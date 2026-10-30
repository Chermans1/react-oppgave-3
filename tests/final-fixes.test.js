import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { createElement, useContext } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";
import { PROGRESS_KEY, emptyProgress, recordAnswer } from "../src/progress/progress.js";
import { loadProgressSession, changeProgressSession, recoverProgressSession, saveProgressSession } from "../src/progress/storage.js";
import { readTasks, writeTasks } from "../src/content/examples/taskStorage.js";
import { workshops as hookWorkshops } from "../src/content/workshops/hooks.js";
import { lessonQueryViewSource } from "../src/content/examples/exampleSources.js";
import { reactCourse } from "../src/content/reactCourse.js";
import { getGoalProgress } from "../src/progress/goals.js";
import { checkAnswer } from "../src/components/exercises/answers.js";

const add = (id, revision = 2) => (p) => recordAnswer(p, "/lesson", id, true, revision);
function fixture(raw = null) {
  const items = new Map([["unrelated", "keep"]]);
  if (raw !== null) items.set(PROGRESS_KEY, raw);
  let writes = 0, denied = false;
  const storage = {
    getItem: (key) => items.get(key) ?? null,
    setItem(key, value) { writes++; if (denied) throw new Error("quota"); items.set(key, value); },
  };
  return { storage, getStorage: () => storage, items, writes: () => writes, deny: (value) => { denied = value; } };
}

test("missing progress permits normal persistence, while malformed data blocks every automatic write", () => {
  const fresh = fixture();
  let session = loadProgressSession(fresh.getStorage);
  assert.equal(session.storageBlocked, false);
  session = changeProgressSession(session, add("q"), fresh.getStorage);
  assert.equal(fresh.writes(), 1);
  assert.deepEqual(loadProgressSession(fresh.getStorage).progress, session.progress);
  for (const raw of ["", "{bad", "null", '{"version":99,"lessons":{}}', '{"version":1,"lessons":[]}', '{"version":1,"lessons":{"l":{"reviewed":true,"answers":{"q":{"attempts":0,"correct":true}}}}}']) {
    const f = fixture(raw);
    let state = loadProgressSession(f.getStorage);
    assert.equal(state.storageBlocked, true, raw);
    state = changeProgressSession(state, add("a"), f.getStorage);
    state = changeProgressSession(state, add("b"), f.getStorage);
    assert.equal(f.writes(), 0);
    assert.equal(f.items.get(PROGRESS_KEY), raw);
    assert.equal(state.progress.lessons["/lesson"].answers.b.correct, true);
    assert.equal(f.items.get("unrelated"), "keep");
  }
});

test("failed recovery keeps session work; an explicit replacement is the only write after read failure", () => {
  const f = fixture("original malformed text");
  let state = changeProgressSession(loadProgressSession(f.getStorage), add("a"), f.getStorage);
  const work = state.progress;
  state = recoverProgressSession(state, f.getStorage);
  assert.equal(state.storageBlocked, true);
  assert.deepEqual(state.progress, work);
  assert.equal(f.writes(), 0);
  state = saveProgressSession(state, f.getStorage); // explicit confirmed UI action
  assert.equal(state.storageBlocked, false);
  assert.equal(state.storageError, "");
  assert.equal(f.writes(), 1);
  assert.deepEqual(loadProgressSession(f.getStorage).progress, work);
  assert.equal(f.items.get("unrelated"), "keep");
});

test("explicit reread restores valid legacy and revised progress without writing or losing revisions", () => {
  const f = fixture("broken");
  let state = changeProgressSession(loadProgressSession(f.getStorage), add("in-memory"), f.getStorage);
  const saved = recordAnswer(recordAnswer(emptyProgress(), "/old", "legacy", true), "/new", "revised", false, 3);
  f.items.set(PROGRESS_KEY, JSON.stringify(saved));
  state = recoverProgressSession(state, f.getStorage);
  assert.equal(state.storageBlocked, false);
  assert.deepEqual(state.progress, saved);
  assert.equal(f.writes(), 0);
  state = changeProgressSession(state, add("next", 3), f.getStorage);
  const reloaded = loadProgressSession(f.getStorage);
  assert.deepEqual(reloaded.progress, state.progress);
  assert.deepEqual(reloaded.progress.lessons["/old"].answers.legacy, { attempts: 1, correct: true });
  assert.equal(reloaded.progress.lessons["/new"].answers.revised.revision, 3);
});

test("write failures pause later automatic writes and preserve pending work until explicit retry", () => {
  const raw = JSON.stringify(emptyProgress()), f = fixture(raw);
  let state = loadProgressSession(f.getStorage);
  f.deny(true);
  state = changeProgressSession(state, add("a"), f.getStorage);
  state = changeProgressSession(state, add("b"), f.getStorage);
  assert.equal(state.storageBlocked, true);
  assert.equal(f.writes(), 1);
  assert.equal(f.items.get(PROGRESS_KEY), raw);
  f.deny(false);
  state = changeProgressSession(state, add("c"), f.getStorage);
  assert.equal(f.writes(), 1); // becoming available alone never enables writes
  state = saveProgressSession(state, f.getStorage);
  assert.equal(state.storageBlocked, false);
  assert.equal(f.writes(), 2);
  assert.deepEqual(Object.keys(loadProgressSession(f.getStorage).progress.lessons["/lesson"].answers), ["a", "b", "c"]);
});

test("progress storage access itself may throw without breaking the session", () => {
  const getStorage = () => { throw new DOMException("blocked", "SecurityError"); };
  let state = loadProgressSession(getStorage);
  state = changeProgressSession(state, add("a"), getStorage);
  assert.equal(state.storageBlocked, true);
  assert.equal(state.progress.lessons["/lesson"].answers.a.correct, true);
  assert.equal(saveProgressSession(state, getStorage).storageBlocked, true);
});

test("teaching storage helpers catch SecurityError at property access and preserve invalid originals", () => {
  let attempts = 0;
  const getStorage = () => { attempts++; throw new DOMException("blocked", "SecurityError"); };
  const loaded = readTasks(getStorage);
  assert.equal(loaded.canWrite, false);
  assert.ok(loaded.error);
  assert.ok(writeTasks(getStorage, [], loaded.canWrite));
  assert.equal(attempts, 1); // blocked writing never even accesses the property again
  assert.ok(writeTasks(getStorage, [], true));
  let raw = "{bad", writes = 0;
  const storage = { getItem: () => raw, setItem(key, value) { writes++; raw = value; } };
  const invalid = readTasks(() => storage);
  assert.ok(writeTasks(() => storage, [{ id: "a", title: "Les", done: false }], invalid.canWrite));
  assert.equal(raw, "{bad"); assert.equal(writes, 0);
  assert.equal(readTasks(() => ({ getItem: () => null })).canWrite, true);
});

let server, Provider, Context, QueryView, Notice;
before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false, watch: null } });
  ({ default: Provider } = await server.ssrLoadModule("/src/context/LearningProgressProvider.jsx"));
  ({ LearningProgressContext: Context } = await server.ssrLoadModule("/src/context/LearningProgressContext.js"));
  ({ default: QueryView } = await server.ssrLoadModule("/src/content/examples/LessonQueryResult.jsx"));
  ({ default: Notice } = await server.ssrLoadModule("/src/components/ProgressStorageNotice.jsx"));
});
after(async () => { await server?.close(); });

function mountProvider(f) {
  let context;
  function Capture() { context = useContext(Context); return null; }
  renderToStaticMarkup(createElement(Provider, { getStorage: f.getStorage }, createElement(Capture)));
  return context;
}

test("actual provider preserves raw bytes while answers and review accumulate in memory", () => {
  const f = fixture("damaged original"), context = mountProvider(f);
  assert.equal(context.storageBlocked, true);
  context.submitAnswer("/lesson", "q", false, 3);
  context.submitAnswer("/lesson", "q", true, 3);
  context.setReviewed("/lesson", true);
  assert.equal(f.items.get(PROGRESS_KEY), "damaged original");
  assert.equal(f.writes(), 0);
  context.recoverStoredProgress();
  assert.equal(f.writes(), 0);
  context.replaceStoredProgress();
  const recovered = loadProgressSession(f.getStorage).progress.lessons["/lesson"];
  assert.equal(recovered.reviewed, true);
  assert.deepEqual(recovered.answers.q, { attempts: 2, correct: true, revision: 3 });
});

test("actual provider saves normally and restores legacy progress only on explicit reread", () => {
  const f = fixture(), context = mountProvider(f);
  context.submitAnswer("/lesson", "q", true, 3);
  assert.equal(loadProgressSession(f.getStorage).progress.lessons["/lesson"].answers.q.revision, 3);
  const old = recordAnswer(emptyProgress(), "/old", "legacy", true);
  f.items.set(PROGRESS_KEY, JSON.stringify(old));
  context.recoverStoredProgress();
  context.submitAnswer("/next", "new", true, 3);
  const actual = loadProgressSession(f.getStorage).progress;
  assert.deepEqual(actual.lessons["/old"], old.lessons["/old"]);
  assert.equal(actual.lessons["/next"].answers.new.revision, 3);
});

test("recovery UI explains replacement and disables it before the explicit acknowledgement", () => {
  const markup = renderToStaticMarkup(createElement(Context.Provider, { value: {
    storageError: "Bevart original", storageBlocked: true,
    recoverStoredProgress() {}, replaceStoredProgress() {},
  } }, createElement(Notice)));
  assert.match(markup, /Les lagret progresjon på nytt/);
  assert.match(markup, /type="checkbox"/);
  assert.match(markup, /disabled="">Erstatt lagring med øktens progresjon/);
});

test("complete teaching hook survives a SecurityError from window.localStorage during rendering", async () => {
  const block = hookWorkshops.localstorage.sections[0].blocks.find((b) => b.type === "code");
  const source = block.code.replace('from "react"', `from ${JSON.stringify(import.meta.resolve("react"))}`)
    .replace('from "./taskStorage.js"', `from ${JSON.stringify(new URL("../src/content/examples/taskStorage.js", import.meta.url).href)}`);
  const { useStoredTasks } = await import("data:text/javascript," + encodeURIComponent(source));
  const previous = Object.getOwnPropertyDescriptor(globalThis, "window");
  Object.defineProperty(globalThis, "window", { configurable: true, value: {
    get localStorage() { throw new DOMException("blocked", "SecurityError"); },
  } });
  try {
    let state;
    function Probe() { state = useStoredTasks(); return createElement("p", null, state.storageError); }
    const html = renderToStaticMarkup(createElement(Probe));
    assert.equal(state.canWrite, false);
    assert.deepEqual(state.tasks, []);
    assert.match(html, /Originaldata er bevart/);
  } finally {
    if (previous) Object.defineProperty(globalThis, "window", previous);
    else delete globalThis.window;
  }
});

const result = (patch = {}) => ({ data: undefined, isPaused: false, isPending: false, isLoading: false,
  isFetching: false, isError: false, refetch() {}, ...patch });
function view(patch, courseId = "react") {
  return renderToStaticMarkup(createElement(QueryView, { courseId, result: result(patch) }));
}

test("actual Query view distinguishes no selection, missing data, loading, pause, error and empty success", () => {
  assert.match(view({}, ""), /Velg et kurs/);
  assert.match(view({ isPending: true, isLoading: true }), /Laster leksjoner/);
  const paused = view({ isPending: true, isPaused: true });
  assert.match(paused, /venter på nettforbindelse/);
  assert.doesNotMatch(paused, /Ingen leksjoner/);
  assert.match(view({ isError: true }), /Kunne ikke hente/);
  assert.match(view({}), /Kontroller API-kontrakten/);
  assert.match(view({ data: [] }), /Ingen leksjoner/);
  assert.match(view({ data: {} }), /ikke en leksjonsliste/);
});

test("actual Query view retains existing data during refreshing, pause and failure", () => {
  for (const flags of [{ isFetching: true }, { isPaused: true }, { isError: true }]) {
    const markup = view({ data: [{ id: "jsx", title: "JSX" }], ...flags });
    assert.match(markup, /<li>JSX<\/li>/);
    assert.doesNotMatch(markup, /Ingen leksjoner/);
    if (flags.isFetching) assert.match(markup, /Oppdaterer/);
    if (flags.isPaused) assert.match(markup, /Tidligere data vises/);
    if (flags.isError) assert.match(markup, /Tidligere data beholdes/);
  }
  let calls = 0;
  const element = QueryView({ courseId: "react", result: result({ isError: true, refetch() { calls++; } }) });
  element.props.children.find((child) => child?.type === "button").props.onClick();
  assert.equal(calls, 1);
});

test("shown Query view is the tested component source and min-memory mode is explicitly scoped", async () => {
  const { readFile } = await import("node:fs/promises");
  assert.equal(lessonQueryViewSource, await readFile(new URL("../src/content/examples/LessonQueryResult.jsx", import.meta.url), "utf8"));
  const l = reactCourse.modules.flatMap((m) => m.lessons).find((l) => l.id === "queries-cache");
  const blocks = l.sections.flatMap((s) => s.blocks);
  assert.ok(blocks.some((b) => b.code === lessonQueryViewSource));
  assert.ok(blocks.some((b) => b.code?.includes('networkMode: "always"')));
});

test("four changed assessments require revision 3 while other task revisions remain unchanged", () => {
  const changed = ["children-slot-check", "children-responsibility-check", "children-render-check", "klient-server-provider-check"];
  const lessons = reactCourse.modules.flatMap((m) => m.lessons);
  for (const l of lessons) for (const q of l.exercises) {
    const expected = changed.includes(q.id) ? 3 : ["funksjonskomponenter", "fra-main-til-app", "jsx-regler"].includes(l.id) ? 1 : 2;
    assert.equal(q.revision ?? 1, expected, q.id);
    if (expected !== 3) continue;
    let p = recordAnswer(emptyProgress(), "lesson", q.id, true, 2);
    for (const goal of l.learningObjectives.filter((g) => g.exerciseIds.includes(q.id))) assert.notEqual(getGoalProgress(p, "lesson", goal, l.exercises).status, "mastered");
    p = recordAnswer(p, "lesson", q.id, true, 3);
    for (const goal of l.learningObjectives.filter((g) => g.exerciseIds.includes(q.id))) assert.equal(getGoalProgress(p, "lesson", goal, l.exercises).status, "mastered");
    for (const option of q.options) assert.equal(checkAnswer(q, option.id), option.id === q.correctAnswer);
    assert.equal(q.type === "FillInCodeQuestion", false);
  }
});

test("capstone minimum is consistent in teaching, task, acceptance and checks", () => {
  const l = reactCourse.modules.flatMap((m) => m.lessons).find((l) => l.id === "datamodell");
  const section = l.sections.find((s) => s.id === "byggetrinn-en");
  const activity = l.practicalActivities[0];
  for (const text of [l.introduction, section.blocks[0].text, activity.description, ...activity.criteria.filter((s) => s.includes("To kurs")), activity.checks[0]]) {
    assert.match(text, /to moduler med to leksjoner hver/i);
    assert.match(text, /andre.*én modul med én leksjon/);
  }
});

test("TypeScript guidance selects the app configuration and explains project references", () => {
  const l = reactCourse.modules.flatMap((m) => m.lessons).find((l) => l.id === "typescript");
  const text = JSON.stringify(l);
  assert.match(text, /tsc -p tsconfig.app.json --noEmit/);
  assert.doesNotMatch(text, /tsc --noEmit/);
  assert.match(text, /tsconfig.json i roten/);
  assert.match(text, /tsc -b/);
});


test("revised questions use independent examples and cannot be solved by copying another task's exact solution", () => {
  const lessons = reactCourse.modules.flatMap((m) => m.lessons);
  for (const id of ["children", "klient-server"]) {
    const l = lessons.find((l) => l.id === id);
    for (const q of l.exercises.filter((q) => q.revision === 3)) {
      const solution = q.options.find((o) => o.id === q.correctAnswer).text;
      const visible = [q.title, q.prompt, q.code, ...l.exercises.filter((other) => other.id !== q.id).map((other) => JSON.stringify(other))].join("\n");
      assert.equal(visible.includes(solution), false, q.id);
    }
  }
});
