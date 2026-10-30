import test from "node:test";
import assert from "node:assert/strict";
import { mainToAppLesson as lesson } from "../src/content/lessons/mainToApp.js";
import { reactComponentsLesson } from "../src/content/lessons/reactComponents.js";
import { reactCourse } from "../src/content/reactCourse.js";
import { getLessonNavigation, lessonPath } from "../src/content/courses.js";
import { checkAnswer } from "../src/components/exercises/answers.js";
import { emptyProgress, recordAnswer, readProgress, PROGRESS_KEY } from "../src/progress/progress.js";
import { getGoalProgress, getCourseGoals } from "../src/progress/goals.js";

const key = lessonPath("react", "jsx-komponenter", lesson.id);
const previousKey = lessonPath("react", "jsx-komponenter", reactComponentsLesson.id);

test("new lesson keeps its ID, has four connected goals and distributes exercises once", () => {
  assert.equal(lesson.id, "fra-main-til-app");
  assert.equal(lesson.sections.length, 7);
  assert.equal(lesson.learningObjectives.length, 4);
  const ids = lesson.exercises.map((question) => question.id);
  assert.equal(new Set(ids).size, 4);
  assert.deepEqual(lesson.sections.flatMap((section) => section.blocks)
    .filter((block) => block.type === "exercises").flatMap((block) => block.exerciseIds), ids);
  for (const goal of lesson.learningObjectives) {
    assert.ok(goal.id && goal.description && goal.exerciseIds.length > 0);
    for (const id of goal.exerciseIds) assert.ok(ids.includes(id));
  }
});

test("each question accepts its valid answers and rejects plausible mistakes", () => {
  for (const question of lesson.exercises) {
    if (question.options) {
      for (const option of question.options) assert.equal(checkAnswer(question, option.id), option.id === question.correctAnswer);
    } else {
      for (const answer of ["./messages/Welcome.jsx", " ./messages/Welcome "]) assert.equal(checkAnswer(question, answer), true);
      for (const answer of ["", "./components/Welcome.jsx", '"./messages/Welcome.jsx"', "<Welcome />"]) assert.equal(checkAnswer(question, answer), false);
    }
  }
});

test("import/usage goal needs both tasks, survives reload and leaves previous progress intact", () => {
  let progress = recordAnswer(emptyProgress(), previousKey, "component-definition", true);
  const previous = structuredClone(progress.lessons[previousKey]);
  const goal = lesson.learningObjectives.find((item) => item.id === "import-export-usage");
  const status = () => getGoalProgress(progress, key, goal, lesson.exercises).status;
  assert.equal(status(), "not-started");
  progress = recordAnswer(progress, key, "welcome-import-path", true);
  assert.equal(status(), "in-progress");
  progress = recordAnswer(progress, key, "app-component-binding", false);
  assert.equal(status(), "in-progress");
  progress = recordAnswer(progress, key, "app-component-binding", true);
  assert.equal(status(), "mastered");
  for (const question of lesson.exercises) progress = recordAnswer(progress, key, question.id, true);
  const serialized = JSON.stringify(progress);
  const restored = readProgress({ getItem: (id) => id === PROGRESS_KEY ? serialized : null });
  assert.deepEqual(restored.lessons[previousKey], previous);
  const goals = getCourseGoals(reactCourse, restored);
  assert.ok(goals.filter((item) => item.lessonKey === key).every((item) => item.status === "mastered"));
  assert.equal(goals.find((item) => item.lessonKey === previousKey && item.id === "jsx-variable").status, "not-started");
});

test("navigation connects the original component lesson, main-to-App and JSX without changing URLs", () => {
  assert.equal(reactCourse.modules[0].id, "javascript-grunnlag");
  const nav = getLessonNavigation(reactCourse, "jsx-komponenter", lesson.id);
  assert.equal(nav.previous.path, previousKey);
  assert.equal(nav.next.path, lessonPath("react", "jsx-komponenter", "jsx-regler"));
  assert.equal(getLessonNavigation(reactCourse, "jsx-komponenter", reactComponentsLesson.id).next.path, key);
  assert.equal(getLessonNavigation(reactCourse, "jsx-komponenter", "jsx-regler").previous.path, key);
});
