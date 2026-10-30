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
  learningObjectives: [], // { id, description, exerciseIds }
  content: [],           // forklaringsavsnitt som strenger
  codeExamples: [],      // { id, title, language, code }
  exercises: [],         // { id, title, type, instructions }
}
```

Leksjonen «Hva er en React-komponent?» ligger i `lessons/reactComponents.js`
og har sju undervisningsseksjoner, læringsmål og tre demonstrasjonsoppgaver.
Seksjonene ligger i `lessons/reactComponentSections.js`.
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


## Kursmål og personlige læringsmål

Kursmål ligger i leksjonens `learningObjectives` som objekter:

```js
{
  id: "function-component-jsx",
  description: "Gjenkjenne og arbeide med en enkel funksjonskomponent som returnerer JSX.",
  exerciseIds: ["component-return", "jsx-closing-tag"]
}
```

ID-en er stabil innenfor leksjonen. Oppgave-ID-ene viser til oppgaver i samme
leksjon; samme oppgave kan være knyttet til flere mål. En tom `exerciseIds`-liste
er tillatt, men kan ikke gi mestring. De andre leksjonene beholder tomme
mål-lister frem til innholdet utarbeides.

Status er ikke et felt som lagres i kursdata eller localStorage.
`src/progress/goals.js` beregner den fra eksisterende oppgaveforsøk:

- `not-started` / Ikke startet: ingen tilknyttede oppgaver er forsøkt.
- `in-progress` / Under arbeid: noen er forsøkt, men ikke alle er bestått.
- `mastered` / Mestret: alle tilknyttede oppgaver har riktig siste innsendte svar.

Mål uten oppgaver blir «Ikke startet», med beskjed om at mestring ikke kan
vurderes. Ukjente oppgave-ID-er kan heller ikke gi mestring. Dashboardets
samlede progresjon er antall mestrede mål delt på antall definerte kursmål,
inkludert mål som foreløpig mangler oppgaver. Det gjelder dagens definerte mål,
ikke planlagte fremtidige mål i alle leksjoner.

Dashboard og leksjonsvisning bruker samme beregning og den delte komponenten
`CourseGoalList`. Kursmål kan ikke krysses av manuelt og trenger ingen ny
lagringsnøkkel. De holdes adskilt fra TodoContext og personlige mål.

Kursmål krever ikke at studenten krysser av «gjennomgått». Den eksisterende
statusen for hele leksjonen krever fortsatt både gjennomgått og riktige svar
på alle leksjonens oppgaver. Dette er to ulike vurderinger.


## Seksjonsbasert undervisning

Leksjoner kan ha en valgfri `sections`-liste. Hver seksjon har stabil `id`,
`title`, `stage` og en ordnet liste `blocks`. Leksjoner uten seksjoner bruker
fortsatt eksisterende `content` og `codeExamples`; de andre leksjonenes data er
ikke endret. De to formatene rendres ikke samtidig.

```js
{
  id: "forste-komponent",
  title: "Din første React-komponent",
  stage: "Forklaring",
  blocks: [
    { type: "paragraph", text: "En kort forklaring." },
    {
      type: "code", title: "Kodeeksempel", language: "jsx", code: "...",
      notes: [{ term: "return", text: "Forklaring knyttet til koden." }]
    },
    { type: "preview", caption: "Resultatet", nodes: [{ tag: "h1", text: "Hei!" }] }
  ]
}
```

Støttede blokker er `paragraph`, `list` (`items`), `code` (med valgfrie `notes`),
`componentTree` (`caption`, `root` med `name`, `description`, `children`),
`preview` (`caption`, `nodes`), `exercises`, `goals` og `progress`.

`LessonSections` tilbyr fri navigasjon som flytter fokus til seksjonen, uten å
endre HashRouter-adressen eller registrere mestring. Alle seksjoner og oppgaver
rendres med en gang. `TeachingSection` og `TeachingBlock` viser innholdet.
`exercises` gjenbruker den eksisterende oppgavemotoren og leksjonens oppgavedata.
`goals` og `progress` bruker eksisterende beregning og Context.

Visuelle forhåndsvisninger er deklarative, statiske elementtrær. Hver node har
`tag`, valgfri `text` og valgfrie `children`. Bare godkjente elementtyper vises,
og kildeteksten evalueres aldri. En demonstrert `main` vises som en div for å
unngå et ekstra main-landemerke inne i appens hovedinnhold. Foreløpig støttes
h1, h2, p, span, article og main. Forhåndsvisningene skal vedlikeholdes sammen
med kodeeksemplene; tester kontrollerer innholdet i de første eksemplene.


## Leksjon 2: Fra main.jsx til App

`lessons/mainToApp.js` inneholder leksjonen med eksisterende ID `fra-main-til-app`.
Den registreres sammen med komponentleksjonen i `reactCourse.js`.
Fire nye kursmål kobles til fire egne oppgave-ID-er; det eksisterende
localStorage-formatet og tidligere leksjonsprogresjon endres ikke.

Oppgaver kan fordeles gjennom en leksjon med en valgfri `exerciseIds`-liste
på `exercises`-blokken:

```js
{ type: "exercises", exerciseIds: ["html-entry-role"] }
```

Uten listen vises alle leksjonens oppgaver som før. Med listen vises bare de
valgte oppgavene. Nummereringen følger alltid leksjonens globale oppgaveliste,
slik at oppgavene beholder nummer 1–4 selv om de vises i forskjellige seksjoner.
Hver oppgave skal plasseres én gang. Progresjon og mestring beregnes fortsatt
fra hele leksjonens oppgaveliste, ikke fra seksjonens utvalg.

Leksjonen bruker bare standardeksport for egne komponenter, og introduserer
ikke props, state eller hooks. `createRoot` importeres fra biblioteket med
bibliotekets ordinære importform. StrictMode nevnes kun kort.
