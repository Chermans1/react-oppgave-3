# EduPlan – Læringsmål

React Oppgave 3: Context API og useContext. En enkel app for å legge til,
fullføre og slette læringsmål, med progresjonsindikator og lys/mørk modus.
Laget med JavaScript, JSX og vanlig CSS, uten ekstra avhengigheter.

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
- `src/App.jsx`: pakker innholdet inn i begge providerne og setter sammen siden.
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
