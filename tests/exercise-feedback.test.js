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
      // A wrong answer shows a hint only; the solution and explanation wait for a correct answer or an explicit choice.
      assert.equal(html.split("Riktig svar:").length - 1, correct ? 1 : 0);
      assert.equal(html.includes(escaped(active.explanation)), correct);
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
    assert.deepEqual(dashboard.split("<li").filter((row) => row.includes(`href="${key}"`)).flatMap(statuses), statuses(lesson));
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
  const planned = { id: "test-placeholder", title: "Test", status: "planned", learningObjectives: [], content: [], codeExamples: [], exercises: [] };
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

test("every completed lesson renders its sections, activities and hidden feedback without placeholders", () => {
  for (const module of reactCourse.modules) for (const lesson of module.lessons) {
    const html = renderLesson(lesson);
    assert.equal((html.match(/class="teaching-section"/g) ?? []).length, lesson.sections.length, lesson.id);
    assert.equal(html.includes("Denne leksjonen er planlagt"), false);
    assert.equal(html.includes("Riktig svar:"), false);
    for (const question of lesson.exercises) {
      assert.equal(html.split(escaped(question.prompt)).length - 1, 1, question.id);
      assert.equal(html.includes(escaped(question.explanation)), false, question.id);
    }
    if (lesson.practicalActivities?.length) {
      assert.match(html, /Praktisk mål: gjennomføres i eget prosjekt/);
      assert.match(html, /Kunnskapsdel mestret/);
      assert.equal((html.match(/class="practical-activity"/g) ?? []).length, lesson.practicalActivities.length);
      assert.equal(html.includes("practicalCompleted"), false);
      for (const activity of lesson.practicalActivities) {
        for (const criterion of activity.criteria) assert.ok(html.includes(escaped(criterion)));
      }
    }
  }
});

test("practical work stays unassessed in dashboard and lesson even with all knowledge checks passed", () => {
  const module = reactCourse.modules.find((m) => m.id === "sluttprosjekt");
  const lesson = module.lessons.at(-1);
  const key = lessonPath(reactCourse.id, module.id, lesson.id);
  let progress = emptyProgress();
  for (const question of lesson.exercises) progress = recordAnswer(progress, key, question.id, true);
  progress.lessons[key].reviewed = true;
  const render = (Component, props) => renderToStaticMarkup(createElement(MemoryRouter, null,
    createElement(LearningProgressContext.Provider, { value: { progress, setReviewed() {} } }, createElement(Component, props)),
  ));
  const dashboard = render(CourseGoals, { course: reactCourse });
  const lessonMarkup = render(LessonView, { lesson, lessonKey: key, navigation: {} });
  const practical = getCourseGoals(reactCourse, progress).find((g) => g.id === "testing-publisering-practical-goal");
  assert.equal(practical.status, "not-started");
  assert.ok(dashboard.includes(escaped(practical.description)));
  assert.ok(lessonMarkup.includes(escaped(practical.description)));
  assert.match(lessonMarkup, /Kunnskapsdel mestret/);
  assert.match(lessonMarkup, /denne modellen registrerer ikke praktisk gjennomføring/);
  assert.equal(lessonMarkup.includes("Leksjon mestret"), false);
});

test("all course questions show solution and explanation only after a correct answer", () => {
  for (const module of reactCourse.modules) for (const lesson of module.lessons) for (const question of lesson.exercises) {
    const unanswered = renderQuestion(question, null, { correct: true, attempts: 1 });
    assert.equal(unanswered.includes(escaped(question.explanation)), false, question.id);
    const wrong = renderQuestion(question, { correct: false });
    assert.ok(wrong.includes("Ikke helt riktig ennå."));
    assert.equal(wrong.includes("Riktig svar:"), false, question.id);
    assert.equal(wrong.includes(escaped(question.explanation)), false, question.id);
    assert.match(wrong, /Endre svaret for å prøve igjen/);
    const right = renderQuestion(question, { correct: true });
    assert.ok(right.includes("Riktig!"));
    assert.ok(right.includes(escaped(question.explanation)), question.id);
    assert.ok(right.includes("Riktig svar:"));
  }
});

test("course summary counts knowledge only and explicitly explains practical goals", () => {
  const markup = renderToStaticMarkup(createElement(MemoryRouter, null,
    createElement(LearningProgressContext.Provider, { value: { progress: emptyProgress() } },
      createElement(CourseGoals, { course: reactCourse })),
  ));
  const goals = getCourseGoals(reactCourse, emptyProgress());
  const practicalCount = goals.filter((g) => g.assessment === "practical").length;
  assert.ok(markup.includes(`0 av ${goals.filter((g) => g.assessment !== "practical" && !g.optional).length} obligatoriske kunnskapsmål mestret`));
  assert.ok(markup.includes(`kurset ${practicalCount} praktiske mål`));
  assert.match(markup, /inngår ikke i den automatiske prosentberegningen/);
});


test("revised attempts remain visible history without revealing a new solution or granting mastery", () => {
  const question = reactCourse.modules.flatMap((m) => m.lessons).flatMap((l) => l.exercises).find((q) => q.id === "dataflyt-props-values-check");
  const markup = renderQuestion(question, null, { attempts: 3, correct: true });
  assert.match(markup, /eldre utgave/);
  assert.match(markup, /må besvares på nytt/);
  assert.equal(markup.includes("Riktig svar:"), false);
  assert.equal(markup.includes(escaped(question.explanation)), false);
});


test("dashboard groups all goals by closed native modules and keeps optional/practical goals outside mandatory progress", () => {
  const progress = emptyProgress();
  const html = renderToStaticMarkup(createElement(MemoryRouter, null,
    createElement(LearningProgressContext.Provider, { value: { progress } },
      createElement(CourseGoals, { course: reactCourse }),
    ),
  ));
  assert.equal((html.match(/<details class="module-goals"/g) ?? []).length, 14);
  assert.equal((html.match(/<summary>/g) ?? []).length, 14);
  assert.doesNotMatch(html, /<details[^>]*\bopen(?:=|>| )/);
  assert.equal((html.match(/Til leksjonen:/g) ?? []).length, 266);
  assert.match(html, /0 av 201 obligatoriske kunnskapsmål mestret/);
  assert.match(html, /Valgfrie kunnskapsmål \(3\)/);
  assert.match(html, /Praktiske mål – vurderes i eget prosjekt/);
  for (const module of reactCourse.modules) {
    const rows = html.split('<details class="module-goals"').find((part) => part.includes(`. ${module.title}</span>`));
    assert.ok(rows, module.id);
    for (const lesson of module.lessons) {
      const target = lessonPath(reactCourse.id, module.id, lesson.id);
      const count = rows.split(`href="${target}"`).length - 1;
      assert.equal(count, lesson.learningObjectives.length, target);
    }
  }
});
