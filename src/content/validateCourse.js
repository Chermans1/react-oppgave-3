// Build-time authoring validation; not shipped in the initial application bundle.
export function validateCourse(course) {
  const globalIds = { module: new Set(), lesson: new Set(), question: new Set(), goal: new Set(), practical: new Set() };
  function id(value, kind, set = globalIds[kind]) {
    if (typeof value !== "string" || !/^[a-z][a-z0-9-]*$/.test(value)) throw new Error(`Ugyldig ${kind}-id: ${value}`);
    if (set.has(value)) throw new Error(`Duplisert ${kind}-id: ${value}`);
    set.add(value);
  }
  for (const module of course.modules) {
    id(module.id, "module");
    for (const lesson of module.lessons) {
      id(lesson.id, "lesson");
      const sections = new Set();
      lesson.sections.forEach((s) => id(s.id, "section", sections));
      for (const question of lesson.exercises) {
        id(question.id, "question");
        if (question.revision !== undefined && (!Number.isSafeInteger(question.revision) || question.revision < 1)) throw new Error("Ugyldig oppgaverevisjon");
        if (question.type === "FillInCodeQuestion") {
          if (!question.validAnswers?.length || !question.validAnswers.every((a) => typeof a === "string" && a.trim())) throw new Error("Mangler gyldige svar");
        } else if (["MultipleChoiceQuestion", "FindTheBugQuestion"].includes(question.type)) {
          const options = new Set();
          question.options.forEach((o) => id(o.id, "option", options));
          if (!options.has(question.correctAnswer)) throw new Error("Ugyldig fasitreferanse");
        } else throw new Error("Ukjent oppgavetype");
      }
      for (const goal of lesson.learningObjectives) {
        id(goal.id, "goal");
        if (!goal.description?.trim()) throw new Error("Mangler målbeskrivelse");
        if (goal.assessment === "practical" && goal.exerciseIds.length) throw new Error("Praktiske mål kan ikke automatisk godkjennes");
        for (const qid of goal.exerciseIds) if (!lesson.exercises.some((q) => q.id === qid)) throw new Error("Ukjent oppgave i læringsmål");
      }
      for (const activity of lesson.practicalActivities ?? []) id(activity.id, "practical");
    }
  }
  return true;
}
