// Focused regression checks for the confirmed student-simulation findings.
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { BASE_URL, lessons, modules } from "../lib/env.mjs";
import { openLesson, recorder, setTheme, horizontalOverflow } from "../lib/ui.mjs";
import { mountTeachingFixture } from "../lib/teachingFixtures.mjs";
import { scanContrast } from "./views.mjs";
import { goalFormExample } from "../../src/content/workshops/testing.js";

export async function runFindings(browser) {
  const { failures, check } = recorder();
  const result = { name: "findings", failures, dashboards: [], contrasts: [], examples: [], lessons: [] };
  const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await context.newPage();
  const accessibility = await context.newCDPSession(page);
  const shots = fileURLToPath(new URL("../results/screenshots/", import.meta.url));
  mkdirSync(shots, { recursive: true });
  const expandedState = async () => {
    const { root } = await accessibility.send("DOM.getDocument");
    const { nodeId } = await accessibility.send("DOM.querySelector", { nodeId: root.nodeId, selector: ".module-goals > summary" });
    const tree = await accessibility.send("Accessibility.getPartialAXTree", { nodeId, fetchRelatives: false });
    const node = tree.nodes.find((node) => !node.ignored);
    return node?.properties?.find((p) => p.name === "expanded")?.value.value;
  };
  try {
    for (const theme of ["light", "dark"]) {
      await page.goto(BASE_URL);
      await setTheme(page, theme);
      const panel = page.getByRole("region", { name: "Kursmål", exact: true });
      const groups = panel.locator("details.module-goals");
      check(await groups.count() === modules.length, `${theme}: module count`);
      check(await groups.locator("[open]").count() === 0 && await panel.locator("details[open]").count() === 0, `${theme}: modules closed initially`);
      const height = await page.evaluate(() => document.documentElement.scrollHeight);
      check(height < 10000, `${theme}: collapsed mobile dashboard too tall (${height})`);
      const summary = groups.first().locator("summary");
      check(await expandedState() === false, `${theme}: collapsed state exposed to accessibility tree`);
      await page.screenshot({ path: `${shots}/dashboard-collapsed-mobile-${theme}.png`, fullPage: true });
      await summary.focus();
      await page.keyboard.press("Enter");
      check(await groups.first().getAttribute("open") !== null, `${theme}: Enter expands module`);
      check(await expandedState() === true, `${theme}: expanded state exposed to accessibility tree`);
      await summary.scrollIntoViewIfNeeded();
      await page.screenshot({ path: `${shots}/dashboard-expanded-mobile-${theme}.png` });
      await page.keyboard.press("Tab");
      check(await page.evaluate(() => document.activeElement?.matches(".module-goals a")), `${theme}: Tab enters lesson links`);
      const focus = await page.evaluate(() => ({ outline: getComputedStyle(document.activeElement).outlineStyle, width: getComputedStyle(document.activeElement).outlineWidth }));
      check(focus.outline !== "none" && parseFloat(focus.width) >= 2, `${theme}: visible keyboard focus`);
      await summary.focus();
      await page.keyboard.press("Space");
      check(await groups.first().getAttribute("open") === null, `${theme}: Space collapses module`);
      let totalGoals = 0;
      for (let i = 0; i < modules.length; i++) {
        const group = groups.nth(i);
        await group.locator("summary").click();
        totalGoals += await group.locator(".goal-status").count();
        const contrast = await page.evaluate(scanContrast);
        check(contrast.offenders.length === 0, `${theme}/${modules[i].id}: expanded goals contrast ${JSON.stringify(contrast.offenders)}`);
        check(await horizontalOverflow(page) <= 1, `${theme}/${modules[i].id}: mobile overflow`);
        const links = await group.locator("a").evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().height));
        check(links.every((size) => size >= 24), `${theme}/${modules[i].id}: lesson link target size`);
        await group.locator("summary").click();
      }
      check(totalGoals === 266, `${theme}: all 266 goals accessible`);
      result.dashboards.push({ theme, height, modules: modules.length, goals: totalGoals, keyboard: "Enter/Space/Tab and focus passed" });
      result.contrasts.push({ theme, pairs: await page.evaluate(() => {
        const style = getComputedStyle(document.querySelector(".app"));
        const color = (name) => {
          const hex = style.getPropertyValue(`--${name}`).trim();
          return hex.length === 4 ? "#" + [...hex.slice(1)].map((char) => char + char).join("") : hex;
        };
        const lum = (hex) => [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16) / 255).map((v) => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4).reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
        return [
          ["muted", "surface", 4.5], ["muted", "note-bg", 4.5], ["muted", "bg", 4.5],
          ["accent", "accent-soft", 4.5], ["note-text", "note-bg", 4.5],
          ["control-border", "input-bg", 3], ["control-border", "surface", 3],
          ["accent", "surface", 3], ["accent", "bg", 3],
        ].map(([fg, bg, minimum]) => {
          const foreground = color(fg), background = color(bg);
          const [hi, lo] = [lum(foreground), lum(background)].sort((a, b) => b - a);
          const ratio = (hi + 0.05) / (lo + 0.05);
          return { fg, bg, foreground, background, ratio, minimum };
        });
      }) });
    }
    for (const set of result.contrasts) for (const pair of set.pairs) check(pair.ratio >= pair.minimum, `${set.theme}: ${pair.fg}/${pair.bg} contrast ${pair.ratio}`);
    for (const number of [11, 24, 35, 37, 51]) {
      await openLesson(page, lessons[number - 1]);
      check(await page.getByRole("heading", { level: 1, name: lessons[number - 1].lesson.title, exact: true }).isVisible(), `lesson ${number} renders`);
      result.lessons.push({ number, title: lessons[number - 1].lesson.title });
    }
    // Run the actual authored form, including the requested deliberate mutation.
    for (const mutated of [false, true]) {
      const source = mutated ? goalFormExample.replace('if (!title.trim()) return;', "// Deliberately remove the validation guard.") : goalFormExample;
      await mountTeachingFixture(page, { "GoalForm.jsx": source }, "GoalForm.jsx", '{ onCreate: (title) => window.created.push(title) }');
      await page.getByRole("textbox", { name: "Tittel" }).fill("   ");
      await page.getByRole("button", { name: "Legg til", exact: true }).click();
      check(await page.getByRole("alert").isVisible(), `GoalForm mutated=${mutated}: error remains visible`);
      check(await page.evaluate(() => window.created.length) === (mutated ? 1 : 0), `GoalForm mutated=${mutated}: callback detects blank submission`);
      if (!mutated) {
        await page.getByRole("textbox", { name: "Tittel" }).fill("  Les CSS  ");
        await page.getByRole("button", { name: "Legg til", exact: true }).click();
        check(JSON.stringify(await page.evaluate(() => window.created)) === '["Les CSS"]', "GoalForm trims valid title");
        check(await page.getByRole("alert").count() === 0, "GoalForm clears old error on valid submit");
      }
      result.examples.push({ example: "GoalForm", mutated });
    }
    const validation = lessons[23].lesson.sections.find((section) => section.id === "feedback").blocks.find((block) => block.type === "code").code;
    await mountTeachingFixture(page, { "TitleForm.jsx": validation }, "TitleForm.jsx");
    await page.getByRole("button", { name: "Lagre tittel", exact: true }).click();
    check(await page.getByRole("alert").isVisible(), "TitleForm blank input shows linked error");
    check(await page.getByRole("textbox", { name: "Tittel" }).getAttribute("aria-describedby") === "title-error", "TitleForm error is linked to field");
    await page.getByRole("textbox", { name: "Tittel" }).fill("  Lær React  ");
    await page.getByRole("button", { name: "Lagre tittel", exact: true }).click();
    check(await page.getByRole("status").innerText() === "Lagret: Lær React", "TitleForm displays trimmed valid result");
    check(await page.getByRole("alert").count() === 0, "TitleForm valid input removes error");
    result.examples.push({ example: "TitleForm", blankAndValid: true });
    const storageBlocks = lessons[34].lesson.sections.find((section) => section.id === "lagringshook").blocks.filter((block) => block.type === "code");
    const helpers = await readFile(new URL("../../src/content/examples/taskStorage.js", import.meta.url), "utf8");
    await mountTeachingFixture(page, { "taskStorage.js": helpers, "useStoredTasks.js": storageBlocks[0].code, "App.jsx": storageBlocks[2].code }, "App.jsx");
    await page.getByRole("button", { name: "Legg til mål" }).click();
    await page.getByRole("button", { name: "Legg til mål" }).click();
    check(await page.getByRole("listitem").count() === 2, "storage quota: two tasks remain in memory");
    check((await page.getByRole("alert").innerText()).includes("minnet"), "storage quota: error is explained");
    result.examples.push({ example: "useStoredTasks", injectedThrowingAdapter: true, tasksInMemory: 2 });
    result.summary = { dashboards: result.dashboards, correctedLessons: result.lessons.length, executableExampleChecks: result.examples.length, failures: failures.length };
  } finally { await context.close(); }
  return result;
}
