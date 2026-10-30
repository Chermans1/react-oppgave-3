import ExerciseRenderer from "./exercises/ExerciseRenderer.jsx";

export default function LessonExercises({ lesson, lessonKey, exerciseIds }) {
  const questions = lesson.exercises.map((question, index) => ({ question, number: index + 1 }))
    .filter(({ question }) => !exerciseIds || exerciseIds.includes(question.id));
  return questions.length ? (
    <div className="exercise-list">
      {questions.map(({ question, number }) => (
        <ExerciseRenderer key={question.id} number={number} question={question} lessonKey={lessonKey} />
      ))}
    </div>
  ) : (
    <p className="muted">Her blir det plass til interaktive oppgaver. Ingen oppgaver er tilgjengelige ennå.</p>
  );
}
