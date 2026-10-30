import ProgressStorageNotice from "./ProgressStorageNotice.jsx";
import { useId } from "react";
import { useLearningProgress } from "../hooks/useLearningProgress.js";
import { getCourseGoals, summarizeGoals } from "../progress/goals.js";
import CourseGoalList from "./CourseGoalList.jsx";

export default function CourseGoals({ course }) {
  const headingId = useId();
  const { progress } = useLearningProgress();
  const goals = getCourseGoals(course, progress);
  const practicalCount = goals.filter((goal) => goal.assessment === "practical").length;
  const summary = summarizeGoals(goals.filter((goal) => goal.assessment !== "practical" && !goal.optional));

  return (
    <section className="course-goals-panel page-section" aria-labelledby={headingId}>
      <span className="eyebrow">AUTOMATISK FRA OPPGAVENE</span>
      <h2 id={headingId}>Kursmål</h2>
      <p className="muted">{course.title}</p>
      <div className="course-goals-summary" role="status" aria-live="polite">
        <strong>{summary.mastered} av {summary.total} {practicalCount ? "obligatoriske kunnskapsmål" : "kursmål"} mestret</strong>
        <span>{summary.percentage} %</span>
      </div>
      <progress value={summary.mastered} max={summary.total || 1} aria-label={practicalCount ? "Andel mestrede kunnskapsmål" : "Andel mestrede kursmål"} />
      <p className="muted">Kursmål oppdateres fra siste innsendte svar. Alle tilknyttede oppgaver må være bestått.</p>
      {practicalCount > 0 && <p className="notice">I tillegg har kurset {practicalCount} praktiske mål. De vises under, men inngår ikke i den automatiske prosentberegningen og kan ikke godkjennes av kunnskapsoppgavene.</p>}
      <p className="muted">Prosenten gjelder obligatoriske kunnskapsmål vurdert med oppgavene. Ett mål kan kreve flere oppgaver, og én oppgave kan støtte flere mål. Valgfri fordypning og praktisk programmering inngår ikke. Eldre forsøk på vesentlig reviderte oppgaver er bevart, men må erstattes av et nytt svar.</p>
      {goals.length ? <CourseGoalList goals={goals} showLessonLinks />
        : <p className="muted">Kursmål legges til når leksjonene utarbeides.</p>}
      <ProgressStorageNotice />
    </section>
  );
}
