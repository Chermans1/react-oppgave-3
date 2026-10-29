# EduPlan – Læringsplattform

En modulbasert React-plattform med kurs, moduler og planlagte leksjoner.
Den opprinnelige læringsmål-appen er bevart på dashboardet, med
progresjonsindikator og lys/mørk modus. Laget med JavaScript, JSX,
vanlig CSS, Context API og React Router.

## Kjør lokalt

```sh
npm install
npm run dev
```

Åpne adressen Vite viser i terminalen.

```sh
npm run build
npm run lint
```

## Filstruktur

- `src/context/TodoContext.js`: oppretter TodoContext med createContext.
- `src/context/TodoProvider.jsx`: håndterer todos med useState og deler addTodo, toggleTodo og removeTodo.
- `src/context/ThemeContext.js`: oppretter ThemeContext med createContext.
- `src/context/ThemeProvider.jsx`: håndterer theme med useState og deler toggleTheme. Starttemaet er light.
- `src/components/AddTodo.jsx`: skjema med lokalt input-state. Henter addTodo med useContext og tømmer feltet etter innsending.
- `src/components/TodoList.jsx`: henter todos og handlingene med useContext. Viser listen med map, checkboxer og sletteknapper.
- `src/components/Progress.jsx`: henter todos med useContext og beregner antall fullførte mål og prosent.
- `src/components/ThemeSwitcher.jsx`: henter theme og toggleTheme med useContext.
- `src/App.jsx`: felles layout, navigasjon og ruter, pakket inn i begge providerne.
- `src/pages/Dashboard.jsx`: den opprinnelige læringsmål-visningen og kurskort.
- `src/pages/`: kursoversikt, kursdetaljer, moduler, leksjon og ikke-funnet-side.
- `src/components/LessonView.jsx`: gjenbrukbar visning av leksjonsdata.
- `src/content/`: kursregister, React-kursplan og navigasjonshjelpere.
- `src/App.css`: responsivt design og CSS-variabler for begge temaene.
- `src/index.css`: grunnleggende stiler og tastaturfokus.
- `index.html`: norsk sidespråk, beskrivelse og sidetittel.
- `public/favicon.svg`: EduPlan-ikon til nettleserfanen.

## Hvordan Context API brukes

createContext oppretter en context. Provideren bruker useState til å holde
state og sender state og funksjoner til komponentene gjennom value.
Komponentene leser det de trenger direkte med useContext, uten at App må
sende todos eller theme videre som props. children brukes til å plassere
innholdet inne i providerne.

TodoProvider oppdaterer alltid state uten å endre det eksisterende arrayet:
spread legger til et mål, map bytter done på riktig mål, og filter sletter
målet med riktig id. Hvert mål har formen `{ id: number, text: string, done: boolean }`.

ThemeProvider bytter mellom light og dark. LearningGoals leser temaet og
setter data-theme, som CSS bruker til å velge farger.

Mål og tema ligger bare i React-state og tilbakestilles ved oppdatering av siden.

## Manuell kontroll

1. Sjekk at appen starter med lyst tema, tom liste og 0 av 0 fullført.
2. Legg til to læringsmål, ett med knappen og ett med Enter. Feltet skal tømmes etter hvert mål.
3. Prøv å skrive bare mellomrom. Dette skal ikke kunne legges til.
4. Kryss av ett mål. Progresjonen skal vise 1 av 2 og 50 prosent.
5. Fjern avkryssingen. Progresjonen skal gå tilbake til 0 prosent.
6. Fullfør begge målene. Progresjonen skal vise 100 prosent.
7. Slett et mål med X. Listen og progresjonen skal oppdateres.
8. Slett det siste målet. Tomtilstanden og 0 av 0 skal vises igjen.
9. Bytt tema to ganger. Teksten og fargene skal følge valgt tema, og målene skal bevares under temabytte.
10. Test smal skjerm og tastaturnavigasjon med Tab, Enter og mellomrom.


## Kursstruktur og navigasjon

React-kurset inneholder 14 moduler (modul 0–13 i kursplanen) og 65
leksjoner. Grensesnittet nummererer modulene fra 1 til 14. Leksjonen «Hva er en
React-komponent?» har nå tre interaktive demonstrasjonsoppgaver; resten er
fortsatt planlagt.
Se `src/content/README.md` for dataformatet.

Ruter inne i HashRouter:

- `/`: dashboard med læringsmål og kurskort.
- `/kurs`: kursoversikt.
- `/kurs/:courseId`: kursdetaljer.
- `/kurs/:courseId/moduler`: alle moduler med leksjoner.
- `/kurs/:courseId/moduler/:moduleId`: én modul med leksjoner.
- `/kurs/:courseId/moduler/:moduleId/leksjoner/:lessonId`: leksjonsvisning.
- Ugyldige adresser og ukjente ID-er viser en ikke-funnet-side.

HashRouter holder rutene etter `#`, slik at direkte lenker og sideoppdatering
fungerer på statisk hosting uten nye serverregler. Vites eksisterende `base`
og GitHub Pages-skriptene er beholdt. Ingen deploy utføres som del av utviklingen.
Tema og personlige læringsmål bevares under navigasjon, men nullstilles ved
sideoppdatering. Leksjonsprogresjon lagres separat i localStorage.

## Manuell kontroll av kursplattformen

1. Åpne kursoversikten fra dashboardet og velg React-kurset.
2. Kontroller at kurset har 14 moduler og 65 leksjoner.
3. Åpne moduloversikten, velg en modul og åpne en leksjon.
4. Kontroller plassholderne og forrige/neste, også over modulgrenser.
5. Kontroller første og siste leksjon, brødsmuler og nettleserens tilbakeknapp.
6. Oppdater siden på en direkte leksjonslenke og prøv en ugyldig ID.
7. Bytt tema og legg til et læringsmål. Naviger til kurset og tilbake;
   temaet og læringsmålet skal være bevart.
8. Kontroller mobilbredde, tastaturfokus og lenken «Hopp til innhold».


## Interaktive oppgaver

I modul «JSX og komponenter» finnes leksjonen «Hva er en React-komponent?».
Den bruker den eksisterende ID-en `funksjonskomponenter`, så gamle lenker virker.

Oppgavemotoren støtter flervalg, utfylling av ett kodeuttrykk og feilfinning
med svaralternativer. Oppgavene defineres som data i `src/content/lessons/`.
Ingen innsendt kode kjøres, og ingen editor- eller andre avhengigheter er lagt til.

Leksjonsprogresjonen skiller mellom gjennomgått, besvart, riktig og mestret.
Mestring krever gjennomgått-markering og riktig siste svar på alle oppgaver.
localStorage inneholder kun status og antall forsøk, uten svartekst eller fasit.
Se `src/content/README.md` for dataformat, lagring og utvidelse.

Kjør de automatiserte testene uten ekstra testavhengigheter:

```sh
node --test tests/*.test.js
npm run build
npm run lint
```

Manuell kontroll av oppgavene:

1. Åpne eksempelleksjonen og kontroller at den ikke automatisk er gjennomgått.
2. Send inn feil og riktig svar på hver oppgave. Forklaring skal vises etter innsending.
3. Prøv `  courseName  ` som gyldig kodeutfylling, og `course Name` som ugyldig.
4. Fullfør alle oppgavene riktig og marker leksjonen som gjennomgått.
5. Oppdater siden: resultat, antall forsøk og mestring skal være bevart.
6. Send inn et feil svar etter mestring: status skal nå vise at leksjonen ikke er mestret.
7. Test radioknapper, tekstfelt, innsending og navigasjon på mobil og i begge temaer.


De tre eksempeloppgavene er uavhengige: begrepsforståelse med et kalenderkort,
variabelbruk i `CourseBadge` og feilsøking av nøstede JSX-tagger i `Notice`.
Oppgavenummer, ferdighet og oppgavetype vises separat fra tittelen.
Oppgavene kan fortsatt leses og løses i valgfri rekkefølge. Fasit og forklaring
vises først etter innsending på den aktuelle oppgaven, også når annen
oppgaveprogresjon allerede er lagret.
