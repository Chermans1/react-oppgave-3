// Trusted teaching example. Student input is never executed.
export const TASKS_KEY = "practice.tasks.v1";

export function validTasks(value) {
  return Array.isArray(value) && value.every((task) =>
    task !== null && typeof task === "object" &&
    typeof task.id === "string" && task.id.trim().length > 0 &&
    typeof task.title === "string" && task.title.trim().length > 0 &&
    typeof task.done === "boolean"
  ) && new Set(value.map((task) => task.id)).size === value.length;
}

export function readTasks(getStorage) {
  try {
    const storage = typeof getStorage === "function" ? getStorage() : getStorage;
    const raw = storage.getItem(TASKS_KEY);
    if (raw === null) return { tasks: [], canWrite: true, error: "" };
    const tasks = JSON.parse(raw);
    if (!validTasks(tasks)) throw new Error("Ugyldig datamodell");
    return { tasks, canWrite: true, error: "" };
  } catch {
    return { tasks: [], canWrite: false,
      error: "Lagrede mål kunne ikke leses. Originaldata er bevart. Du kan arbeide i minnet eller velge å nullstille lagringen." };
  }
}

export function writeTasks(getStorage, tasks, canWrite) {
  if (!canWrite) return "Lagring er satt på pause for å bevare originaldata.";
  if (!validTasks(tasks)) return "Målene har ugyldig format og ble ikke lagret.";
  try {
    const storage = typeof getStorage === "function" ? getStorage() : getStorage;
    storage.setItem(TASKS_KEY, JSON.stringify(tasks));
    return "";
  } catch {
    return "Endringene finnes i minnet, men kunne ikke lagres lokalt.";
  }
}
