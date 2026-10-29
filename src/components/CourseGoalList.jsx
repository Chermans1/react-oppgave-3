import { Link } from "react-router-dom";
import { GOAL_STATUS_LABELS } from "../progress/goals.js";

export default function CourseGoalList({ goals, showLessonLinks = false }) {
  return (
    <ul className="course-goal-list">
      {goals.map((goal) => (
        <li key={`${goal.lessonKey}:${goal.id}`}>
          <div className="course-goal-heading">
            <p>{goal.description}</p>
            <span className={`goal-status goal-status-${goal.status}`}>
              {GOAL_STATUS_LABELS[goal.status]}
            </span>
          </div>
          <p className="muted">
            {goal.total ? `${goal.passed} av ${goal.total} tilknyttede oppgaver bestått`
              : "Ingen oppgaver er knyttet til målet ennå. Mestring kan ikke vurderes."}
          </p>
          {showLessonLinks && (
            <Link className="text-link" to={goal.lessonKey}>Til leksjonen: {goal.lessonTitle} →</Link>
          )}
        </li>
      ))}
    </ul>
  );
}
