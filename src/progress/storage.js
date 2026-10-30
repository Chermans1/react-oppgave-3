import { emptyProgress, PROGRESS_KEY, sanitizeProgress } from "./progress.js";

const isRecord = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

// Unknown extra fields are sanitized; malformed progress must never become a writable empty reserve.
export function validStoredProgress(value) {
  return value?.version === 1 && isRecord(value.lessons) &&
    Object.values(value.lessons).every((lesson) =>
      isRecord(lesson) && typeof lesson.reviewed === "boolean" && isRecord(lesson.answers) &&
      Object.values(lesson.answers).every((answer) =>
        isRecord(answer) && Number.isSafeInteger(answer.attempts) && answer.attempts > 0 &&
        typeof answer.correct === "boolean" &&
        (answer.revision === undefined || (Number.isSafeInteger(answer.revision) && answer.revision >= 1))));
}

export function loadProgressSession(getStorage) {
  try {
    const raw = getStorage().getItem(PROGRESS_KEY);
    if (raw === null) return { progress: emptyProgress(), storageBlocked: false, storageError: "" };
    const value = JSON.parse(raw);
    if (!validStoredProgress(value)) throw new Error("Ugyldig progresjonsformat");
    return { progress: sanitizeProgress(value), storageBlocked: false, storageError: "" };
  } catch {
    return { progress: emptyProgress(), storageBlocked: true,
      storageError: "Lagret progresjon kunne ikke leses. Originaldata er ikke overskrevet. Lagring er satt på pause; du kan fortsette å øve i denne økten." };
  }
}

export function saveProgressSession(session, getStorage) {
  try {
    getStorage().setItem(PROGRESS_KEY, JSON.stringify(session.progress));
    return { ...session, storageBlocked: false, storageError: "" };
  } catch {
    return { ...session, storageBlocked: true,
      storageError: "Progresjonen kunne ikke lagres. Endringene beholdes i minnet, og videre lagring er satt på pause til du velger hvordan du vil fortsette." };
  }
}

export function changeProgressSession(session, change, getStorage) {
  const next = { ...session, progress: change(session.progress) };
  return next.storageBlocked ? next : saveProgressSession(next, getStorage);
}

// Called only by the explicit recovery action. A failed retry preserves this session's work.
export function recoverProgressSession(session, getStorage) {
  const loaded = loadProgressSession(getStorage);
  return loaded.storageBlocked ? { ...loaded, progress: session.progress } : loaded;
}
