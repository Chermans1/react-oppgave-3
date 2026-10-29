import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";
import { reactComponentsLesson } from "../src/content/lessons/reactComponents.js";

let server;
let QuestionFrame;
before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false, watch: null } });
  ({ default: QuestionFrame } = await server.ssrLoadModule("/src/components/exercises/QuestionFrame.jsx"));
});
after(async () => { await server?.close(); });

function renderQuestion(question, result = null, attempt) {
  return renderToStaticMarkup(createElement(QuestionFrame, {
    question,
    number: reactComponentsLesson.exercises.indexOf(question) + 1,
    attempt,
    state: { answer: "", result, handleSubmit() {} },
  }));
}

function escaped(text) {
  return renderToStaticMarkup(createElement("span", null, text)).slice(6, -7);
}

test("each exercise tests a separate skill with separate examples", () => {
  const [concept, application, debugging] = reactComponentsLesson.exercises;
  assert.equal(new Set([concept.skill, application.skill, debugging.skill]).size, 3);
  assert.equal(concept.code, undefined);
  assert.match(application.code, /function CourseBadge/);
  assert.match(debugging.code, /const Notice/);
  assert.equal(application.code.includes("Notice"), false);
  assert.equal(debugging.code.includes("CourseBadge"), false);
  for (const other of [concept, debugging]) {
    // Neither the other prompt, options, code nor feedback provides the fill-in answer.
    assert.equal(JSON.stringify(other).includes(application.validAnswers[0]), false);
  }
});

test("fresh and restored-but-unsubmitted questions do not render solutions or explanations", () => {
  for (const question of reactComponentsLesson.exercises) {
    for (const attempt of [undefined, { correct: true, attempts: 1 }]) {
      const html = renderQuestion(question, null, attempt);
      assert.equal(html.includes("Riktig svar:"), false);
      assert.equal(html.includes(escaped(question.explanation)), false);
      assert.match(html, /Oppgave/);
      assert.match(html, new RegExp(question.skill));
    }
  }
});

test("only the submitted question renders its own feedback, for both outcomes", () => {
  const questions = reactComponentsLesson.exercises;
  for (const active of questions) {
    for (const correct of [false, true]) {
      const html = questions.map((question) => renderQuestion(question, question === active ? { correct } : null)).join("");
      assert.equal(html.split("Riktig svar:").length - 1, 1);
      assert.equal(html.includes(escaped(active.explanation)), true);
      assert.equal(html.includes(correct ? "Riktig!" : "Ikke helt riktig ennå."), true);
      assert.match(html, /Endre svaret for å prøve igjen/);
      for (const other of questions.filter((question) => question !== active)) {
        assert.equal(html.includes(escaped(other.explanation)), false);
      }
    }
  }
});
