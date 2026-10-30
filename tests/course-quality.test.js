import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { reactCourse } from "../src/content/reactCourse.js";
import { reactCourseManifest } from "../src/content/courseManifest.js";
import { courseMetadata } from "../src/content/courseMetadata.js";
import { loadLesson } from "../src/content/loadLesson.js";
import { validateCourse } from "../src/content/validateCourse.js";
import { checkAnswer, normalizeCodeAnswer } from "../src/components/exercises/answers.js";
import { emptyProgress, recordAnswer, getLessonProgress, readProgress, updateLessonProgress } from "../src/progress/progress.js";
import { getGoalProgress, getCourseGoals, summarizeGoals } from "../src/progress/goals.js";
import { lessonPath } from "../src/content/courses.js";
import { practiceApiSource, taskStorageSource } from "../src/content/examples/exampleSources.js";
import { createPracticeApi, getCourses, getLessons, createCourse, getCoursePage } from "../src/content/examples/practiceApi.js";
import { validTasks, readTasks, writeTasks, TASKS_KEY } from "../src/content/examples/taskStorage.js";
import { goalFormExample, emptySubmitTest } from "../src/content/workshops/testing.js";

const lessons = reactCourse.modules.flatMap((m) => m.lessons);
const lesson = (id) => lessons.find((l) => l.id === id);
const question = (id) => lessons.flatMap((l) => l.exercises).find((q) => q.id === id);

test("JSX integer formatting accepts whitespace without rewriting arbitrary JS", () => {
  const q = question("dataflyt-props-values-check");
  for (const answer of ["{12}", "{ 12 }", " {\n12\t} "]) assert.equal(checkAnswer(q, answer), true, answer);
  for (const answer of ["{1 2}", '"12"', '{"12"}', "12", "{12;}", "{12 + 0}", "{ 13 }", "{012}", "{12/*x*/}", "{12} alert(1)", ""]) assert.equal(checkAnswer(q, answer), false, answer);
  assert.equal(normalizeCodeAnswer("course Name"), "course Name");
  assert.equal(normalizeCodeAnswer('"a  b"', "jsx-integer"), '"a  b"');
});

test("all accepted fill forms remain explicit and exact by default", () => {
  for (const q of lessons.flatMap((l) => l.exercises).filter((q) => q.validAnswers)) {
    for (const answer of q.validAnswers) assert.equal(checkAnswer(q, `\t${answer}\n`), true, q.id);
    assert.equal(checkAnswer(q, "arbitrary unsupported code"), false, q.id);
  }
  const path = question("welcome-import-path");
  assert.equal(checkAnswer(path, "./messages/Welcome"), true);
  assert.equal(checkAnswer(path, "./messages/Welcome.jsx"), true);
  assert.equal(checkAnswer(path, "./Messages/Welcome.jsx"), false);
});

test("old results are readable history but revised evidence requires a fresh answer", () => {
  const l = lesson("dataflyt-props"), key = lessonPath("react", "props-komposisjon", l.id);
  let progress = emptyProgress();
  for (const q of l.exercises) progress = recordAnswer(progress, key, q.id, true);
  progress = updateLessonProgress(progress, key, (l) => ({ ...l, reviewed: true }));
  progress = readProgress({ getItem: () => JSON.stringify(progress) });
  assert.equal(progress.lessons[key].reviewed, true);
  assert.equal(progress.lessons[key].answers[l.exercises[0].id].correct, true);
  assert.equal(getLessonProgress(progress, key, l.exercises).correct, 0);
  assert.equal(getLessonProgress(progress, key, l.exercises).mastered, false);
  for (const q of l.exercises) progress = recordAnswer(progress, key, q.id, true, q.revision);
  assert.equal(getLessonProgress(progress, key, l.exercises).mastered, true);
  assert.equal(progress.lessons[key].answers[l.exercises[0].id].attempts, 2);
  assert.deepEqual(readProgress({ getItem: () => JSON.stringify(progress) }), progress);
  const original = lesson("funksjonskomponenter");
  let legacy = emptyProgress();
  for (const q of original.exercises) legacy = recordAnswer(legacy, "original", q.id, true);
  assert.equal(getGoalProgress(legacy, "original", original.learningObjectives[0], original.exercises).status, "mastered");
});

test("mixed revisions and multiple tasks cannot grant partial mastery", () => {
  const qs = [{ id: "a", revision: 2 }, { id: "b", revision: 2 }];
  const goal = { exerciseIds: ["a", "b"] };
  let p = recordAnswer(emptyProgress(), "l", "a", true, 2);
  p = recordAnswer(p, "l", "b", true, 1);
  assert.equal(getGoalProgress(p, "l", goal, qs).status, "in-progress");
  p = recordAnswer(p, "l", "b", false, 2);
  assert.equal(getGoalProgress(p, "l", goal, qs).status, "in-progress");
  p = recordAnswer(p, "l", "b", true, 2);
  assert.equal(getGoalProgress(p, "l", goal, qs).status, "mastered");
  assert.equal(getGoalProgress(p, "l", { exerciseIds: [] }, qs).status, "not-started");
});

test("Tailwind and all practical goals are excluded from mandatory knowledge percentage", () => {
  let p = emptyProgress();
  for (const m of reactCourse.modules) for (const l of m.lessons) if (!l.optional) {
    for (const q of l.exercises) p = recordAnswer(p, lessonPath("react", m.id, l.id), q.id, true, q.revision);
  }
  const goals = getCourseGoals(reactCourse, p);
  assert.equal(goals.length, 266);
  assert.equal(goals.filter((g) => g.optional && g.assessment !== "practical").length, 3);
  assert.deepEqual(summarizeGoals(goals), { total: 201, mastered: 201, percentage: 100 });
  assert.equal(goals.filter((g) => g.assessment === "practical").length, 62);
  assert.ok(goals.filter((g) => g.assessment === "practical").every((g) => g.status !== "mastered"));
});

test("manifest matches complete content without shipping question solutions or teaching", () => {
  assert.deepEqual(reactCourseManifest, courseMetadata(reactCourse));
  const serialized = JSON.stringify(reactCourseManifest);
  for (const key of ['"correctAnswer"', '"validAnswers"', '"sections"', '"explanation"', '"code"']) assert.equal(serialized.includes(key), false, key);
});

test("every dynamically loaded lesson preserves metadata, IDs and revision contracts", async () => {
  for (const module of reactCourseManifest.modules) for (const meta of module.lessons) {
    const full = await loadLesson("react", module.id, meta.id);
    assert.equal(full.title, meta.title);
    assert.deepEqual(full.learningObjectives, meta.learningObjectives);
    assert.deepEqual(full.exercises.map(({ id, revision }) => ({ id, ...(revision ? { revision } : {}) })), meta.exercises);
    assert.ok(full.sections.length >= 5);
  }
  await assert.rejects(loadLesson("react", "routing", "missing"), /finnes ikke/);
  await assert.rejects(loadLesson("missing", "routing", "router-layout"), /finnes ikke/);
});

test("authoring rejects invalid, duplicate and dangling IDs", () => {
  assert.equal(validateCourse(reactCourse), true);
  for (const mutate of [
    (c) => { c.modules[0].id = "../bad"; },
    (c) => { c.modules[1].id = c.modules[0].id; },
    (c) => { c.modules[1].lessons[0].id = c.modules[0].lessons[0].id; },
    (c) => { c.modules[0].lessons[0].exercises[1].id = c.modules[0].lessons[0].exercises[0].id; },
    (c) => { c.modules[0].lessons[0].learningObjectives[1].id = c.modules[0].lessons[0].learningObjectives[0].id; },
    (c) => { c.modules[0].lessons[0].learningObjectives[0].exerciseIds = ["missing"]; },
    (c) => { c.modules[0].lessons[0].exercises[0].revision = -1; },
  ]) { const c = structuredClone(reactCourse); mutate(c); assert.throws(() => validateCourse(c)); }
});

test("all bug activities have actual code, not comments standing in for a defect", () => {
  for (const q of lessons.flatMap((l) => l.exercises).filter((q) => q.type === "FindTheBugQuestion")) {
    assert.ok(q.code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "").trim().length > 10, q.id);
  }
});

test("known direct copy leaks have been removed", () => {
  const composition = question("children-slot-check");
  const provider = question("klient-server-provider-check");
  assert.equal(composition.type, "MultipleChoiceQuestion");
  assert.equal(provider.type, "MultipleChoiceQuestion");
  assert.equal(composition.revision, 3);
  assert.equal(provider.revision, 3);
  const router = question("komponent-integrasjon-providers-check");
  assert.equal(router.code.includes(router.validAnswers[0]), false);
  const list = question("lister-nokler-render-map-check");
  assert.equal(list.code.includes(list.validAnswers[0]), false);
  const storage = question("localstorage-write-check");
  assert.equal(storage.validAnswers.includes("stringify"), false);
  assert.equal(storage.code.includes(storage.validAnswers[0]), false);
  assert.equal(checkAnswer(storage, '{ "done": false }'), true);
  for (const invalid of ['{done:false}', '{"done":"false"}', '{"done":true}', '{"done":false};']) assert.equal(checkAnswer(storage, invalid), false);
  assert.notEqual(question("oppdateringer-batching-queue-check").validAnswers[0], "previous");
});

test("all practical activities have startpoints, mandatory checks and optional extension", () => {
  const activities = lessons.flatMap((l) => l.practicalActivities ?? []);
  assert.equal(activities.length, 62);
  for (const activity of activities) {
    assert.ok(activity.startpoint?.length > 25, activity.id);
    assert.ok(activity.criteria.length >= 3, activity.id);
    assert.ok(activity.checks.length > 0, activity.id);
    assert.ok(activity.extensions.length > 0, activity.id);
  }
});

test("API contract matches course id, cancellation and cache key examples", async () => {
  const api = createPracticeApi();
  assert.deepEqual(await getLessons("react", { request: api.request }), [{ id: "jsx", title: "JSX" }]);
  assert.deepEqual(await getLessons("css", { request: api.request }), [{ id: "grid", title: "Grid" }]);
  assert.deepEqual(await getLessons("js", { request: api.request }), []);
  await assert.rejects(getLessons("unknown", { request: api.request }), /404/);
  await assert.rejects(getLessons("", { request: api.request }), /Velg kurs/);
  for (const id of ["api-axios", "queries-cache"]) {
    const snippets = lesson(id).sections.flatMap((s) => s.blocks).filter((b) => b.type === "code").map((b) => b.code).join("\n");
    assert.match(snippets, /queryKey: \["lessons", courseId\]/);
    assert.match(snippets, /getLessons\(courseId, \{ signal \}\)/);
  }
});

test("controlled API distinguishes success, empty, error, mutation and paging", async () => {
  const api = createPracticeApi(), options = { request: api.request };
  assert.equal((await getCourses(options)).length, 3);
  assert.equal((await getCoursePage(1, options)).hasMore, true);
  assert.deepEqual((await getCoursePage(2, options)).items.map((x) => x.id), ["js"]);
  const created = await createCourse({ title: "  Testing  " }, options);
  assert.equal(created.title, "Testing");
  assert.equal((await getCourses(options)).length, 4);
  await assert.rejects(createCourse({ title: "  " }, options), /400/);
  assert.equal((await getCourses(options)).length, 4);
  api.setScenario("empty");
  assert.deepEqual(await getCourses(options), []);
  api.setScenario("error");
  await assert.rejects(getCourses(options), /503/);
  await assert.rejects(createCourse({ title: "Not saved" }, options), /503/);
  api.setScenario("success");
  assert.equal((await getCourses(options)).length, 4);
});

test("controlled slow API supports already aborted and in-flight signals", async () => {
  const api = createPracticeApi(); api.setScenario("slow");
  for (const alreadyAborted of [true, false]) {
    const controller = new AbortController();
    if (alreadyAborted) controller.abort();
    const pending = getLessons("react", { request: api.request, signal: controller.signal });
    if (!alreadyAborted) controller.abort();
    await assert.rejects(pending, (e) => e.name === "AbortError");
  }
});

test("API rejects structurally invalid success data", async () => {
  for (const value of [{}, [{ id: "a" }], [{ id: 1, title: "x" }]]) {
    const request = async () => new Response(JSON.stringify(value), { status: 200 });
    await assert.rejects(getLessons("react", { request }), /format/);
  }
});

function memoryStorage(raw = null) {
  let value = raw;
  return { getItem: () => value, setItem(key, next) { assert.equal(key, TASKS_KEY); value = next; } };
}
const tasks = [{ id: "a", title: "Les", done: false }];
test("storage validates full shape including done, nonblank fields and unique ids", () => {
  assert.equal(validTasks(tasks), true);
  for (const data of [null, {}, [null], [{ id: "a", title: "Les" }], [{ ...tasks[0], done: "false" }], [{ ...tasks[0], title: " " }], [{ ...tasks[0], id: "" }], [tasks[0], tasks[0]]]) assert.equal(validTasks(data), false);
});

test("missing storage permits writes while malformed or unreadable storage is preserved", () => {
  assert.deepEqual(readTasks(memoryStorage()), { tasks: [], canWrite: true, error: "" });
  for (const raw of ["{bad", "{}", JSON.stringify([{ ...tasks[0], done: "false" }]), JSON.stringify([tasks[0], tasks[0]])]) {
    const storage = memoryStorage(raw), loaded = readTasks(storage);
    assert.equal(loaded.canWrite, false);
    assert.match(loaded.error, /Originaldata er bevart/);
    assert.ok(writeTasks(storage, tasks, loaded.canWrite));
    assert.equal(storage.getItem(TASKS_KEY), raw);
    assert.equal(writeTasks(storage, tasks, true), ""); // explicit reset
    assert.deepEqual(readTasks(storage).tasks, tasks);
  }
  assert.equal(readTasks({ getItem() { throw new Error("denied"); } }).canWrite, false);
});

test("storage write errors do not mutate memory and successful writes survive reload", () => {
  assert.match(writeTasks({ setItem() { throw new Error("quota"); } }, tasks, true), /minnet/);
  assert.deepEqual(tasks, [{ id: "a", title: "Les", done: false }]);
  const storage = memoryStorage();
  assert.equal(writeTasks(storage, tasks, true), "");
  assert.deepEqual(readTasks(storage), { tasks, canWrite: true, error: "" });
  assert.ok(writeTasks(storage, [{ title: "broken" }], true));
  assert.deepEqual(readTasks(storage).tasks, tasks);
});

test("rendered teaching sources remain literal tested source, including production minification", async () => {
  assert.equal(practiceApiSource, await readFile(new URL("../src/content/examples/practiceApi.js", import.meta.url), "utf8"));
  assert.equal(taskStorageSource, await readFile(new URL("../src/content/examples/taskStorage.js", import.meta.url), "utf8"));
  assert.match(practiceApiSource, /export async function getLessons\(courseId/);
  assert.equal(goalFormExample.includes('if (!title.trim()) return;'), true);
  assert.match(emptySubmitTest, /expect\(onCreate\)\.not\.toHaveBeenCalled\(\)/);
  assert.equal(emptySubmitTest.includes('queryByText("Nytt mål")'), false);
});

test("complete React teaching files bundle together with their real import/export contracts", async () => {
  const { build } = await import("vite");
  const { default: react } = await import("@vitejs/plugin-react");
  for (const [id, sectionId, files] of [
    ["listeoppdateringer", "redigeringsflyt", ["TaskEditor.jsx", "App.jsx"]],
    ["context-hooks", "to-context-er", ["ThemeContext.jsx", "App.jsx"]],
    ["error-boundaries", "boundary-forlop", ["ErrorBoundary.jsx", "App.jsx"]],
    ["ytelse", "mal-forst", ["results.js", "App.jsx"]],
    ["typescript", "typer-stegvis", ["TaskRow.tsx", "App.tsx"]],
  ]) {
    const blocks = lesson(id).sections.find((s) => s.id === sectionId).blocks.filter((b) => b.type === "code");
    const sources = Object.fromEntries(files.map((file, index) => [file, blocks[index].code]));
    const prefix = "\0course-example/";
    const result = await build({
      configFile: false, logLevel: "silent", plugins: [react(), {
        name: "trusted-course-fixtures",
        resolveId(source) {
          const file = source.replace(/^\.\//, "");
          const match = Object.keys(sources).find((key) => key === file || key.replace(/\.tsx$/, "") === file);
          if (match) return prefix + match;
        },
        load(source) { if (source.startsWith(prefix)) return sources[source.slice(prefix.length)]; },
      }],
      build: { write: false, minify: false, lib: { entry: files.at(-1), formats: ["es"], fileName: "example" }, rolldownOptions: {
        input: files.at(-1), external: ["react", "react/jsx-runtime", "react/jsx-dev-runtime"],
      } },
    });
    assert.ok((Array.isArray(result) ? result : [result]).flatMap((bundle) => bundle.output).some((chunk) => chunk.type === "chunk" && chunk.code.length > 100), id);
  }
});


test("percentage never rounds incomplete mandatory goals up to 100", () => {
  const goals = Array.from({ length: 201 }, (_, index) => ({ status: index < 200 ? "mastered" : "in-progress" }));
  assert.equal(summarizeGoals(goals).percentage, 99);
  goals[200].status = "mastered";
  assert.equal(summarizeGoals(goals).percentage, 100);
});
