// Felles oppsett for nettlesersimuleringen: adresse, nettleser og kursdata.
import { chromium } from "playwright";
import { existsSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { reactCourse } from "../../src/content/reactCourse.js";
import { lessonPath } from "../../src/content/courses.js";
import { getHint } from "../../src/content/exerciseHints.js";

export const BASE_URL = (process.env.BASE_URL ?? "http://localhost:5173/react-oppgave-3/").replace(/\/?$/, "/");
export const PROGRESS_KEY = "eduplan.learning-progress.v1";
export const VIEWPORTS = { mobile: { width: 375, height: 812 }, tablet: { width: 768, height: 1024 }, desktop: { width: 1440, height: 900 } };

// Bruker Playwrights egen Chromium. Finnes ikke riktig versjon, brukes en annen Chromium fra Playwright-cachen.
function cachedChromium() {
  const roots = [join(homedir(), "Library/Caches/ms-playwright"), join(homedir(), ".cache/ms-playwright")];
  for (const root of roots) {
    if (!existsSync(root)) continue;
    for (const dir of readdirSync(root).filter((name) => /^chromium-\d+$/.test(name)).sort().reverse()) {
      for (const rel of ["chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing", "chrome-mac/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing", "chrome-linux/chrome", "chrome-linux64/chrome"]) {
        if (existsSync(join(root, dir, rel))) return join(root, dir, rel);
      }
    }
  }
  return undefined;
}

export async function launchBrowser() {
  const executablePath = process.env.PW_CHROMIUM ?? undefined;
  try {
    return await chromium.launch({ executablePath });
  } catch (error) {
    const fallback = cachedChromium();
    if (!fallback) throw error;
    return chromium.launch({ executablePath: fallback });
  }
}

// ---- Kursdata (brukes bare for å vite hva som skal finnes og hva som er riktig svar) ----
export const course = reactCourse;
export const modules = course.modules;
export const lessons = modules.flatMap((module, moduleIndex) => module.lessons.map((lesson, lessonIndex) => ({
  module, moduleIndex, lesson, lessonIndex, key: lessonPath(course.id, module.id, lesson.id),
})));
lessons.forEach((entry, index) => { entry.index = index; entry.previous = lessons[index - 1], entry.next = lessons[index + 1]; });
export const questions = lessons.flatMap((entry) => entry.lesson.exercises.map((question) => ({ ...entry, question })));
export const questionHint = getHint;

// Mål som kan avgjøres av kunnskapsoppgaver: ikke praktiske, ikke valgfrie.
export const goals = lessons.flatMap((entry) => entry.lesson.learningObjectives.map((goal) => ({
  ...goal, lessonKey: entry.key, lessonTitle: entry.lesson.title,
  optional: goal.optional === true || entry.lesson.optional === true,
  practical: goal.assessment === "practical",
})));
export const mandatoryKnowledgeGoals = goals.filter((goal) => !goal.practical && !goal.optional);

export const hash = (key) => `${BASE_URL}#${key}`;
export const answerFor = (question) => question.type === "FillInCodeQuestion" ? question.validAnswers[0]
  : question.options.find((option) => option.id === question.correctAnswer).text;
export const wrongAnswers = (question) => question.type === "FillInCodeQuestion" ? ["§feil-1§", "§feil-2§"]
  : question.options.filter((option) => option.id !== question.correctAnswer).map((option) => option.text);
