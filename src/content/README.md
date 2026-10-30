# Kursdata og vurdering

React-kurset har 14 moduler og 65 tilgjengelige leksjoner. Ingen leksjoner står
som `planned`. Modul- og leksjons-ID-er, rekkefølge og URL-er er beholdt.
JavaScript-grunnlaget kommer først; Tailwind er et valgfritt sidespor.

## Innholdsorganisering

- `courses.js`: kursregister via `courseManifest.js`, oppslag, URL-er og forrige/neste leksjon.
- `loadLesson.js`: dynamisk modulinnlasting, bare for kjent kurs/modul/leksjon.
- `courseMetadata.js` og `validateCourse.js`: manifestprojeksjon og byggvalidering.
- `reactCourse.js`: modulrekkefølge, leksjonstitler og registrering. Manglende
  implementasjon gir en eksplisitt feil fremfor en taus plassholder.
- `lessons/`: de tre referanseleksjonene med bevarte undervisningsseksjoner.
- `modules/`: 13 innholdsfiler med de 62 øvrige leksjonene og et register.
  `components.js` inneholder både fragmentleksjonen og propsmodulen.
- `lessonBuilder.js`: små forfatterhjelpere for samme eksisterende datamodell.
  De setter sammen manuelt skrevne temaer, oppgaver og arbeidsoppgaver.
- `lessonSummaries.js`: korte, faglige oppsummeringer per ny leksjon.
- `lessonIllustrations.js`: statiske, deklarative illustrasjoner av utvalgte
  kodeeksempler. Ingen eksempelkode eller studentkode kjøres.

En ny leksjon beskrives med id, introduksjon, forkunnskaper, temaer,
praktisk aktivitet og kilder. Hvert tema har en forklaring, kode, forklaring
av resultatet og et eget spørsmål. Antall temaer kan variere; de nye
leksjonene har tre eller fire. En tema-id brukes i avledede stabile ID-er:
`<lessonId>-<topicId>-check` og `<lessonId>-<topicId>-goal`.
Endre ikke disse id-ene etter at innhold er tatt i bruk. Rekkefølgeendring
skal aldri kreve nye id-er.

Kodeblokker merkes som avgrensede utdrag. Filnavn i kommentarer kan angi flere
filer. JSX-utdrag forutsetter relevante importer og data. Feil kode står i
feilsøkingsoppgavene med en tydelig instruksjon om å finne feilen.
`examples/practiceApi.js` gir et kontrollert minne-API med GET, POST, sider og feilscenarioer. Det kopieres til øvingsprosjektet fra fetch-leksjonen; ingen backend kreves. `examples/taskStorage.js` er den testede lagringskontrakten.
`workshops/` utvider utvalgte leksjoner med sammenhengende filer og kontrollpunkter. `practicalGuides.js` gir konkrete startdata og kontroller til de korte aktivitetene.
EduPlan får ingen backend. Biblioteker som Query 5, Axios, MSW 2, Vitest,
Tailwind 4 og TypeScript beskrives for studentens separate øvingsprosjekt.
De er ikke installert som del av kursimplementeringen.

## Undervisningsblokker

Seksjoner har `id`, `title`, `stage` og `blocks`. Eksisterende blokker er
`paragraph`, `list`, `code` (med `notes`), `componentTree`, `preview`,
`exercises`, `goals` og `progress`. To tillegg brukes av de nye leksjonene:

- `practical`: `activityId` peker til en aktivitet i `practicalActivities`.
- `resources`: `links` er `{ title, url }` for offisiell videre lesing.

`LessonSections` tillater direkte navigasjon til alle seksjoner og oppgaver.
En exercises-blokk bruker `exerciseIds`; hver oppgave plasseres én gang og
beholder globalt oppgavenummer innen leksjonen.

`preview` bruker et statisk tillatt elementtre, ikke HTML-strenger eller
dynamisk kjøring. Inputillustrasjoner er skrivebeskyttet. `id` og `htmlFor`
får et unikt prefiks per forhåndsvisning. Main vises som div for å unngå
et ekstra hovedlandemerke inne i appens main.

## Oppgaver

Hver oppgave har stabil `id`, `type`, `title`, `prompt`, `explanation` og
eventuelt `code`.

- Flervalg og feilfinning: `options: [{ id, text }]` og `correctAnswer` som
  peker til ett alternativ.
- Kodeutfylling: `validAnswers` og en definert whitespace-regel.
  `trim` bevarer interne mellomrom; `collapse` brukes bare der det er riktig.
  `jsx-integer` godtar bare irrelevant whitespace rundt et heltall i {}.
  `json` normaliserer gyldige JSON-data, uten å endre tekst inne i strenger eller kjøre JavaScript.

Forfatterhjelperne roterer alternativrekkefølgen deterministisk. Løsning og
forklaring vises bare etter innsending av den aktuelle oppgaven. Et nytt
forsøk øker forsøksantall og erstatter siste resultat. Oppgavemotoren er
uendret. Studentkode kjøres aldri med eval eller tilsvarende.

## Progresjon og praktisk vurdering

Lagringsformat og nøkkel er uendret: `eduplan.learning-progress.v1`.

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

Ingen fasit, svartekst, målstatus eller praktisk godkjenning lagres.
Et automatisk mål har en ikke-tom `exerciseIds`-liste. Status beregnes av
`progress/goals.js`: ingen forsøk = ikke startet; noen forsøk uten alle
bestått = under arbeid; alle bestått = mestret. Siste resultat gjelder.
Et mål uten oppgaver blir aldri automatisk mestret.

Praktiske mål har `assessment: "practical"` og tom `exerciseIds`.
Arbeidsoppgaven har oppgavebeskrivelse, forkunnskaper, eventuelt startkode,
krav/akseptansekriterier og tips. Studenten utfører og kontrollerer den i
eget prosjekt. Praktisk status vises som «Ikke automatisk vurdert»; den interne statusberegningen er ikke en praktisk gjennomføringsregistrering. Det finnes ingen registrering eller verifisering av praktisk
utførelse. Det er en uttrykkelig modellbegrensning, ikke en skjult automatisk
bestått-markering.

Dashboard viser alle mål, men prosentberegningen gjelder bare automatisk
vurderbare, obligatoriske kunnskapsmål. Valgfrie mål har lesson.optional=true og utelates sammen med praktiske mål. 100 prosent vises først når alle obligatoriske mål er mestret. Praktiske mål telles og forklares separat.
For nye leksjoner heter den automatiske leksjonsindikatoren «Kunnskapsdel
mestret». Den bruker samme gamle regel: gjennomgått og alle oppgaver riktig.
De tre opprinnelige leksjonenes undervisning og indikator er beholdt; måltekstene er presisert til det oppgavene faktisk dokumenterer.
Personlige mål bruker fortsatt TodoContext og er helt adskilt fra kursmål.

## Kvalitetskontroll

Kjør `npm test`. Testene kontrollerer hver modul, globale ID-er, gyldige
fasiter, plassering av oppgaver, målkoblinger, navigasjonsmål, reload og
praktiske vurderingsgrenser. Alle leksjoner rendres i en komponenttest;
fasit skal være skjult før innsending. Nye JS/JSX/TSX-undervisningsutdrag
parses med Vites eksisterende Oxc-transformer uten å kjøre koden.
Kontekstuelle return-, case- og JSX-utdrag får bare en parserinnramming i
selve testen. CSS, HTML, shell og bevisst feil oppgavekode er ikke omfattet
av JavaScript-parseren. Dette er syntakskontroll, ikke full typekontroll
eller en bekreftelse på at alle API-er og biblioteker er satt opp hos studenten.

## Revisjoner og dynamisk innhold

Kjør `npm run content:manifest` etter innholdsendringer. `prebuild` gjør dette automatisk. Manifestet inneholder titler, id-er, mål og oppgaverevisjoner, men ingen fasit eller undervisningsblokker. Tester oppdager avvik. Ikke rediger genererte filer for hånd. Eksempelkilde lagres som bokstavelig tekst, slik at minifisering ikke endrer koden studenten leser.

En oppgave uten revision regnes som revisjon 1. Av de 190 reviderte oppgavene bruker 186 revision: 2. De fire oppgavene children-slot-check, children-responsibility-check, children-render-check og klient-server-provider-check bruker revision: 3 etter endret vurderingsgrunnlag. Lagret `answers[id]` kan nå ha `{ attempts, correct, revision: 2 }`; nøkkelen og v1-formatet er beholdt. Eldre resultat vises som historikk, men teller først igjen etter et svar på gjeldende revisjon. Øk revision ved vesentlige endringer i ferdighet, fasit eller vurderingsgrunnlag. Bruk eksisterende id når ferdigheten fortsatt er den samme.

De 62 praktiske aktivitetene har `startpoint`, `criteria`, `checks` og `extensions`. Minimum og fordypning skal fremgå hver for seg. De får aldri oppgavekoblinger som automatisk godkjenner programmeringen.

Se [kvalitetsrapporten](../../docs/react-course-quality-improvements.md) og [oppgaveoversikten](../../docs/react-course-review-ledger.md).

## Beskyttelse ved lagringsfeil

`progress/storage.js` skiller manglende nøkkel fra mislykket lesing av rådata og feil datamodell. Provideren sperrer videre automatisk skriving ved både lese- og skrivefeil. Nye svar beholdes i minnet. `storageBlocked` og feilmeldinger er bare øktstilstand; de lagres ikke som en ny progresjonsmodell.

`ProgressStorageNotice` tilbyr uttrykkelig ny lesing (som erstatter øktens arbeid med gyldige lagrede data), eller erstatning av lagringen med øktens progresjon etter bekreftelse. Mislykket ny lesing beholder minnet. Bare eksisterende progresjonsnøkkel skrives. Gyldig v1 og tidligere oppgaverevisjoner støttes fortsatt.

Lagringseksemplet mottar en funksjon som henter `window.localStorage` inne i try/catch. Query-workshopen viser den faktiske testede `examples/LessonQueryResult.jsx` som bokstavelig kildekode; den håndterer undefined-data, pause, lasting, feil, tomt svar og data.
