// Besvarer én interaktiv oppgave gjennom brukergrensesnittet, og kontrollerer hvert steg.
import { answerFor, questionHint, wrongAnswers } from "./env.mjs";
import { storedAnswer } from "./ui.mjs";

const squash = (text) => text.replace(/\s+/g, " ").trim();
const NEW_ROUND = "Start ny øvingsrunde";

export async function answerThroughUi(form, question, text) {
  if (question.type === "FillInCodeQuestion") {
    await form.getByRole("textbox", { name: "Manglende uttrykk" }).fill(text);
  } else {
    const byName = form.getByRole("radio", { name: text, exact: true });
    if (await byName.count() === 1) await byName.check();
    else {
      const index = question.options.findIndex((option) => option.text === text);
      await form.getByRole("radio").nth(index).check();
    }
  }
  await form.getByRole("button", { name: "Sjekk svar" }).click();
}

// Forventet status for et mål i grensesnittet, utledet fra det testen selv har bekreftet.
export function expectedGoalStatus(goal, mastered, attempted) {
  if (goal.exerciseIds.every((id) => mastered.has(id))) return "Mestret";
  return goal.exerciseIds.some((id) => attempted.has(id)) ? "Under arbeid" : "Ikke startet";
}

async function goalStatuses(main, lesson, questionId, mastered, attempted) {
  const problems = [];
  for (const goal of lesson.learningObjectives.filter((item) => item.exerciseIds.includes(questionId))) {
    const item = main.getByRole("listitem").filter({ hasText: goal.description }).first();
    const shown = (await item.locator(".goal-status").first().innerText()).trim();
    const expected = expectedGoalStatus(goal, mastered, attempted);
    if (shown !== expected) problems.push(`mål ${goal.id}: viser «${shown}», forventet «${expected}»`);
  }
  return problems;
}

export async function runQuestionFlow({ page, main, entry, index, state }) {
  const { lesson, key } = entry;
  const question = lesson.exercises[index];
  const form = main.getByRole("form").nth(index);
  const [wrongOne, wrongTwo] = wrongAnswers(question);
  const correct = answerFor(question);
  const solution = correct;
  const explanation = squash(question.explanation);
  const hint = questionHint(question);
  const record = { id: question.id, lesson: key, type: question.type, steps: {}, failures: [] };
  const fail = (step, message) => record.failures.push(`${step}: ${message}`);
  const text = async () => squash(await form.innerText());

  async function step(name, body) {
    try { await body(); record.steps[name] = record.failures.some((f) => f.startsWith(`${name}:`)) ? "feil" : "ok"; }
    catch (error) { fail(name, `avbrutt: ${String(error).split("\n")[0].slice(0, 180)}`); record.steps[name] = "avbrutt"; }
  }

  await form.scrollIntoViewIfNeeded();
  record.hasSpecificHint = Boolean(hint);

  await step("wrong1", async () => {
    await answerThroughUi(form, question, wrongOne);
    await form.getByText("Ikke helt riktig ennå.").waitFor({ timeout: 5000 });
    const shown = await text();
    state.wrongSubmitted += 1;
    state.attemptedIds.add(question.id);
    if (!shown.includes(squash(hint ?? "∅"))) fail("wrong1", "spesifikt hint vises ikke");
    if (shown.includes("Riktig svar:")) fail("wrong1", "fasit vises etter første feil");
    if (shown.includes(explanation)) fail("wrong1", "forklaring vises etter første feil");
    if (await form.getByRole("button", { name: "Vis fasit" }).count() !== 0) fail("wrong1", "«Vis fasit» vises etter første feil");
    if (!shown.includes("Sist besvart feil.")) fail("wrong1", "historikk viser ikke «Sist besvart feil.»");
    const stored = await storedAnswer(page, key, question.id);
    if (!stored || stored.attempts !== 1 || stored.correct !== false || stored.mastered || stored.assisted || stored.solutionShown) fail("wrong1", `uventet lagret svar ${JSON.stringify(stored)}`);
    for (const problem of await goalStatuses(main, lesson, question.id, state.mastered, state.attemptedIds)) fail("wrong1", problem);
  });

  await step("wrong2", async () => {
    await answerThroughUi(form, question, wrongTwo);
    await form.getByRole("button", { name: "Vis fasit" }).waitFor({ timeout: 5000 });
    state.wrongSubmitted += 1;
    const shown = await text();
    if (shown.includes("Riktig svar:")) fail("wrong2", "fasit vises automatisk etter andre feil");
    if (shown.includes(explanation)) fail("wrong2", "forklaring vises etter andre feil");
    if (!shown.includes("Du har svart feil 2 ganger")) fail("wrong2", "teller for feil svar stemmer ikke");
    const stored = await storedAnswer(page, key, question.id);
    if (!stored || stored.attempts !== 2 || stored.correct !== false || stored.mastered || stored.solutionShown) fail("wrong2", `uventet lagret svar ${JSON.stringify(stored)}`);
  });

  await step("reveal", async () => {
    await form.getByRole("button", { name: "Vis fasit" }).click();
    await form.getByText("Fasit (øving, ikke mestring)").waitFor({ timeout: 5000 });
    state.reveals += 1;
    const shown = await text();
    if (!shown.includes(`Riktig svar: ${squash(solution)}`)) fail("reveal", "fasit vises ikke riktig");
    if (!shown.includes(explanation)) fail("reveal", "forklaring vises ikke sammen med fasit");
    if (await form.getByRole("button", { name: "Vis fasit" }).count() !== 0) fail("reveal", "«Vis fasit» er fortsatt synlig");
    const stored = await storedAnswer(page, key, question.id);
    if (!stored || stored.solutionShown !== true || stored.correct !== false || stored.mastered) fail("reveal", `fasitvisning er ikke lagret riktig ${JSON.stringify(stored)}`);
    if (!(await page.evaluate(() => document.activeElement?.className?.includes("answer-revealed")))) fail("reveal", "fokus flyttes ikke til fasit-panelet");
  });

  await step("assisted", async () => {
    await answerThroughUi(form, question, correct);
    await form.getByText("Riktig!").waitFor({ timeout: 5000 });
    state.rightSubmitted += 1;
    const shown = await text();
    if (!shown.includes("teller derfor som øving")) fail("assisted", "svaret merkes ikke som øving");
    const stored = await storedAnswer(page, key, question.id);
    if (!stored || stored.attempts !== 3 || stored.correct !== true || stored.assisted !== true || stored.mastered) fail("assisted", `registreres ikke som assistert ${JSON.stringify(stored)}`);
    for (const problem of await goalStatuses(main, lesson, question.id, state.mastered, state.attemptedIds)) fail("assisted", problem);
    if (await form.getByRole("button", { name: NEW_ROUND }).count() !== 1) fail("assisted", "knappen for ny øvingsrunde mangler");
  });

  await step("newRound", async () => {
    await form.getByRole("button", { name: NEW_ROUND }).click();
    await form.getByRole("button", { name: NEW_ROUND }).waitFor({ state: "detached", timeout: 5000 });
    state.newRounds += 1;
    const stored = await storedAnswer(page, key, question.id);
    if (!stored || stored.solutionShown || stored.attempts !== 3) fail("newRound", `ny runde er ikke lagret riktig ${JSON.stringify(stored)}`);
    if ((await text()).includes("Riktig!")) fail("newRound", "gammel tilbakemelding vises i ny runde");
  });

  await step("mastered", async () => {
    await answerThroughUi(form, question, correct);
    await form.getByText("Riktig!").waitFor({ timeout: 5000 });
    state.rightSubmitted += 1;
    const shown = await text();
    if (shown.includes("teller derfor som øving")) fail("mastered", "selvstendig svar merkes som øving");
    if (!shown.includes(`Riktig svar: ${squash(solution)}`) || !shown.includes(explanation)) fail("mastered", "fasit og forklaring vises ikke etter riktig svar");
    const stored = await storedAnswer(page, key, question.id);
    if (!stored || stored.attempts !== 4 || stored.correct !== true || stored.assisted || stored.solutionShown) fail("mastered", `registreres ikke som selvstendig mestret ${JSON.stringify(stored)}`);
    else { state.mastered.add(question.id); state.masteredQuestions += 1; }
    for (const problem of await goalStatuses(main, lesson, question.id, state.mastered, state.attemptedIds)) fail("mastered", problem);
  });

  return record;
}
