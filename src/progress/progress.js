export const PROGRESS_KEY = "eduplan.learning-progress.v1";
export const emptyProgress = () => ({ version: 1, lessons: {} });

// Only retain progress fields. Never persist answer text or answer keys.
export function sanitizeProgress(value) {
  if (value?.version !== 1 || !value.lessons || typeof value.lessons !== "object") {
    return emptyProgress();
  }
  const lessons = Object.fromEntries(
    Object.entries(value.lessons).filter(([, lesson]) => lesson && typeof lesson === "object")
      .map(([id, lesson]) => [id, {
        reviewed: lesson.reviewed === true,
        answers: Object.fromEntries(
          Object.entries(lesson.answers ?? {}).filter(([, answer]) =>
            answer && Number.isSafeInteger(answer.attempts) && answer.attempts > 0 &&
            typeof answer.correct === "boolean",
          ).map(([questionId, answer]) => [questionId, {
            attempts: answer.attempts,
            correct: answer.correct,
          }]),
        ),
      }]),
  );
  return { version: 1, lessons };
}

export function readProgress(storage) {
  const saved = storage.getItem(PROGRESS_KEY);
  return saved ? sanitizeProgress(JSON.parse(saved)) : emptyProgress();
}

export function updateLessonProgress(progress, lessonKey, change) {
  const lesson = progress.lessons[lessonKey] ?? { reviewed: false, answers: {} };
  return {
    version: 1,
    lessons: { ...progress.lessons, [lessonKey]: change(lesson) },
  };
}

export function recordAnswer(progress, lessonKey, questionId, correct) {
  return updateLessonProgress(progress, lessonKey, (lesson) => ({
    ...lesson,
    answers: {
      ...lesson.answers,
      [questionId]: { attempts: (lesson.answers[questionId]?.attempts ?? 0) + 1, correct },
    },
  }));
}

export function getLessonProgress(progress, lessonKey, exercises) {
  const lesson = progress.lessons[lessonKey];
  const attempts = exercises.map((question) => lesson?.answers[question.id]);
  const answered = attempts.filter(Boolean).length;
  const correct = attempts.filter((answer) => answer?.correct).length;
  const reviewed = lesson?.reviewed === true;
  return {
    reviewed,
    answered,
    correct,
    total: exercises.length,
    mastered: reviewed && exercises.length > 0 && correct === exercises.length,
  };
}
