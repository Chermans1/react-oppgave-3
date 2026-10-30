import test from "node:test";
import assert from "node:assert/strict";
import { jsxRulesLesson as lesson } from "../src/content/lessons/jsxRules.js";
import { reactCourse } from "../src/content/reactCourse.js";
import { getLessonNavigation, lessonPath } from "../src/content/courses.js";
import { checkAnswer, getSolution } from "../src/components/exercises/answers.js";
import { emptyProgress, recordAnswer, readProgress, PROGRESS_KEY } from "../src/progress/progress.js";
import { getGoalProgress, getCourseGoals } from "../src/progress/goals.js";

const key = lessonPath("react", "jsx-komponenter", lesson.id);

test("JSX lesson preserves its ID and connects six goals to five unique distributed questions", () => {
  assert.equal(lesson.id, "jsx-regler");
  assert.equal(lesson.sections.length, 7);
  assert.equal(lesson.learningObjectives.length, 6);
  const ids = lesson.exercises.map((question) => question.id);
  assert.equal(ids.length, 5);
  assert.equal(new Set(ids).size, 5);
  const placements = lesson.sections.map((section) => section.blocks.filter((block) => block.type === "exercises").flatMap((block) => block.exerciseIds));
  assert.deepEqual(placements, [[], [ids[0]], [ids[1]], [ids[2]], [ids[3]], [ids[4]], []]);
  for (const goal of lesson.learningObjectives) {
    assert.ok(goal.id && goal.description && goal.exerciseIds.length);
    for (const id of goal.exerciseIds) assert.ok(ids.includes(id));
  }
});

test("answers are graded correctly without accepting wrong text or identifiers", () => {
  for (const question of lesson.exercises) {
    if (question.options) {
      for (const option of question.options) assert.equal(checkAnswer(question, option.id), option.id === question.correctAnswer);
      assert.equal(checkAnswer(question, "unknown"), false);
    } else {
      for (const answer of ["remaining", " remaining ", "\tremaining\n"]) assert.equal(checkAnswer(question, answer), true);
      for (const answer of ["", "planned", "completed", "5", "{remaining}", "remain ing"]) assert.equal(checkAnswer(question, answer), false);
    }
  }
});

test("independent teaching examples do not copy exact exercise solutions", () => {
  const teaching = JSON.stringify(lesson.sections.flatMap((section) => section.blocks.filter((block) => block.type !== "exercises")));
  for (const question of lesson.exercises) assert.equal(teaching.includes(getSolution(question)), false);
  assert.equal(teaching.includes("ReadingCount"), false);
  assert.equal(teaching.includes("StudySessions"), false);
  assert.equal(teaching.includes("NicknameField"), false);
});

test("goal status uses all required latest answers and survives reload independently", () => {
  const oldKey = lessonPath("react", "jsx-komponenter", "fra-main-til-app");
  let progress = recordAnswer(emptyProgress(), oldKey, "welcome-import-path", true);
  const oldProgress = structuredClone(progress.lessons[oldKey]);
  const goal = lesson.learningObjectives.find((item) => item.id === "jsx-expressions");
  const state = () => getGoalProgress(progress, key, goal, lesson.exercises).status;
  assert.equal(state(), "not-started");
  progress = recordAnswer(progress, key, "predict-reading-count", true);
  assert.equal(state(), "in-progress");
  progress = recordAnswer(progress, key, "complete-remaining-value", false);
  assert.equal(state(), "in-progress");
  progress = recordAnswer(progress, key, "complete-remaining-value", true);
  assert.equal(state(), "mastered");
  for (const question of lesson.exercises) progress = recordAnswer(progress, key, question.id, true);
  const restored = readProgress({ getItem: (id) => id === PROGRESS_KEY ? JSON.stringify(progress) : null });
  assert.deepEqual(restored.lessons[oldKey], oldProgress);
  const goals = getCourseGoals(reactCourse, restored).filter((item) => item.lessonKey === key);
  assert.equal(goals.length, 6);
  assert.ok(goals.every((item) => item.status === "mastered"));
});

test("JSX lesson stays between main-to-App and fragments", () => {
  const nav = getLessonNavigation(reactCourse, "jsx-komponenter", lesson.id);
  assert.equal(nav.previous.path, lessonPath("react", "jsx-komponenter", "fra-main-til-app"));
  assert.equal(nav.next.path, lessonPath("react", "jsx-komponenter", "fragmenter-komponenttraer"));
});
