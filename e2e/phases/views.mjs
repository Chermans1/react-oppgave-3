// Fase 4: visning. Tre skjermbredder x lys/mørk modus på representative sider, med måling av
// horisontal overflyt, trykkflater og tekstkontrast. Noen få skjermbilder lagres til manuell vurdering.
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { BASE_URL, VIEWPORTS, answerFor, lessons, modules, wrongAnswers } from "../lib/env.mjs";
import { answerThroughUi } from "../lib/questionFlow.mjs";
import { horizontalOverflow, newSink, openLesson, setTheme, watchPage } from "../lib/ui.mjs";

const shots = fileURLToPath(new URL("../results/screenshots/", import.meta.url));

// Kjøres i siden: finner synlig tekst med kontrast under WCAG AA (4.5, eller 3 for stor tekst).
export function scanContrast() {
  const parse = (value) => {
    const m = /rgba?\(([^)]+)\)/.exec(value) ?? /color\(srgb ([^)]+)\)/.exec(value);
    if (!m) return null;
    const parts = m[1].replace("/", " ").split(/[ ,]+/).filter(Boolean).map(Number);
    const scale = value.startsWith("color(") ? 255 : 1;
    return { r: parts[0] * scale, g: parts[1] * scale, b: parts[2] * scale, a: parts[3] ?? 1 };
  };
  const lum = ({ r, g, b }) => [r, g, b].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }).reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
  const over = (top, bottom) => ({ r: top.r * top.a + bottom.r * (1 - top.a), g: top.g * top.a + bottom.g * (1 - top.a), b: top.b * top.a + bottom.b * (1 - top.a), a: 1 });
  const background = (element) => {
    const stack = [];
    for (let node = element; node; node = node.parentElement) {
      const color = parse(getComputedStyle(node).backgroundColor);
      if (color && color.a > 0) { stack.push(color); if (color.a === 1) break; }
    }
    return stack.reduceRight((below, above) => over(above, below), { r: 255, g: 255, b: 255, a: 1 });
  };
  const offenders = new Map();
  let scanned = 0;
  for (const element of document.querySelectorAll("body *")) {
    const own = [...element.childNodes].some((node) => node.nodeType === 3 && node.textContent.trim());
    if (!own) continue;
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    if (style.visibility === "hidden" || style.display === "none" || rect.width === 0 || rect.height === 0 || Number(style.opacity) === 0) continue;
    const fg = parse(style.color);
    if (!fg) continue;
    const bg = background(element);
    const color = over(fg, bg);
    const [a, b] = [lum(color), lum(bg)].sort((x, y) => y - x);
    const ratio = (a + 0.05) / (b + 0.05);
    const size = parseFloat(style.fontSize);
    const large = size >= 24 || (size >= 18.66 && Number(style.fontWeight) >= 700);
    scanned += 1;
    if (ratio < (large ? 3 : 4.5)) {
      const name = `${element.tagName.toLowerCase()}${element.className ? "." + String(element.className).split(" ").join(".") : ""}`;
      const entry = offenders.get(name) ?? { name, ratio: Number(ratio.toFixed(2)), count: 0, sample: element.textContent.trim().slice(0, 50) };
      entry.count += 1; entry.ratio = Math.min(entry.ratio, Number(ratio.toFixed(2)));
      offenders.set(name, entry);
    }
  }
  return { scanned, offenders: [...offenders.values()] };
}

function scanTargets() {
  const small = [];
  for (const element of document.querySelectorAll("button, a[href], input, summary")) {
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;
    const inline = element.tagName === "A" && getComputedStyle(element).display === "inline";
    if (!inline && (rect.height < 32 || rect.width < 32)) small.push({ tag: element.tagName.toLowerCase(), text: (element.textContent || element.getAttribute("aria-label") || element.type || "").trim().slice(0, 40), w: Math.round(rect.width), h: Math.round(rect.height) });
  }
  return small;
}

export async function runViews(browser) {
  mkdirSync(shots, { recursive: true });
  const result = { name: "views", failures: [], pages: [], contrast: [], states: [], screenshots: [] };
  const representative = modules.map((module) => lessons.find((entry) => entry.module.id === module.id));
  const sink = newSink();

  for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    watchPage(page, sink);
    for (const themeName of ["light", "dark"]) {
      const places = [
        { name: "dashboard", go: () => page.goto(BASE_URL) },
        { name: "kursoversikt", go: () => page.goto(`${BASE_URL}#/kurs`) },
        { name: "kursside", go: () => page.goto(`${BASE_URL}#/kurs/react`) },
        { name: "moduloversikt", go: () => page.goto(`${BASE_URL}#/kurs/react/moduler`) },
        ...representative.map((entry) => ({ name: `lesson:${entry.module.id}`, go: () => openLesson(page, entry) })),
      ];
      let first = true;
      for (const place of places) {
        sink.label = `${viewportName}/${themeName}/${place.name}`;
        await place.go();
        if (first) { await page.locator(".app").waitFor(); first = false; }
        await setTheme(page, themeName);
        await page.waitForTimeout(150);
        const overflow = await horizontalOverflow(page);
        const small = viewportName === "mobile" ? await page.evaluate(scanTargets) : [];
        result.pages.push({ viewport: viewportName, theme: themeName, page: place.name, overflowPx: overflow, smallTargets: small.length });
        if (overflow > 1) result.failures.push(`${viewportName}/${themeName}/${place.name}: horisontal overflyt ${overflow}px`);
        if (["dashboard", "lesson:javascript-grunnlag", "kursside"].includes(place.name) || place.name.startsWith("lesson:") && viewportName === "desktop") {
          const found = await page.evaluate(scanContrast);
          if (found.offenders.length) result.failures.push(`${sink.label}: text contrast ${JSON.stringify(found.offenders)}`);
          result.contrast.push({ viewport: viewportName, theme: themeName, page: place.name, scanned: found.scanned, offenders: found.offenders });
        }
        if (place.name === "dashboard" && viewportName === "mobile") {
          const file = `${shots}dashboard-${viewportName}-${themeName}.png`;
          await page.screenshot({ path: file, fullPage: false }); result.screenshots.push(file);
        }
      }

      // Oppgavetilstander i valgt tema og skjermbredde: feil, fasit, assistert svar, mestret.
      const entry = lessons.find((item) => item.lesson.id === "funksjonskomponenter");
      const question = entry.lesson.exercises[0];
      const [wrongOne, wrongTwo] = wrongAnswers(question);
      await context.clearCookies();
      await page.evaluate(() => localStorage.clear());
      sink.label = `${viewportName}/${themeName}/oppgavetilstander`;
      await openLesson(page, entry);
      await setTheme(page, themeName);
      const form = page.getByRole("main").getByRole("form").first();
      const capture = async (state) => {
        await form.scrollIntoViewIfNeeded();
        const found = await page.evaluate(scanContrast);
        const small = viewportName === "mobile" ? await page.evaluate(scanTargets) : [];
        const overflow = await horizontalOverflow(page);
        result.states.push({ viewport: viewportName, theme: themeName, state, offenders: found.offenders, overflowPx: overflow, smallTargets: small });
        if (overflow > 1) result.failures.push(`${viewportName}/${themeName}/${state}: horisontal overflyt ${overflow}px`);
        if (found.offenders.length) result.failures.push(`${viewportName}/${themeName}/${state}: tekst under kontrastkravet: ${found.offenders.map((o) => `${o.name} ${o.ratio}`).join(", ")}`);
        if (["revealed", "assisted"].includes(state) && ((viewportName === "mobile" && themeName === "dark") || (viewportName === "tablet" && themeName === "light") || (viewportName === "desktop" && themeName === "dark"))) {
          const file = `${shots}oppgave-${state}-${viewportName}-${themeName}.png`;
          await form.screenshot({ path: file }); result.screenshots.push(file);
        }
      };
      await answerThroughUi(form, question, wrongOne); await form.getByText("Ikke helt riktig ennå.").waitFor(); await capture("wrong1");
      await answerThroughUi(form, question, wrongTwo); await form.getByRole("button", { name: "Vis fasit" }).waitFor(); await capture("wrong2-knapp");
      // Tastaturbetjening: fokus på knappen og Enter.
      await form.getByRole("button", { name: "Vis fasit" }).focus();
      await page.keyboard.press("Enter");
      await form.getByText("Fasit (øving, ikke mestring)").waitFor(); await capture("revealed");
      await answerThroughUi(form, question, answerFor(question)); await form.getByText("Riktig!").waitFor(); await capture("assisted");
      await form.getByRole("button", { name: "Start ny øvingsrunde" }).click();
      await answerThroughUi(form, question, answerFor(question)); await form.getByText("Riktig!").waitFor(); await capture("mastered");
    }
    if (viewportName !== "desktop") {
      // Representativ hel leksjonsside til visuell kontroll.
      const entry = representative[3];
      await openLesson(page, entry);
      const file = `${shots}leksjon-${viewportName}-${await page.locator(".app").getAttribute("data-theme")}.png`;
      await page.screenshot({ path: file, fullPage: false }); result.screenshots.push(file);
    }
    await context.close();
  }

  const worst = result.contrast.flatMap((item) => item.offenders.map((offender) => ({ ...offender, where: `${item.viewport}/${item.theme}/${item.page}` })));
  result.summary = {
    pagesMeasured: result.pages.length,
    pagesWithOverflow: result.pages.filter((item) => item.overflowPx > 1).length,
    mobileSmallTargetPages: result.pages.filter((item) => item.smallTargets > 0).length,
    contrastPagesScanned: result.contrast.length,
    contrastOffenderPages: result.contrast.filter((item) => item.offenders.length).length,
    questionStatesChecked: result.states.length,
    questionStatesWithContrastProblems: result.states.filter((item) => item.offenders.length).length,
    failures: result.failures.length,
    consoleEvents: sink.events.length,
    worst: worst.slice(0, 5),
  };
  result.consoleEvents = sink.events;
  return result;
}
