import { reactCourseManifest as reactCourse } from "./courseManifest.js";

export const courses = [reactCourse];
export const getCourse = (id) => courses.find((course) => course.id === id);
export const coursePath = (courseId) => `/kurs/${courseId}`;
export const modulePath = (courseId, moduleId) =>
  `${coursePath(courseId)}/moduler/${moduleId}`;
export const lessonPath = (courseId, moduleId, lessonId) =>
  `${modulePath(courseId, moduleId)}/leksjoner/${lessonId}`;
export const getLessonCount = (course) =>
  course.modules.reduce((count, module) => count + module.lessons.length, 0);

// Follow the course order, including transitions between modules.
export function getLessonNavigation(course, moduleId, lessonId) {
  const lessons = course.modules.flatMap((module) =>
    module.lessons.map((lesson) => ({
      title: lesson.title,
      path: lessonPath(course.id, module.id, lesson.id),
      moduleId: module.id,
      id: lesson.id,
    })),
  );
  const index = lessons.findIndex(
    (lesson) => lesson.moduleId === moduleId && lesson.id === lessonId,
  );
  if (index === -1) return { previous: null, next: null };
  return {
    previous: lessons[index - 1] ?? null,
    next: lessons[index + 1] ?? null,
  };
}
