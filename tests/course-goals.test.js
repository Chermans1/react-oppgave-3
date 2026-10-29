import test from "node:test";
import assert from "node:assert/strict";
import { courses, lessonPath } from "../src/content/courses.js";
import { reactComponentsLesson as lesson } from "../src/content/lessons/reactComponents.js";
import { getCourseGoals, getGoalProgress, summarizeGoals } from "../src/progress/goals.js";
import { emptyProgress, recordAnswer, readProgress, PROGRESS_KEY } from "../src/progress/progress.js";

const key = lessonPath("react", "jsx-komponenter", lesson.id);
const goal = lesson.learningObjectives.find((item) => item.exerciseIds.length === 2);
const status = (progress, target = goal) => getGoalProgress(progress, key, target, lesson.exercises);

test("course goals have unique stable IDs and valid exercise references", () => {
  for (const course of courses) {
    for (const module of course.modules) {
      for (const item of module.lessons) {
        const ids = item.learningObjectives.map((objective) => objective.id);
        assert.equal(new Set(ids).size, ids.length);
        for (const objective of item.learningObjectives) {
          assert.ok(objective.id && objective.description);
          assert.ok(Array.isArray(objective.exerciseIds));
          assert.equal(Object.hasOwn(objective, "status"), false);
          for (const id of objective.exerciseIds) assert.ok(item.exercises.some((question) => question.id === id));
        }
      }
    }
  }
});

test("a goal needs all linked tasks to pass, including after a failed attempt", () => {
  let progress = emptyProgress();
  assert.deepEqual(status(progress), { status: "not-started", attempted: 0, passed: 0, total: 2 });
  progress = recordAnswer(progress, key, goal.exerciseIds[0], false);
  assert.equal(status(progress).status, "in-progress");
  progress = recordAnswer(progress, key, goal.exerciseIds[0], true);
  assert.equal(status(progress).status, "in-progress");
  assert.equal(status(progress).passed, 1);
  progress = recordAnswer(progress, key, goal.exerciseIds[1], true);
  assert.equal(status(progress).status, "mastered");
  // Latest-result semantics are inherited; mastery is not a second persisted flag.
  progress = recordAnswer(progress, key, goal.exerciseIds[1], false);
  assert.equal(status(progress).status, "in-progress");
});

test("unrelated attempts and review do not start goals; task success does not require review", () => {
  let progress = { version: 1, lessons: { [key]: { reviewed: true, answers: {} } } };
  progress = recordAnswer(progress, key, "component-definition", true);
  assert.equal(status(progress).status, "not-started");
  let unreviewed = emptyProgress();
  for (const id of goal.exerciseIds) unreviewed = recordAnswer(unreviewed, key, id, true);
  assert.equal(status(unreviewed).status, "mastered");
});

test("goals without exercises and references to missing exercises never become mastered", () => {
  const progress = recordAnswer(emptyProgress(), key, "missing-exercise", true);
  assert.equal(status(progress, { id: "no-tasks", exerciseIds: [] }).status, "not-started");
  assert.equal(status(progress, { id: "missing-task", exerciseIds: ["missing-exercise"] }).status, "not-started");
  assert.deepEqual(summarizeGoals([]), { total: 0, mastered: 0, percentage: 0 });
});

test("one task may serve multiple goals and duplicate links do not double count", () => {
  const progress = recordAnswer(emptyProgress(), key, "component-return", true);
  const goals = getCourseGoals(courses[0], progress);
  assert.equal(goals.find((item) => item.id === "jsx-variable").status, "mastered");
  assert.equal(goals.find((item) => item.id === "function-component-jsx").status, "in-progress");
  assert.equal(status(progress, { exerciseIds: ["component-return", "component-return"] }).total, 1);
});

test("reloading preserves derived course statuses without persisting goals", () => {
  let progress = emptyProgress();
  for (const question of lesson.exercises) progress = recordAnswer(progress, key, question.id, true);
  const serialized = JSON.stringify(progress);
  const restored = readProgress({ getItem: (storageKey) => storageKey === PROGRESS_KEY ? serialized : null });
  const goals = getCourseGoals(courses[0], restored);
  assert.deepEqual(goals, getCourseGoals(courses[0], progress));
  assert.deepEqual(summarizeGoals(goals), { total: 4, mastered: 4, percentage: 100 });
  assert.equal(serialized.includes('"status"'), false);
  for (const objective of lesson.learningObjectives) assert.equal(serialized.includes(objective.id), false);
  assert.ok(goals.every((item) => item.lessonKey === key));
});
