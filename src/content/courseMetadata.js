// Pure projection shared by the generator and drift tests. Contains no course imports.
export function courseMetadata(course) {
  return {
    id: course.id, title: course.title, description: course.description, status: course.status,
    modules: course.modules.map((module) => ({
      id: module.id, title: module.title, description: module.description,
      lessons: module.lessons.map((lesson) => ({
        id: lesson.id, title: lesson.title, status: lesson.status,
        ...(lesson.optional ? { optional: true } : {}),
        learningObjectives: lesson.learningObjectives,
        exercises: lesson.exercises.map(({ id, revision }) => ({ id, ...(revision ? { revision } : {}) })),
        practicalActivities: (lesson.practicalActivities ?? []).map(({ id }) => ({ id })),
      })),
    })),
  };
}
