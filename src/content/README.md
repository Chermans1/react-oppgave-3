# Kursdata

`courses.js` registrerer kurs og eksporterer funksjoner for oppslag, URL-er,
leksjonstelling og forrige/neste leksjon. Rekkefølgen i modul- og leksjonsarrayene
bestemmer progresjonen, også mellom moduler. ID-er er stabile URL-segmenter;
behold dem når en tittel eller rekkefølge endres.

`reactCourse.js` beskriver de 14 modulene fra kursplanen. Hver modul har `id`,
`title`, `description` og en ordnet liste med planlagte leksjoner.
Hvert leksjonspar i `modulePlans` er `[id, title]` og utvides til:

```js
{
  id: "jsx-regler",
  title: "JSX-regler og uttrykk",
  status: "planned",
  learningObjectives: [], // strenger
  content: [],           // forklaringsavsnitt som strenger
  codeExamples: [],      // { id, title, language, code }
  exercises: [],         // { id, title, type, instructions }
}
```

Ingen fullstendige læringsmål, forklaringer, kodeeksempler eller oppgaver er
lagt inn. `LessonView` viser plassholdere for tomme felt. Kodeeksempler vises
som tekst i `pre`/`code`; de kjøres ikke. Oppgavefeltet reserverer plass for
senere innhold og har ingen oppgavemotor.

Ved senere innholdsproduksjon kan leksjonsdefinisjonene flyttes til egne filer
som eksporterer samme objektformat. Sidene trenger da ingen endring.
Nye kurs legges til i `courses`-arrayet. Statiske kursdata trenger ingen Context;
Context brukes fortsatt for tema og brukerens læringsmål.
