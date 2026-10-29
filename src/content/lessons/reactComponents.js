import { reactComponentSections } from "./reactComponentSections.js";

export const reactComponentsLesson = {
  id: "funksjonskomponenter",
  title: "Hva er en React-komponent?",
  status: "available",
  learningObjectives: [
    {
      id: "reusable-component",
      description: "Forklare at en komponent er en gjenbrukbar del av brukergrensesnittet.",
      exerciseIds: ["component-definition"],
    },
    {
      id: "function-component-jsx",
      description: "Gjenkjenne og arbeide med en enkel funksjonskomponent som returnerer JSX.",
      exerciseIds: ["component-return", "jsx-closing-tag"],
    },
    {
      id: "jsx-variable",
      description: "Bruke en lokal variabel som tekst i JSX.",
      exerciseIds: ["component-return"],
    },
    {
      id: "matching-jsx-tags",
      description: "Oppdage at en JSX-starttagg og sluttagg må passe sammen.",
      exerciseIds: ["jsx-closing-tag"],
    },
  ],
  sections: reactComponentSections,
  content: [],
  codeExamples: [],
  exercises: [
    {
      id: "component-definition",
      type: "MultipleChoiceQuestion",
      title: "Gjenbruk i en kalender",
      skill: "Begrepsforståelse",
      prompt: "Et kalendergrensesnitt viser et kort for hvert arrangement. Hva betyr det at kortet er en React-komponent?",
      options: [
        { id: "stylesheet", text: "Kortet er en CSS-fil som bestemmer alle fargene i appen." },
        { id: "reusable-ui", text: "Kortet er en gjenbrukbar del av brukergrensesnittet som kan vises flere steder." },
        { id: "database", text: "Kortet er en database som lagrer alle arrangementene." },
      ],
      correctAnswer: "reusable-ui",
      explanation: "En komponent beskriver en del av brukergrensesnittet. Kalenderen kan bruke den samme kortkomponenten for flere arrangementer. CSS bestemmer utseendet, og en database kan lagre data, men ingen av dem er selve grensesnittkomponenten.",
    },
    {
      id: "component-return",
      type: "FillInCodeQuestion",
      title: "Vis kursnavnet i CourseBadge",
      skill: "Anvendelse",
      prompt: "Fullfør CourseBadge slik at teksten fra den lokale variabelen vises i strong-elementet. Skriv bare variabelnavnet i svarfeltet, uten klammeparenteser eller anførselstegn.",
      code: 'function CourseBadge() {\n  const courseName = "React";\n  return <strong>{___}</strong>;\n}',
      validAnswers: ["courseName"],
      whitespace: "trim",
      explanation: "courseName er variabelen som inneholder kursnavnet. Klammeparentesene står allerede i koden, så det manglende uttrykket er bare courseName. JSX leser verdien av variabelen i {courseName} og viser teksten i strong-elementet. Skriver du variabelnavnet som en tekststreng, vises navnet i stedet for verdien.",
    },
    {
      id: "jsx-closing-tag",
      type: "FindTheBugQuestion",
      title: "Reparer meldingen i Notice",
      skill: "Feilsøking",
      prompt: "Notice skal vise en melding i et p-element inne i en aside. Hvilken endring av sluttaggen retter JSX-feilen uten å endre elementtypen?",
      code: 'const Notice = () => (\n  <aside>\n    <p>Husk en kort pause.</span>\n  </aside>\n);',
      options: [
        { id: "lowercase-name", text: "Endre </span> til </aside>." },
        { id: "missing-state", text: "Fjern </span> og la p-elementet stå uten sluttagg." },
        { id: "matching-tags", text: "Endre </span> til </p>." },
      ],
      correctAnswer: "matching-tags",
      explanation: "Meldingen starter med <p>, så den må lukkes med </p>. Riktig meldingslinje er <p>Husk en kort pause.</p>. Den ytre aside-taggen er allerede lukket. JSX krever at elementene er riktig lukket og nøstet; å fjerne sluttaggen eller bruke </aside> på meldingen løser ikke feilen.",
    },
  ],
};
