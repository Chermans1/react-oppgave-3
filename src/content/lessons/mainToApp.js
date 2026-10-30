export const mainToAppLesson = {
  id: "fra-main-til-app",
  title: "Fra main.jsx til App",
  status: "available",
  learningObjectives: [
    { id: "html-entry", description: "Forklare rollen til index.html i en Vite/React-applikasjon.", exerciseIds: ["html-entry-role"] },
    { id: "react-startup", description: "Forklare hvordan main.jsx starter React-applikasjonen.", exerciseIds: ["create-root-target"] },
    { id: "app-root-component", description: "Forklare hvordan App.jsx brukes som rotkomponent.", exerciseIds: ["app-component-binding"] },
    { id: "import-export-usage", description: "Følge sammenhengen mellom eksport, import og komponentbruk.", exerciseIds: ["welcome-import-path", "app-component-binding"] },
  ],
  content: [],
  codeExamples: [],
  sections: [
    {
      id: "prosjektfiler", title: "Fra prosjektfiler til nettside", stage: "Introduksjon",
      blocks: [
        { type: "paragraph", text: "Du har lært å definere og bruke komponenter. Nå følger vi veien fra prosjektfilene til det som vises i nettleseren. Filnavnene har ulike roller; de er ikke fire forskjellige måter å starte React på." },
        { type: "code", title: "En enkel prosjektstruktur", language: "text", code: 'src/\n├── main.jsx\n├── App.jsx\n└── components/\n    └── Welcome.jsx\n\nindex.html', notes: [
          { term: "index.html", text: "HTML-dokumentet nettleseren starter med. Her finnes elementet React skal kobles til og henvisningen til startfilen." },
          { term: "src/main.jsx", text: "Startfilen som kobler React til HTML-elementet og ber React vise App." },
          { term: "src/App.jsx", text: "Definerer rotkomponenten for denne appen: komponenten vi gir til React ved oppstart." },
          { term: "src/components/Welcome.jsx", text: "Definerer en mindre komponent som App kan bruke. Den trenger ikke å kjenne til oppstartskoden." },
        ] },
        { type: "paragraph", text: "En filsti forteller hvor en fil ligger. src er en mappe, og components er en undermappe. Filendingen .jsx brukes her for JavaScript-filer som kan inneholde JSX." },
      ],
    },
    {
      id: "index-html", title: "index.html", stage: "Forklaring",
      blocks: [
        { type: "paragraph", text: "index.html er utgangspunktet for siden i dette Vite-prosjektet. Nettleseren leser HTML-dokumentet. Inne i body legger vi et tomt element med en id som startkoden kan finne." },
        { type: "code", title: "Elementet React skal kobles til", language: "html", code: '<div id="root"></div>', notes: [
          { term: 'id="root"', text: "Gir elementet et navn som JavaScript kan slå opp. root er en vanlig navnekonvensjon, ikke et magisk ord. Navnet i HTML og oppstartskoden må være likt." },
        ] },
        { type: "code", title: "Et lite index.html for Vite", language: "html", code: '<!doctype html>\n<html lang="nb">\n  <head>\n    <meta charset="UTF-8" />\n    <title>Skoleplattform</title>\n  </head>\n  <body>\n    <div id="root"></div>\n    <script type="module" src="/src/main.jsx"></script>\n  </body>\n</html>', notes: [
          { term: '<script type="module" …>', text: "Henviser til main.jsx som startfil. module gjør at filen kan bruke import. Vite behandler prosjektfilene, inkludert JSX, før nettleseren bruker koden. Eksemplet forutsetter at prosjektet kjøres med Vite." },
        ] },
        { type: "paragraph", text: "Det tomme div-elementet viser ikke noe alene. React skal senere vise appens innhold inne i dette elementet. index.html bestemmer dokumentets ramme; App beskriver innholdet vi vil vise med React." },
        { type: "exercises", exerciseIds: ["html-entry-role"] },
      ],
    },
    {
      id: "main-jsx", title: "main.jsx", stage: "Forklaring",
      blocks: [
        { type: "paragraph", text: "main.jsx finner HTML-elementet, oppretter en React-rot og ber React vise App. DOM er nettleserens representasjon av HTML-elementene. Her bruker vi document.getElementById for å finne ett slikt element." },
        { type: "code", title: "Start React i main.jsx", language: "jsx", code: 'import { createRoot } from "react-dom/client";\nimport App from "./App.jsx";\n\nconst container = document.getElementById("root");\nconst root = createRoot(container);\n\nroot.render(<App />);', notes: [
          { term: 'import { createRoot } from "react-dom/client"', text: "Henter React-verktøyet som kan opprette en rot i et DOM-element. Dette er bibliotekets importform; du trenger ikke lære flere eksportformer for egne komponenter nå." },
          { term: 'import App from "./App.jsx"', text: "Gjør komponenten fra App.jsx tilgjengelig i denne filen. ./ betyr at filstien starter i samme mappe som main.jsx." },
          { term: 'document.getElementById("root")', text: "Henter det eksisterende elementet med id root fra index.html. Strengen må passe med id-en i HTML." },
          { term: "createRoot(container)", text: "Oppretter en React-rot knyttet til elementet. Den oppretter ikke en ny div eller en ny App-komponent." },
          { term: "root.render(<App />)", text: "Ber React vise App i roten vi opprettet. Her brukes App som en komponent i JSX." },
        ] },
        { type: "paragraph", text: "I mange Vite-prosjekter er App også omgitt av StrictMode. Det gir ekstra kontroller under utvikling. Vi har utelatt det i dette lille eksemplet for å gjøre oppstartskjeden tydelig; du trenger ikke bruke det i oppgavene." },
        { type: "exercises", exerciseIds: ["create-root-target"] },
      ],
    },
    {
      id: "app-jsx", title: "App.jsx", stage: "Eksempler",
      blocks: [
        { type: "paragraph", text: "App er rotkomponenten fordi startkoden vår gir <App /> til React. Navnet App er en konvensjon; det er bruken i main.jsx som gir komponenten denne rollen. Inne i App setter vi sammen mindre komponenter." },
        { type: "code", title: "Sett sammen siden i App.jsx", language: "jsx", code: 'import Welcome from "./components/Welcome.jsx";\n\nfunction App() {\n  return (\n    <main>\n      <Welcome />\n      <p>Velg et kurs for å komme i gang.</p>\n    </main>\n  );\n}\n\nexport default App;', notes: [
          { term: "<Welcome />", text: "Plasserer Welcome sitt innhold i grensesnittet. Dette er komponentbruk, slik du lærte i forrige leksjon." },
          { term: "export default App", text: "Gjør App tilgjengelig som filens standardeksport, slik at main.jsx kan importere den." },
        ] },
        { type: "paragraph", text: "La Welcome vise overskriften «Velkommen til skoleplattformen!». Da gir App denne overskriften etterfulgt av avsnittet som er skrevet direkte i App." },
        { type: "preview", caption: "Resultatet fra App når Welcome viser velkomstoverskriften", nodes: [
          { tag: "main", children: [{ tag: "h1", text: "Velkommen til skoleplattformen!" }, { tag: "p", text: "Velg et kurs for å komme i gang." }] },
        ] },
      ],
    },
    {
      id: "import-eksport", title: "Import og eksport", stage: "Eksempler",
      blocks: [
        { type: "paragraph", text: "Når komponenter ligger i forskjellige filer, må de kobles sammen. Eksport gjør noe tilgjengelig fra én fil. Import gjør det tilgjengelig i en annen fil. I eksemplene våre har hver komponentfil én standardeksport, skrevet med export default." },
        { type: "code", title: "components/Welcome.jsx: definer og eksporter", language: "jsx", code: 'function Welcome() {\n  return <h1>Velkommen til skoleplattformen!</h1>;\n}\n\nexport default Welcome;', notes: [
          { term: "export default Welcome", text: "Eksporterer komponenten som standardverdien fra denne filen. Det gjør ikke at den vises automatisk." },
        ] },
        { type: "code", title: "App.jsx: importer og bruk", language: "jsx", code: 'import Welcome from "./components/Welcome.jsx";\n\nfunction App() {\n  return <Welcome />;\n}\n\nexport default App;', notes: [
          { term: "import Welcome from …", text: "Gjør komponenten tilgjengelig under navnet Welcome i App.jsx. Filstien peker fra App.jsx til filen som eksporterer komponenten." },
          { term: "<Welcome />", text: "Bruker det importerte navnet i JSX. Import alene viser ikke noe på siden. Navnet som brukes i JSX må vise til en komponent som finnes i filen." },
        ] },
        { type: "paragraph", text: "Les en relativ filsti fra filen som importerer: ./ betyr samme mappe, og ../ betyr én mappe opp. Deretter følger eventuelle undermapper og filnavnet. I oppgaven ligger Welcome i en annen mappe enn i eksemplet; følg oppgavens egen prosjektstruktur." },
        { type: "exercises", exerciseIds: ["welcome-import-path"] },
      ],
    },
    {
      id: "praktiske-oppgaver", title: "Praktiske oppgaver", stage: "Oppgaver",
      blocks: [
        { type: "paragraph", text: "Du har allerede øvd på HTML-filen, oppstarten og en import underveis. Nå setter du kunnskapen sammen og undersøker en annen komponentkobling. Du kan gå tilbake til tidligere seksjoner og prøve alle oppgavene flere ganger." },
        { type: "code", title: "Følg oppstartskjeden", language: "text", code: 'index.html\n  → laster main.jsx\n    → kobler React til HTML-elementet\n      → viser App\n        → bruker mindre komponenter' },
        { type: "exercises", exerciseIds: ["app-component-binding"] },
      ],
    },
    {
      id: "oppsummering", title: "Oppsummering", stage: "Oppsummering",
      blocks: [
        { type: "list", items: [
          "index.html gir nettleseren dokumentet, et element for React og henvisningen til startfilen.",
          "main.jsx finner HTML-elementet, oppretter React-roten og ber React vise App.",
          "App er rotkomponenten i dette prosjektet og setter sammen andre komponenter.",
          "export default gjør en komponent tilgjengelig fra en fil. import henter den inn i en annen fil.",
          "Komponenten vises først når den brukes i JSX som React rendrer. En riktig filsti og et tilgjengelig komponentnavn er begge nødvendige.",
        ] },
        { type: "goals", title: "Kursmål og mestring" },
        { type: "progress" },
      ],
    },
  ],
  exercises: [
    {
      id: "html-entry-role", type: "MultipleChoiceQuestion", title: "HTML-rammen for et bibliotek", skill: "Begrepsforståelse",
      prompt: "Et Vite-prosjekt for et bibliotek har denne index.html-filen. Hva er filens rolle?",
      code: '<body>\n  <div id="library"></div>\n  <script type="module" src="/src/main.jsx"></script>\n</body>',
      options: [
        { id: "document-entry", text: "Den gir nettleseren HTML-rammen, et element for React og en henvisning til startfilen." },
        { id: "defines-component", text: "Den definerer App som en JavaScript-komponent." },
        { id: "imports-all", text: "Den importerer automatisk alle komponentene i src-mappen." },
      ],
      correctAnswer: "document-entry",
      explanation: "index.html er dokumentet nettleseren leser. Elementet med id library er tilgjengelig for React-startkoden, og script-taggen henviser til main.jsx. App defineres i en komponentfil; andre komponenter må importeres der de brukes.",
    },
    {
      id: "create-root-target", type: "MultipleChoiceQuestion", title: "Hvor kobles React til?", skill: "Følg oppstartskoden",
      prompt: "En tegneapp bruker dette HTML-elementet og denne startkoden. Hva er createRoot koblet til?",
      code: '// index.html\n<div id="workspace"></div>\n\n// main.jsx (importene er utelatt)\nconst element = document.getElementById("workspace");\nconst root = createRoot(element);\nroot.render(<App />);',
      options: [
        { id: "app-file", text: "App.jsx-filen på disken." },
        { id: "dom-element", text: "Det eksisterende div-elementet med id workspace i nettleserens DOM." },
        { id: "whole-document", text: "Alle elementene i HTML-dokumentet samtidig." },
      ],
      correctAnswer: "dom-element",
      explanation: "getElementById henter DOM-elementet med id workspace. Dette elementet sendes til createRoot. Deretter ber render React vise App inne i roten. Filen App.jsx er kildekode, mens div-elementet er stedet innholdet vises.",
    },
    {
      id: "welcome-import-path", type: "FillInCodeQuestion", title: "Finn filstien til Welcome", skill: "Anvendelse",
      prompt: "I dette prosjektet ligger App.jsx direkte i src, mens Welcome.jsx ligger i src/messages. Fullfør importen. Skriv bare den relative filstien, uten anførselstegn. Du kan ta med eller utelate .jsx.",
      code: '// Prosjektstruktur:\n// src/App.jsx\n// src/messages/Welcome.jsx\n\n// src/App.jsx:\nimport Welcome from "___";\n\nexport default function App() {\n  return <Welcome />;\n}',
      validAnswers: ["./messages/Welcome.jsx", "./messages/Welcome"], whitespace: "trim",
      explanation: "App.jsx ligger i src. Fra den filen går ./messages/Welcome.jsx inn i messages-mappen og videre til Welcome.jsx. ./messages/Welcome godtas også i dette Vite-prosjektet. Importen gjør Welcome tilgjengelig; <Welcome /> bruker den i visningen.",
    },
    {
      id: "app-component-binding", type: "FindTheBugQuestion", title: "Koble App til StudyTip", skill: "Feilsøking",
      prompt: "StudyTip.jsx standardeksporterer en fungerende komponent. Importstien under er riktig. Hvilken endring i App.jsx retter komponentkoblingen?",
      code: 'import StudyTip from "./StudyTip.jsx";\n\nfunction App() {\n  return <StudyTips />;\n}\n\nexport default App;',
      options: [
        { id: "use-imported-name", text: "Endre <StudyTips /> til <StudyTip />, slik at JSX bruker det importerte navnet." },
        { id: "remove-import", text: "Fjern importlinjen; komponenter fra andre filer finnes automatisk." },
        { id: "lowercase-tag", text: "Endre <StudyTips /> til <studytips /> for å bruke den importerte komponenten." },
      ],
      correctAnswer: "use-imported-name",
      explanation: "Importen gjør navnet StudyTip tilgjengelig i App.jsx. StudyTips med ekstra s er et annet navn og er ikke definert her. <StudyTip /> bruker den importerte komponenten. Å fjerne importen eller skrive navnet med liten forbokstav kobler ikke til komponenten.",
    },
  ],
};
