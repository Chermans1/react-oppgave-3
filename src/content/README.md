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

Leksjonen «Hva er en React-komponent?» ligger i `lessons/reactComponents.js`
og har introduksjon, læringsmål, kodeeksempel og tre demonstrasjonsoppgaver.
Resten av leksjonene har fortsatt tomme innholdsfelt. `LessonView` viser
plassholdere der innhold mangler. Kodeeksempler og innsendt kode er kun tekst;
ingen JavaScript kjøres.

Ved senere innholdsproduksjon kan leksjonsdefinisjonene flyttes til egne filer
som eksporterer samme objektformat. Sidene trenger da ingen endring.
Nye kurs legges til i `courses`-arrayet. Statiske kursdata trenger ingen Context;
Context brukes for tema, brukerens læringsmål og lokal leksjonsprogresjon.


## Oppgavedata

Alle oppgaver har `id`, `type`, `title`, `prompt` og `explanation`.
`code` er valgfri tekst. Oppgavene ligger i leksjonens `exercises`-array.

- `MultipleChoiceQuestion` og `FindTheBugQuestion`: `options` er en liste med
  `{ id, text }`, og `correctAnswer` er ID-en til riktig alternativ.
- `FillInCodeQuestion`: `validAnswers` inneholder godkjente uttrykk.
  `whitespace: "trim"` ignorerer mellomrom før og etter svaret, men bevarer
  interne mellomrom og store/små bokstaver. Valgfri `"collapse"` slår interne
  whitespace-sekvenser sammen til ett mellomrom; bruk bare dette for uttrykk
  der det er faglig riktig. Alternative skrivemåter kan listes eksplisitt.

`ExerciseRenderer` velger komponent ut fra `type`. Felles skjema og
pedagogisk tilbakemelding ligger i `QuestionFrame`, og flervalg og feilfinning
bruker de samme radiokontrollene. Et svar teller først ved innsending.
Nye forsøk oppdaterer resultatet for samme oppgave; de øker ikke antall
unike besvarte oppgaver. Ingen fasit eller inputverdier lagres i progresjonen.

## Progresjon

`LearningProgressProvider` lagrer under `eduplan.learning-progress.v1` i
localStorage. Hver leksjon identifiseres av full kurs-/modul-/leksjonssti.
Skjemaet er versjonert, og ukjente felt filtreres bort ved innlesing.

```js
{
  version: 1,
  lessons: {
    "/kurs/react/moduler/jsx-komponenter/leksjoner/funksjonskomponenter": {
      reviewed: true,
      answers: {
        "component-definition": { attempts: 2, correct: true }
      }
    }
  }
}
```

Antall besvarte og riktige oppgaver beregnes fra gjeldende oppgaver i
leksjonen. Mestring krever eksplisitt gjennomgang og riktig siste innsendte
svar på alle oppgaver. En tom oppgaveliste gir aldri mestring. Et senere feil
svar eller fjerning av gjennomgått-markeringen fjerner mestringsstatusen.
Å åpne en leksjon skriver ingen progresjon. Input og valgt alternativ er
midlertidige; etter sideoppdatering vises sist lagrede resultat og antall forsøk.
Ved lagringsfeil beholdes progresjonen i minnet og en melding vises.
