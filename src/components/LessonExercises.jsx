import ExerciseRenderer from "./exercises/ExerciseRenderer.jsx";

export default function LessonExercises({ lesson, lessonKey }) {
  return lesson.exercises.length ? (
    <div className="exercise-list">
      {lesson.exercises.map((question, index) => (
        <ExerciseRenderer key={question.id} number={index + 1} question={question} lessonKey={lessonKey} />
      ))}
    </div>
  ) : (
    <p className="muted">Her blir det plass til interaktive oppgaver. Ingen oppgaver er tilgjengelige ennå.</p>
  );
}
