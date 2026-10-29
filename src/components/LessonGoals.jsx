import { useId } from "react";
import { useLearningProgress } from "../hooks/useLearningProgress.js";
import { getGoalProgress } from "../progress/goals.js";
import CourseGoalList from "./CourseGoalList.jsx";

export default function LessonGoals({ lesson, lessonKey }) {
  const headingId = useId();
  const { progress } = useLearningProgress();
  const goals = lesson.learningObjectives.map((goal) => ({
    ...goal,
    lessonKey,
    ...getGoalProgress(progress, lessonKey, goal, lesson.exercises),
  }));

  return (
    <section aria-labelledby={headingId}>
      <h2 id={headingId}>Leksjonens kursmål</h2>
      {goals.length ? <CourseGoalList goals={goals} />
        : <p className="muted">Kursmål legges til når leksjonen utarbeides.</p>}
    </section>
  );
}
