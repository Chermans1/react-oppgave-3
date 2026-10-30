import { isCurrentAnswer } from "./progress.js";
import { lessonPath } from "../content/courses.js";

export const GOAL_STATUS_LABELS = {
  "not-started": "Ikke startet",
  "in-progress": "Under arbeid",
  mastered: "Mestret",
};

// Goal status is always derived from the existing, latest submitted answers.
export function getGoalProgress(progress, lessonKey, goal, exercises) {
  const questionIds = [...new Set(goal.exerciseIds)];
  const available = new Map(exercises.map((exercise) => [exercise.id, exercise]));
  const answers = questionIds.map((id) =>
    available.has(id) && isCurrentAnswer(progress.lessons[lessonKey]?.answers[id], available.get(id))
      ? progress.lessons[lessonKey]?.answers[id] : undefined,
  );
  const attempted = answers.filter((answer) => answer?.attempts > 0).length;
  const passed = answers.filter((answer) => answer?.attempts > 0 && answer.correct === true).length;
  const total = questionIds.length;
  const status = total > 0 && passed === total
    ? "mastered"
    : attempted > 0 ? "in-progress" : "not-started";
  return { status, attempted, passed, total };
}

export function getCourseGoals(course, progress) {
  return course.modules.flatMap((module) =>
    module.lessons.flatMap((lesson) => {
      const lessonKey = lessonPath(course.id, module.id, lesson.id);
      return lesson.learningObjectives.map((goal) => ({
        ...goal,
        optional: goal.optional === true || lesson.optional === true,
        lessonKey,
        lessonTitle: lesson.title,
        ...getGoalProgress(progress, lessonKey, goal, lesson.exercises),
      }));
    }),
  );
}

export function summarizeGoals(allGoals) {
  const goals = allGoals.filter((goal) => goal.assessment !== "practical" && !goal.optional);
  const mastered = goals.filter((goal) => goal.status === "mastered").length;
  return {
    total: goals.length,
    mastered,
    percentage: goals.length ? Math.floor(mastered / goals.length * 100) : 0,
  };
}
