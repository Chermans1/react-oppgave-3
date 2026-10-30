> Oppdatert etter siste kontroll: se [siste feilretting](react-course-final-fixes.md) for lagringsbeskyttelse, fire oppgaver på revisjon 3 og nye testresultater. Rapporten under beskriver forrige forbedringsrunde.

# Kvalitetsforbedring av React-kurset

Arbeidsbranch: `develop`. Ingen commit, push, deploy eller pakkeinstallasjon.

## Rettede kritiske og viktige funn

| Funn | Gjennomført rettelse |
| --- | --- |
| Gyldig `{ 12 }` ble avvist | Oppgavespesifikk normalisering av klammeinnrammede heltall. `{1 2}`, strenger og vilkårlig kode avvises. JSON-oppgaven godtar irrelevant JSON-formatering gjennom dataparseren, uten å kjøre JavaScript eller endre innholdet i strenger. |
| Kunnskapssvar ga inntrykk av praktisk mestring | Alle 204 kunnskapsmål er vurdert mot oppgavene. Beskrivelser er avgrenset til gjenkjenning, prediksjon, valg av rettelse eller konkret forklaring. De 62 praktiske målene er separate og vises som «Ikke automatisk vurdert». |
| Gamle svar kunne telle for en ny vurdering | De 190 oppgavene utenfor de tre referanseleksjonene har revisjon 2 etter samlet redaksjonell gjennomgang. Gamle svar, antall forsøk og gjennomgått-status leses fortsatt, men gammel revisjon gir ikke ny mestring. Ny besvarelse øker antall forsøk og registrerer gjeldende revisjon. De 12 referanseoppgavene beholder tidligere vurderingsgrunnlag. |
| Fasitlekkasjer og svake alternativer | Alle 202 oppgaver er gjennomgått. Alternativene i nye flervalg/feilfinning er erstattet med faglige misoppfatninger. Direkte kopieringsoppgaver om map, provider, MemoryRouter, state-kø, callbacks, dispatch og query keys er omarbeidet. JSON-oppgaven tester serialisert format fremfor å hente metoden fra neste oppgave. Feilfinning har faktisk kode. |
| Overfladiske krevende emner | Egne arbeidsforløp gir sammenhengende filer, observasjoner og kontrollpunkter, uten å tvinge alle leksjoner inn i samme ekstra struktur. Se listen under. |
| Motstridende API-signaturer | `getLessons(courseId, { signal, request } = {})` bruker kurs-ID i URL. Query key og queryFn bruker samme ID og videresender signal. |
| Utrygg lagringsundervisning | Full validering av id, title, done og unike id-er. Manglende nøkkel tillater skriving; lesefeil sperrer automatisk skriving. Originaldata bevares til uttrykkelig nullstillingsvalg. Skrivefeil sletter ikke arbeidsdata. |
| Tomfelt-test beviste ikke fravær av oppretting | Komponenttesten kontrollerer at onCreate aldri kalles. Integrasjonseksemplet teller faktiske listitem-elementer. Gyldig innsending testes separat. |
| Manglende API-øvingsmiljø | Et komplett, injiserbart minne-API med GET, POST, paginering, HTTP-feil, tomt resultat, forsinkelse og AbortSignal. Ingen backend eller pakker kreves for dette oppsettet. |
| Uklare praktiske arbeidsforutsetninger | Alle 62 aktiviteter har startpunkt, obligatoriske kriterier, kontrollhandlinger og separat fordypning. De korte aktivitetene har konkrete testdata/scenarier i practicalGuides; de krevende har egne arbeidsforløp. |
| Tailwind hindret obligatorisk 100 % | Tre valgfrie kunnskapsmål og alle praktiske mål utelates. Prosenten gjelder 201 obligatoriske kunnskapsmål, ikke 201 forskjellige oppgaver eller praktisk programmering. 100 % vises først når alle obligatoriske mål er mestret. |
| Sluttprosjektet var for generelt | Fire trinn beholdt; lagt til dype lenker, modulovergang, ukjente id-er, lagringsfeil, vurderingsmatrise, konkrete regresjonstester og separate Query-/TypeScript-spor. |
| Få visualiseringer av dataflyt | Statiske før/etter-forløp for state, batching, cleanup, race, StrictMode, hooks, Context, API-tilstander og cache. Ingen studentkode kjøres. |
| Hele kurset i startpakken | Dashboard og navigasjon bruker et generert innholdsmanifest uten fasit og undervisning. Leksjonsinnhold lastes dynamisk per modul, med felles hjelpefiler, lastestatus og retry-visning. HashRouter og hosting er beholdt. |

## Vesentlig utvidede leksjoner

- **Opprette, redigere, fullføre og slette:** komplett editor og forelder; utkast, lagring, avbryt, validering og stabil id.
- **Separate Context-er og egne hooks:** komplett provider, to hooks, to consumers og forklaring av abonnement kontra vanlig foreldrerendering.
- **useLocalStorage og JSON-feil:** full datavalidering og sammenhengende useStoredTasks med sperret skriving og eksplisitt gjenoppretting.
- **Fetch og HTTP-status:** komplett kontrollert transport og API-lag, endepunkter, responsformer og testbare scenarier.
- **Laste-, feil- og tomtilstand:** forskjellige utfall og kontrollert nytt forsøk.
- **API-lag og Axios:** konsekvent kontrakt, signal og valgfritt klientbytte.
- **Query keys, enabled og staleTime:** komplett kursvelger, egen cachepost per kurs, første lasting, bakgrunnshenting og feil med tidligere data.
- **Mutasjoner og paginering:** konkrete skrive- og sidekontrakter mot øvings-API-et.
- **Tester av brukeradferd og komponent-/integrasjonstester:** komponentfixturer, reelle tomfelt-forventninger, MemoryRouter forklart før bruk og listekontroll.
- **Error Boundaries:** fungerende klasse, kontrollert renderingsfeil, avgrenset fallback og bevisst remontering etter rettet input.
- **Ytelse:** samme scenario før/etter, gjentatte målinger og kontroll av uendret funksjon, fremfor generelle memo-råd.
- **TypeScript:** sammenhengende props, callbacks, liste-state, formhendelser og validering fra unknown.
- **Sluttprosjektet:** alle fire trinn med minimumskrav, scenarioer og valgfri fordypning.

De øvrige leksjonene er gjennomgått, har mer presise vurderingsmål, bedre oppgaver og konkrete praktiske kontroller. De tre opprinnelige JSX-leksjonenes undervisningsseksjoner er beholdt; målformuleringer og enkelte feilalternativer er justert.

## Oppgavekontroll og mestring

[Oppgavelisten](react-course-review-ledger.md) viser alle 202 stabile oppgave-ID-er, typer, revisjoner og tilknyttede kunnskapsmål. Automatisk kontroll dekker blant annet gyldige/ugyldige svar, unike id-er, referanser, kjente fasitlekkasjer, faktisk feilfinningkode og skjult fasit før innsending. Det er fortsatt nødvendig å prøve kurset med nybegynnere for å måle den pedagogiske effekten og hvor godt hvert feilalternativ fungerer.

Lagringsnøkkelen er fortsatt `eduplan.learning-progress.v1`. Bare et valgfritt `revision`-felt er lagt til per forsøksresultat. Ingen fasit, svartekst eller separat målstatus lagres. Historikk betyr her eksisterende antall forsøk og siste resultat; modellen har aldri lagret en tidslinje over hvert tidligere svar. Oppdaterte revisjoner teller bare når de samsvarer med oppgavens nåværende vurderingsgrunnlag. Dette er en konservativ ny kontroll av hele det reviderte oppgavesettet, også der bare alternativene er forbedret.

Ett mål kan kreve flere oppgaver, og samme oppgave kan støtte flere mål. Derfor gjelder prosentberegningen mål, ikke antall unike spørsmål. Personlige mål ligger fortsatt bare i TodoContext og følger eksisterende øktmodell.

## Teknisk kontroll

- `npm run build`: bestått, uten størrelsesvarsel.
- `npm run lint`: bestått.
- `npm test`: **81 bestått, 0 feil, 0 hoppet over**.
- `git diff --check`: bestått.
- Alle 65 leksjoner kan lastes dynamisk; manifestet sammenlignes med faktisk innhold i testene.
- Reelle API-/lagringsfunksjoner testes mot suksess, feil, tomt svar, feil datamodell, kansellering, bevaring og reload.
- Fem sett med sammenhengende React-filer bygges i minnet med sine faktiske importer/eksporter: editor, Context, boundary, ytelse og TypeScript-komponenter.
- Eksisterende render-tester kontrollerer alle leksjoner og alle oppgavers tilbakemeldinger.
- Nettleser: ugyldig `{1 2}`, gyldig `{ 12 }`, nytt forsøk, målstatus og reload med skjult fasit; dashboardstatus og 201-målsberegning; opprett/fullfør/slett personlig testmål; dynamisk leksjonsnavigasjon; 375 px i begge temaer uten horisontal sidescroll.
- Produksjons-preview: dynamisk lastet API-leksjon; de komplette kodefilene beholder lesbare navn og kontrakter også etter minifisering.

## Pakkestørrelse

Før: startpakken var **553,69 kB**, omtrent **179,99 kB gzip**.
Etter: startpakken er omtrent **364,12 kB**, **106,09 kB gzip** — rundt **34 % mindre JavaScript ved oppstart** og **41 % mindre gzip**. Varselgrensen er ikke endret. Samlet nedlasting av hele det nå utvidede kurset er større enn startpakken; innhold lastes når moduler åpnes. Dette er kodeoppdeling, ikke en påstand om at hele kurset er blitt mindre.

## Gjenværende avgrensninger

- Praktisk arbeid utføres i studentens prosjekt og vurderes mot kriteriene; det kjører eller godkjennes ikke i EduPlan.
- Illustrasjonene er statiske, eksplisitte forløp. De er ikke interaktive kodekjøringer.
- Minne-API-et er et undervisningsoppsett og nullstilles ved reload. Det er ikke en database.
- Bygging av TSX-eksemplene kontrollerer importkoblinger og transformasjon, ikke full TypeScript-typekontroll. Ingen TypeScript-kompilator eller Query/MSW-testmiljø er installert i EduPlan. Bibliotekøvingene må også kjøres i studentens avtalte øvingsprosjekt.
- Alle 65 leksjoner er kontrollert automatisk, men hver enkelt praktisk arbeidsoppgave er ikke gjennomført ende til ende som et separat studentprosjekt. En studentgjennomgang og manuell kodevurdering er fortsatt nødvendig.
- Browserens nettverksfeil for en faktisk manglende produksjonschunk er ikke fremprovosert manuelt; retry-visningen er implementert.

Ingen dokumenterte kritiske eller viktige funn er lagt til side uten behandling. Avgrensningene over er uttrykkelig skilt fra automatisk vurdering.

## Filer berørt av denne kvalitetsforbedringen

- `package.json`: deterministisk generering før build; ingen nye avhengigheter.
- `scripts/generate-course-manifest.mjs`, `scripts/generate-example-sources.mjs`.
- `src/content/courses.js`, `courseMetadata.js`, `courseManifest.js`, `loadLesson.js`, `validateCourse.js`.
- `src/content/lessonBuilder.js`, `lessonIllustrations.js`, `practicalGuides.js`.
- `src/content/modules/`: alle 13 fagfiler; eksisterende index-register beholdt.
- `src/content/lessons/reactComponents.js`, `mainToApp.js`, `jsxRules.js`: presiserte mål og utvalgte alternativer.
- `src/content/workshops/`: `extendLesson.js`, `forms.js`, `context.js`, `hooks.js`, `api.js`, `testing.js`, `robustness.js`, `project.js`.
- `src/content/examples/`: `practiceApi.js`, `taskStorage.js`, `exampleSources.js`.
- `src/components/CourseGoals.jsx`, `CourseGoalList.jsx`, `LessonGoals.jsx`, `lesson/PracticalActivity.jsx`, `lesson/VisualExample.jsx`.
- `src/components/exercises/answers.js`, `QuestionFrame.jsx`, `ExerciseRenderer.jsx`.
- `src/context/LearningProgressProvider.jsx`, `src/progress/progress.js`, `src/progress/goals.js`, `src/pages/Lesson.jsx`.
- `tests/course-quality.test.js`, `course-completeness.test.js`, `exercise-feedback.test.js`.
- `README.md`, `src/content/README.md`, denne rapporten og oppgavelisten. Den tidligere sluttrapporten er merket historisk.

Den eksisterende, ukommitterte kursimplementeringen er bevart. Filoversikten over gjelder kvalitetsarbeidet; arbeidsmappen har også endringer fra den opprinnelige kursutvidelsen.
