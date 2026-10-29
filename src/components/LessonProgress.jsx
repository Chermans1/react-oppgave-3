import { useLearningProgress } from "../hooks/useLearningProgress.js";
import { getLessonProgress } from "../progress/progress.js";

export default function LessonProgress({ lesson, lessonKey }) {
  const { progress, storageError, setReviewed } = useLearningProgress();
  const summary = getLessonProgress(progress, lessonKey, lesson.exercises);
  return (
    <section className="lesson-learning-progress" aria-label="Din leksjonsprogresjon">
      <h2>Din leksjonsprogresjon</h2>
      <dl className="learning-progress-stats" aria-live="polite">
        <div><dt>Gjennomgått</dt><dd>{summary.reviewed ? "Ja" : "Nei"}</dd></div>
        <div><dt>Oppgaver besvart</dt><dd>{summary.answered} av {summary.total}</dd></div>
        <div><dt>Riktige svar</dt><dd>{summary.correct} av {summary.total}</dd></div>
        <div><dt>Leksjon mestret</dt><dd>{summary.mastered ? "Ja" : "Ikke ennå"}</dd></div>
      </dl>
      {lesson.status !== "planned" ? (
        <label className="reviewed-toggle">
          <input type="checkbox" checked={summary.reviewed} onChange={(event) => setReviewed(lessonKey, event.target.checked)} />
          Jeg har gjennomgått leksjonen
        </label>
      ) : <p className="muted">Leksjonen kan markeres som gjennomgått når innholdet er klart.</p>}
      <p className="muted">
        {summary.total
          ? "Mestring krever at leksjonen er gjennomgått og siste innsendte svar på hver oppgave er riktig. Du kan prøve flere ganger."
          : "Mestring vurderes først når leksjonen har oppgaver."}
      </p>
      <p className="muted">Leksjonsprogresjonen lagres lokalt i denne nettleseren.</p>
      {storageError && <p className="notice" role="alert">{storageError}</p>}
    </section>
  );
}
