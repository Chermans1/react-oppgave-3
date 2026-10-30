import test from "node:test";
import assert from "node:assert/strict";
import { transformWithOxc } from "vite";
import { reactCourse } from "../src/content/reactCourse.js";
import { completedLessons } from "../src/content/modules/index.js";
import { getLessonNavigation, lessonPath } from "../src/content/courses.js";
import { checkAnswer } from "../src/components/exercises/answers.js";
import { getGoalProgress, getCourseGoals } from "../src/progress/goals.js";
import { emptyProgress, recordAnswer, readProgress, updateLessonProgress } from "../src/progress/progress.js";

const lessons = reactCourse.modules.flatMap((module) => module.lessons);
function unique(values, label) { assert.equal(new Set(values).size, values.length, label); }

for (const module of reactCourse.modules) {
  test(`${module.id}: complete teaching, unique IDs, valid references and answer keys`, () => {
    unique(module.lessons.map((l) => l.id), "lesson IDs");
    for (const lesson of module.lessons) {
      assert.equal(lesson.status, "available", lesson.id);
      assert.ok(lesson.title && lesson.sections?.length >= 5, lesson.id);
      unique(lesson.sections.map((s) => s.id), `${lesson.id} section IDs`);
      unique(lesson.exercises.map((q) => q.id), `${lesson.id} question IDs`);
      assert.ok(lesson.exercises.length >= 3 && lesson.exercises.length <= 5);
      const blocks = lesson.sections.flatMap((s) => s.blocks);
      for (const block of blocks) {
        if (block.type === "paragraph") assert.ok(typeof block.text === "string" && block.text.length > 0, `${lesson.id}: empty explanation`);
        if (block.type === "code") assert.ok(block.title && block.language && block.code);
      }
      assert.ok(blocks.some((block) => block.type === "code" && block.code));
      assert.ok(blocks.some((block) => block.type === "goals"));
      assert.ok(blocks.some((block) => block.type === "progress"));
      const placements = blocks.filter((b) => b.type === "exercises")
        .flatMap((b) => b.exerciseIds ?? lesson.exercises.map((q) => q.id));
      assert.deepEqual([...placements].sort(), lesson.exercises.map((q) => q.id).sort());
      for (const q of lesson.exercises) {
        assert.ok(q.prompt && q.explanation && q.title);
        if (q.type === "FillInCodeQuestion") {
          assert.ok(q.validAnswers.length && q.validAnswers.every((a) => typeof a === "string" && a.trim()));
          for (const answer of q.validAnswers) assert.equal(checkAnswer(q, ` ${answer} `), true, q.id);
          assert.equal(checkAnswer(q, ""), false);
          assert.equal(checkAnswer(q, "an-intentionally-wrong-answer"), false);
          assert.match(q.code, /___/);
        } else {
          assert.ok(["MultipleChoiceQuestion", "FindTheBugQuestion"].includes(q.type));
          unique(q.options.map((o) => o.id), q.id);
          unique(q.options.map((o) => o.text), q.id);
          assert.equal(q.options.filter((o) => o.id === q.correctAnswer).length, 1);
          for (const option of q.options) assert.equal(checkAnswer(q, option.id), option.id === q.correctAnswer, q.id);
          assert.equal(checkAnswer(q, "missing-option"), false);
          if (q.type === "FindTheBugQuestion") assert.ok(q.code);
        }
        assert.ok(lesson.learningObjectives.some((g) => g.exerciseIds.includes(q.id)), `unlinked ${q.id}`);
      }
      for (const goal of lesson.learningObjectives) {
        assert.ok(goal.id && goal.description);
        assert.equal(Object.hasOwn(goal, "status"), false);
        for (const id of goal.exerciseIds) assert.ok(lesson.exercises.some((q) => q.id === id));
        if (goal.assessment === "practical") assert.deepEqual(goal.exerciseIds, []);
        else assert.ok(goal.exerciseIds.length > 0);
      }
      for (const activity of lesson.practicalActivities ?? []) {
        assert.ok(activity.description && activity.prerequisites && activity.criteria.length >= 3 && activity.hints.length >= 2);
        assert.equal(blocks.filter((b) => b.activityId === activity.id).length, 1);
      }
    }
  });
}

test("all 65 lessons in 14 modules are available with globally unique new IDs", () => {
  assert.equal(reactCourse.modules.length, 14);
  assert.equal(lessons.length, 65);
  assert.equal(completedLessons.length, 62);
  assert.equal(reactCourse.status, "available");
  unique(lessons.map((l) => l.id), "lesson IDs");
  unique(lessons.flatMap((l) => l.exercises.map((q) => q.id)), "question IDs");
  unique(lessons.flatMap((l) => l.learningObjectives.map((g) => g.id)), "goal IDs");
  unique(completedLessons.flatMap((l) => l.practicalActivities.map((p) => p.id)), "practical IDs");
  for (const lesson of completedLessons) assert.ok(lesson.introduction && lesson.prerequisites);
});

test("every internal lesson link has a target and navigation is symmetric across all modules", () => {
  const ordered = reactCourse.modules.flatMap((module) => module.lessons.map((lesson) => ({ module, lesson, path: lessonPath(reactCourse.id, module.id, lesson.id) })));
  const paths = new Set(ordered.map((entry) => entry.path));
  ordered.forEach(({ module, lesson }, index) => {
    const nav = getLessonNavigation(reactCourse, module.id, lesson.id);
    assert.equal(nav.previous?.path, ordered[index - 1]?.path);
    assert.equal(nav.next?.path, ordered[index + 1]?.path);
    for (const block of lesson.sections.flatMap((s) => s.blocks)) {
      for (const link of block.links ?? []) {
        if (link.url.startsWith("/")) assert.ok(paths.has(link.url), link.url);
        else assert.equal(new URL(link.url).protocol, "https:");
      }
    }
  });
});

test("all new goals derive from attempts, survive reload and never approve practical work", () => {
  let progress = emptyProgress();
  for (const module of reactCourse.modules) for (const lesson of module.lessons) {
    const key = lessonPath(reactCourse.id, module.id, lesson.id);
    for (const goal of lesson.learningObjectives) assert.equal(getGoalProgress(progress, key, goal, lesson.exercises).status, "not-started");
    for (const q of lesson.exercises) {
      progress = recordAnswer(progress, key, q.id, false, q.revision);
      for (const goal of lesson.learningObjectives.filter((g) => g.exerciseIds.includes(q.id))) {
        assert.equal(getGoalProgress(progress, key, goal, lesson.exercises).status, "in-progress");
      }
      progress = recordAnswer(progress, key, q.id, true, q.revision);
    }
    progress = updateLessonProgress(progress, key, (value) => ({ ...value, reviewed: true }));
    for (const goal of lesson.learningObjectives) assert.equal(
      getGoalProgress(progress, key, goal, lesson.exercises).status,
      goal.exerciseIds.length > 0 ? "mastered" : "not-started", goal.id,
    );
  }
  const serialized = JSON.stringify(progress);
  const restored = readProgress({ getItem: () => serialized });
  assert.deepEqual(restored, progress);
  assert.deepEqual(getCourseGoals(reactCourse, restored), getCourseGoals(reactCourse, progress));
  assert.equal(serialized.includes('"status"'), false);
  assert.equal(serialized.includes('"correctAnswer"'), false);
  assert.equal(serialized.includes('"practicalCompleted"'), false);
});

test("new teaching snippets parse without executing any example or student code", async () => {
  for (const lesson of completedLessons) for (const section of lesson.sections) for (const block of section.blocks) {
    if (block.type !== "code" || !["jsx", "tsx", "js"].includes(block.language)) continue;
    let code = block.code;
    if (code.trim().startsWith("<")) code = `const example = (<>${code}</>);`;
    if (code.trim().startsWith("case ")) code = `function example(){switch(action.type){${code}}}`;
    // Top-level returns are component-body excerpts, as explicitly labelled in the UI.
    if (/^return |^if .*return /m.test(code) && !/^import /m.test(code)) code = `async function example(){${code}}`;
    try { await transformWithOxc(code, "example." + block.language); }
    catch (error) { assert.fail(`${lesson.id}/${section.id}: ${error.message}`); }
  }
});
