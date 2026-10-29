import { useId } from "react";
import { useLearningProgress } from "../hooks/useLearningProgress.js";
import { getCourseGoals, summarizeGoals } from "../progress/goals.js";
import CourseGoalList from "./CourseGoalList.jsx";

export default function CourseGoals({ course }) {
  const headingId = useId();
  const { progress, storageError } = useLearningProgress();
  const goals = getCourseGoals(course, progress);
  const summary = summarizeGoals(goals);

  return (
    <section className="course-goals-panel page-section" aria-labelledby={headingId}>
      <span className="eyebrow">AUTOMATISK FRA OPPGAVENE</span>
      <h2 id={headingId}>Kursmål</h2>
      <p className="muted">{course.title}</p>
      <div className="course-goals-summary" role="status" aria-live="polite">
        <strong>{summary.mastered} av {summary.total} kursmål mestret</strong>
        <span>{summary.percentage} %</span>
      </div>
      <progress value={summary.mastered} max={summary.total || 1} aria-label="Andel mestrede kursmål" />
      <p className="muted">Kursmål oppdateres fra siste innsendte svar. Alle tilknyttede oppgaver må være bestått.</p>
      {goals.length ? <CourseGoalList goals={goals} showLessonLinks />
        : <p className="muted">Kursmål legges til når leksjonene utarbeides.</p>}
      {storageError && <p className="notice" role="alert">{storageError}</p>}
    </section>
  );
}
