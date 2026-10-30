// Fase 1: navigerer gjennom dashboard, kursoversikt, moduler og alle leksjoner via lenker i brukergrensesnittet.
import { BASE_URL, course, lessons, modules, hash } from "../lib/env.mjs";
import { checkLesson } from "../lib/lessonChecks.mjs";
import { newSink, openLesson, recorder, watchPage } from "../lib/ui.mjs";

export async function runWalk(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const sink = newSink();
  watchPage(page, sink);
  const { failures, check } = recorder();
  const result = { name: "walk", failures, visitedForward: [], visitedBackward: [], lessonFailures: {}, modules: [], consoleEvents: sink.events };
  const main = page.getByRole("main");

  sink.label = "dashboard";
  await page.goto(BASE_URL);
  check(await page.getByRole("heading", { name: "Ta neste steg med React" }).isVisible(), "Dashboard viser ikke kurshodet");
  check(await page.getByRole("heading", { name: "Kursmål", level: 2 }).first().isVisible(), "Dashboard viser ikke kursmål");

  sink.label = "kursoversikt";
  await page.getByRole("navigation", { name: "Hovednavigasjon" }).getByRole("link", { name: "Kursoversikt" }).click();
  await page.getByRole("heading", { level: 1, name: "Finn din neste læringsreise" }).waitFor();
  await main.getByRole("heading", { level: 2, name: course.title }).getByRole("link").click();

  sink.label = "kursdetaljer";
  await page.getByRole("heading", { level: 1, name: course.title }).waitFor();
  check(await main.getByText(`${modules.length} moduler`).first().isVisible(), "Kursside viser feil antall moduler");
  check(await main.getByText(`${lessons.length} leksjoner`).first().isVisible(), "Kursside viser feil antall leksjoner");
  check(await main.getByRole("heading", { level: 3 }).count() === modules.length, "Antall moduler i listen avviker");

  // Moduloversikt og hver enkelt modul, med nettleserens tilbakeknapp.
  sink.label = "moduloversikt";
  await main.getByRole("link", { name: /Se moduloversikten/ }).click();
  await page.getByRole("heading", { level: 1, name: "Moduloversikt" }).waitFor();
  check(await main.locator("ol.lesson-list").count() === modules.length, "Moduloversikten viser feil antall modulpaneler");
  const allLessonLinks = await main.locator("ol.lesson-list a").evaluateAll((links) => links.map((link) => link.getAttribute("href")));
  check(JSON.stringify(allLessonLinks) === JSON.stringify(lessons.map((entry) => `#${entry.key}`)), "Moduloversiktens lenker følger ikke kursrekkefølgen");

  for (const [index, module] of modules.entries()) {
    sink.label = `modul:${module.id}`;
    await page.goBack().catch(() => {});
    await page.goto(`${BASE_URL}#/kurs/${course.id}`);
    await page.getByRole("heading", { level: 1, name: course.title }).waitFor();
    await main.getByRole("heading", { level: 3, name: module.title, exact: true }).getByRole("link").click();
    await page.getByRole("heading", { level: 1, name: module.title, exact: true }).waitFor();
    const hrefs = await main.locator("ol.lesson-list a").evaluateAll((links) => links.map((link) => link.getAttribute("href")));
    const expected = module.lessons.map((lesson) => `#/kurs/${course.id}/moduler/${module.id}/leksjoner/${lesson.id}`);
    const ok = JSON.stringify(hrefs) === JSON.stringify(expected);
    check(ok, `Modul ${module.id} viser feil leksjonsliste`, `${hrefs.length} mot ${expected.length}`);
    result.modules.push({ id: module.id, number: index + 1, lessonsListed: hrefs.length, ok });
    await page.goBack();
    await page.getByRole("heading", { level: 1, name: course.title }).waitFor();
  }

  // Start kurset og gå forover med «Neste leksjon» gjennom alle leksjoner.
  sink.label = "start-kurset";
  await page.goto(`${BASE_URL}#/kurs/${course.id}`);
  await main.getByRole("link", { name: lessons[0].lesson.title, exact: true }).first().click();
  for (const entry of lessons) {
    sink.label = `lesson:${entry.key}`;
    try {
      await page.getByRole("heading", { level: 1, name: entry.lesson.title, exact: true }).waitFor({ timeout: 15000 });
      const checked = await checkLesson(page, entry);
      if (checked.failures.length) result.lessonFailures[entry.key] = checked.failures;
      result.visitedForward.push({ index: entry.index + 1, key: entry.key, title: entry.lesson.title, ...checked.facts, ok: checked.failures.length === 0 });
      if (entry.next) {
        await page.getByRole("navigation", { name: "Leksjonsnavigasjon" }).getByRole("link", { name: /Neste leksjon/ }).click();
      }
    } catch (error) {
      result.lessonFailures[entry.key] = [...(result.lessonFailures[entry.key] ?? []), `Kunne ikke åpne eller kontrollere: ${String(error).slice(0, 200)}`];
      await page.goto(entry.next ? hash(entry.next.key) : BASE_URL);
    }
  }

  // Bakover med «Forrige leksjon».
  for (const entry of [...lessons].reverse()) {
    sink.label = `back:${entry.key}`;
    try {
      await page.getByRole("heading", { level: 1, name: entry.lesson.title, exact: true }).waitFor({ timeout: 15000 });
      result.visitedBackward.push(entry.key);
      if (entry.previous) await page.getByRole("navigation", { name: "Leksjonsnavigasjon" }).getByRole("link", { name: /Forrige leksjon/ }).click();
    } catch (error) {
      failures.push(`Bakovernavigasjon stoppet ved ${entry.key}: ${String(error).slice(0, 120)}`);
      break;
    }
  }

  // Tilbakeknappen følger lenkeklikkene.
  sink.label = "tilbakeknapp";
  await openLesson(page, lessons[10]);
  await page.getByRole("navigation", { name: "Leksjonsnavigasjon" }).getByRole("link", { name: /Neste leksjon/ }).click();
  await page.getByRole("heading", { level: 1, name: lessons[11].lesson.title, exact: true }).waitFor();
  const headingShown = (entry) => page.getByRole("heading", { level: 1, name: entry.lesson.title, exact: true })
    .waitFor({ timeout: 5000 }).then(() => true, () => false);
  await page.goBack();
  check(await headingShown(lessons[10]), "Tilbakeknappen går ikke til forrige leksjon");
  await page.goForward();
  check(await headingShown(lessons[11]), "Frem-knappen går ikke til neste leksjon");

  result.summary = {
    modulesChecked: result.modules.length,
    lessonsVisitedForward: result.visitedForward.length,
    lessonsVisitedBackward: result.visitedBackward.length,
    lessonsWithFailures: Object.keys(result.lessonFailures).length,
    consoleEvents: sink.events.length,
  };
  await context.close();
  return result;
}
