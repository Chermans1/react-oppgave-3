> Historisk rapport fra før kvalitetsrevisjonen. Gjeldende oppførsel, kontroller og pakkestørrelse er beskrevet i [kvalitetsrapporten](react-course-quality-improvements.md).

# Sluttrapport: React-kurset i EduPlan

Dato: 30. oktober 2026. Arbeidsbranch: `develop`.

Alle 62 tidligere planlagte leksjoner er implementert. De tre eksisterende
referanseleksjonene er bevart uendret. Kurset har 14 moduler og 65 tilgjengelige
leksjoner. Ingen leksjoner står igjen som `planned`; det foreligger ingen
konkret implementeringshindring.

## Opptelling

| Leveranse | Antall |
| --- | ---: |
| Ferdige moduler | 14 |
| Ferdige leksjoner | 65 |
| Læringsmål totalt | 266 |
| Automatisk vurderbare kunnskapsmål | 204 |
| Praktiske mål uten automatisk godkjenning | 62 |
| Interaktive oppgaver totalt | 202 |
| Praktiske programmeringsoppgaver | 62 |
| Beståtte automatiserte tester | 59 |
| Planlagte leksjoner som gjenstår | 0 |

De 202 interaktive oppgavene inkluderer de 12 eksisterende oppgavene i
referanseleksjonene. De praktiske arbeidsoppgavene er egne aktiviteter og
inngår ikke i denne oppgavetellingen eller automatisk godkjenning.

| Modul | Leksjoner | Mål | Interaktive | Praktiske |
| --- | ---: | ---: | ---: | ---: |
| JavaScript-grunnlaget for React | 4 | 16 | 12 | 4 |
| JSX og komponenter | 4 | 18 | 15 | 1 |
| Props, komposisjon og lister | 4 | 16 | 12 | 4 |
| Styling og tilgjengelige komponenter | 5 | 20 | 15 | 5 |
| State og hendelser | 5 | 20 | 15 | 5 |
| Skjemaer og samarbeid mellom komponenter | 4 | 16 | 12 | 4 |
| Effekter og API-henting | 6 | 25 | 19 | 6 |
| Egne hooks og lokal lagring | 4 | 16 | 12 | 4 |
| Context og organisering av state | 5 | 20 | 15 | 5 |
| Routing og URL som state | 4 | 16 | 12 | 4 |
| Serverdata med TanStack Query | 5 | 21 | 16 | 5 |
| Testing og feilsøking | 5 | 21 | 16 | 5 |
| Robusthet, ytelse og TypeScript | 6 | 25 | 19 | 6 |
| Avsluttende prosjekt | 4 | 16 | 12 | 4 |

## Undervisning og progresjon

Nye leksjoner har introduksjon, forkunnskaper, konkrete læringsmål,
temaseksjoner med korte forklaringer, kodeutdrag, resultatforklaringer og
fordelte aktiviteter. Det er tre eller fire kunnskapsoppgaver per ny leksjon.
Utvalgte eksempler har statiske, deklarative visuelle resultater. Hver ny
leksjon har også en praktisk arbeidsoppgave med krav og akseptansekriterier,
tips og eventuelt startkode, samt en egen faglig oppsummering og videre lesing.
Første JavaScript-leksjon har en egen seksjon for studentens øvingsmiljø.

JavaScript forblir først. Deretter kommer komponenter før props, state før
skjemaer, effekter før egne hooks og lagring, og Context før routing og
serverdata. Testing og robusthet bygger videre på disse konkrete flytene.
Tailwind er et valgfritt sidespor, og TypeScript innføres etter JavaScript.
Stabile modul-, leksjons- og eksisterende oppgave-/mål-ID-er er bevart.

Sluttprosjektet har fire gjennomførbare trinn:

1. Kursdata, oppslag og navigasjon fra katalog til leksjon.
2. Tydelig state-eierskap, personlige mål og trygg lokal lagring.
3. Datadrevne oppgaver, tilbakemelding og avledede kursmål.
4. Automatiserte og manuelle kontroller samt en dokumentert leveranse.

Progresjonen bruker samme lagringsnøkkel og format som før. Målstatus er ikke
en ny lagret sannhet. Dashboard og leksjon bruker de eksisterende felles
beregningene. Personlige mål er fortsatt adskilt i TodoContext.

Dashboardets prosent gjelder nå bare automatisk vurderbare kunnskapsmål.
Antall praktiske mål forklares separat, og alle mål vises med lenke til
leksjonen. Nye leksjoner bruker merkelappen «Kunnskapsdel mestret» for å
unngå at teorisvar presenteres som godkjent programmering.

## Testresultater og nettleserkontroll

- `npm run build`: bestått, 88 moduler transformert.
- `npm run lint`: bestått.
- `npm test`: 59 bestått, 0 feil, 0 hoppet over.
- `git diff --check`: bestått.
- Kontrollerte uendrede filer: alle tre referanseleksjoners innhold,
  `src/progress/`, `src/context/`, `package-lock.json` og `vite.config.js`.

Testene kontrollerer alle 14 modulers innhold, globale id-er, gyldige fasiter,
målkoblinger, oppgaveplassering, praktiske aktiviteter og navigasjonsmål.
Alle 65 leksjoner rendres i komponenttester uten planlagt-plassholdere.
Samtlige oppgavers forklaringer testes skjult før innsending og synlig ved
begge vurderingsutfall. Alle nye JS/JSX/TSX-undervisningsutdrag parses uten
å kjøres; kontekstuelle utdrag rammes inn i testen. Tester verifiserer også
reload, gjeldende siste resultat, mål uten oppgaver og at praktiske mål aldri
blir automatisk mestret.

Nettleserkontrollen omfattet:

- Kursoversikt med 14 moduler og 65 leksjoner samt korrekt tilgjengelig-status.
- Første JavaScript-leksjon: feil og riktige svar i alle tre oppgavetyper,
  nytt forsøk og kodeutfylling med omkringliggende mellomrom.
- Reload: tre riktige resultater og gjennomgått-markering ble bevart,
  mens fasit igjen var skjult. Eksisterende JSX-resultater var fortsatt lagret.
- Dashboard og leksjon viste samme kunnskapsstatus. Det praktiske målet
  forble uten automatisk godkjenning.
- Navigasjon via kurs/modul, forrige leksjon og overgang fra prosjektmodulen
  til TypeScript-modulen.
- Sluttprosjektets fjerde trinn og siste-leksjon-markering.
- Mobil ved 390 × 844 i begge temaer, lesbare praktiske krav og separat
  horisontal scroll på lange kodeblokker. Ingen horisontal sidescroll.
- Nytt props-eksempel med samsvar mellom kode og statisk resultat på desktop.
- Ingen feil eller advarsler i nettleserkonsollen under kontrollen.

En lang, linjebrutt modultittel hadde et lite treffområde ved museklikk på
mobil. Tittellenken er nå et blokkelement; ny kontroll bekreftet at den åpnes
ved klikk. Tastaturaktivering ble også kontrollert.

## Begrensninger og anbefalt faglig gjennomgang

1. **Praktisk gjennomføring registreres ikke.** Praktiske mål har ingen
   automatisk oppgavereferanse og blir ikke mestret av teorisvar. Dagens
   modell kan ikke avgjøre om studenten faktisk har bygget prosjektet.
   Statusen «Ikke startet» for et praktisk mål dokumenterer derfor ikke
   studentens reelle ferdighet. Vurder arbeidet mot akseptansekriteriene,
   gjennom kodegjennomgang og demonstrasjon. Det er ikke bygget et nytt
   progresjons- eller kjøringssystem for å simulere dette.
2. **Eksempler er undervisningsutdrag.** Syntakskontroll er ikke full
   integrasjons- eller typekontroll. Bibliotekeksempler og API-kall er ikke
   kjørt som selvstendige eksterne øvingsprosjekter. Query 5, MSW 2,
   Tailwind 4 og TypeScript-oppsett krever riktige verktøy i studentens
   eget prosjekt. Ingen av disse pakkene ble installert i EduPlan.
3. **API-adresser er eksempler.** `/api` krever et lokalt API eller en
   kontrollert mock. Eksemplene beskriver datakontraktene og lærer håndtering
   av feil, avbryting og ukjent data, men leverer ingen backend eller innlogging.
4. **Visuelle resultater er statiske illustrasjoner.** De kjører ikke
   kildekoden og er ikke en kodeeditor. Endret kodeeksempel krever tilsvarende
   oppdatering av illustrasjonsdata. Interaktive svar vurderes av den
   eksisterende oppgavemotoren.
5. **Byggstørrelse.** Vite varsler om én JavaScript-pakke over 500 kB:
   553,69 kB minimert / 179,99 kB gzip. Bygget passerer. Innholdet lastes
   samlet med dagens synkrone kursmodell; oppdeling kan vurderes dersom
   faktisk lastetid blir et problem. Varselgrensen og hostingoppsettet er
   ikke endret for å skjule dette.
6. **Pedagogisk kontroll.** Faglig og teknisk gjennomgang er gjort under
   implementeringen, men dette erstatter ikke et helt kurs gjennomført av
   nye studenter. Gjennomgå særlig effektavhengigheter/race conditions,
   Query-nøkler og bakgrunnshenting, testmiljøoppsett, Error Boundaries og
   skillet mellom TypeScript-typer og runtime-validering i en egen elevrunde.
   De praktiske oppgavene bør vurderes manuelt for overføring til egen kode.

Videre lesing er lenket i leksjonene. Versjonsavhengige mønstre er kontrollert
mot blant annet [React](https://react.dev/learn/synchronizing-with-effects),
[React Router](https://reactrouter.com/api/declarative-routers/HashRouter),
[TanStack Query 5](https://tanstack.com/query/latest/docs/framework/react/quick-start),
[MSW](https://mswjs.io/guides/integrations/node),
[Tailwind](https://tailwindcss.com/docs/installation/using-vite),
[Testing Library](https://testing-library.com/docs/react-testing-library/example-intro/),
[TypeScript](https://www.typescriptlang.org/docs/handbook/2/narrowing.html) og
[Vite](https://vite.dev/guide/).

## Endrede og nye filer

- `README.md`
- `docs/react-course-completion.md`
- `package.json`
- `src/App.css`
- `src/components/CourseCard.jsx`
- `src/components/CourseGoalList.jsx`
- `src/components/CourseGoals.jsx`
- `src/components/LessonProgress.jsx`
- `src/components/LessonView.jsx`
- `src/components/lesson/PracticalActivity.jsx`
- `src/components/lesson/TeachingBlock.jsx`
- `src/components/lesson/VisualExample.jsx`
- `src/content/README.md`
- `src/content/lessonBuilder.js`
- `src/content/lessonIllustrations.js`
- `src/content/lessonSummaries.js`
- `src/content/modules/components.js`
- `src/content/modules/context.js`
- `src/content/modules/effects.js`
- `src/content/modules/forms.js`
- `src/content/modules/hooks.js`
- `src/content/modules/index.js`
- `src/content/modules/javascript.js`
- `src/content/modules/project.js`
- `src/content/modules/robustness.js`
- `src/content/modules/routing.js`
- `src/content/modules/serverdata.js`
- `src/content/modules/state.js`
- `src/content/modules/styling.js`
- `src/content/modules/testing.js`
- `src/content/reactCourse.js`
- `src/pages/CourseDetails.jsx`
- `tests/course-completeness.test.js`
- `tests/exercise-feedback.test.js`

Arbeidet er utført på `develop`. Ingen commit, push eller deploy er utført.
`main`, deploy-scripts, avhengigheter og GitHub Pages-oppsett er ikke endret.
