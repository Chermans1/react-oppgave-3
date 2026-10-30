import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";
import {
  emptyProgress, getLessonProgress, isMastered, isSolutionShown, markSolutionShown, PROGRESS_KEY, readProgress, recordAnswer,
  sanitizeProgress, startPracticeRound,
} from "../src/progress/progress.js";
import { getGoalProgress } from "../src/progress/goals.js";
import {
  changeProgressSession, loadProgressSession, saveProgressSession, validStoredProgress,
} from "../src/progress/storage.js";
import { lessonPath } from "../src/content/courses.js";
import { reactCourse } from "../src/content/reactCourse.js";

let server;
let ChoiceQuestion;
before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false, watch: null } });
  ({ default: ChoiceQuestion } = await server.ssrLoadModule("/src/components/exercises/ChoiceQuestion.jsx"));
});
after(async () => { await server?.close(); });

const module = reactCourse.modules.find((m) => m.lessons.some((l) => l.id === "funksjonskomponenter"));
const lesson = module.lessons.find((l) => l.id === "funksjonskomponenter");
const key = lessonPath("react", module.id, "funksjonskomponenter");
const question = lesson.exercises.find((q) => q.type === "MultipleChoiceQuestion");
const rev = question.revision ?? 1;
const goal = { id: "g", exerciseIds: [question.id] };
const status = (progress, exercises = [question]) => getGoalProgress(progress, key, goal, exercises).status;
const answerOf = (progress) => progress.lessons[key].answers[question.id];

// A fake localStorage that survives "reloads" (new sessions reading the same raw text).
const fakeStorage = (initial = null) => {
  const data = new Map(initial === null ? [] : [[PROGRESS_KEY, initial]]);
  return { getItem: (k) => data.get(k) ?? null, setItem: (k, v) => { data.set(k, v); }, raw: () => data.get(PROGRESS_KEY) ?? null };
};
const reload = (storage) => loadProgressSession(() => storage);
const wrongTwiceAndReveal = (progress = emptyProgress()) => {
  progress = recordAnswer(progress, key, question.id, false, rev);
  progress = recordAnswer(progress, key, question.id, false, rev);
  return markSolutionShown(progress, key, question.id, rev);
};
const renderQuestion = (attempt) => renderToStaticMarkup(createElement(ChoiceQuestion, { question, number: 1, attempt, onAnswer() {} }));

test("1. showing the solution survives a reload and is bound to question id and revision", () => {
  const storage = fakeStorage();
  const session = changeProgressSession({ progress: emptyProgress(), storageBlocked: false, storageError: "" }, wrongTwiceAndReveal, () => storage);
  const loaded = reload(storage);
  assert.equal(loaded.storageBlocked, false);
  const saved = answerOf(loaded.progress);
  assert.equal(saved.solutionShown, true);
  assert.equal(saved.attempts, 2, "attempt history is kept");
  assert.equal(isSolutionShown(saved, question), true);
  assert.equal(isSolutionShown(saved, { ...question, revision: rev + 1 }), false, "another revision is a different round");
  assert.equal(session.progress.lessons[key].answers[question.id].solutionShown, true);
  // The fresh page opens in the revealed state without any click: panel visible, reveal button gone.
  const html = renderQuestion(saved);
  assert.ok(html.includes("Fasit (øving, ikke mestring)"));
  assert.ok(html.includes("Start ny øvingsrunde"));
  assert.equal(html.includes(">Vis fasit<"), false);
});

test("revealing needs an existing answer of the same revision and is idempotent", () => {
  assert.equal(markSolutionShown(emptyProgress(), key, question.id, rev).lessons[key], undefined);
  const progress = wrongTwiceAndReveal();
  assert.equal(markSolutionShown(progress, key, question.id, rev), progress, "no rewrite when already shown");
  assert.equal(markSolutionShown(progress, key, question.id, rev + 1), progress, "wrong revision is ignored");
});

test("2. a correct answer after reload is still recorded as assisted and gives no mastery", () => {
  const storage = fakeStorage();
  changeProgressSession({ progress: emptyProgress(), storageBlocked: false, storageError: "" }, wrongTwiceAndReveal, () => storage);
  const reloaded = reload(storage).progress;
  // The new page knows nothing in memory: the caller passes assisted = false, as after a reload.
  const next = recordAnswer(reloaded, key, question.id, true, rev, false);
  assert.equal(answerOf(next).assisted, true);
  assert.equal(answerOf(next).correct, true);
  assert.equal(answerOf(next).solutionShown, true, "the round stays marked until a deliberate new round");
  assert.equal(status(next), "in-progress");
  // Also after yet another reload, and after a further wrong answer.
  const again = readProgress(fakeStorage(JSON.stringify(next)));
  assert.equal(status(recordAnswer(again, key, question.id, true, rev)), "in-progress");
});

test("3. a deliberate new round allows new independent mastery and keeps history", () => {
  let progress = recordAnswer(wrongTwiceAndReveal(), key, question.id, true, rev);
  assert.equal(status(progress), "in-progress");
  progress = startPracticeRound(progress, key, question.id, rev);
  assert.equal(answerOf(progress).solutionShown, undefined);
  assert.equal(answerOf(progress).attempts, 3, "history is not deleted");
  assert.equal(answerOf(progress).assisted, true, "the earlier result is kept until a new answer replaces it");
  assert.equal(status(progress), "in-progress", "starting a round alone gives no mastery");
  const storage = fakeStorage(JSON.stringify(progress));
  const reloaded = readProgress(storage);
  assert.equal(isSolutionShown(answerOf(reloaded), question), false, "a reload does not start or end a round by itself");
  assert.equal(renderQuestion(answerOf(reloaded)).includes("Fasit (øving"), false);
  progress = recordAnswer(reloaded, key, question.id, true, rev);
  assert.equal(answerOf(progress).assisted, undefined);
  assert.equal(answerOf(progress).attempts, 4);
  assert.equal(status(progress), "mastered");
  assert.equal(startPracticeRound(progress, key, question.id, rev), progress, "nothing to reset: no rewrite");
});

test("4. an assisted answer never gives mastery, in the goal or in the lesson", () => {
  const progress = recordAnswer(wrongTwiceAndReveal(), key, question.id, true, rev);
  assert.equal(isMastered(answerOf(progress)), false);
  assert.equal(status(progress), "in-progress");
  const reviewed = { ...progress, lessons: { [key]: { ...progress.lessons[key], reviewed: true } } };
  assert.equal(getLessonProgress(reviewed, key, [question]).correct, 0);
  assert.equal(getLessonProgress(reviewed, key, [question]).mastered, false);
  // The caller's own claim of "assisted" also counts, e.g. the in-memory round of the page.
  const claimed = recordAnswer(emptyProgress(), key, question.id, true, rev, true);
  assert.equal(status(claimed), "in-progress");
});

test("5. an assisted answer does not remove earlier valid mastery", () => {
  let progress = recordAnswer(emptyProgress(), key, question.id, true, rev);
  assert.equal(status(progress), "mastered");
  assert.equal(answerOf(progress).mastered, undefined, "independent correct needs no extra field: nothing duplicated");
  progress = recordAnswer(progress, key, question.id, false, rev);
  progress = recordAnswer(progress, key, question.id, false, rev);
  progress = markSolutionShown(progress, key, question.id, rev);
  progress = recordAnswer(progress, key, question.id, true, rev);
  const saved = answerOf(progress);
  assert.deepEqual({ correct: saved.correct, assisted: saved.assisted, mastered: saved.mastered }, { correct: true, assisted: true, mastered: true });
  assert.equal(saved.attempts, 4);
  assert.equal(status(progress), "mastered");
  const reviewed = { ...progress, lessons: { [key]: { ...progress.lessons[key], reviewed: true } } };
  assert.equal(getLessonProgress(reviewed, key, [question]).mastered, true);
  // Mastery survives a reload and a further new round with a wrong answer.
  let reloaded = readProgress(fakeStorage(JSON.stringify(progress)));
  reloaded = recordAnswer(startPracticeRound(reloaded, key, question.id, rev), key, question.id, false, rev);
  assert.equal(status(reloaded), "mastered");
  assert.equal(answerOf(reloaded).correct, false, "the latest practice result is still recorded separately");
  // No goal status is stored anywhere.
  assert.equal(/in-progress|"status"|not-started/.test(JSON.stringify(reloaded)), false);
});

test("6. mastery from an older revision never counts for the current revision", () => {
  const v1 = { id: "q", revision: 1 };
  const v2 = { id: "q", revision: 2 };
  const goalQ = { id: "g", exerciseIds: ["q"] };
  let progress = recordAnswer(emptyProgress(), key, "q", true, 1);
  assert.equal(getGoalProgress(progress, key, goalQ, [v1]).status, "mastered");
  assert.equal(getGoalProgress(progress, key, goalQ, [v2]).status, "not-started");
  assert.equal(getLessonProgress(progress, key, [v2]).correct, 0);
  // A new assisted or wrong answer on the new revision does not inherit the old mastery.
  const wrongV2 = recordAnswer(progress, key, "q", false, 2);
  assert.equal(wrongV2.lessons[key].answers.q.mastered, undefined);
  assert.equal(getGoalProgress(wrongV2, key, goalQ, [v2]).status, "in-progress");
  const assistedV2 = recordAnswer(progress, key, "q", true, 2, true);
  assert.equal(getGoalProgress(assistedV2, key, goalQ, [v2]).status, "in-progress");
  assert.equal(assistedV2.lessons[key].answers.q.attempts, 2, "attempt count continues across revisions");
  // A solution shown on the old revision does not mark the new one.
  const shownV1 = markSolutionShown(progress, key, "q", 1);
  assert.equal(isSolutionShown(shownV1.lessons[key].answers.q, v2), false);
  assert.equal(recordAnswer(shownV1, key, "q", true, 2).lessons[key].answers.q.assisted, undefined);
  assert.equal(getGoalProgress(recordAnswer(shownV1, key, "q", true, 2), key, goalQ, [v2]).status, "mastered");
});

test("7. existing saved progress still reads and keeps its meaning", () => {
  const legacy = {
    version: 1,
    lessons: { [key]: { reviewed: true, answers: {
      a: { attempts: 2, correct: true },
      b: { attempts: 3, correct: true, assisted: true },
      c: { attempts: 1, correct: false },
      d: { attempts: 5, correct: true, revision: 2 },
    } } },
  };
  assert.equal(validStoredProgress(legacy), true);
  const loaded = reload(fakeStorage(JSON.stringify(legacy)));
  assert.equal(loaded.storageBlocked, false);
  assert.deepEqual(loaded.progress, sanitizeProgress(legacy));
  const answers = loaded.progress.lessons[key].answers;
  assert.deepEqual([answers.a, answers.b, answers.c, answers.d].map(isMastered), [true, false, false, true]);
  const exercises = ["a", "b", "c"].map((id) => ({ id }));
  assert.equal(getLessonProgress(loaded.progress, key, exercises).correct, 1);
  assert.equal(getGoalProgress(loaded.progress, key, { id: "g", exerciseIds: ["a"] }, exercises).status, "mastered");
  assert.equal(getGoalProgress(loaded.progress, key, { id: "g", exerciseIds: ["b"] }, exercises).status, "in-progress");
  // New fields are valid, kept by the sanitizer, and malformed values are not accepted as valid storage.
  const extended = { version: 1, lessons: { [key]: { reviewed: false, answers: { q: { attempts: 4, correct: true, assisted: true, mastered: true, solutionShown: true } } } } };
  assert.equal(validStoredProgress(extended), true);
  assert.deepEqual(sanitizeProgress(extended).lessons[key].answers.q, { attempts: 4, correct: true, assisted: true, mastered: true, solutionShown: true });
  for (const bad of [{ mastered: "yes" }, { solutionShown: 1 }]) {
    const malformed = { version: 1, lessons: { [key]: { reviewed: false, answers: { q: { attempts: 1, correct: false, ...bad } } } } };
    assert.equal(validStoredProgress(malformed), false);
    assert.deepEqual(sanitizeProgress(malformed).lessons[key].answers.q, { attempts: 1, correct: false });
  }
});

test("8. storage failures never overwrite saved progress unintentionally", () => {
  // Unreadable stored data: the original text is left untouched by reveal, answers and new rounds.
  const corrupt = "{not json";
  const storage = fakeStorage(corrupt);
  let writes = 0;
  const counting = { getItem: storage.getItem, setItem: (...args) => { writes += 1; storage.setItem(...args); } };
  let session = reload(counting);
  assert.equal(session.storageBlocked, true);
  for (const change of [wrongTwiceAndReveal, (p) => recordAnswer(p, key, question.id, true, rev), (p) => startPracticeRound(p, key, question.id, rev)]) {
    session = changeProgressSession(session, change, () => counting);
  }
  assert.equal(writes, 0);
  assert.equal(storage.raw(), corrupt);
  assert.equal(answerOf(session.progress).attempts, 3, "the session keeps working in memory");

  // Valid data, then storage starts failing: no throw, memory keeps the reveal, and the saved copy stays the last good one.
  const good = fakeStorage();
  let live = changeProgressSession({ progress: emptyProgress(), storageBlocked: false, storageError: "" },
    (p) => recordAnswer(p, key, question.id, false, rev), () => good);
  const lastGood = good.raw();
  const failing = { getItem: good.getItem, setItem() { throw new Error("quota"); } };
  live = changeProgressSession(live, (p) => markSolutionShown(recordAnswer(p, key, question.id, false, rev), key, question.id, rev), () => failing);
  assert.equal(live.storageBlocked, true);
  assert.equal(answerOf(live.progress).solutionShown, true);
  assert.equal(good.raw(), lastGood);
  // While blocked, later changes are not written even if storage recovers.
  const recovered = changeProgressSession(live, (p) => startPracticeRound(p, key, question.id, rev), () => good);
  assert.equal(good.raw(), lastGood);
  assert.equal(recovered.storageBlocked, true);
  // Only the explicit save replaces the stored copy.
  const replaced = saveProgressSession(recovered, () => good);
  assert.equal(replaced.storageBlocked, false);
  assert.equal(JSON.parse(good.raw()).lessons[key].answers[question.id].attempts, 2);
});
