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
            ...(answer.assisted === true ? { assisted: true } : {}),
            ...(answer.mastered === true ? { mastered: true } : {}),
            ...(answer.solutionShown === true ? { solutionShown: true } : {}),
            ...(Number.isSafeInteger(answer.revision) && answer.revision > 1 ? { revision: answer.revision } : {}),
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

// An answer record holds the latest practice result (correct, assisted) and, separately, the documented
// mastery of that revision. A correct answer given after the solution was shown (assisted) is practice, not mastery.
// `mastered` is only stored when the latest result alone cannot show it (a later wrong or assisted answer);
// legacy records without the field are read as before: correct and not assisted means mastered.
// `solutionShown` marks that the current practice round has seen the solution. It lives until a deliberate new round.
export const isIndependentCorrect = (answer) => answer?.correct === true && answer.assisted !== true;
export const isMastered = (answer) => answer?.mastered === true || isIndependentCorrect(answer);
export const isSolutionShown = (answer, question) => isCurrentAnswer(answer, question) && answer.solutionShown === true;

const sameRevision = (answer, revision) => (answer?.revision ?? 1) === revision;

export function recordAnswer(progress, lessonKey, questionId, correct, revision = 1, assisted = false) {
  return updateLessonProgress(progress, lessonKey, (lesson) => {
    const previous = lesson.answers[questionId];
    const current = previous && sameRevision(previous, revision) ? previous : undefined;
    const solutionShown = current?.solutionShown === true;
    const isAssisted = correct && (assisted || solutionShown);
    const independent = correct && !isAssisted;
    const keepsMastery = !independent && isMastered(current);
    return {
      ...lesson,
      answers: {
        ...lesson.answers,
        [questionId]: {
          attempts: (previous?.attempts ?? 0) + 1,
          correct,
          ...(isAssisted ? { assisted: true } : {}),
          ...(keepsMastery ? { mastered: true } : {}),
          ...(solutionShown ? { solutionShown: true } : {}),
          ...(revision > 1 ? { revision } : {}),
        },
      },
    };
  });
}

// Persist that the student chose to see the solution for this revision. Needs an existing answer to attach to.
export function markSolutionShown(progress, lessonKey, questionId, revision = 1) {
  const answer = progress.lessons[lessonKey]?.answers[questionId];
  if (!answer || !sameRevision(answer, revision) || answer.solutionShown === true) return progress;
  return updateLessonProgress(progress, lessonKey, (lesson) => ({
    ...lesson, answers: { ...lesson.answers, [questionId]: { ...answer, solutionShown: true } },
  }));
}

// A deliberate new practice round. History (attempts, latest result, mastery) is kept.
export function startPracticeRound(progress, lessonKey, questionId, revision = 1) {
  const answer = progress.lessons[lessonKey]?.answers[questionId];
  if (!answer || !sameRevision(answer, revision) || answer.solutionShown !== true) return progress;
  return updateLessonProgress(progress, lessonKey, (lesson) => ({
    ...lesson, answers: { ...lesson.answers, [questionId]: Object.fromEntries(Object.entries(answer).filter(([field]) => field !== "solutionShown")) },
  }));
}

export function isCurrentAnswer(answer, question) {
  return Boolean(answer) && (answer.revision ?? 1) === (question.revision ?? 1);
}

export function getLessonProgress(progress, lessonKey, exercises) {
  const lesson = progress.lessons[lessonKey];
  const attempts = exercises.map((question) => isCurrentAnswer(lesson?.answers[question.id], question) ? lesson.answers[question.id] : undefined);
  const answered = attempts.filter(Boolean).length;
  const correct = attempts.filter(isMastered).length;
  const reviewed = lesson?.reviewed === true;
  return {
    reviewed,
    answered,
    correct,
    total: exercises.length,
    mastered: reviewed && exercises.length > 0 && correct === exercises.length,
  };
}
