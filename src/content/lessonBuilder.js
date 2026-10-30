import { practicalGuides } from "./practicalGuides.js";
import { lessonSummaries } from "./lessonSummaries.js";
import { lessonIllustrations } from "./lessonIllustrations.js";

// Authoring helpers only: all explanations, examples and tasks remain authored data.
export const choice = (prompt, correct, wrong1, wrong2, explanation, code) => ({
  type: "MultipleChoiceQuestion", prompt, code, explanation,
  options: [correct, wrong1, wrong2].map((text, index) => ({ id: `option-${index + 1}`, text })),
  correctAnswer: "option-1",
});
export const fill = (prompt, code, answer, explanation) => ({
  type: "FillInCodeQuestion", prompt, code, validAnswers: Array.isArray(answer) ? answer : [answer],
  whitespace: "trim", explanation,
});
export const bug = (prompt, code, correct, wrong1, wrong2, explanation) => ({
  ...choice(prompt, correct, wrong1, wrong2, explanation, code), type: "FindTheBugQuestion",
});
export const topic = (id, title, text, code, result, question, language = "jsx", objective) => ({ id, title, text, code, result, question, language, objective });
export const practice = (title, description, criteria, hints, starter = "") => ({ title, description, criteria, hints, starter });

export function buildLesson(id, introduction, prerequisites, topics, practical, sources = []) {
  const exercises = topics.map((item) => ({
    ...item.question, revision: item.question.revision ?? 2, id: `${id}-${item.id}-check`, title: item.question.title ?? item.title, skill: item.question.skill ?? item.title,
  }));
  // Rotate the correct choice position without changing its stable ID.
  exercises.forEach((exercise, index) => {
    if (exercise.options) {
      const offset = (id.length + index) % exercise.options.length;
      exercise.options = [...exercise.options.slice(offset), ...exercise.options.slice(0, offset)];
    }
  });
  const learningObjectives = topics.map((item, index) => ({
    id: `${id}-${item.id}-goal`, description: item.objective,
    exerciseIds: [exercises[index].id], assessment: "knowledge",
  }));
  learningObjectives.push({
    id: `${id}-practical-goal`, description: practical.title,
    exerciseIds: [], assessment: "practical",
  });
  return {
    id, status: "available", optional: id === "tailwind", introduction, prerequisites,
    learningObjectives, exercises, content: [], codeExamples: [],
    practicalActivities: [{
      startpoint: `Arbeid i et eget Vite/React-prosjekt. Begynn med kodeeksemplene i denne leksjonen og bygg først den minste fungerende varianten: ${practical.description}`,
      checks: practical.criteria.map((criterion) => `Kontroller i prosjektet og noter faktisk resultat: ${criterion}`),
      extensions: ["Fordypning: dokumenter én alternativ løsning og begrunn valget etter at minimumskravene fungerer."],
      ...practicalGuides[id], ...practical, id: `${id}-practice`, prerequisites }],
    sections: [
      { id: "introduksjon", title: "Start her", stage: "Introduksjon", blocks: [
        { type: "paragraph", text: introduction },
        { type: "paragraph", text: `Forkunnskaper: ${prerequisites}` },
        { type: "paragraph", text: "Korte kodeeksempler er avgrensede utdrag. Arbeidsforløp merket med komplette filer kan brukes sammen i øvingsprosjektet. Følg filnavnene og legg til importer eller kontekst der et utdrag uttrykkelig trenger det." },
        { type: "paragraph", text: "Kunnskapsoppgavene vurderes automatisk. Arbeidsoppgaven utfører du selv i eget prosjekt; den blir ikke automatisk godkjent." },
      ] },
      ...topics.map((item, index) => ({
        id: item.id, title: item.title, stage: "Forklaring og aktivitet", blocks: [
          { type: "paragraph", text: item.text },
          { type: "code", title: "Kodeeksempel – avgrenset utdrag", language: item.language, code: item.code },
          { type: "paragraph", text: `Resultat og forklaring: ${item.result}` },
          ...(lessonIllustrations[`${id}/${item.id}`] ? [{ type: "preview", ...lessonIllustrations[`${id}/${item.id}`] }] : []),
          { type: "exercises", exerciseIds: [exercises[index].id] },
        ],
      })),
      { id: "praktisk", title: "Programmer selv", stage: "Praktisk arbeid", blocks: [{ type: "practical", activityId: `${id}-practice` }] },
      { id: "oppsummering", title: "Oppsummering og videre læring", stage: "Oppsummering", blocks: [
        { type: "paragraph", text: lessonSummaries[id] },
        { type: "paragraph", text: "Kontroller resultatet av arbeidsoppgaven mot akseptansekriteriene. Forklar dine egne kodevalg høyt før du går videre. Neste leksjon bygger på begrepene du nettopp har brukt." },
        ...(sources.length ? [{ type: "resources", links: sources }] : []),
        { type: "goals", title: "Kunnskapsmål og praktiske mål" }, { type: "progress" },
      ] },
    ],
  };
}
