# EduPlan – Læringsplattform

En React-plattform med 14 moduler, 65 ferdig implementerte leksjoner,
interaktive kunnskapsoppgaver og praktisk programmeringsarbeid.
Laget med JavaScript/JSX, CSS, Context API og React Router.
Lys/mørk modus og den opprinnelige personlige læringsmål-appen er bevart.

## Kjør lokalt

```sh
npm install
npm run dev
```

Kontroller prosjektet med:

```sh
npm run build
npm run lint
npm test
```

## Kursinnhold

Kurset går fra JavaScript, JSX, props og lister til styling, state, skjemaer,
effekter/API, hooks, lagring, Context, routing, Query, testing, robusthet og
TypeScript. Sluttprosjektet bygger en liten læringsplattform i fire praktiske
trinn. JavaScript ligger først og alle eksisterende ID-er er beholdt.
Tailwind er valgfritt.

De tre første komplette JSX-leksjonenes undervisningsseksjoner er beholdt. Mål og utvalgte svaralternativer er presisert. De 62 øvrige
leksjonene ligger som data i `src/content/modules/`. Hver har forkunnskaper,
introduksjon, konkrete mål, forklaring, kodeutdrag, resultatforklaring,
3–4 fordelte kunnskapsoppgaver, en praktisk aktivitet og oppsummering.
Utvalgte eksempler har statiske visuelle resultater.

Se [innholdsmodellen](src/content/README.md) og
[kvalitetsrapporten](docs/react-course-quality-improvements.md) for opptelling og begrensninger.

## Arkitektur

- `src/content/`: kursregister, navigasjon og undervisningsdata.
- `src/components/lesson/`: gjenbrukbar seksjonsvisning, illustrasjoner og
  praktiske arbeidsoppgaver. Ingen studentkode kjøres.
- `src/components/exercises/`: eksisterende oppgavemotor og tilbakemelding.
- `src/progress/`: rene beregninger for progresjon og kursmål.
- `src/context/`: tema, personlige mål og lagret oppgaveprogresjon.
- `src/pages/`: dashboard, kurs, moduler, leksjoner og ikke-funnet-visning.
- `src/App.css` og `src/index.css`: responsivt design, tema og fokusmarkering.

HashRouter bruker følgende app-ruter:

- `/`: dashboard og personlige mål.
- `/kurs`: kursoversikt.
- `/kurs/:courseId`: kursdetaljer.
- `/kurs/:courseId/moduler`: moduloversikt.
- `/kurs/:courseId/moduler/:moduleId`: leksjonsoversikt.
- `/kurs/:courseId/moduler/:moduleId/leksjoner/:lessonId`: undervisning.

Forrige/neste følger kursdataenes rekkefølge, også mellom moduler.
Ukjente ruter og id-er håndteres av ikke-funnet-visningen.

## Hva progresjonen dokumenterer

Oppgaveprogresjon lagres lokalt under `eduplan.learning-progress.v1`.
Formatet og tidligere lagrede resultater er beholdt. Bare gjennomgått,
antall forsøk, siste riktighet og eventuell oppgaverevisjon lagres; ingen fasit eller svartekst.
Kursmål avledes fra tilknyttede oppgaver og er aldri manuelt avkryssbare.

Dashboardets automatiske prosent gjelder 201 obligatoriske kunnskapsmål. Valgfrie Tailwind-mål inngår ikke. Praktiske mål vises
separat og vurderes ikke automatisk. De nye leksjonene viser «Kunnskapsdel
mestret» slik at riktige teorisvar ikke fremstår som godkjent programmering.
Praktisk gjennomføring i studentens eget prosjekt registreres ikke i dagens
modell og må kontrolleres mot akseptansekriteriene.

Personlige læringsmål kan fortsatt opprettes, fullføres og slettes gjennom
TodoContext. Tema og personlige mål er midlertidig React-state og tilbakestilles
ved full sideoppdatering; oppgaveprogresjonen er den lagrede delen.

## Manuell kontroll

1. Åpne kurset og kontroller 14 moduler og 65 tilgjengelige leksjoner.
2. Prøv leksjonslenker, forrige/neste, brødsmuler og direkte hash-adresser.
3. Besvar oppgaver feil og riktig; kontroller nytt forsøk og skjult fasit i
   andre oppgaver. Reload skal bevare resultat, men ikke åpne alle løsninger.
4. Sammenlign kursmål på dashboard og leksjonsside.
5. Kontroller at praktiske mål ikke godkjennes av riktige kunnskapssvar.
6. Opprett, fullfør og slett et personlig mål.
7. Prøv smal skjerm, tastaturnavigasjon og begge temaer.
8. Kontroller siste prosjekttrinn og en ukjent adresse.

GitHub Pages-oppsett og deploy-scripts er beholdt. Denne kursutvidelsen
installerer ingen nye pakker og gjennomfører ingen publisering.

Kursmetadata genereres før build (`npm run content:manifest`). Dashboardet bruker manifestet; undervisningsinnhold lastes dynamisk per modul. Etter vesentlige oppgaveendringer må revisjonen oppdateres, slik at gamle svar bevares uten å gi ny mestring. Se innholdsmodellen for kontrakten.
