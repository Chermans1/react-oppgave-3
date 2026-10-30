# Nettlesersimulering av EduPlan (Playwright)

Disse testene åpner EduPlan i en ekte Chromium-nettleser og oppfører seg som en student:
de navigerer til alle leksjoner, besvarer alle interaktive oppgaver gjennom brukergrensesnittet,
og kontrollerer tilbakemelding, progresjon, lagring og visning. De er skilt fra `tests/`
(enhetstestene), så `npm test` er upåvirket.

## Slik kjører du dem

1. Start appen i en egen terminal: `npm run dev` (standardadresse `http://localhost:5173/react-oppgave-3/`).
2. Kjør simuleringen i en annen terminal:

```sh
npm run e2e              # alle faser
npm run e2e:walk         # navigasjon og alle 65 leksjoner
npm run e2e:course       # alle 202 oppgaver + progresjon i hele kurset (tar noen minutter)
npm run e2e:robustness   # reload, ny runde, ugyldig/manglende lagring, ugyldige adresser
npm run e2e:views        # 375/768/1440 px, lys/mørk, overflyt, kontrast, skjermbilder
```

Miljøvariabler:

- `BASE_URL` - annen adresse, f.eks. `BASE_URL=http://localhost:4173/react-oppgave-3/ npm run e2e` mot `npm run preview`.
- `PW_CHROMIUM` - sti til en bestemt Chromium. Uten den brukes Playwrights egen nettleser, og finnes den ikke
  brukes en Chromium fra Playwright-cachen (`~/Library/Caches/ms-playwright`). Første gang på en ny maskin:
  `npx playwright install chromium`.
- `E2E_LESSON_LIMIT=N` - simuler bare de første N leksjonene i `course`-fasen (rask røyktest).

Resultatene skrives til `e2e/results/<fase>.json` og skjermbilder til `e2e/results/screenshots/`.
Prosessen avslutter med kode 1 hvis noe feilet.

## Hva som er isolert

Hver fase og hvert robusthetsscenario bruker en ny nettleserkontekst med tom lagring. Din egen nettleser og
eksisterende progresjon berøres aldri. Ingen test skriver til prosjektets filer utenom `e2e/results/`.

## Oppbygging

- `lib/env.mjs` - adresse, nettleseroppstart og kursdata (brukes bare til å vite hva som er riktig svar og hva som skal vises).
- `lib/ui.mjs` - hjelpere som bruker roller og tilgjengelige navn; samler konsollfeil, sidefeil og mislykkede forespørsler.
- `lib/lessonChecks.mjs` - kontroller av én leksjon (seksjoner, kode, oppgaver, praktisk oppgave, mål, navigasjon).
- `lib/questionFlow.mjs` - oppgaveflyten: feil, feil, vis fasit, riktig (assistert), ny runde, riktig (mestret).
- `phases/*.mjs` - de fire fasene.

Selektorer bruker i all hovedsak roller og tilgjengelige navn (`getByRole`). Unntak, bevisst: `.goal-status`
(målstatus), `figure pre code` (telling av kodeblokker) og `.app[data-theme]` (aktivt tema), fordi de ikke har egne roller.

## Begrensninger

- Praktiske programmeringsoppgaver vurderes ikke av EduPlan, og simuleringen kontrollerer bare at de vises.
- Testene forutsetter at kursdata i `src/content` er sannhetskilden for riktige svar og hint.
- Kontrastmålingen er en egen enkel beregning (WCAG AA 4,5:1 / 3:1 for stor tekst) og erstatter ikke et fullt tilgjengelighetsverktøy.

## Regresjoner fra studentrapporten

`node e2e/run.mjs findings` kjører målrettede kontroller av sammenfoldbare modulmål, alle 266 mål, Enter/Space/Tab, fokus, mobilhøyde, tekstkontrast og fargepar for kontrollgrenser og fokus i begge temaer. Fasen inngår også i `npm run e2e`. De fem korrigerte leksjonene åpnes. De faktiske undervisningseksemplene for validering, lagringshook med adapter og GoalForm kjøres isolert i Chromium. En bevisst fjernet valideringsretur kontrollerer at feilmeldingen fortsatt vises mens callback-kontrollen avslører feilen. Bare betrodd undervisningskode kompileres i minnet; ingen studentkode kjøres og ingen kildefiler opprettes.

Dashboardkontrollen leser også mål i lukkede grupper. Kontrastavvik på sider i views-fasen gir nå testfeil, slik avvik i oppgavetilstander allerede gjorde.
