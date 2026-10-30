# EduPlan - automatisert studentsimulering

Dato: 2026-10-30. Gren: `develop`. Applikasjonen kjørte på `http://localhost:5173/react-oppgave-3/` (Vite dev-server).
Nettleser: Chromium via Playwright 1.64.1, isolert kontekst per fase og per scenario (tom lagring). Brukerens egen
nettleser og progresjon ble ikke berørt. Applikasjonens kildekode er ikke endret. Ingen commit, push eller deploy.

Testene ligger i `e2e/` og kjøres med `npm run e2e` (se `e2e/README.md`). Rådata ligger i `e2e/results/*.json`,
representative skjermbilder i `e2e/results/screenshots/`.

## 0. Hva som faktisk ble testet, og hvordan

| Område | Metode | Omfang |
|---|---|---|
| Navigasjon, alle leksjoner | Nettleser (Playwright), klikk på lenker | 65 av 65 leksjoner åpnet forover med «Neste leksjon», 65 av 65 bakover med «Forrige leksjon» |
| Leksjonsinnhold | Nettleser, roller og tilgjengelige navn | 65 av 65: tittel, seksjoner, kodeeksempler, oppgaver, praktisk oppgave, mål, forrige/neste |
| Interaktive oppgaver | Nettleser, alle innsendinger via UI | 202 av 202, seks steg per oppgave |
| Progresjon og dashboard | Nettleser, sammenlignet med egen beregning fra kursdata | Hele kurset, med mellomsjekker, reload og omøving |
| Robusthet | Nettleser, 15 isolerte scenarioer | Reload, ny runde, ugyldig og manglende lagring, ugyldige adresser, eldre data, valgfrie mål |
| Visning | Nettleser, 375/768/1440 px, lys/mørk | 108 sidevisninger, 30 oppgavetilstander, kontrast- og overflytmåling, 10 skjermbilder |
| Pedagogikk | Kildeanalyse av eksportert kursinnhold (ikke nettleser) | Alle 65 leksjoner lest i sin helhet av tre uavhengige gjennomganger, pluss egne automatiske målinger |
| Praktiske oppgaver | Nettleser: bare at de vises. Pedagogisk: bare instruksjonene er lest | 62 praktiske oppgaver. Ingen av dem er gjennomført |

Rapportert antall er kun det testene registrerte. Leksjonene registreres én og én i `e2e/results/walk.json`
(`visitedForward`, `visitedBackward`), og oppgavene i `course.json`. Ingenting er markert som bestått uten at det ble kjørt.

## 1-7. Nøkkeltall

| Mål | Resultat |
|---|---|
| 1. Moduler testet | 14 av 14 (hver åpnet fra kursoppsettet, leksjonslisten sammenlignet med kursdata) |
| 2. Leksjoner besøkt | 65 av 65 (forover), 65 av 65 (bakover), 65 av 65 i oppgavesimuleringen |
| 3. Oppgaver besvart | 202 av 202 |
| 4. Feil svar testet | 404 (to per oppgave) |
| 5. Riktige svar testet | 404 (ett assistert og ett selvstendig per oppgave) |
| 6. Fasitvisninger testet | 202 (og 202 «Start ny øvingsrunde») |
| 7. Mål mestret | 201 av 201 obligatoriske kunnskapsmål (100 %), vist som «Mestret» på 204 mål når de tre valgfrie kunnskapsmålene regnes med |

## 8. Resultater for oppgaver, progresjon og lagring

### Oppgaveflyten (202 oppgaver, 6 steg hver, 1212 steg: alle bestått)

For hver oppgave ble dette gjort og kontrollert i brukergrensesnittet og i lagret data:

1. Første feil svar: avvist, oppgavespesifikt hint vises (lik hintet i kursdata), ingen fasit, ingen forklaring, ingen «Vis fasit»-knapp, ikke mestret, lagret `attempts: 1, correct: false`.
2. Andre feil svar: «Vis fasit» vises, fasit vises ikke automatisk, teller viser «2 ganger».
3. «Vis fasit»: fasit og forklaring vises, fokus flyttes til panelet, `solutionShown: true` lagres, ingen mestring.
4. Riktig svar i samme runde: godkjent, merket som øving, lagret `assisted: true`, målet står på «Under arbeid».
5. «Start ny øvingsrunde»: markeringen fjernes, historikken (3 forsøk) beholdes.
6. Riktig svar i ny runde: godkjent, lagret uten `assisted` og `solutionShown`, 4 forsøk, målstatus ifølge forventet beregning.

Resultat: 202 av 202 bestått på alle seks steg. Testen er også kjørt med feil forventning som kontroll, og da rapporteres feil (testene kan feile).

### Kopling mellom oppgaver og mål (faktisk undersøkt)

- 266 mål totalt: 62 praktiske, 4 valgfrie (3 av dem kunnskapsmål, 1 praktisk), 201 obligatoriske kunnskapsmål.
- 201 er riktig: 266 - 62 praktiske - 3 valgfrie kunnskapsmål. Alle 201 har minst én oppgave, og alle 202 oppgaver er koblet til minst ett kunnskapsmål.
- 198 av 201 mål har bare **én** oppgave. 3 mål har to. 5 oppgaver støtter flere mål.
- Det betyr at de 202 oppgavene faktisk dekker alle 201 obligatoriske mål. Dette ble bekreftet i nettleseren: 201 av 201 mestret etter 202 mestrede oppgaver.

### Dashboard og prosent (sammenlignet mot egen uavhengig beregning)

| Tidspunkt | Dashboard | Forventet |
|---|---|---|
| Start | 0 av 201, 0 % | 0 av 201, 0 % |
| Etter leksjon 5 | 16 av 201, 7 % | 16, 7 % |
| Etter leksjon 20 | 62 av 201, 30 % | 62, 30 % |
| Etter leksjon 42 | 129 av 201, 64 % | 129, 64 % |
| Etter alle leksjoner | 201 av 201, 100 % | 201, 100 % |
| Etter reload | 201 av 201, 100 % | 201, 100 % |
| Etter assistert omøving og reload | 201 av 201, 100 % | 201, 100 % |

- 62 praktiske mål viser «Ikke automatisk vurdert» på alle målene, også når alle kunnskapsoppgaver er mestret, og ingen er godkjent.
- De tre valgfrie kunnskapsmålene vises som «Mestret» (204 mestrede mål) men teller ikke i prosenten (201 i nevneren). I et eget scenario ble bare den valgfrie Tailwind-leksjonen besvart: 3 mål mestret, prosenten forble 0 av 201, 0 %.
- Alle 65 leksjoner kunne markeres som gjennomgått og ble da vist som mestret. «Oppgaver besvart» og «Riktige svar» var riktige i alle leksjoner.
- Progresjonen overlevde reload uendret (lagret data sammenlignet tegn for tegn).
- Omøving: på en allerede mestret oppgave ble det svart feil to ganger, fasit vist og riktig svar gitt. Lagret: `correct: true, assisted: true, mastered: true`, 7 forsøk. Målet forble «Mestret» og dashboardet uendret, også etter reload.

### Robusthet (15 av 15 scenarioer bestått, 3 gjentatte kjøringer stabile)

| Scenario | Resultat |
|---|---|
| Reload etter fasitvisning | Fasit-panelet vises igjen uten klikk, «Vis fasit» vises ikke på nytt. Riktig svar etter reload lagres som assistert, ingen mestring. |
| Ny øvingsrunde (bevisst handling) | Ny runde overlever reload. Ny reload uten å starte runde gjenåpner ikke runden. Selvstendig svar i ny runde gir mestring. |
| Reload etter mestring | Mestring og «Sist besvart riktig» vises. |
| Tidligere mestring etter assistert svar | Mestring bevares (lagret `mastered: true`), historikk bevart. |
| Ugyldig lagret progresjon (ikke JSON) | Tydelig melding. Originaldata ble **ikke** overskrevet av øving. Gjenoppretting og «Erstatt»-valg (med bekreftelse) finnes. |
| Ugyldig struktur / ugyldig felttype | Avvises med melding, originaldata uberørt. |
| Skriving til lagring feiler | Melding vises, øving, fasit og assistert merking fungerer i minnet, ingen mestring ved assistert svar. |
| localStorage utilgjengelig | Melding vises, appen fungerer i minnet. |
| Eldre lagret data, revidert oppgave | Gammel mestring leses. Svar på eldre revisjon gir ikke mestring av ny revisjon, og viser melding om eldre utgave. |
| Ugyldig leksjon, modul, kurs, leksjon under feil modul, ukjent adresse | «Vi fant ikke det du lette etter» og fungerende lenke til kursoversikten (5 scenarioer). |
| Ren lesing | Skriver ikke til lagringen. |

### Konsoll og nettverk

0 konsollfeil, 0 konsollvarsler, 0 sidefeil, 0 mislykkede forespørsler og 0 HTTP-feil i alle fire fasene, også i de to scenarioene der lagring med vilje ble gjort utilgjengelig.

## 9. Resultater for mobil, nettbrett og temaer

Måling i 375 px, 768 px og 1440 px, både lys og mørk modus: 108 sidevisninger (dashboard, kursoversikt, kursside,
moduloversikt og én leksjon fra hver av de 14 modulene) og 30 oppgavetilstander (feil, andre feil med knapp, fasit
åpnet med tastatur (Enter), assistert, mestret).

- Horisontal overflyt: 0 av 108 sider og 0 av 30 tilstander.
- Temabytte med «Bytt tema»-knappen fungerer på alle sidene. Mørk modus: **0** tekstelementer under kontrastkravet på de målte sidene og i alle oppgavetilstander.
- «Vis fasit», «Start ny øvingsrunde» og fasit-panelet er lesbare og bruker hele bredden på 375 px (se skjermbilder).
- Lys modus: tekst under WCAG AA (4,5:1) på dashboard, kursside, leksjoner og alle oppgavetilstander, se funn V2.
- Trykkflater på mobil: radioknapper og avkrysning er 18 x 18 px, men ligger i store klikkbare etiketter. Lenker «Til leksjonen: ...» i målsammendraget er 22 px høye.
- Dashboardet er svært langt: 60 970 px høyt på mobil (266 mål i én liste), se funn V1.

Skjermbilder (representative, ikke alle leksjoner): `e2e/results/screenshots/`.

## 10. Tekniske feil

Nettlesersimuleringen fant **ingen funksjonelle feil** i navigasjon, leksjonsvisning, oppgaveflyt, progresjon, lagring eller feilhåndtering. Funnene under er målt i nettleseren, men gjelder visning og skala, ikke at noe slutter å virke.

Midlertidige testfeil underveis (rettet i testene, ikke i appen): tilbake/frem-knappen ble sjekket før ruteren hadde tegnet siden, ett scenario brukte feil forventet forsøkstall, en lukket `<details>` skjulte et avkrysningsfelt, og lysbilder ble først lagret i en feil URL-kodet mappe (flyttet, og stien er rettet).

## 11. Pedagogiske svakheter

Metode: tre uavhengige, fullstendige gjennomlesninger (en per modulgruppe) av eksportert kursinnhold, med en felles rubrikk på åtte kriterier,
pluss mine egne automatiske målinger. Gjennomlesningene er gjort av språkmodeller, ikke av en lærer, og er **kildeanalyse, ikke nettleserkjøring**.
Jeg har ikke gjennomført noen av de 62 praktiske oppgavene. Vurderingene av dem gjelder bare om instruksjonene er tydelige og gjennomførbare med det som er undervist.
Jeg kontrollerte syv av de «bekreftede» feilene direkte mot kilden (merket under med ✓); resten er gjengitt fra gjennomlesningene.

### Målt automatisk

- 65 leksjoner med 6-8 seksjoner. 59 leksjoner har 3 oppgaver, 5 har 4, 1 har 5. 202 oppgaver: 78 flervalg, 66 «finn feilen», 58 utfylling. Alle flervalg har nøyaktig 3 alternativer.
- Riktig alternativ ligger på plass 1/2/3 med 56/40/48 av 144, og er det lengste i 36 av 144 (25 %). Ingen tydelig posisjons- eller lengdeskjevhet totalt, men leserne fant lokale mønstre (se under).
- **198 av 201 obligatoriske mål er koblet til én eneste oppgave.** Mestring av et mål betyr derfor ett riktig svar, ofte på et flervalg med tre alternativer.
- Alle 62 praktiske mål har «oppgaver: ingen». Ingen praktisk oppgave kan påvirke progresjonen, og det er bevisst og tydelig merket i UI.
- Hintene er 12-30 ord (snitt 19). Alle 202 har et oppgavespesifikt hint, men bare ett nivå.
- Tre eldre leksjoner (nr. 5, 6 og 7, modul 2) har en annen datamodell: de mangler praktisk oppgave, introduksjon, forkunnskaper og måltype i dataene. De vises uten feil i appen.

### Styrker (fra gjennomlesningene)

Sterkest: leksjon 11 (`children`), 18 (`useState`), 38 (Provider/consumer), 33 (hook-regler), 41 (`useReducer`), 43 (Link og params), 34 og 23. Felles: kode og tekst samsvarer, tydelige mål, og oppgaver som tester en reell misforståelse.

### Svakest

Leksjon 29 (fetch/HTTP: ca. 100 linjer kopikode og for mange nye begreper), 35 (`useLocalStorage`), 51 (tester: Vitest, jsdom, Testing Library og user-event samtidig), 61 (hele TypeScript i én leksjon), 64 (oppgavemotor), 10 (rest-syntaks mangler), 14, 16, 30 og 42.

### Vanskelighetskurve

Jevn i modul 1, 6, 8 (unntatt leksjon 35) og 10; modul 3 har et hopp i leksjon 10. Hakkete i modul 7 (topper i 29 og 35, lette repetisjoner i 32 og 37), brå i 51, 53, 61 og 64. Mellom modul 11-12 og sluttprosjektet går kurset fra små oppgaver til selvstendig prosjektbygging uten mellomtrinn.
**Vanskeligheten vokser i stoffet, men ikke i oppgavene.** Kunnskapsoppgavene tester nesten bare gjenkjenning (velg, fyll inn ett ord) og aldri å skrive en hel løsning.

### Kontrollerte feil og motsigelser

Kunnskapsoppgaver:
- ✓ Leksjon 11, oppgave 3: forklaringen sier «Bare den første varianten» gjengir lenken, men riktig alternativ er det tredje. Rekkefølgen i forklaringen stemmer ikke med alternativene.
- ✓ Leksjon 21, oppgave 2: et galt alternativ påstår at `visits` er `const`, men koden bruker `let`.  Leserne meldte også at forklaringen i leksjon 18, oppgave 2 er irrelevant for spørsmålet (ikke kontrollert av meg).
- Leksjon 22, oppgave 2: ferdighetsnavnet (skille erstatning fra oppdateringsfunksjon) matcher ikke oppgaven. Mål 1 og 2 er i praksis dubletter. Leksjon 14 oppgave 3 og leksjon 13 mål 3 har samme type misforhold mellom navn og innhold.
- ✓ Leksjon 37, oppgave 3 bruker `AppContext.Provider` og `useContext`, som først undervises i leksjon 38.
- Leksjon 7, oppgave 4 (mitt hint `structure-info-panel`): «En komponent kan bare returnere ett rotelement» er upresist, fordi fragmenter og `null` er tillatt og er introdusert i leksjon 5 og 8.
- Leksjon 33, oppgave 3 (hint): skrivefeil «Hver kall» (skal være «Hvert kall»).
- Seksjoner uten oppgave som tester temaet (leserne i modul 11-14): `useQuery` (46), kansellering (47), `hasMore`/sidekontroller (50), fokusflyt (56), ErrorBoundary med Suspense (59), `memo`/`useCallback` (60). I tillegg tester mange oppgaver noe annet enn det ferdighetsnavnet sier.

Praktiske oppgaver og kode:
- ✓ Leksjon 24: `showError` brukes i eksempelkoden men er aldri definert.
- ✓ Leksjon 35, kontroll 3: krever en lagringsadapter som kaster, men `useStoredTasks()` tar ingen parameter. Kan ikke gjennomføres uten å endre hooken.
- Leksjon 36: kobler til et «API-scenario» med søk, men øvings-API-et har ingen søkeendepunkt.
- Leksjon 39: «refaktorer til useThemeValue og useThemeSetter», men de ferdige filene definerer dem allerede (kopier og kontroller, ikke lag selv).
- ✓ Leksjon 51: kontrollen «feile selv om feilmeldingen fortsatt vises» lar seg ikke demonstrere med skjemaet som er gitt. Testen feiler på varsel, ikke på `onCreate`.
- Leksjon 47: kommentar viser til `readJson`/`validCourses` «nedenfor», men de vises aldri. Leksjon 50: nøkkelen skifter form (`{ page }` mot `page`).
- Leksjon 45: kravet om navigasjon etter handling har ingen kontroll. `useNavigate` undervises og testes aldri.
- Leksjon 26 og 43: kontrollen krever sortering som ikke er spesifisert i kravene. Leksjon 63-64: «oppgaverevisjon» kreves, men finnes ikke i noen datamodell i leksjonene.
- Leksjon 57: seksjonen «unngå hjemmelagde modalvinduer» viser en `<dialog>` uten måte å åpne den på.

Forkunnskaper som mangler før de brukes (utvalg): rest-syntaks `...rest` (leksjon 10), `finally`/`throw`/`Error` (4), skjemaer og `submit` (16), bobling (19), kontrollert input før den praktiske oppgaven i leksjon 21, avhengighetslisten `[]` og StrictMode før leksjon 27, fetch i `useEffect` før leksjon 29/30, `Link` før leksjon 42, `findBy` før leksjon 54, React DevTools (brukt fra leksjon 8, introdusert først i 55), installasjonskommandoer for Query, Axios og Vitest (46-51), TypeScript-generikker (61), samt `?.` og `??` som brukes før de forklares.

Hint og gjettbarhet:
- Hint er nesten alltid ett spørsmål som peker direkte på svaret, og er sjelden gradert. Leserne pekte på tydelig avslørende hint blant annet i leksjon 3 (oppgave 1), 8 (1, 2), 14 (1), 20 (1, 2), 21 (3), 28 (3), 29 (1, 4), 30 (3), 48 (3), 50 (3), 60 (2) og 61 (1, 2). Hintene i leksjon 22 oppgave 1 og 2 er nesten identiske («regn ut steg for steg»).
- Mange gale alternativer er åpenbart absurde, og i flere leksjoner (23, 25, 26, 31, 36, 37, 41, 45) er riktig svar det korte og mest nøkterne mens de gale har «slik at/automatisk/alltid». I andre (5, 6, 10, 12, 17, 20, 28, 29, 48, 50) er riktig svar det lengste. Rundt 20 utfyllingsoppgaver kan besvares ved å kopiere et ord fra seksjonens kode (for eksempel leksjon 16 oppgave 1 og 53 oppgave 2).
- Ressurslister er kopiert mellom leksjoner og passer ikke alltid (leksjon 8, 18-22, 32, 35, 36). «Fordypning: dokumenter én alternativ løsning» og tre «Forkunnskaper»-linjer er identiske i nesten alle leksjoner.

Gjentakelser: «beregn, ikke lagre» (25, 27, 40), id mot indeks (26, 40, 43), timer-cleanup (28, 32, 36), utdaterte svar (31, 36), og leksjon 37 gjentar 25 nesten ordrett. Rent teknisk er repetisjon ikke feil i et kurs, men lett oppgavemasse i stedet for dybde er en mulig sammenheng.

### Praktiske oppgaver, oppsummert

Karakter 4-5 for praktisk oppgave fikk leksjon 11, 13, 18, 19, 20, 24, 27, 33, 34, 38, 41, 43, 44, 56, 60 og 65. Karakter 2 fikk leksjon 10, 14, 21, 29, 30, 37, 39, 48, 53, 63 og 64 (karakterene er leserens, 1-5). Mønsteret er (a) kreves kunnskap som kommer senere, (b) kopier-og-kontroller i stedet for å lage, (c) en skjult øvingsseler som ikke leveres, og (d) kontrollpunkter som ikke matcher kravene. **Ingen av dem er prøvd i praksis.**

## 12. Forbedringsforslag

### Kritiske feil
Ingen funnet. Ingen blokkerende teknisk feil, tap av data eller feil mestring i 1212 oppgavesteg, 8 dashboardkontroller og 15 robusthetsscenarioer.

### Viktige feil
1. **Dashboardet er 60 970 px høyt på mobil** (40 326 px på desktop) fordi alle 266 mål ligger i én uten sammenfoldbar liste, og «Personlige læringsmål» ligger under. Forslag: vis bare sammendrag og neste steg, og legg målene i `<details>` per modul.
2. **Kontrast i lys modus er under WCAG AA** (mørk modus er uten funn). `--muted` (#6c7973) gir 4,45:1 på hvit og **3,87:1 inne i feilpanelet** («Endre svaret for å prøve igjen.», «Sist besvart ...»). Målstatus «Ikke startet», brødsmuler, lenker og bunntekst ligger på 4,23:1. Forslag: mørkne `--muted` og lenke-/statusfargene til minst 4,5:1.
3. **Mestring er svakt belegg for forståelse.** 198 av 201 mål avgjøres av én oppgave, ofte et flervalg med tre alternativer, uten grense for forsøk. Simuleringen viste at 100 % kan nås med «to feil, vis fasit, skriv av, ny runde, skriv av» på alle 202 oppgaver. Det er i tråd med bestemmelsen om konsistent progresjon i stedet for jukesikkerhet, men «Mestret» betyr her ikke mer enn «har sett og gjenskapt riktig svar». Forslag: minst to ulike oppgaver per mål og fire alternativer, eller tydeligere språk («gjennomført» i stedet for «mestret»).
4. **Bekreftede innholdsfeil** (se kontrollerte feil): leksjon 11 oppgave 3 (forklaringens rekkefølge), 21 oppgave 2, 24 (`showError`), 35 kontroll 3, 36, 37 oppgave 3, 39, 45, 51. Disse bør rettes før studenter bruker kurset.
5. **Hint er ett nivå og peker ofte rett på svaret.** Forslag: to nivåer (prinsipp først, konkret hint etter neste feil), og bytt ut avslørende formuleringer (liste over i avsnitt 11).

### Mindre feil
- Lenker «Til leksjonen: ...» i dashboardets målliste er 22 px høye (under 24 px målstørrelse i WCAG 2.2). Radioknapper og avkrysningsfelt er 18 px men ligger i store klikkbare etiketter.
- Hintet i leksjon 7 oppgave 4 er upresist om «ett rotelement». Skrivefeil i hint for leksjon 33 oppgave 3.
- Leksjon 5-7 har en annen datamodell enn resten (mangler introduksjon, forkunnskaper, praktisk oppgave).
- Etter «Vis fasit» står den gamle feilmeldingen med hint fortsatt over fasit-panelet. Det er ikke feil, men gir lengre sider på mobil.
- «Sjekk svar» er gråtonet når den er deaktivert, noe som er tillatt, men gjør første inntrykk svakt i lys modus.

### Pedagogiske forbedringer (prioritert)
1. Flytt eller legg til undervisning før bruk: `...rest` (10), `finally`/`throw`/`Error` (4), skjema/`submit` (16), bobling (19), kontrollert input før 21, `[]` og StrictMode før 27, fetch-i-effekt i 29/30, `Link` før 42, `findBy` før 54, installasjonskommandoer før 46 og 51.
2. Gi alle praktiske oppgaver en komplett øvingsseler (filer, mock-API, oppsett) og rett kontrollpunkter som ikke samsvarer med kravene (liste i avsnitt 11).
3. Erstatt noen av utfyllings- og gjenkjenningsoppgavene med «skriv hele uttrykket» og «forutsi resultatet», og legg til oppgaver for temaene uten dekning.
4. Del for tunge leksjoner (51, 61, 64, 29) i to, og legg inn mellomtrinn før sluttprosjektet.
5. Bytt ut absurde gale alternativer med troverdige misforståelser, og gjør like lange alternativer.
6. Fjern kopiert boilerplate og feilkoblede ressurser, og slå sammen dubletter (leksjon 22, 30, 34, 37, 40).

## 13. Sluttvurdering (bygger bare på dokumenterte resultater)

| Område | Vurdering | Begrunnelse |
|---|---|---|
| Teknisk stabilitet | Sterk | 65 av 65 leksjoner, 14 av 14 moduler, 0 konsollfeil i alle faser, 0 horisontal overflyt i 108 visninger, stabil over gjentatte kjøringer, ugyldige adresser håndtert. Testet bare mot Vite dev-server i Chromium. |
| Oppgavesystemet | Sterk | 202 av 202 oppgaver gjennom alle seks steg. Hint før fasit, fasit bare ved valg eller riktig svar, tilgjengelig tastaturbruk, mørk modus uten kontrastfeil. Svakhet: lav oppgavedybde (se pedagogikk). |
| Progresjonssystemet | Sterk teknisk, svak som læringsbevis | Dashboard stemte med uavhengig beregning på alle målepunkter. Mestring bevares ved assistert omøving, overlever reload, og ugyldig eller manglende lagring overskriver ikke originaldata. Men ett riktig svar per mål er svakt belegg for forståelse. |
| Pedagogisk kvalitet | Middels, med klare fortrinn | Gode leksjoner finnes (11, 18, 33, 38, 41, 43), men stoffet vokser fortere enn oppgavene, mange hint avslører svaret, og minst ni bekreftede innholdsfeil og en rekke praktiske oppgaver med krav som ikke samsvarer. |
| Klar for reelle studenter? | **Ja for løpende bruk i en kontrollert gruppe, ikke uten rettinger som en ferdig plattform.** | Plattformen virker. Før bredere bruk bør de bekreftede innholdsfeilene rettes, dashboardets lengde og lys modus-kontrast fikses, og praktiske oppgaver med manglende øvingsseler repareres. Uten lærerveiledning vil studentene møte hull i forkunnskaper (se avsnitt 11). |

## 14. Hva som IKKE er testet

- Praktiske programmeringsoppgaver (62) er ikke gjennomført, bare lest og sett i nettleseren.
- Produksjonsbygg (`vite preview`/GitHub Pages) er ikke kjørt i nettleseren, bare dev-serveren.
- Bare Chromium, ingen Firefox, Safari eller ekte mobilenhet (mobil er emulert viewport). Ingen skjermleser, og tastaturbruk er bare testet for «Vis fasit» (Enter). Full fanerekkefølge for alle sider er ikke testet.
- Flere faner samtidig mot samme lagring, og svært store eller gamle lagringsmengder.
- Kontrastmåling er en egen beregning (WCAG AA) på 44 sider og 30 oppgavetilstander, ikke et sertifisert tilgjengelighetsverktøy.
- De pedagogiske vurderingene er laget av språkmodeller fra kildeteksten, og bør støttes av en lærer eller reelle studenter.
