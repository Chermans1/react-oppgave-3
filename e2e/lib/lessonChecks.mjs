// Kontroller av innholdet i én åpnet leksjon.
import { hash } from "./env.mjs";
import { recorder } from "./ui.mjs";

const codeBlockCount = (lesson) => lesson.sections
  ? lesson.sections.flatMap((section) => section.blocks).filter((block) => block.type === "code").length
    + (lesson.practicalActivities ?? []).filter((activity) => activity.starter).length
  : lesson.codeExamples.length;

export async function checkLesson(page, entry) {
  const { lesson } = entry;
  const { failures, check } = recorder();
  const main = page.getByRole("main");
  const facts = {};

  check(await page.getByRole("heading", { level: 1, name: lesson.title, exact: true }).count() === 1, "Tittel (h1) vises ikke nøyaktig én gang");
  check(await main.getByRole("link", { name: entry.module.title, exact: true }).count() >= 1, "Moduloversikt mangler i brødsmulen");

  if (lesson.sections) {
    const contents = page.getByRole("navigation", { name: "Seksjoner i leksjonen" });
    facts.sectionButtons = await contents.getByRole("button").count();
    check(facts.sectionButtons === lesson.sections.length, "Antall seksjonsknapper stemmer ikke", `${facts.sectionButtons} mot ${lesson.sections.length}`);
    const missing = [];
    for (const section of lesson.sections) {
      if (await main.getByRole("heading", { level: 2, name: section.title, exact: true }).count() < 1) missing.push(section.title);
    }
    check(missing.length === 0, "Seksjoner som ikke rendres", missing.join(" | "));
    facts.sections = lesson.sections.length - missing.length;
  } else {
    for (const heading of ["Forklaring", "Kodeeksempler"]) {
      check(await main.getByRole("heading", { level: 2, name: heading, exact: true }).count() === 1, `Overskrift «${heading}» mangler`);
    }
    facts.sections = 2;
  }

  facts.codeBlocks = await main.locator("figure pre code").count();
  check(facts.codeBlocks >= 1, "Ingen kodeeksempler vises");
  check(facts.codeBlocks === codeBlockCount(lesson), "Antall kodeblokker avviker fra kursdata", `${facts.codeBlocks} mot ${codeBlockCount(lesson)}`);

  const forms = main.getByRole("form");
  facts.exerciseForms = await forms.count();
  check(facts.exerciseForms === lesson.exercises.length, "Antall interaktive oppgaver avviker", `${facts.exerciseForms} mot ${lesson.exercises.length}`);
  for (let i = 0; i < lesson.exercises.length && i < facts.exerciseForms; i += 1) {
    const heading = await forms.nth(i).getByRole("heading", { level: 3 }).innerText();
    check(heading === lesson.exercises[i].title, `Oppgave ${i + 1} har feil tittel`, `${heading} mot ${lesson.exercises[i].title}`);
  }

  facts.practical = 0;
  for (const activity of lesson.practicalActivities ?? []) {
    const shown = await main.getByRole("heading", { level: 3, name: activity.title, exact: true }).count();
    check(shown === 1, "Praktisk oppgave vises ikke", activity.title);
    facts.practical += shown;
  }
  if (lesson.practicalActivities?.length) {
    check(await main.getByText("vurderes ikke automatisk", { exact: false }).count() >= 1, "Praktisk oppgave mangler beskjed om at den ikke vurderes automatisk");
  }

  const missingGoals = [];
  for (const goal of lesson.learningObjectives) {
    if (await main.getByText(goal.description, { exact: false }).count() < 1) missingGoals.push(goal.id);
  }
  check(missingGoals.length === 0, "Læringsmål som ikke vises", missingGoals.join(", "));
  facts.goals = lesson.learningObjectives.length - missingGoals.length;
  check(await main.getByRole("heading", { name: "Din leksjonsprogresjon" }).count() >= 1, "Leksjonsprogresjon vises ikke");

  const nav = page.getByRole("navigation", { name: "Leksjonsnavigasjon" });
  for (const [label, target, missingText] of [["Forrige leksjon", entry.previous, "kursets første leksjon"], ["Neste leksjon", entry.next, "kursets siste leksjon"]]) {
    if (target) {
      const link = nav.getByRole("link", { name: new RegExp(label) });
      check(await link.count() === 1, `Lenke «${label}» mangler`);
      if (await link.count() === 1) {
        check((await link.getAttribute("href")) === `#${target.key}`, `Lenke «${label}» peker feil`, await link.getAttribute("href"));
        check((await link.innerText()).includes(target.lesson.title), `Lenke «${label}» har feil tittel`);
      }
    } else {
      check(await nav.getByText(missingText).count() === 1, `Mangler beskjed «${missingText}»`);
    }
  }
  check(await main.getByText("Leksjonen kunne ikke lastes").count() === 0, "Feilmelding om lasting vises");
  return { failures, facts, url: hash(entry.key) };
}
