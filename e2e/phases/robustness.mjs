// Fase 3: robusthet. Hvert scenario kjøres i en egen, isolert nettleserkontekst (egen lagring).
import { BASE_URL, PROGRESS_KEY, answerFor, lessons, wrongAnswers } from "../lib/env.mjs";
import { answerThroughUi } from "../lib/questionFlow.mjs";
import { readDashboard } from "./course.mjs";
import { newSink, openLesson, recorder, storedAnswer, storedProgress, watchPage } from "../lib/ui.mjs";

const target = lessons.find((entry) => entry.lesson.id === "funksjonskomponenter");
const question = target.lesson.exercises[0];
const goalOf = target.lesson.learningObjectives.find((goal) => goal.exerciseIds.length === 1 && goal.exerciseIds[0] === question.id)
  ?? target.lesson.learningObjectives.find((goal) => goal.exerciseIds.includes(question.id));
const [wrongOne, wrongTwo] = wrongAnswers(question);
const correct = answerFor(question);

async function scenario(browser, name, options, body, result) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  if (options.init) await context.addInitScript(options.init.script, options.init.arg);
  const page = await context.newPage();
  const sink = newSink();
  sink.label = name;
  watchPage(page, sink);
  const { failures, check } = recorder();
  const notes = {};
  try { await body({ page, check, notes, sink }); }
  catch (error) { failures.push(`avbrutt: ${String(error).split("\n")[0].slice(0, 200)}`); }
  result.scenarios.push({ name, ok: failures.length === 0, failures, notes, consoleEvents: sink.events.length, events: sink.events.filter((event) => !options.expectedEvents) });
  for (const message of failures) result.failures.push(`${name}: ${message}`);
  await context.close();
}

const formOf = (page) => page.getByRole("main").getByRole("form").nth(0);
const goalStatus = async (page) => {
  const item = page.getByRole("main").getByRole("listitem").filter({ hasText: goalOf.description }).first();
  return (await item.locator(".goal-status").first().innerText()).trim();
};
const submit = async (page, text) => answerThroughUi(formOf(page), question, text);
async function toRevealed(page) {
  await submit(page, wrongOne);
  await formOf(page).getByText("Ikke helt riktig ennå.").waitFor();
  await submit(page, wrongTwo);
  await formOf(page).getByRole("button", { name: "Vis fasit" }).click();
  await formOf(page).getByText("Fasit (øving, ikke mestring)").waitFor();
}

// Setter lagring før noe annet skriptet på siden kjører, men bare første gang (ikke ved reload).
const seed = { script: ({ key, value }) => { if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); if (value !== null) localStorage.setItem(key, value); } }, };
const seeded = (value) => ({ init: { script: seed.script, arg: { key: PROGRESS_KEY, value } } });

export async function runRobustness(browser) {
  const result = { name: "robustness", failures: [], scenarios: [] };

  await scenario(browser, "reload etter fasitvisning", {}, async ({ page, check }) => {
    await openLesson(page, target);
    await toRevealed(page);
    await page.reload();
    await page.getByRole("heading", { level: 1, name: target.lesson.title, exact: true }).waitFor();
    const form = formOf(page);
    check(await form.getByText("Fasit (øving, ikke mestring)").isVisible(), "fasit-panelet vises ikke etter reload");
    check(await form.getByRole("button", { name: "Vis fasit" }).count() === 0, "«Vis fasit» vises på nytt etter reload");
    check((await storedAnswer(page, target.key, question.id)).solutionShown === true, "fasitvisning er ikke lagret");
    await submit(page, correct);
    await form.getByText("Riktig!").waitFor();
    const stored = await storedAnswer(page, target.key, question.id);
    check(stored.assisted === true && stored.correct === true && !stored.mastered, "riktig svar etter reload registreres ikke som assistert", JSON.stringify(stored));
    check(await goalStatus(page) !== "Mestret", "målet er mestret etter assistert svar etter reload");
    // Ny, bevisst runde etter reload, deretter reload igjen uten å starte runden.
    await page.reload();
    check(await formOf(page).getByText("Fasit (øving, ikke mestring)").waitFor({ timeout: 5000 }).then(() => true, () => false), "ny reload fjernet fasitmarkeringen");
    await formOf(page).getByRole("button", { name: "Start ny øvingsrunde" }).click();
    await page.reload();
    await page.getByRole("heading", { level: 1, name: target.lesson.title, exact: true }).waitFor();
    await formOf(page).getByRole("button", { name: "Sjekk svar" }).waitFor();
    check(await formOf(page).getByText("Fasit (øving, ikke mestring)").count() === 0, "ny runde overlevde ikke reload");
    await submit(page, correct);
    await formOf(page).getByText("Riktig!").waitFor();
    const mastered = await storedAnswer(page, target.key, question.id);
    check(!mastered.assisted && !mastered.solutionShown && mastered.correct === true, "ny selvstendig runde gir ikke mestring", JSON.stringify(mastered));
    check(await goalStatus(page) === "Mestret", "målet vises ikke som mestret etter ny selvstendig runde");
  }, result);

  await scenario(browser, "reload etter mestring og assistert omøving", {}, async ({ page, check }) => {
    await openLesson(page, target);
    await submit(page, correct);
    await formOf(page).getByText("Riktig!").waitFor();
    await page.reload();
    await formOf(page).getByRole("button", { name: "Sjekk svar" }).waitFor();
    check((await formOf(page).innerText()).includes("Sist besvart riktig."), "mestring vises ikke etter reload");
    check(await goalStatus(page) === "Mestret", "mål ikke mestret etter reload");
    await toRevealed(page);
    await submit(page, correct);
    await formOf(page).getByText("Riktig!").waitFor();
    const stored = await storedAnswer(page, target.key, question.id);
    check(stored.assisted === true && stored.mastered === true, "assistert omøving bevarer ikke mestring i lagringen", JSON.stringify(stored));
    check(await goalStatus(page) === "Mestret", "assistert omøving nedgraderer målet");
    await page.reload();
    check(await goalStatus(page) === "Mestret", "mål nedgradert etter reload av assistert omøving");
    check((await storedAnswer(page, target.key, question.id)).attempts === 4, "forsøkshistorikken er ikke bevart");
  }, result);

  await scenario(browser, "ugyldig lagret progresjon (ikke JSON)", seeded("{ikke json"), async ({ page, check, notes }) => {
    await openLesson(page, target);
    check(await page.getByRole("alert").filter({ hasText: "Lagret progresjon kunne ikke leses" }).isVisible(), "ingen melding om uleselig progresjon");
    await submit(page, correct);
    await formOf(page).getByText("Riktig!").waitFor();
    notes.rawAfter = await page.evaluate((key) => localStorage.getItem(key), PROGRESS_KEY);
    check(notes.rawAfter === "{ikke json", "originaldata ble overskrevet");
    check(await page.getByRole("button", { name: "Les lagret progresjon på nytt" }).isVisible(), "gjenopprettingsknapp mangler");
    await page.getByText("Erstatt uleselige eller gamle lagringsdata").click();
    check(await page.getByRole("checkbox", { name: /Jeg forstår at de tidligere lagrede/ }).count() === 1, "bekreftelse for erstatning mangler");
    check(await page.getByRole("button", { name: "Erstatt lagring med øktens progresjon" }).isDisabled(), "erstatt-knappen er aktiv uten bekreftelse");
    // Gjenoppretting etter at dataene er reparert.
    await page.evaluate(([key]) => localStorage.setItem(key, JSON.stringify({ version: 1, lessons: {} })), [PROGRESS_KEY]);
    await page.getByRole("button", { name: "Les lagret progresjon på nytt" }).click();
    await page.getByRole("alert").filter({ hasText: "Lagret progresjon kunne ikke leses" }).waitFor({ state: "detached" });
  }, result);

  await scenario(browser, "ugyldig lagret progresjon (feil struktur)", seeded(JSON.stringify({ version: 1, lessons: { x: { reviewed: "ja", answers: { q: { attempts: -1, correct: "nei" } } } } })), async ({ page, check }) => {
    await openLesson(page, target);
    check(await page.getByRole("alert").filter({ hasText: "Lagret progresjon kunne ikke leses" }).isVisible(), "ingen melding om ugyldig struktur");
    await submit(page, correct);
    await formOf(page).getByText("Riktig!").waitFor();
    const raw = JSON.parse(await page.evaluate((key) => localStorage.getItem(key), PROGRESS_KEY));
    check(raw.lessons.x?.reviewed === "ja", "originaldata ble overskrevet");
  }, result);

  await scenario(browser, "ugyldig lagret progresjon (nye felt med feil type)", seeded(JSON.stringify({ version: 1, lessons: { [target.key]: { reviewed: false, answers: { [question.id]: { attempts: 2, correct: true, mastered: "ja" } } } } })), async ({ page, check }) => {
    await openLesson(page, target);
    check(await page.getByRole("alert").filter({ hasText: "Lagret progresjon kunne ikke leses" }).isVisible(), "ugyldig mastered-felt avvises ikke");
  }, result);

  await scenario(browser, "lagring som feiler ved skriving", { init: { script: () => { Storage.prototype.setItem = function () { throw new DOMException("quota", "QuotaExceededError"); }; } }, expectedEvents: true }, async ({ page, check }) => {
    await openLesson(page, target);
    await submit(page, wrongOne);
    await formOf(page).getByText("Ikke helt riktig ennå.").waitFor();
    check(await page.getByRole("alert").filter({ hasText: "kunne ikke lagres" }).isVisible(), "ingen melding når lagring feiler");
    await submit(page, wrongTwo);
    await formOf(page).getByRole("button", { name: "Vis fasit" }).click();
    check(await formOf(page).getByText("Fasit (øving, ikke mestring)").isVisible(), "øvingen fungerer ikke uten lagring");
    await submit(page, correct);
    await formOf(page).getByText("Riktig!").waitFor();
    check((await formOf(page).innerText()).includes("teller derfor som øving"), "assistert svar merkes ikke uten lagring");
    check(await goalStatus(page) !== "Mestret", "assistert svar gir mestring uten lagring");
  }, result);

  await scenario(browser, "manglende localStorage (tilgang nektet)", { init: { script: () => { Object.defineProperty(window, "localStorage", { get() { throw new DOMException("denied", "SecurityError"); } }); } }, expectedEvents: true }, async ({ page, check }) => {
    await openLesson(page, target);
    check(await page.getByRole("alert").filter({ hasText: "Lagret progresjon kunne ikke leses" }).first().isVisible(), "ingen melding når lagring ikke er tilgjengelig");
    await submit(page, correct);
    await formOf(page).getByText("Riktig!").waitFor();
    check(await goalStatus(page) === "Mestret", "øving i minnet fungerer ikke uten lagring");
  }, result);

  const revised = lessons.flatMap((entry) => entry.lesson.exercises.map((q) => ({ entry, q }))).find(({ q }) => (q.revision ?? 1) > 1);
  const revisedGoal = revised.entry.lesson.learningObjectives.find((goal) => goal.exerciseIds.includes(revised.q.id));
  const legacy = JSON.stringify({ version: 1, lessons: { [target.key]: { reviewed: true, answers: { [question.id]: { attempts: 2, correct: true } } }, [revised.entry.key]: { reviewed: false, answers: { [revised.q.id]: { attempts: 3, correct: true } } } } });
  await scenario(browser, "eldre lagret progresjon og revidert oppgave", seeded(legacy), async ({ page, check }) => {
    await openLesson(page, target);
    check(await goalStatus(page) === "Mestret", "eldre lagret mestring leses ikke");
    check((await formOf(page).innerText()).includes("2 innsendte forsøk"), "eldre forsøkshistorikk vises ikke");
    await openLesson(page, revised.entry);
    const index = revised.entry.lesson.exercises.indexOf(revised.q);
    const form = page.getByRole("main").getByRole("form").nth(index);
    check(await form.getByText(/tidligere svart på en eldre utgave/).isVisible(), "revidert oppgave viser ikke melding om eldre utgave");
    const item = page.getByRole("main").getByRole("listitem").filter({ hasText: revisedGoal.description }).first();
    check((await item.locator(".goal-status").first().innerText()).trim() !== "Mestret", "mestring fra eldre revisjon gir mestring av gjeldende revisjon");
    await answerThroughUi(form, revised.q, answerFor(revised.q));
    await form.getByText("Riktig!").waitFor();
    const stored = await storedAnswer(page, revised.entry.key, revised.q.id);
    check(stored.revision === revised.q.revision && stored.attempts === 4, "svar på ny revisjon lagres ikke med revisjon og bevart historikk", JSON.stringify(stored));
  }, result);

  for (const [name, path] of [
    ["ugyldig leksjon", "/kurs/react/moduler/javascript-grunnlag/leksjoner/finnes-ikke"],
    ["ugyldig modul", "/kurs/react/moduler/finnes-ikke"],
    ["ugyldig kurs", "/kurs/finnes-ikke"],
    ["leksjon under feil modul", `/kurs/react/moduler/sluttprosjekt/leksjoner/${target.lesson.id}`],
    ["ukjent adresse", "/helt/feil/adresse"],
  ]) {
    await scenario(browser, name, {}, async ({ page, check }) => {
      await page.goto(`${BASE_URL}#${path}`);
      await page.getByRole("heading", { level: 1, name: "Vi fant ikke det du lette etter" }).waitFor({ timeout: 8000 });
      await page.getByRole("link", { name: /Til kursoversikten/ }).click();
      const reached = await page.getByRole("heading", { level: 1, name: "Finn din neste læringsreise" }).waitFor({ timeout: 5000 }).then(() => true, () => false);
      check(reached, "lenken fra feilsiden fungerer ikke");
    }, result);
  }

  const optionalLesson = lessons.find((entry) => entry.lesson.optional);
  await scenario(browser, "valgfrie mål påvirker ikke obligatorisk progresjon", {}, async ({ page, check, notes }) => {
    const before = await readDashboard(page);
    await openLesson(page, optionalLesson);
    const main = page.getByRole("main");
    for (const [index, item] of optionalLesson.lesson.exercises.entries()) {
      const form = main.getByRole("form").nth(index);
      await answerThroughUi(form, item, answerFor(item));
      await form.getByText("Riktig!").waitFor();
    }
    const after = await readDashboard(page);
    notes.optionalLesson = optionalLesson.lesson.title;
    notes.before = { mastered: before.mastered, total: before.total, percent: before.percent };
    notes.after = { mastered: after.mastered, total: after.total, percent: after.percent, markedMastered: after.rows.filter((row) => row.status === "Mestret").length };
    check(after.mastered === before.mastered && after.total === before.total && after.percent === before.percent, "valgfri leksjon endret den obligatoriske prosenten");
    check(notes.after.markedMastered > 0, "valgfrie mål vises ikke som mestret etter å ha besvart oppgavene");
    check(after.rows.filter((row) => row.optional && row.status === "Mestret").length === notes.after.markedMastered, "mestrede mål utenfor de valgfrie ble påvirket");
  }, result);

  await scenario(browser, "uberørt lagring ved ren lesing", {}, async ({ page, check }) => {
    await openLesson(page, target);
    check((await storedProgress(page)) === null, "lesing alene skrev til lagringen");
  }, result);

  result.summary = { scenarios: result.scenarios.length, passed: result.scenarios.filter((item) => item.ok).length, failures: result.failures.length };
  return result;
}
