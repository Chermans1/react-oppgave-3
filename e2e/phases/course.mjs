// Fase 2: besvarer alle oppgaver gjennom brukergrensesnittet og kontrollerer progresjonen i hele kurset.
import { BASE_URL, PROGRESS_KEY, goals, lessons, mandatoryKnowledgeGoals, questions } from "../lib/env.mjs";
import { answerThroughUi, expectedGoalStatus, runQuestionFlow } from "../lib/questionFlow.mjs";
import { newSink, openLesson, recorder, storedProgress, watchPage } from "../lib/ui.mjs";

const SUMMARY = /(\d+) av (\d+) obligatoriske kunnskapsmål mestret\s*(\d+) %/;

export function newState() {
  return { mastered: new Set(), attemptedIds: new Set(), wrongSubmitted: 0, rightSubmitted: 0, reveals: 0, newRounds: 0, masteredQuestions: 0 };
}

export async function readDashboard(page) {
  await page.goto(BASE_URL);
  const panel = page.getByRole("region", { name: "Kursmål" });
  await panel.waitFor();
  const text = await panel.getByRole("status").innerText();
  const match = SUMMARY.exec(text.replace(/\s+/g, " "));
  // Read every goal, including those in intentionally collapsed module groups.
  const items = panel.getByRole("listitem", { includeHidden: true });
  const rows = await items.evaluateAll((nodes) => nodes.filter((node) => node.querySelector(".goal-status")).map((node) => ({
    status: node.querySelector(".goal-status").textContent.trim(),
    optional: node.textContent.includes("Valgfri fordypning"),
    note: node.querySelector(".muted")?.textContent ?? "",
  })));
  return { text, mastered: match ? Number(match[1]) : null, total: match ? Number(match[2]) : null, percent: match ? Number(match[3]) : null, rows };
}

// Forventet dashboard utledet fra kursdata og det testen selv har bekreftet.
export function expectedDashboard(mastered, attempted) {
  const done = mandatoryKnowledgeGoals.filter((goal) => goal.exerciseIds.length && goal.exerciseIds.every((id) => mastered.has(id))).length;
  const total = mandatoryKnowledgeGoals.length;
  const knowledgeMastered = goals.filter((goal) => !goal.practical && goal.exerciseIds.every((id) => mastered.has(id))).length;
  return { done, total, percent: total ? Math.floor(done / total * 100) : 0, knowledgeMastered, practical: goals.filter((goal) => goal.practical).length,
    optional: goals.filter((goal) => goal.optional).length, attempted: attempted.size };
}

export async function checkDashboard(page, state, label, recordFailure) {
  const shown = await readDashboard(page);
  const expected = expectedDashboard(state.mastered, state.attemptedIds);
  const problems = [];
  if (shown.mastered !== expected.done || shown.total !== expected.total) problems.push(`mestrede mål ${shown.mastered}/${shown.total}, forventet ${expected.done}/${expected.total}`);
  if (shown.percent !== expected.percent) problems.push(`prosent ${shown.percent}, forventet ${expected.percent}`);
  const mastered = shown.rows.filter((row) => row.status === "Mestret").length;
  if (mastered !== expected.knowledgeMastered) problems.push(`mål merket Mestret ${mastered}, forventet ${expected.knowledgeMastered}`);
  const practicalRows = shown.rows.filter((row) => row.status === "Ikke automatisk vurdert");
  if (practicalRows.length !== expected.practical) problems.push(`praktiske mål ${practicalRows.length}, forventet ${expected.practical}`);
  if (shown.rows.filter((row) => row.optional).length !== expected.optional) problems.push("antall valgfrie mål avviker");
  if (practicalRows.some((row) => !row.note.includes("dokumenterer ikke praktisk mestring"))) problems.push("praktiske mål mangler forklaring om at de ikke er vurdert");
  for (const problem of problems) recordFailure(`${label}: ${problem}`);
  return { label, shown: { mastered: shown.mastered, total: shown.total, percent: shown.percent, goalRows: shown.rows.length, markedMastered: mastered, practicalNotAssessed: practicalRows.length }, expected, ok: problems.length === 0 };
}

async function reviewLesson(page, main, entry, state, recordFailure) {
  const region = main.getByRole("region", { name: "Din leksjonsprogresjon" }).first();
  const count = entry.lesson.exercises.length;
  const text = (await region.innerText()).replace(/\s+/g, " ");
  const answered = /Oppgaver besvart (\d+) av (\d+)/.exec(text);
  const right = /Riktige svar (\d+) av (\d+)/.exec(text);
  if (!answered || Number(answered[1]) !== count) recordFailure(`${entry.key}: «Oppgaver besvart» viser ${answered?.[1]}, forventet ${count}`);
  if (!right || Number(right[1]) !== count) recordFailure(`${entry.key}: «Riktige svar» viser ${right?.[1]}, forventet ${count}`);
  const checkbox = region.getByRole("checkbox", { name: "Jeg har gjennomgått leksjonen" });
  await checkbox.check();
  const mastered = await region.getByText(/Ja|Ikke ennå/).evaluateAll((nodes) => nodes.map((node) => node.textContent));
  const label = /(Kunnskapsdel mestret|Leksjon mestret) (Ja|Ikke ennå)/.exec((await region.innerText()).replace(/\s+/g, " "));
  if (label?.[2] !== "Ja") recordFailure(`${entry.key}: leksjonen vises ikke som mestret etter gjennomgang (${label?.[0]} / ${mastered.join(",")})`);
  state.lessonsMastered += 1;
}

export async function runCourse(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const sink = newSink();
  watchPage(page, sink);
  const { failures, check } = recorder();
  const state = { ...newState(), lessonsMastered: 0 };
  const result = { name: "course", failures, questions: [], dashboards: [], consoleEvents: sink.events, lessonsVisited: [] };
  const noteFailure = (message) => failures.push(message);

  check(await (async () => { await page.goto(BASE_URL); return (await page.evaluate((key) => localStorage.getItem(key), PROGRESS_KEY)) === null; })(), "Konteksten er ikke isolert: lagret progresjon fantes fra før");
  result.dashboards.push(await checkDashboard(page, state, "start", noteFailure));

  const limit = Number(process.env.E2E_LESSON_LIMIT ?? lessons.length);
  for (const entry of lessons.slice(0, limit)) {
    sink.label = `lesson:${entry.key}`;
    try {
      await openLesson(page, entry);
      const main = page.getByRole("main");
      for (let index = 0; index < entry.lesson.exercises.length; index += 1) {
        const record = await runQuestionFlow({ page, main, entry, index, state });
        result.questions.push(record);
        for (const message of record.failures) failures.push(`${record.id} ${message}`);
      }
      await reviewLesson(page, main, entry, state, noteFailure);
      result.lessonsVisited.push(entry.key);
    } catch (error) {
      failures.push(`${entry.key}: leksjonen ble ikke ferdig simulert: ${String(error).split("\n")[0].slice(0, 200)}`);
    }
    if ([4, 19, 41].includes(entry.index)) result.dashboards.push(await checkDashboard(page, state, `etter leksjon ${entry.index + 1}`, noteFailure));
  }

  sink.label = "slutt";
  const final = await checkDashboard(page, state, "etter alle leksjoner", noteFailure);
  result.dashboards.push(final);
  const before = JSON.stringify(await storedProgress(page));
  await page.reload();
  const afterReload = await checkDashboard(page, state, "etter reload", noteFailure);
  result.dashboards.push(afterReload);
  check(JSON.stringify(await storedProgress(page)) === before, "Lagret progresjon endret seg ved reload");

  // Tidligere mestring skal bevares ved omøving med fasit.
  sink.label = "omøving";
  const target = questions.find((item) => item.lesson.id === "funksjonskomponenter" && item.question.type === "MultipleChoiceQuestion");
  await openLesson(page, target);
  const main = page.getByRole("main");
  const form = main.getByRole("form").nth(target.lesson.exercises.indexOf(target.question));
  const wrongs = target.question.options.filter((option) => option.id !== target.question.correctAnswer).map((option) => option.text);
  const correct = target.question.options.find((option) => option.id === target.question.correctAnswer).text;
  await answerThroughUi(form, target.question, wrongs[0]);
  await form.getByText("Ikke helt riktig ennå.").waitFor();
  await answerThroughUi(form, target.question, wrongs[1]);
  await form.getByRole("button", { name: "Vis fasit" }).click();
  await answerThroughUi(form, target.question, correct);
  await form.getByText("Riktig!").waitFor();
  const stored = (await storedProgress(page)).lessons[target.key].answers[target.question.id];
  check(stored.correct === true && stored.assisted === true && stored.mastered === true, "Omøving: lagret svar mangler assistert og bevart mestring", JSON.stringify(stored));
  result.relearning = { question: target.question.id, stored };
  const afterRelearn = await checkDashboard(page, state, "etter assistert omøving", noteFailure);
  result.dashboards.push(afterRelearn);
  await page.reload();
  result.dashboards.push(await checkDashboard(page, state, "etter assistert omøving og reload", noteFailure));

  const perStep = {};
  for (const record of result.questions) for (const [name, status] of Object.entries(record.steps)) {
    perStep[name] ??= { ok: 0, feil: 0, avbrutt: 0 };
    perStep[name][status] += 1;
  }
  result.summary = {
    lessonsFullySimulated: result.lessonsVisited.length,
    questionsAnswered: result.questions.length,
    questionsMasteredAndVerified: state.masteredQuestions,
    wrongAnswersSubmitted: state.wrongSubmitted,
    correctAnswersSubmitted: state.rightSubmitted,
    solutionRevealsTested: state.reveals,
    newRoundsTested: state.newRounds,
    lessonsMarkedReviewedAndMastered: state.lessonsMastered,
    goalsMasteredByUi: final.shown.mastered + " av " + final.shown.total + " (" + final.shown.percent + " %)",
    markedMasteredIncludingOptional: final.shown.markedMastered,
    perStep,
    failures: failures.length,
    consoleEvents: sink.events.length,
  };
  await context.close();
  return result;
}
