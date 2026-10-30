# Rettelser etter studentgjennomgangen

Arbeid utført på `develop`. Utgangspunkt: `docs/eduplan-student-simulation.md` og `e2e/README.md`. Ingen commit, push eller deploy er utført.

## De fem innholdsfeilene

| Leksjon | Rettelse | Kontroll |
|---|---|---|
| 11 – Children som innholdsplass | Forklaringen identifiserer varianten som inkluderer `{children}` direkte, i stedet for å vise til «første variant». Den forklarer også hvorfor et nytt avsnitt og `String(children)` ikke bevarer lenken. | Alle tre svaralternativene vurderes i testpakken. Full nettleserflyt tester feil, fasit og riktig svar. |
| 24 – Validering og feilmeldinger | Det tidligere løse utdraget er erstattet av en komplett `TitleForm`. `showError` er en beregnet boolsk verdi fra innsendingsstatus og trimmet feltverdi. Blank innsending stoppes. Feltet får koblet feilmelding og `aria-invalid`; gyldig innsending viser lagret tittel. | Den faktiske undervisningskoden kompileres og kjøres isolert i Chromium: blank innsending, kobling til feiltekst, gyldig trimmet verdi og fjerning av feiltekst. |
| 35 – Lagring med localStorage | `useStoredTasks(getStorage = browserStorage)` kan nå motta en stabil funksjon som henter adapteren. Samme argument brukes ved lesing, effektskriving og eksplisitt erstatning. Standardkallet fungerer fortsatt. Et komplett `App.jsx` viser en adapter med kastende `setItem`, og kontrollpunkt 3 angir nøyaktig hvordan den brukes. Adapteren velges ved montering. | Den viste hooken og adapter-App kjøres sammen med de faktiske lagringshjelperne i Chromium. To nye mål forblir synlige i minnet, og lagringsfeil vises. Eksisterende tester kontrollerer ugyldige data, SecurityError og eksplisitt gjenoppretting. |
| 37 – Props kontra Context | Oppgave 3 bruker nå allerede undervist `useState`, props og kontrollert input. Studenten velger riktig eier for et lokalt utkast. Ingen `Provider` eller `useContext` må forstås for å løse oppgaven. Hint og forklaring er tilpasset. | Stabil ID `props-context-scope-check` er beholdt, revisjon økt fra 2 til 3. Regresjonstesten verifiserer at gammelt svar ikke gir mestring av den nye revisjonen, at nytt riktig svar gjør det, og at alle alternativer vurderes korrekt. |
| 51 – Tester av brukeratferd | `GoalForm` lagrer valideringsmeldingen fra siste innsending. Den fjernes ved gyldig innsending, uten at tømming av feltet endrer den. Når studenten midlertidig fjerner valideringsreturen, vises feilmeldingen fortsatt mens `onCreate` feilaktig kalles. Forklaringen beskriver denne kontrakten. | Chromium kjører både originalkomponenten og varianten uten tidlig retur. Originalen avviser blank tekst og sender trimmet gyldig tekst. Varianten viser fortsatt alert, men callbacken mottar tom tekst: kontrollpunktet kan nå demonstreres som beskrevet. |

Alle leksjons-, mål- og oppgave-ID-er er beholdt. Bare den vesentlig endrede oppgaven i leksjon 37 får ny revisjon. Lagringsformatet og progresjonsberegningen er ikke endret.

## Dashboard

- Samlet obligatorisk kunnskapsprogresjon vises foran modulene.
- Alle 14 moduler vises som native `details`/`summary`, lukket ved oppstart, med synlig antall mestrede obligatoriske mål og prosent per modul.
- Utvidede moduler grupperer obligatoriske kunnskapsmål, valgfrie kunnskapsmål og praktiske mål. Alle 266 mål og leksjonslenker er fortsatt tilgjengelige. Praktiske mål merkes fortsatt som ikke automatisk vurdert.
- Ingen ny lagret progresjon eller manuell godkjenning er lagt til. Valgfrie og praktiske mål holdes fortsatt utenfor samlet prosent. Personlige mål bruker de eksisterende komponentene og Context-listen.
- Mobilhøyde ved 375 × 812: **4 746 px**, mot rapportens **60 970 px**, omtrent **92 % kortere**. Målt i både lys og mørk modus med tom progresjon/personlig målliste.
- Enter åpner, Space lukker og Tab går videre til leksjonslenker. Synlig fokus kontrolleres. Chromium sitt tilgjengelighetstre eksponerer riktig lukket/utvidet tilstand. Leksjonslenkene har minst 32 px høyde.

## Kontrast

Faktiske temafarger hentes fra nettleserens beregnede stil. Forholdene under er avrundet for presentasjon; testene sammenligner uten avrunding. Normal tekst kontrolleres mot minst 4,5:1, relevante kontrollgrenser og fokus mot minst 3:1, i tråd med [WCAG tekstkontrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) og [ikke-tekstlig kontrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).

| Kombinasjon | Lys modus | Mørk modus |
|---|---:|---:|
| Dempet tekst / overflate | **6,34:1** (tidligere 4,45) | 7,05:1 |
| Dempet tekst / feilpanel | **5,40:1** (tidligere 3,87) | 6,04:1 |
| «Ikke startet» og dempet tekst / sidebakgrunn | **5,90:1** (tidligere ca. 4,23) | 8,08:1 |
| Mestret-status / svak aksentbakgrunn | 4,72:1 | 6,21:1 |
| Feil-/under arbeid-tekst / feilpanel | 5,71:1 | 8,47:1 |
| Feltgrense / feltbakgrunn | **4,04:1** | **4,76:1** |
| Feltgrense / overflate | 4,12:1 | 4,34:1 |
| Fokusfarge / overflate | 5,35:1 | 8,07:1 |
| Fokusfarge / sidebakgrunn | 4,97:1 | 9,24:1 |

Lys `--muted` er mørknet til `#54635b`. Felt har egen `--control-border`: `#738079` i lys modus, `#789185` i mørk modus. Dekorative kortskiller trenger ikke samme kontrast som feltgrenser. Aksent-/statusfargene som allerede besto kravene er beholdt. Eksisterende aksentfarge gir også god kontrast for valgte kontroller og fremdriftslinjer mot aksentbakgrunnen.

Ingen tekstkontrastavvik i de 44 ordinære sidekontrollene eller 30 oppgavetilstandene. Dessuten er alle 14 utvidede modulgrupper kontrollert i begge temaer, uten tekstkontrastavvik eller horisontal overflyt.

## Målrettede hintendringer

18 av 202 hint er endret; resten er beholdt. Endringene erstatter direkte henvisninger til nøkkelord/egenskaper med sporing av verdier, input/output, komponentgrenser eller tidslinjer. To presisjonsfeil er også rettet.

| Leksjon | Oppgave-ID-er | Forbedring |
|---|---|---|
| Map, filter og immutable oppdateringer | `lister-immutabilitet-map-check` | Ta utgangspunkt i ønsket resultat, fremfor å beskrive metoden nesten ordrett. |
| JSX-regler og uttrykk | `structure-info-panel` | Presiser samling i ett JSX-uttrykk med beholder **eller fragment**, fremfor påstand om bare ett rotelement. |
| Fragmenter og komponenttrær | `fragmenter-komponenttraer-fragment-check`, `fragmenter-komponenttraer-tree-check` | Følg gruppegrenser og tegn treet, fremfor å avsløre taggformen eller navngi forelderen. |
| Inline styles og layoutkomposisjon | `inline-layout-style-object-check` | Sammenlign navneformer uten å navngi den etterspurte egenskapen. |
| Betinget rendering | `betinget-rendering-branch-check`, `betinget-rendering-and-check` | Følg begge grener eller kortslutningen og datatypen. |
| State som øyeblikksbilde | `state-rendering-reset-check` | Resonner om mottakerens identitet fremfor å spørre direkte etter spesialegenskapen. |
| Funksjonelle oppdateringer og batching | `oppdateringer-batching-batch-check` | Skill ferdig erstatningsverdi fra oppdateringsfunksjon; det tidligere køhintet var misvisende og nesten likt det andre. |
| Avhengigheter og cleanup | `avhengigheter-cleanup-subscription-check` | Spor hva som opprettes/fjernes, fremfor å oppgi callback-identitet som løsningen. |
| Fetch og HTTP-status | `fetch-http-response-check`, `fetch-http-cors-check` | Skill nettverk, serverstatus og nettleserblokkering; ikke pek direkte på løsningsalternativet. |
| Laste-, feil- og tomtilstand | `last-feil-tomt-retry-check` | Spor begge kontrollflyter og sluttverdien av loading. |
| Hook-regler og gjenbruk av logikk | `hook-regler-instances-check` | Rett «Hver kall» til «Hvert kall» og la studenten følge hver komponents setter. |
| Props kontra Context | `props-context-scope-check` | Tilpass hintet til det nye props-eksemplet og eieren av utkastet. |
| Query keys, enabled og staleTime | `queries-cache-freshness-check` | Tegn tidslinje for oppdatering og fjerning, uten å oppgi innstillingsnavnet. |
| Paginering | `paginering-controls-check` | Sammenlign forespørselen med cacheidentiteten, uten å oppgi den manglende verdien. |
| Ytelsesmåling og målrettet memoization | `ytelse-memo-check` | Varier input og vurder resultatet, fremfor å peke på den utelatte avhengigheten. |

## Faktiske testresultater

- `npm run build`: **bestått**, inkludert regenerering av kursmanifest. Ingen størrelsesadvarsel. Største JS-chunk ca. 402 kB / 120 kB gzip.
- `npm run lint`: **bestått**.
- `npm test`: **126 av 126 bestått**, ingen utelatte tester. Ny test av alle lukkede modulgrupper/mållenker og kategorier; eksisterende statussammenligning tilpasset gruppering. Revisjonskontrollen inkluderer den nye oppgaverevisjonen.
- `BASE_URL=http://127.0.0.1:5175/react-oppgave-3/ npm run e2e`: **hele pakken bestått**, uten leksjonsbegrensning. Den utvidede findings-fasen er også kjørt separat etter at kontroll av tilgjengelighetstreet og skjermbilder ble lagt til; bestått.

| Nettleserfase | Resultat |
|---|---|
| findings | Begge temaer, 266 mål, 14 grupper, tastatur og fokus, 18 fargepar, fem rettede leksjoner og fire kjøringer av faktiske kodeeksempler: ingen feil. |
| walk | 14 moduler, 65 leksjoner fremover og 65 bakover: ingen feil. |
| course | 202 oppgaver gjennom seks steg, totalt 1 212 kontrollerte oppgavesteg: alle bestått. 404 feil og 404 riktige innsendinger, 202 fasitvisninger og 202 nye runder. |
| course/progresjon | 201 av 201 obligatoriske kunnskapsmål, 204 inkludert valgfrie, 62 praktiske mål fortsatt ikke automatisk vurdert. Sammenligning med uavhengig forventning, reload og assistert omøving består. |
| robustness | 15 av 15 scenarioer, inkludert utilgjengelig/ugyldig lagring og gamle oppgaverevisjoner: bestått. |
| views | 108 visninger ved 375/768/1440 px i begge temaer, 44 tekstkontrastkontroller og 30 oppgavetilstander: ingen overflyt eller kontrastfeil. |

De opprinnelige nettleserfasene rapporterer ingen konsoll-/side-/nettverksfeil. Nettleseroppstart måtte kjøres utenfor sandkassen; ingen pakker er installert. Skjermbilder av mobilvisning i begge temaer er inspisert.

Detaljer: `e2e/results/findings.json`, `walk.json`, `course.json`, `robustness.json`, `views.json`. Skjermbilder: `e2e/results/screenshots/`, blant annet `dashboard-collapsed-mobile-light.png` og `dashboard-expanded-mobile-light.png` med mørke varianter.

## Endrede filer

Applikasjon og innhold:

- `src/App.css` – kontrast, feltgrenser, modulgrupper og mållenkenes trykkflate.
- `src/components/CourseGoals.jsx` – gruppering per modul og måltype, samme beregninger.
- `src/content/modules/components.js` – children-forklaringen.
- `src/content/modules/forms.js` – komplett valideringseksempel.
- `src/content/modules/context.js` – enklere oppgave 3 og revisjon 3.
- `src/content/workshops/hooks.js` – adapterparameter, komplett feilsimulering og kontrollpunkt.
- `src/content/workshops/testing.js` – demonstrerbar valideringsregresjon.
- `src/content/exerciseHints.js` – de 18 avgrensede hintendringene.
- `src/content/courseManifest.js` – generert oppgaverevisjon, ellers uendret.

Tester og dokumentasjon:

- `tests/exercise-feedback.test.js` – statussammenligning per leksjon og test av modulgrupper.
- `tests/final-fixes.test.js` – ny vurderingsrevisjon.
- `e2e/run.mjs`, `e2e/README.md` – målrettet regresjonsfase og dokumentasjon.
- `e2e/phases/course.mjs` – tell også mål i lukkede grupper.
- `e2e/phases/views.mjs` – gjenbrukbar kontrastskanning; sidekontrastavvik gir nå testfeil.
- Nye `e2e/phases/findings.mjs`, `e2e/lib/teachingFixtures.mjs` – målrettede nettleser- og eksempelkontroller.
- Resultatfiler og skjermbilder under `e2e/results/` er oppdatert/opprettet av testkjøringene.
- Denne rapporten: `docs/eduplan-student-fixes.md`.

`package.json`, `package-lock.json`, studentrapporten og e2e-mappen hadde allerede lokale endringer/var uversjonerte ved start. Pakke-/låsefilene og den opprinnelige studentrapporten er ikke endret i dette arbeidet. E2E-mappen er utvidet som angitt over.

## Gjenværende forhold

Ingen gjenstående feil er funnet i de fem avgrensede rettelsene eller i testet dashboard/progresjon. De øvrige pedagogiske forbedringspunktene fra studentrapporten er ikke omarbeidet i denne oppgaven: særlig én gjenkjenningsoppgave per mange kunnskapsmål, forkunnskapshull og gjennomførbarheten av andre praktiske oppgaver. Automatisk mestring er fortsatt begrenset dokumentasjon av kunnskap, ikke bevis på praktisk programmeringsferdighet.

Visning er kontrollert i Chromium med emulerte skjermbredder, ikke på en fysisk telefon, i Safari/Firefox eller med en faktisk skjermleser. Native semantikk og tilgjengelighetstre er kontrollert, men er ikke en full skjermleserrevisjon. Testens indikasjon om små kontroller på 34 mobilvisninger gjelder fortsatt blant annet 18 px radioknapper/avkrysninger med større klikkbare etiketter og en streng målegrense på 32 px; dette er ikke alene en WCAG-feil. Målgruppenes leksjonslenker er målt separat og består minst 24 px. Kontrastskanningen er ikke en full WCAG-sertifisering.

Rettelsene er klare for kontrollert studentgjennomgang. Gjenværende pedagogiske funn bør følges opp med en lærer og studentenes faktiske programmeringsarbeid.
