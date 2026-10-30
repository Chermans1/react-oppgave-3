import { getCourse } from "./courses.js";

const loaders = {
  "javascript-grunnlag": () => import("./modules/javascript.js").then((m) => m.javascriptLessons),
  "jsx-komponenter": async () => {
    const [components, first, second, third] = await Promise.all([
      import("./modules/components.js"), import("./lessons/reactComponents.js"),
      import("./lessons/mainToApp.js"), import("./lessons/jsxRules.js"),
    ]);
    return [...components.componentLessons, first.reactComponentsLesson, second.mainToAppLesson, third.jsxRulesLesson];
  },
  "props-komposisjon": () => import("./modules/components.js").then((m) => m.componentLessons),
  "styling-tilgjengelighet": () => import("./modules/styling.js").then((m) => m.stylingLessons),
  "state-hendelser": () => import("./modules/state.js").then((m) => m.stateLessons),
  "skjemaer-samarbeid": () => import("./modules/forms.js").then((m) => m.formLessons),
  "effekter-api": () => import("./modules/effects.js").then((m) => m.effectLessons),
  "egne-hooks": () => import("./modules/hooks.js").then((m) => m.hookLessons),
  "context-state": () => import("./modules/context.js").then((m) => m.contextLessons),
  routing: () => import("./modules/routing.js").then((m) => m.routingLessons),
  serverdata: () => import("./modules/serverdata.js").then((m) => m.serverLessons),
  testing: () => import("./modules/testing.js").then((m) => m.testingLessons),
  robusthet: () => import("./modules/robustness.js").then((m) => m.robustnessLessons),
  sluttprosjekt: () => import("./modules/project.js").then((m) => m.projectLessons),
};

export async function loadLesson(courseId, moduleId, lessonId) {
  const metadata = getCourse(courseId)?.modules.find((m) => m.id === moduleId)?.lessons.find((l) => l.id === lessonId);
  if (!metadata || !loaders[moduleId]) throw new Error("Leksjonen finnes ikke");
  const lessons = await loaders[moduleId]();
  const lesson = lessons.find((item) => item.id === lessonId);
  if (!lesson) throw new Error("Leksjonsinnholdet mangler");
  return { ...lesson, title: metadata.title };
}
