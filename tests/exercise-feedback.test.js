import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";
import { MemoryRouter } from "react-router-dom";
import { emptyProgress, recordAnswer } from "../src/progress/progress.js";
import { lessonPath } from "../src/content/courses.js";
import { reactCourse } from "../src/content/reactCourse.js";
import { reactComponentsLesson } from "../src/content/lessons/reactComponents.js";

let server;
let QuestionFrame;
let CourseGoals;
let LessonGoals;
let LearningProgressContext;
before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false, watch: null } });
  ({ default: CourseGoals } = await server.ssrLoadModule("/src/components/CourseGoals.jsx"));
  ({ default: LessonGoals } = await server.ssrLoadModule("/src/components/LessonGoals.jsx"));
  ({ LearningProgressContext } = await server.ssrLoadModule("/src/context/LearningProgressContext.js"));
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


test("dashboard and lesson render identical goal statuses from the same saved answers", () => {
  const key = lessonPath("react", "jsx-komponenter", reactComponentsLesson.id);
  const states = [emptyProgress()];
  let progress = emptyProgress();
  for (const question of reactComponentsLesson.exercises) {
    progress = recordAnswer(progress, key, question.id, true);
    states.push(progress);
  }
  for (const saved of states) {
    const render = (Component, props) => renderToStaticMarkup(
      createElement(MemoryRouter, null,
        createElement(LearningProgressContext.Provider, { value: { progress: saved } },
          createElement(Component, props),
        ),
      ),
    );
    const dashboard = render(CourseGoals, { course: reactCourse });
    const lesson = render(LessonGoals, { lesson: reactComponentsLesson, lessonKey: key });
    const statuses = (html) => [...html.matchAll(/goal-status goal-status-([^" ]+)/g)].map((match) => match[1]);
    assert.deepEqual(statuses(dashboard), statuses(lesson));
    assert.equal(statuses(dashboard).length, 4);
    assert.equal(dashboard.includes('type="checkbox"'), false);
    assert.equal(lesson.includes('type="checkbox"'), false);
    assert.equal((dashboard.match(/Til leksjonen:/g) ?? []).length, 4);
  }
});
