import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";
import { MemoryRouter } from "react-router-dom";
import { emptyProgress, recordAnswer } from "../src/progress/progress.js";
import { lessonPath } from "../src/content/courses.js";
import { jsxRulesLesson } from "../src/content/lessons/jsxRules.js";
import { mainToAppLesson } from "../src/content/lessons/mainToApp.js";
import { getCourseGoals } from "../src/progress/goals.js";
import { reactCourse } from "../src/content/reactCourse.js";
import { reactComponentsLesson } from "../src/content/lessons/reactComponents.js";

let server;
let QuestionFrame;
let CourseGoals;
let LessonGoals;
let LearningProgressContext;
let LessonView;
let VisualExample;
before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false, watch: null } });
  ({ default: LessonView } = await server.ssrLoadModule("/src/components/LessonView.jsx"));
  ({ default: VisualExample } = await server.ssrLoadModule("/src/components/lesson/VisualExample.jsx"));
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
    const allGoals = getCourseGoals(reactCourse, saved);
    assert.deepEqual(statuses(dashboard).filter((_, index) => allGoals[index].lessonKey === key), statuses(lesson));
    assert.equal(statuses(dashboard).length, allGoals.length);
    assert.equal(dashboard.includes('type="checkbox"'), false);
    assert.equal(lesson.includes('type="checkbox"'), false);
    assert.equal((dashboard.match(/Til leksjonen:/g) ?? []).length, allGoals.length);
  }
});


function renderLesson(lesson = reactComponentsLesson) {
  return renderToStaticMarkup(createElement(MemoryRouter, null,
    createElement(LearningProgressContext.Provider, {
      value: { progress: emptyProgress(), storageError: "", setReviewed() {}, submitAnswer() {} },
    }, createElement(LessonView, {
      lesson,
      lessonKey: lessonPath("react", "jsx-komponenter", lesson.id),
      navigation: { previous: null, next: null },
    })),
  ));
}

test("all seven sections and exercises render immediately with free section navigation", () => {
  const html = renderLesson();
  const sections = reactComponentsLesson.sections;
  assert.equal(sections.length, 7);
  assert.equal(new Set(sections.map((section) => section.id)).size, 7);
  assert.equal((html.match(/class="teaching-section"/g) ?? []).length, 7);
  for (const section of sections) assert.ok(html.includes(escaped(section.title)));
  assert.equal((html.match(/<button type="button"/g) ?? []).length, 7);
  for (const question of reactComponentsLesson.exercises) assert.ok(html.includes(escaped(question.prompt)));
  assert.equal(html.includes("Riktig svar:"), false);
  assert.ok(html.includes("Kursmål og mestring"));
  assert.ok(html.includes("Din leksjonsprogresjon"));
});

test("teaching examples supply concepts without copying exercise answers", () => {
  const sections = reactComponentsLesson.sections;
  const source = JSON.stringify(sections);
  assert.equal(source.includes("courseName"), false);
  assert.equal(source.includes("Husk en kort pause."), false);
  assert.equal(source.includes(reactComponentsLesson.exercises[0].options[1].text), false);
  const code = sections.flatMap((section) => section.blocks).filter((block) => block.type === "code");
  assert.ok(code.some((block) => block.code.includes("<Welcome />")));
  assert.ok(code.some((block) => block.code.includes("const course =")));
});

test("visual results match Welcome, the variable value and three CourseCard usages", () => {
  const blocks = reactComponentsLesson.sections.flatMap((section) => section.blocks);
  const previews = blocks.filter((block) => block.type === "preview");
  const renderPreview = (block) => renderToStaticMarkup(createElement(VisualExample, block));
  const welcome = previews.find((block) => block.nodes[0].tag === "h1");
  assert.ok(renderPreview(welcome).includes("Velkommen til React!"));
  const cards = previews.find((block) => block.nodes[0].tag === "main");
  const cardHtml = renderPreview(cards);
  assert.equal((cardHtml.match(/<article /g) ?? []).length, 3);
  assert.equal((cardHtml.match(/React for nybegynnere/g) ?? []).length, 3);
  const cardCode = blocks.find((block) => block.type === "code" && block.code.includes("function CourseCard"));
  assert.equal((cardCode.code.match(/<CourseCard \/>/g) ?? []).length, 3);
  assert.equal(cardHtml.includes("<main"), false);
  const badge = previews.find((block) => block.nodes[0].tag === "span");
  assert.ok(renderPreview(badge).includes('class="preview-span">React</span>'));
  const html = renderLesson();
  for (const component of ["App", "Header", "Navigation", "CourseList", "CourseCard", "Footer"]) {
    assert.ok(html.includes(`<code>${component}</code>`));
  }
});

test("preview nodes cannot run code or inject HTML", () => {
  const html = renderToStaticMarkup(createElement(VisualExample, {
    caption: "Test", nodes: [{ tag: "script", text: "throw new Error()" }, { tag: "span", text: "<script>alert(1)</script>" }],
  }));
  assert.equal(html.includes("<script>"), false);
  assert.ok(html.includes("&lt;script&gt;"));
});

test("lessons without sections retain the existing placeholder view", () => {
  const planned = reactCourse.modules[0].lessons[0];
  const html = renderLesson(planned);
  assert.ok(html.includes("Forklaringsteksten er ikke publisert ennå."));
  assert.ok(html.includes("Kodeeksempler kommer her."));
  assert.ok(html.includes("Ingen oppgaver er tilgjengelige ennå."));
  assert.equal(html.includes("teaching-section"), false);
});


test("main-to-App exercises appear once, near their teaching, with global question numbers", () => {
  const html = renderLesson(mainToAppLesson);
  assert.equal((html.match(/class="teaching-section"/g) ?? []).length, 7);
  for (const question of mainToAppLesson.exercises) {
    assert.equal(html.split(escaped(question.prompt)).length - 1, 1);
    assert.equal(html.includes(escaped(question.explanation)), false);
  }
  for (let number = 1; number <= 4; number++) assert.ok(html.includes(`Oppgave ${number}`));
  const sections = mainToAppLesson.sections;
  for (const index of [1, 2, 4, 5]) {
    assert.ok(sections[index].blocks.some((block) => block.type === "exercises"));
  }
  assert.equal(html.includes("Riktig svar:"), false);
});


test("JSX sections render five numbered activities without revealing unsubmitted feedback", () => {
  const html = renderLesson(jsxRulesLesson);
  assert.equal((html.match(/class="teaching-section"/g) ?? []).length, 7);
  for (let number = 1; number <= 5; number++) assert.ok(html.includes(`Oppgave ${number}`));
  for (const question of jsxRulesLesson.exercises) {
    assert.equal(html.split(escaped(question.prompt)).length - 1, 1);
    assert.equal(html.includes(escaped(question.explanation)), false);
  }
  assert.equal(html.includes("Riktig svar:"), false);
});

test("JSX visual results show text/expression differences and a safely associated field", () => {
  const previews = jsxRulesLesson.sections.flatMap((section) => section.blocks).filter((block) => block.type === "preview");
  const render = (block) => renderToStaticMarkup(createElement(VisualExample, block));
  const expressions = render(previews[0]);
  for (const text of ["firstName", "Sara", "6"]) assert.ok(expressions.includes(`>${text}</p>`));
  const field = render(previews[1]);
  const labelFor = field.match(/for="([^"]+)"/)[1];
  assert.ok(field.includes(`id="${labelFor}"`));
  assert.match(field, /readonly/i);
  assert.ok(field.includes('class="preview-label field-label"'));
  const secondField = renderToStaticMarkup(createElement("div", null,
    createElement(VisualExample, previews[1]), createElement(VisualExample, previews[1]),
  ));
  const ids = [...secondField.matchAll(/<input[^>]* id="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, 2);
  assert.ok(render(previews[3]).includes("Med pause: 25 minutter"));
});
