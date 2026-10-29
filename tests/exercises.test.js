import test from "node:test";
import assert from "node:assert/strict";
import { checkAnswer, normalizeCodeAnswer } from "../src/components/exercises/answers.js";
import { reactComponentsLesson } from "../src/content/lessons/reactComponents.js";
import {
  emptyProgress,
  getLessonProgress,
  PROGRESS_KEY,
  readProgress,
  recordAnswer,
  sanitizeProgress,
  updateLessonProgress,
} from "../src/progress/progress.js";

const exercises = reactComponentsLesson.exercises;
const lessonKey = "/kurs/react/moduler/jsx-komponenter/leksjoner/funksjonskomponenter";
const summary = (progress) => getLessonProgress(progress, lessonKey, exercises);

for (const question of exercises.filter((item) => item.options)) {
  test(`${question.type}: only the defined option is correct`, () => {
    for (const option of question.options) {
      assert.equal(checkAnswer(question, option.id), option.id === question.correctAnswer);
    }
    assert.equal(checkAnswer(question, ""), false);
    assert.equal(checkAnswer(question, "unknown"), false);
  });
}

test("code answers accept insignificant outer whitespace without joining identifiers", () => {
  const question = exercises.find((item) => item.type === "FillInCodeQuestion");
  for (const answer of ["courseName", " courseName ", "\tcourseName\n"]) assert.equal(checkAnswer(question, answer), true);
  for (const answer of ["", "  ", "course Name", "CourseName", "courseName;", "{courseName}", '"courseName"']) {
    assert.equal(checkAnswer(question, answer), false);
  }
  assert.equal(normalizeCodeAnswer("a   b", "collapse"), "a b");
  assert.equal(normalizeCodeAnswer("a   b"), "a   b");
});

test("multiple valid code answers and explicit whitespace rules", () => {
  const question = { type: "FillInCodeQuestion", validAnswers: ["a + b", "b + a"], whitespace: "collapse" };
  assert.equal(checkAnswer(question, " b  +  a "), true);
  assert.equal(checkAnswer(question, "ab"), false);
  assert.equal(checkAnswer({ type: "unknown" }, "return"), false);
});

test("opening a lesson neither creates progress nor grants mastery", () => {
  const progress = emptyProgress();
  assert.deepEqual(summary(progress), { reviewed: false, answered: 0, correct: 0, total: 3, mastered: false });
  assert.deepEqual(progress.lessons, {});
});

test("mastery needs explicit review and a correct latest answer for every exercise", () => {
  let progress = emptyProgress();
  for (const question of exercises) progress = recordAnswer(progress, lessonKey, question.id, true);
  assert.equal(summary(progress).mastered, false);
  progress = updateLessonProgress(progress, lessonKey, (lesson) => ({ ...lesson, reviewed: true }));
  assert.equal(summary(progress).mastered, true);
  progress = recordAnswer(progress, lessonKey, exercises[0].id, false);
  assert.equal(summary(progress).answered, 3);
  assert.equal(summary(progress).correct, 2);
  assert.equal(summary(progress).mastered, false);
  assert.equal(progress.lessons[lessonKey].answers[exercises[0].id].attempts, 2);
  progress = recordAnswer(progress, lessonKey, exercises[0].id, true);
  assert.equal(summary(progress).mastered, true);
});

test("review alone and a lesson with no exercises never grant mastery", () => {
  const progress = updateLessonProgress(emptyProgress(), lessonKey, (lesson) => ({ ...lesson, reviewed: true }));
  assert.equal(summary(progress).mastered, false);
  assert.equal(getLessonProgress(progress, lessonKey, []).mastered, false);
});

test("persisted progress survives a fresh load and contains no submitted answers or solutions", () => {
  let progress = recordAnswer(emptyProgress(), lessonKey, exercises[0].id, true);
  progress = updateLessonProgress(progress, lessonKey, (lesson) => ({ ...lesson, reviewed: true }));
  const serialized = JSON.stringify(progress);
  const reloaded = readProgress({ getItem: (key) => key === PROGRESS_KEY ? serialized : null });
  assert.deepEqual(reloaded, progress);
  assert.deepEqual(Object.keys(reloaded.lessons[lessonKey].answers[exercises[0].id]).sort(), ["attempts", "correct"]);
  for (const secret of ["reusable-ui", "courseName", "correctAnswer", "validAnswers", "explanation"]) {
    assert.equal(serialized.includes(secret), false);
  }
});

test("bad storage is surfaced to the provider and invalid data is discarded", () => {
  assert.throws(() => readProgress({ getItem: () => "{bad json" }));
  assert.throws(() => readProgress({ getItem: () => { throw new Error("denied"); } }));
  assert.deepEqual(readProgress({ getItem: () => null }), emptyProgress());
  assert.deepEqual(sanitizeProgress({ version: 99, lessons: {} }), emptyProgress());
  const loaded = sanitizeProgress({ version: 1, lessons: { [lessonKey]: {
    reviewed: true,
    answers: {
      valid: { attempts: 2, correct: true, submittedAnswer: "secret", correctAnswer: "secret" },
      invalid: { attempts: -1, correct: true },
    },
  } } });
  assert.deepEqual(loaded.lessons[lessonKey].answers, { valid: { attempts: 2, correct: true } });
});

test("progress is isolated by full lesson path and counts only current exercises", () => {
  const progress = recordAnswer(emptyProgress(), lessonKey, "retired-exercise", true);
  assert.equal(summary(progress).answered, 0);
  assert.equal(getLessonProgress(progress, "/another-course/lesson", exercises).answered, 0);
});
