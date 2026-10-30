export const paragraph = (text) => ({ type: "paragraph", text });
export const code = (title, code, language = "jsx") => ({ type: "code", title, code, language });
export const list = (...items) => ({ type: "list", items });
export const sequence = (caption, steps) => ({ type: "preview", caption,
  nodes: steps.map(([title, text]) => ({ tag: "article", children: [
    { tag: "h4", text: title }, { tag: "p", text },
  ] })),
});
export const section = (id, title, ...blocks) => ({ id, title, stage: "Arbeidsforløp", blocks });
export function extendLesson(lesson, workshop) {
  if (!workshop) return lesson;
  return {
    ...lesson,
    practicalActivities: lesson.practicalActivities.map((activity) => ({ ...activity, ...workshop.practice })),
    sections: lesson.sections.flatMap((s) => [
      ...(s.id === "praktisk" ? workshop.sections ?? [] : []),
      { ...s, blocks: [...(workshop.beforeTopic?.[s.id] ?? []), ...s.blocks] },
    ]),
  };
}
