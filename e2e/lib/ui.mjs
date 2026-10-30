// Hjelpere som snakker med EduPlan gjennom brukergrensesnittet. Foretrekker roller og tilgjengelige navn.
import { BASE_URL, PROGRESS_KEY, hash } from "./env.mjs";

// Samler konsollfeil, sidefeil og mislykkede forespørsler, merket med hva testen gjorde da.
export function watchPage(page, sink) {
  const where = () => sink.label ?? "ukjent";
  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) sink.events.push({ kind: `console.${message.type()}`, where: where(), text: message.text().slice(0, 400) });
  });
  page.on("pageerror", (error) => sink.events.push({ kind: "pageerror", where: where(), text: String(error).slice(0, 400) }));
  page.on("requestfailed", (request) => sink.events.push({ kind: "requestfailed", where: where(), text: `${request.url()} ${request.failure()?.errorText}` }));
  page.on("response", (response) => {
    if (response.status() >= 400 && !response.url().endsWith("favicon.ico")) sink.events.push({ kind: `http.${response.status()}`, where: where(), text: response.url() });
  });
}

export const newSink = () => ({ label: null, events: [] });

export async function open(page, key) {
  await page.goto(key ? hash(key) : BASE_URL, { waitUntil: "domcontentloaded" });
}

export async function openLesson(page, entry) {
  await open(page, entry.key);
  await page.getByRole("heading", { level: 1, name: entry.lesson.title, exact: true }).waitFor({ timeout: 15000 });
}

export const storedProgress = (page) => page.evaluate((key) => {
  const raw = localStorage.getItem(key);
  return raw === null ? null : JSON.parse(raw);
}, PROGRESS_KEY);

export async function storedAnswer(page, lessonKey, id) {
  return (await storedProgress(page))?.lessons?.[lessonKey]?.answers?.[id];
}

// Samler funn uten å stoppe testen.
export function recorder() {
  const failures = [];
  const check = (condition, message, extra) => { if (!condition) failures.push(extra ? `${message} (${extra})` : message); return Boolean(condition); };
  return { failures, check };
}

export async function theme(page) {
  return (await page.locator(".app").getAttribute("data-theme")) ?? "ukjent";
}

export async function setTheme(page, wanted) {
  if ((await theme(page)) !== wanted) await page.getByRole("button", { name: /Bytt tema/ }).click();
  await page.locator(`.app[data-theme="${wanted}"]`).waitFor();
}

export const horizontalOverflow = (page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
