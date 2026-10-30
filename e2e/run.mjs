// Kjør: node e2e/run.mjs [walk] [course] [robustness] [views]   (uten argument kjøres alt)
import { mkdirSync, writeFileSync } from "node:fs";
import { launchBrowser } from "./lib/env.mjs";

const phases = {
  findings: async () => (await import("./phases/findings.mjs")).runFindings,
  walk: async () => (await import("./phases/walk.mjs")).runWalk,
  course: async () => (await import("./phases/course.mjs")).runCourse,
  robustness: async () => (await import("./phases/robustness.mjs")).runRobustness,
  views: async () => (await import("./phases/views.mjs")).runViews,
};
const wanted = process.argv.slice(2).filter((name) => name in phases);
const selected = wanted.length ? wanted : Object.keys(phases);
mkdirSync(new URL("./results/", import.meta.url), { recursive: true });

const browser = await launchBrowser();
let exitCode = 0;
try {
  for (const name of selected) {
    const started = Date.now();
    console.log(`\n== ${name} ==`);
    const run = await phases[name]();
    const result = await run(browser);
    result.seconds = Math.round((Date.now() - started) / 1000);
    writeFileSync(new URL(`./results/${name}.json`, import.meta.url), JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result.summary, null, 2));
    if ((result.failures?.length ?? 0) > 0 || Object.keys(result.lessonFailures ?? {}).length > 0) exitCode = 1;
  }
} finally {
  await browser.close();
}
process.exit(exitCode);
