# Siste feilretting før studentgjennomgang

Arbeidsbranch: `develop`. Omfanget er de konkrete funnene fra siste kontroll.
Ingen commit, push, deploy eller installasjon av pakker.

## Rettelser og verifisering

1. **EduPlans progresjonslagring:** ny, testbar lagringsgrense skiller manglende nøkkel fra ugyldig JSON, feil format og avvist lagringstilgang. Lesefeil bevarer originaldata og sperrer skriving. Skrivefeil sperrer senere automatiske forsøk. Nye svar og gjennomgått-markeringer beholdes i minnet. Gjenoppretting skjer bare fra en uttrykkelig handling. Ny lesing erstatter øktens progresjon med gyldig lagring; mislykket lesing beholder øktens arbeid. Erstatning skriver øktens progresjon etter at studenten har bekreftet konsekvensen. Andre lagringsnøkler berøres ikke. Nøkkel og gyldig v1-format er beholdt, inkludert eldre svar uten revisjonsfelt.
2. **Lagringshooken i undervisningen:** readTasks og writeTasks kan motta en getter. Selve window.localStorage-tilgangen skjer inne i try/catch. Hooken bruker denne kontrakten, sperrer skriving ved feil og åpner ikke lagring igjen før et bevisst erstatningsvalg. Testen rendrer hele undervisningshooken med en localStorage-getter som kaster SecurityError.
3. **Query-eksemplet:** den komplette App-filen bruker en separat, faktisk testet LessonQueryResult. Manglende valg, undefined-data, pending, paused, error, tom liste, data og oppfrisking håndteres før data.length leses. Feil gjøres ikke om til tomt resultat. Tidligere data beholdes ved feil eller pauset oppfrisking. Retry-knappen kaller faktisk refetch. networkMode: always brukes uttrykkelig for minne-API-et; standardmodusen online forklares for ekte HTTP-API-er. Samme courseId brukes i query key og API-kall.
4. **TypeScript:** kommandoen er `npx tsc -p tsconfig.app.json --noEmit`, også i hint og sluttprosjektets fordypningsspor. Undervisningen forklarer rotkonfigurasjonens prosjektreferanser, appkonfigurasjonen og malens `tsc -b`-baserte byggscript.
5. **Oppgaver:** de tre children-oppgavene tester DOM-resultat, forskjellen mellom JSX-innhold og tekstprop, og bevaring av et faktisk lenkeelement. Query-provider-oppgaven tester providerens rekkevidde i komponenttreet. De tidligere kodeutfyllingene av ordene children og client er fjernet. Eksempler og svaralternativer er ulike, og oppgavetitlene oppgir ikke løsningen.
6. **Sluttprosjekt:** ett minimum brukes i introduksjon, arbeidsoppgave, kriterier og kontrollpunkter: to kurs; React har to moduler med to leksjoner hver, det andre kurset én modul med én leksjon.

## Oppgave-ID-er og revisjoner

Disse fire eksisterende ID-ene er bevart og økt fra revisjon 2 til 3:

- `children-slot-check`
- `children-responsibility-check`
- `children-render-check`
- `klient-server-provider-check`

De tilknyttede kunnskapsmålene er presisert. Tidligere forsøk beholdes, men gir ikke mestring av den nye vurderingen. De øvrige oppgavenes revisjoner er uendret. Kurset har fortsatt 14 moduler, 65 leksjoner, 266 mål, 202 interaktive oppgaver og 62 praktiske aktiviteter.

## Kontroller

- Build og lint bestått.
- Hele testpakken: **98 bestått, 0 feil**.
- Nye tester bruker de faktiske lagringsfunksjonene, provideren og Query-visningen. De kontrollerer rådatabevaring, sperring etter skrivefeil, normal lagring, uttrykkelig gjenoppretting, eldre revisjoner, SecurityError fra egenskapstilgang, alle aktuelle datatilstander og refetch-handlingen.
- Tester kontrollerer de fire oppgavenes revisjonsgrenser, gyldig/ugyldig vurdering, kjente lekkasjer, TypeScript-instruksjonen og prosjektets minimumskrav.
- Nettleser: en isolert testside brukte den virkelige provideren, oppgavemotoren og feilvisningen med en minneadapter. Studentens virkelige lagringsdata ble ikke endret. Nye svar bevarte ugyldige rådata med null skriveforsøk. Mislykket ny lesing bevarte arbeidet. Bekreftet erstatning lagret arbeidet. Ny lesing gjenopprettet eldre gyldig progresjon. Skrivefeil stanset videre automatiske forsøk, også ved gjennomgått-markering.
- Produksjonsbygget ble lastet på nytt i nettleseren: alle tre nye children-oppgaver og den nye provider-oppgaven vises, fasit er skjult før innsending, og forrige/neste mellom children og listeleksjonen fungerer.

## Filer

- `src/progress/storage.js`, `src/context/LearningProgressProvider.jsx`.
- `src/components/ProgressStorageNotice.jsx`, `CourseGoals.jsx`, `LessonProgress.jsx`.
- `src/content/examples/taskStorage.js`, `LessonQueryResult.jsx`, generert `exampleSources.js`.
- `src/content/workshops/hooks.js`, `api.js`, `robustness.js`, `project.js`.
- `src/content/modules/hooks.js`, `components.js`, `serverdata.js`, `robustness.js`, `project.js`.
- `src/content/lessonBuilder.js`, generert `courseManifest.js`.
- `scripts/generate-example-sources.mjs`.
- `tests/final-fixes.test.js`, `tests/course-quality.test.js`.
- Innholdsmodell, oppgaveoversikt og kvalitetsrapporter er oppdatert.

## Avgrensninger

Ingen av de dokumenterte punktene står igjen ubehandlet. Query-visningen er testet med de faktiske resultattilstandene, men et nytt separat TanStack Query-prosjekt er ikke installert eller kjørt. TypeScript-instruksjonen er rettet for den anbefalte Vite-malen; en TypeScript-kompilator er ikke installert i EduPlan. Praktisk studentarbeid vurderes fortsatt manuelt. Lokal lagring løser fortsatt ikke samtidige redigeringer fra flere faner eller synkronisering mellom enheter.
