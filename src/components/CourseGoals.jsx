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

  const modules = course.modules.map((module, index) => {
    const moduleGoals = getCourseGoals({ ...course, modules: [module] }, progress);
    return {
      ...module, number: index + 1, summary: summarizeGoals(moduleGoals),
      groups: [
        { title: "Obligatoriske kunnskapsmål", goals: moduleGoals.filter((goal) => goal.assessment !== "practical" && !goal.optional) },
        { title: "Valgfrie kunnskapsmål", goals: moduleGoals.filter((goal) => goal.assessment !== "practical" && goal.optional) },
        { title: "Praktiske mål – vurderes i eget prosjekt", goals: moduleGoals.filter((goal) => goal.assessment === "practical") },
      ],
    };
  });

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
      {goals.length ? <div className="module-goals-list">
        <p className="muted">Utvid en modul for å se alle målene og lenker til leksjonene.</p>
        {modules.map((module) => (
          <details className="module-goals" key={module.id}>
            <summary>
              <span className="module-goals-title">{module.number}. {module.title}</span>
              <span className="module-goals-progress">{module.summary.mastered} av {module.summary.total} obligatoriske kunnskapsmål mestret · {module.summary.percentage} %</span>
            </summary>
            <div className="module-goals-content">
              {module.groups.filter((group) => group.goals.length).map((group) => (
                <section className="module-goals-group" key={group.title} aria-label={`${module.title}: ${group.title}`}>
                  <h3>{group.title} ({group.goals.length})</h3>
                  <CourseGoalList goals={group.goals} showLessonLinks />
                </section>
              ))}
            </div>
          </details>
        ))}
      </div>
        : <p className="muted">Kursmål legges til når leksjonene utarbeides.</p>}
      <ProgressStorageNotice />
    </section>
  );
}
