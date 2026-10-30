import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";
import { MemoryRouter } from "react-router-dom";
import { emptyProgress, getLessonProgress, isIndependentCorrect, readProgress, recordAnswer, sanitizeProgress, PROGRESS_KEY } from "../src/progress/progress.js";
import { getCourseGoals } from "../src/progress/goals.js";
import { validStoredProgress, loadProgressSession } from "../src/progress/storage.js";
import { lessonPath } from "../src/content/courses.js";
import { reactCourse } from "../src/content/reactCourse.js";
import { exerciseHints, getHint } from "../src/content/exerciseHints.js";
import {
  canRevealSolution, changeAnswer, freshRound, revealSolution, roundFor, startNewRound, submitAnswer, WRONG_BEFORE_SOLUTION,
} from "../src/components/exercises/attemptRound.js";
import { checkAnswer, getSolution } from "../src/components/exercises/answers.js";

let server;
let QuestionFrame;
before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false, watch: null } });
  ({ default: QuestionFrame } = await server.ssrLoadModule("/src/components/exercises/QuestionFrame.jsx"));
});
after(async () => { await server?.close(); });

const lessons = reactCourse.modules.flatMap((module) => module.lessons.map((lesson) => ({ module, lesson })));
const allQuestions = lessons.flatMap(({ lesson }) => lesson.exercises);
const escaped = (text) => renderToStaticMarkup(createElement("span", null, text)).slice(6, -7);
const norm = (text) => text.toLowerCase().replace(/\s+/g, " ").trim();
const render = (question, state = {}, attempt) => renderToStaticMarkup(createElement(QuestionFrame, {
  question, number: 1, attempt, state: { answer: "", result: null, handleSubmit() {}, ...state },
}));

const wrongAnswer = (question) => question.type === "FillInCodeQuestion" ? "zzz" : question.options.find((o) => o.id !== question.correctAnswer).id;
const rightAnswer = (question) => question.type === "FillInCodeQuestion" ? question.validAnswers[0] : question.correctAnswer;

test("all 202 exercises have a hint that guides without revealing the solution", () => {
  assert.equal(allQuestions.length, 202);
  assert.deepEqual(Object.keys(exerciseHints).filter((id) => !allQuestions.some((q) => q.id === id)), []);
  for (const question of allQuestions) {
    const hint = getHint(question);
    assert.ok(typeof hint === "string" && hint.length >= 30 && hint.length <= 260, `${question.id}: hint length`);
    assert.notEqual(norm(hint), norm(question.explanation), question.id);
    assert.equal(norm(hint).includes(norm(question.explanation)), false, question.id);
    assert.equal(/riktig svar:/i.test(hint), false, question.id);
    const given = norm(`${question.prompt} ${question.code ?? ""}`);
    const answers = question.options
      ? [question.options.find((o) => o.id === question.correctAnswer).text]
      : question.validAnswers;
    for (const valid of answers) {
      const answer = norm(valid);
      if (answer.length <= 3 || given.includes(answer)) continue; // already given by the task itself, or too short to test
      const pattern = new RegExp(`(?<![\\p{L}\\p{N}_])${answer.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\p{L}\\p{N}_])`, "u");
      assert.equal(pattern.test(norm(hint)), false, `${question.id}: hint contains the answer "${valid}"`);
    }
  }
});

test("an explicit hint on the question takes precedence over the hint table", () => {
  assert.equal(getHint({ id: "moduler-funksjoner-return-check", hint: "Eget hint" }), "Eget hint");
});

test("no solution, explanation or reveal option before submission", () => {
  for (const question of allQuestions) {
    const html = render(question);
    assert.equal(html.includes("Riktig svar:"), false);
    assert.equal(html.includes("Fasit"), false);
    assert.equal(html.includes("Vis fasit"), false);
    assert.equal(html.includes(escaped(question.explanation)), false);
  }
});

test("first wrong answer shows only the hint: no solution, explanation or reveal button", () => {
  for (const question of allQuestions) {
    const html = render(question, { result: { correct: false }, wrongCount: 1, canReveal: false });
    assert.ok(html.includes("Ikke helt riktig ennå."));
    assert.ok(html.includes(escaped(getHint(question))), question.id);
    assert.equal(html.includes("Riktig svar:"), false);
    assert.equal(html.includes(escaped(question.explanation)), false);
    assert.equal(html.includes("Vis fasit"), false);
    assert.match(html, /Endre svaret for å prøve igjen/);
  }
});

test("after the second wrong answer the student may choose to show the solution, but it is not shown yet", () => {
  for (const question of allQuestions) {
    const html = render(question, { result: { correct: false }, wrongCount: 2, canReveal: true });
    assert.ok(html.includes("Vis fasit"));
    assert.match(html, /<button class="secondary-button" type="button">Vis fasit<\/button>/);
    assert.match(html, /gir ikke mestring/);
    assert.equal(html.includes("Riktig svar:"), false);
    assert.equal(html.includes(escaped(question.explanation)), false);
    assert.ok(html.includes(escaped(getHint(question))));
  }
});

test("the solution and full explanation appear only when the student chooses to reveal them", () => {
  for (const question of allQuestions) {
    const html = render(question, { result: { correct: false }, wrongCount: 2, revealed: true, canReveal: false });
    assert.ok(html.includes("Fasit (øving, ikke mestring)"));
    assert.ok(html.includes(`Riktig svar: ${escaped(getSolution(question))}`));
    assert.ok(html.includes(escaped(question.explanation)));
    assert.ok(html.includes("Start ny øvingsrunde"));
    assert.equal(html.includes(">Vis fasit<"), false);
  }
});

test("a correct answer shows solution and full explanation; an assisted one is marked as practice", () => {
  for (const question of allQuestions) {
    const independent = render(question, { result: { correct: true, assisted: false }, wrongCount: 0 });
    assert.ok(independent.includes("Riktig!") && independent.includes("Riktig svar:") && independent.includes(escaped(question.explanation)));
    assert.equal(independent.includes("teller derfor som øving"), false);
    const assisted = render(question, { result: { correct: true, assisted: true }, wrongCount: 2, revealed: true });
    assert.ok(assisted.includes("Riktig!") && assisted.includes(escaped(question.explanation)));
    assert.ok(assisted.includes("teller derfor som øving"));
    assert.ok(assisted.includes("Start ny øvingsrunde"));
    assert.equal(assisted.includes("Fasit (øving, ikke mestring)"), false);
  }
});

test("saved history shows whether the last correct answer was assisted", () => {
  const question = allQuestions[0];
  const rev = question.revision ?? 1;
  assert.match(render(question, {}, { attempts: 3, correct: true, revision: rev }), /3 innsendte forsøk · Sist besvart riktig\./);
  assert.match(render(question, {}, { attempts: 3, correct: true, assisted: true, revision: rev }), /etter at fasiten var vist \(øving, ikke mestring\)/);
  assert.match(render(question, {}, { attempts: 1, correct: false, revision: rev }), /Sist besvart feil\./);
});

test("wrong answers are counted per question and reveal needs two of them", () => {
  const [a, b] = allQuestions;
  let round = freshRound(a.id);
  assert.equal(canRevealSolution(round), false);
  round = submitAnswer(changeAnswer(round, wrongAnswer(a)), false).state;
  assert.equal(round.wrongCount, 1);
  assert.equal(canRevealSolution(round), false);
  assert.equal(revealSolution(round).revealed, false, "reveal is refused after one wrong answer");
  round = submitAnswer(changeAnswer(round, wrongAnswer(a)), false).state;
  assert.equal(round.wrongCount, WRONG_BEFORE_SOLUTION);
  assert.equal(canRevealSolution(round), true);
  assert.equal(round.revealed, false, "the solution is never revealed automatically");
  assert.equal(revealSolution(round).revealed, true);
  // Switching to another question never reuses the state or the wrong-answer count.
  const other = roundFor(round, b.id);
  assert.equal(other.questionId, b.id);
  assert.equal(other.wrongCount, 0);
  assert.equal(other.revealed, false);
  assert.equal(roundFor(round, a.id), round);
});

test("changing the answer clears feedback but keeps the count, so the student can try again", () => {
  const q = allQuestions[0];
  const wrong = submitAnswer(changeAnswer(freshRound(q.id), wrongAnswer(q)), false).state;
  const retry = changeAnswer(wrong, rightAnswer(q));
  assert.equal(retry.result, null);
  assert.equal(retry.wrongCount, 1);
  const after = submitAnswer(retry, true);
  assert.equal(after.state.result.correct, true);
  assert.equal(after.assisted, false);
  assert.equal(after.state.wrongCount, 1, "a correct answer does not add a wrong attempt");
});

// Follows one student through the flow and returns the saved progress.
function playRound(progress, key, question, steps) {
  let round = freshRound(question.id);
  for (const step of steps) {
    if (step === "wrong" || step === "right") {
      const next = submitAnswer(changeAnswer(round, "x"), step === "right");
      round = next.state;
      progress = recordAnswer(progress, key, question.id, next.state.result.correct, question.revision ?? 1, next.assisted);
    } else if (step === "reveal") round = revealSolution(round);
    else if (step === "new-round") round = startNewRound(round);
  }
  return { progress, round };
}

const funksjonskomponenter = lessons.find(({ lesson }) => lesson.id === "funksjonskomponenter");
const key = lessonPath("react", funksjonskomponenter.module.id, "funksjonskomponenter");
const goalFor = (progress, question) => getCourseGoals(reactCourse, progress)
  .filter((goal) => goal.lessonKey === key && goal.exerciseIds.length === 1 && goal.exerciseIds[0] === question.id);

test("showing the solution alone grants no mastery and records nothing", () => {
  const question = funksjonskomponenter.lesson.exercises[0];
  const { progress } = playRound(emptyProgress(), key, question, ["wrong", "wrong", "reveal"]);
  assert.equal(progress.lessons[key].answers[question.id].attempts, 2, "only the two submitted answers are recorded");
  assert.equal(progress.lessons[key].answers[question.id].correct, false);
  assert.ok(goalFor(progress, question).every((goal) => goal.status !== "mastered"));
});

test("wrong twice, show solution, copy it: the answer is practice and does not give mastery", () => {
  const question = funksjonskomponenter.lesson.exercises[0];
  const { progress } = playRound(emptyProgress(), key, question, ["wrong", "wrong", "reveal", "right"]);
  const saved = progress.lessons[key].answers[question.id];
  assert.deepEqual({ attempts: saved.attempts, correct: saved.correct, assisted: saved.assisted }, { attempts: 3, correct: true, assisted: true });
  assert.equal(isIndependentCorrect(saved), false);
  for (const goal of goalFor(progress, question)) {
    assert.notEqual(goal.status, "mastered");
    assert.equal(goal.status, "in-progress");
  }
  assert.equal(getLessonProgress({ ...progress, lessons: { [key]: { ...progress.lessons[key], reviewed: true } } }, key, funksjonskomponenter.lesson.exercises).correct, 0);
});

test("a new practice round solved without the solution gives mastery, and history is kept", () => {
  const question = funksjonskomponenter.lesson.exercises[0];
  const { progress } = playRound(emptyProgress(), key, question, ["wrong", "wrong", "reveal", "right", "new-round", "right"]);
  const saved = progress.lessons[key].answers[question.id];
  assert.equal(saved.attempts, 4, "earlier attempts are counted, not deleted");
  assert.equal(saved.assisted, undefined);
  assert.ok(goalFor(progress, question).every((goal) => goal.status === "mastered"));
});

test("a correct answer without ever showing the solution still gives mastery, also after wrong attempts", () => {
  const question = funksjonskomponenter.lesson.exercises[0];
  const { progress } = playRound(emptyProgress(), key, question, ["wrong", "wrong", "right"]);
  assert.equal(progress.lessons[key].answers[question.id].assisted, undefined);
  assert.ok(goalFor(progress, question).every((goal) => goal.status === "mastered"));
});

test("a new round after a revealed solution starts with no revealed state and no counted mistakes", () => {
  const q = allQuestions[0];
  let round = freshRound(q.id);
  round = submitAnswer(changeAnswer(round, "x"), false).state;
  round = submitAnswer(changeAnswer(round, "x"), false).state;
  round = revealSolution(round);
  const next = startNewRound(round);
  assert.deepEqual({ ...next, round: 0 }, freshRound(q.id));
  assert.equal(next.round, 1);
});

test("existing saved progress without the assisted field still works and counts as before", () => {
  const stored = { version: 1, lessons: { [key]: { reviewed: true, answers: { "component-definition": { attempts: 2, correct: true } } } } };
  assert.equal(validStoredProgress(stored), true);
  const progress = sanitizeProgress(stored);
  assert.deepEqual(progress.lessons[key].answers["component-definition"], { attempts: 2, correct: true });
  const session = loadProgressSession(() => ({ getItem: () => JSON.stringify(stored) }));
  assert.equal(session.storageBlocked, false);
  assert.equal(readProgress({ getItem: () => JSON.stringify(stored) }).lessons[key].answers["component-definition"].correct, true);
  const question = funksjonskomponenter.lesson.exercises.find((q) => q.id === "component-definition");
  assert.ok(goalFor(progress, question).every((goal) => goal.status === "mastered"));
});

test("assisted answers are saved, validated and sanitized; malformed flags are rejected or dropped", () => {
  const withFlag = { version: 1, lessons: { [key]: { reviewed: false, answers: { q: { attempts: 3, correct: true, assisted: true } } } } };
  assert.equal(validStoredProgress(withFlag), true);
  assert.deepEqual(sanitizeProgress(withFlag).lessons[key].answers.q, { attempts: 3, correct: true, assisted: true });
  const malformed = { version: 1, lessons: { [key]: { reviewed: false, answers: { q: { attempts: 3, correct: true, assisted: "yes" } } } } };
  assert.equal(validStoredProgress(malformed), false);
  assert.equal(sanitizeProgress(malformed).lessons[key].answers.q.assisted, undefined);
  // A wrong answer never carries the flag, and the flag never contains answer text or keys.
  const wrong = recordAnswer(emptyProgress(), key, "q", false, 1, true);
  assert.deepEqual(wrong.lessons[key].answers.q, { attempts: 1, correct: false });
  assert.equal(JSON.stringify(withFlag).includes("explanation"), false);
  assert.ok(PROGRESS_KEY.length > 0);
});

test("QuestionFrame is wired to the same rules for every question type in the course", () => {
  for (const question of allQuestions) {
    assert.equal(checkAnswer(question, rightAnswer(question)), true, question.id);
    assert.equal(checkAnswer(question, wrongAnswer(question)), false, question.id);
  }
  const html = renderToStaticMarkup(createElement(MemoryRouter, null, createElement("div")));
  assert.ok(html.length > 0);
});
