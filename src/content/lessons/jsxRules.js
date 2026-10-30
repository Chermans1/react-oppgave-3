export const jsxRulesLesson = {
  id: "jsx-regler",
  title: "JSX-regler og uttrykk",
  status: "available",
  learningObjectives: [
    { id: "jsx-expressions", description: "Forutsi resultatet av et enkelt JSX-uttrykk og identifisere en beregnet variabel.", exerciseIds: ["predict-reading-count", "complete-remaining-value"] },
    { id: "text-versus-expression", description: "Skille mellom vanlig tekst og JavaScript-uttrykk i JSX.", exerciseIds: ["predict-reading-count"] },
    { id: "jsx-attributes", description: "Gjenkjenne className som egenskapen for CSS-klasser i JSX.", exerciseIds: ["choose-classname"] },
    { id: "self-closing-elements", description: "Gjenkjenne og rette selvavsluttende JSX-elementer.", exerciseIds: ["fix-nickname-input"] },
    { id: "nested-jsx", description: "Velge en overordnet JSX-struktur som beholder begge søskenelementene.", exerciseIds: ["structure-info-panel"] },
    { id: "combine-js-and-jsx", description: "Identifisere en allerede beregnet lokal variabel som brukes i JSX.", exerciseIds: ["complete-remaining-value"] },
  ],
  content: [],
  codeExamples: [],
  sections: [
    {
      id: "repetisjon", title: "Repetisjon av JSX", stage: "Introduksjon",
      blocks: [
        { type: "paragraph", text: "Du har allerede brukt komponenter og fulgt veien fra main.jsx til App. Nå ser vi nærmere på JSX: syntaksen som ligner HTML og lar oss beskrive grensesnittet i JavaScript. JSX er ikke en tekststreng med HTML." },
        { type: "code", title: "En liten påminnelse", language: "jsx", code: 'function PageTitle() {\n  return <h1>Min studieøkt</h1>;\n}', notes: [
          { term: "<h1>Min studieøkt</h1>", text: "Beskriver en overskrift. Når komponenten brukes og rendres, viser nettleseren teksten, ikke selve taggene." },
        ] },
        { type: "paragraph", text: "I denne leksjonen skriver vi JSX som bruker verdier fra JavaScript, og ser på noen forskjeller fra vanlig HTML. Alt skjer i små komponenter med lokale variabler; vi trenger ingen nye React-verktøy." },
      ],
    },
    {
      id: "javascript-uttrykk", title: "JavaScript-uttrykk", stage: "Forklaring",
      blocks: [
        { type: "paragraph", text: "Tekst mellom JSX-tagger vises som vanlig tekst. Hvis React skal lese en variabel eller regne ut en verdi, skriver vi et JavaScript-uttrykk mellom klammeparenteser: {}. Et uttrykk er noe som gir en verdi, som et variabelnavn eller en enkel utregning." },
        { type: "code", title: "Sammenlign tekst, variabel og utregning", language: "jsx", code: 'function NameExamples() {\n  const firstName = "Sara";\n\n  return (\n    <section>\n      <p>firstName</p>\n      <p>{firstName}</p>\n      <p>{2 + 4}</p>\n    </section>\n  );\n}', notes: [
          { term: "<p>firstName</p>", text: "Viser bokstavene firstName. React slår ikke opp variabler i vanlig JSX-tekst." },
          { term: "<p>{firstName}</p>", text: "Leser variabelens verdi og viser Sara. Klammeparentesene blir ikke synlige på siden." },
          { term: "<p>{2 + 4}</p>", text: "Regner ut summen av tallene og viser resultatet. Du kan blande fast tekst og uttrykk i samme element." },
        ] },
        { type: "preview", caption: "De tre avsnittene vises i samme rekkefølge som i koden", nodes: [{ tag: "section", children: [
          { tag: "p", text: "firstName" }, { tag: "p", text: "Sara" }, { tag: "p", text: "6" },
        ] }] },
        { type: "paragraph", text: "Uttrykk er ikke det samme som hele JavaScript-setninger. Skriv for eksempel const-definisjoner før return, og bruk variabelnavnet inne i JSX. Vi bruker bare variabler og enkle regneuttrykk her." },
        { type: "exercises", exerciseIds: ["predict-reading-count"] },
      ],
    },
    {
      id: "attributter", title: "Attributter i JSX", stage: "Forklaring",
      blocks: [
        { type: "paragraph", text: "HTML-attributter gir elementer ekstra informasjon, som id, en CSS-klasse eller typen tekstfelt. I JSX skriver vi egenskaper på elementene. Mange navn er like HTML, som id, type og placeholder, men noen har et annet navn." },
        { type: "list", items: [
          "HTML class skrives className i JSX. Verdien er navnet på en CSS-klasse, ikke CSS-reglene selv.",
          "HTML for på en label skrives htmlFor i JSX. Verdien må passe med id på feltet labelen beskriver. Koblingen gir feltet et forståelig navn og gjør at et klikk på labelen finner feltet.",
          "Faste tekstverdier settes i anførselstegn. En variabel kan brukes som attributtverdi med {}, på samme måte som uttrykk inne i elementet.",
        ] },
        { type: "code", title: "Et navngitt tekstfelt", language: "jsx", code: 'function CourseSearch() {\n  return (\n    <div>\n      <label className="field-label" htmlFor="course-query">\n        Finn et kurs\n      </label>\n      <input\n        id="course-query"\n        type="text"\n        placeholder="Skriv et kursnavn"\n      />\n    </div>\n  );\n}', notes: [
          { term: 'className="field-label"', text: "Velger CSS-klassen field-label. Klassen bestemmer utseendet når CSS-regelen nedenfor er lastet i prosjektet." },
          { term: 'htmlFor="course-query" og id="course-query"', text: "Kobler labelen og tekstfeltet sammen. htmlFor er ikke navnet på en CSS-klasse." },
          { term: 'type="text" og placeholder="…"', text: "Angir et vanlig tekstfelt og en hjelpetekst. Placeholder erstatter ikke en label." },
        ] },
        { type: "code", title: "CSS for klassen field-label", language: "css", code: '.field-label {\n  display: block;\n  font-weight: 700;\n}' },
        { type: "preview", caption: "En label over et tekstfelt. Feltet i denne statiske forhåndsvisningen er skrivebeskyttet.", nodes: [{ tag: "div", children: [
          { tag: "label", className: "field-label", htmlFor: "course-query", text: "Finn et kurs" },
          { tag: "input", id: "course-query", placeholder: "Skriv et kursnavn" },
        ] }] },
        { type: "paragraph", text: "JSX-egenskaper som består av flere ord bruker ofte stor bokstav inni navnet, som className og htmlFor. Ikke endre alle navn automatisk: tilgjengelighetsattributter som aria-label beholder bindestreken." },
        { type: "exercises", exerciseIds: ["choose-classname"] },
      ],
    },
    {
      id: "selvavsluttende", title: "Selvavsluttende elementer", stage: "Eksempler",
      blocks: [
        { type: "paragraph", text: "Noen HTML-elementer har ikke innhold mellom en start- og sluttagg. Eksempler er img og input. I JSX må også disse avsluttes tydelig med />. Vanlig HTML tillater ofte at skråstreken utelates; JSX gjør ikke det." },
        { type: "code", title: "Feil: img er ikke avsluttet i JSX", language: "jsx", code: 'function Logo() {\n  return <img src="/logo.svg" alt="Skolens logo">;\n}' },
        { type: "code", title: "Riktig: img er selvavsluttende", language: "jsx", code: 'function Logo() {\n  return <img src="/logo.svg" alt="Skolens logo" />;\n}', notes: [
          { term: "/>", text: "Avslutter elementet. img får ingen egen </img>-tagg, og input får ingen </input>-tagg." },
          { term: 'alt="Skolens logo"', text: "Gir bildet en tekstlig beskrivelse. src angir bildeadressen. Her ser vi på syntaksen; bildet forutsetter en faktisk fil." },
        ] },
        { type: "paragraph", text: "Et element som skal inneholde tekst eller andre elementer, som p, bruker derimot en starttagg og en passende sluttagg." },
        { type: "exercises", exerciseIds: ["fix-nickname-input"] },
      ],
    },
    {
      id: "nosting", title: "Nøsting og struktur", stage: "Eksempler",
      blocks: [
        { type: "paragraph", text: "Nøsting betyr at et element ligger inne i et annet. Lukk det innerste elementet før det ytre, slik at start- og sluttaggene passer sammen. Innrykk hjelper oss å se strukturen." },
        { type: "code", title: "Feil rekkefølge på sluttaggene", language: "jsx", code: '<section>\n  <strong>Viktig</section>\n</strong>' },
        { type: "code", title: "Riktig nøsting", language: "jsx", code: '<section>\n  <strong>Viktig</strong>\n</section>', notes: [
          { term: "strong inne i section", text: "strong åpnes sist og lukkes først. Deretter kan section avsluttes." },
        ] },
        { type: "paragraph", text: "Når vi returnerer flere JSX-elementer sammen i ett uttrykk, samler vi dem her i ett overordnet element. Det overordnede elementet er en del av resultatet i nettleseren. I neste leksjon ser vi på fragmenter, som er et annet alternativ." },
        { type: "code", title: "To avsnitt samlet i en section", language: "jsx", code: 'function StudyPlan() {\n  return (\n    <section>\n      <p>Les et eksempel.</p>\n      <p>Prøv selv.</p>\n    </section>\n  );\n}' },
        { type: "preview", caption: "section inneholder begge avsnittene", nodes: [{ tag: "section", children: [
          { tag: "p", text: "Les et eksempel." }, { tag: "p", text: "Prøv selv." },
        ] }] },
        { type: "exercises", exerciseIds: ["structure-info-panel"] },
      ],
    },
    {
      id: "kombiner", title: "Kombiner JSX og JavaScript", stage: "Anvendelse",
      blocks: [
        { type: "paragraph", text: "JavaScript kan forberede verdiene før return. JSX beskriver hvor verdiene skal vises. Her regner vi ut lengden på en studieøkt med pause. Dynamisk innhold betyr her at resultatet avhenger av variabelverdiene; det endrer seg ikke av seg selv." },
        { type: "code", title: "Beregn først, vis deretter", language: "jsx", code: 'function SessionSummary() {\n  const subject = "JavaScript";\n  const minutes = 20;\n  const breakMinutes = 5;\n  const total = minutes + breakMinutes;\n\n  return (\n    <article>\n      <h2>{subject}</h2>\n      <p>Med pause: {total} minutter</p>\n    </article>\n  );\n}', notes: [
          { term: "const total = minutes + breakMinutes", text: "Regner ut en verdi i vanlig JavaScript før vi beskriver grensesnittet. Uttrykket gir et tall." },
          { term: "{subject} og {total}", text: "Leser verdiene på de stedene i JSX der de skal vises. Navn og tall kan variere uten at strukturen på kortet endres." },
        ] },
        { type: "preview", caption: "Verdiene fra SessionSummary blir tittel og avsnitt", nodes: [{ tag: "article", children: [
          { tag: "h2", text: "JavaScript" }, { tag: "p", text: "Med pause: 25 minutter" },
        ] }] },
        { type: "paragraph", text: "Hvis vi endrer minutes i koden og viser komponenten på nytt, får utregningen et nytt resultat. I oppgaven brukes et annet regnestykke: minus trekker ett tall fra et annet. Les variabeldefinisjonene i akkurat den komponenten før du fyller inn JSX-en." },
        { type: "exercises", exerciseIds: ["complete-remaining-value"] },
      ],
    },
    {
      id: "oppsummering", title: "Oppsummering", stage: "Oppsummering",
      blocks: [
        { type: "list", items: [
          "Vanlig tekst i JSX vises som skrevet. {} ber React bruke verdien av et JavaScript-uttrykk.",
          "Bruk className for CSS-klasser og htmlFor for å koble en label til et felt med samme id.",
          "Elementer uten innhold, som img og input, avsluttes med /> i JSX.",
          "Nøstede elementer må lukkes i riktig rekkefølge. Samle flere elementer under ett overordnet element i eksemplene våre.",
          "Definer og beregn lokale variabler før return, og bruk verdiene i JSX med {}.",
        ] },
        { type: "goals", title: "Kursmål og mestring" },
        { type: "progress" },
      ],
    },
  ],
  exercises: [
    {
      id: "predict-reading-count", type: "MultipleChoiceQuestion", title: "Forutsi antall sider", skill: "Tekst og uttrykk",
      prompt: "Hva viser ReadingCount i nettleseren?",
      code: 'function ReadingCount() {\n  const pages = 4;\n  const extra = 3;\n  return <p>Sider: {pages + extra}</p>;\n}',
      options: [
        { id: "literal", text: "Sider: pages + extra" },
        { id: "sum", text: "Sider: 7" },
        { id: "joined", text: "Sider: 43" },
      ],
      correctAnswer: "sum",
      explanation: "pages og extra er tall. Inne i {} regnes 4 + 3 ut før resultatet vises sammen med teksten Sider:. Derfor blir resultatet Sider: 7. Variabelnavnene vises ikke bokstavelig, og tallene blir ikke satt sammen som tekst her.",
    },
    {
      id: "choose-classname", type: "MultipleChoiceQuestion", title: "Gi et emne en CSS-klasse", skill: "JSX-attributter",
      prompt: "CSS-filen har klassen topic-chip og er lastet. Hvilken linje bruker riktig JSX-egenskap for å koble klassen til teksten Design?",
      options: [
        { id: "html-class", text: '<span class="topic-chip">Design</span>' },
        { id: "label-for", text: '<span htmlFor="topic-chip">Design</span>' },
        { id: "jsx-classname", text: '<span className="topic-chip">Design</span>' },
      ],
      correctAnswer: "jsx-classname",
      explanation: "I JSX bruker vi className for en CSS-klasse. Verdien topic-chip viser til klassen i CSS-filen. htmlFor brukes på label for å koble til et felt, ikke for styling. class er HTML-skrivemåten; className er den riktige JSX-egenskapen vi bruker i React.",
    },
    {
      id: "fix-nickname-input", type: "FindTheBugQuestion", title: "Rett feltet for kallenavn", skill: "Selvavsluttende elementer",
      prompt: "Denne JSX-komponenten har ett element som ikke er avsluttet. Hvilken endring retter feilen?",
      code: 'function NicknameField() {\n  return (\n    <label>\n      Kallenavn\n      <input type="text" name="nickname">\n    </label>\n  );\n}',
      options: [
        { id: "self-close-input", text: 'Avslutt input-elementet med />: <input type="text" name="nickname" />.' },
        { id: "close-label-again", text: "La input stå åpent slik som i vanlig HTML." },
        { id: "rename-component", text: "Fjern den ytre label-sluttaggen slik at input blir ytterst." },
      ],
      correctAnswer: "self-close-input",
      explanation: "input har ikke innhold og må selvavsluttes i JSX. /> avslutter akkurat dette elementet før den ytre labelen lukkes. Vanlig HTML-syntaks med åpen input er ikke tilstrekkelig i JSX. Å fjerne label-sluttaggen gir også feil struktur.",
    },
    {
      id: "structure-info-panel", type: "MultipleChoiceQuestion", title: "Samle informasjonen", skill: "Nøsting og struktur",
      prompt: "InfoPanel skal vise både en overskrift og et avsnitt. Hvilken endring gir gyldig JSX og beholder begge elementene i samme return-uttrykk?",
      code: 'function InfoPanel() {\n  return (\n    <h2>Åpningstider</h2>\n    <p>Mandag til fredag</p>\n  );\n}',
      options: [
        { id: "semicolon", text: "Sett semikolon mellom h2 og p inne i parentesene." },
        { id: "parent-article", text: "Legg både h2 og p inne i én article med passende sluttagg." },
        { id: "drop-paragraph", text: "Slett avsnittet, selv om begge elementene skal vises." },
      ],
      correctAnswer: "parent-article",
      explanation: "En article kan være det overordnede elementet som samler h2 og p. Begge ligger da inne i ett JSX-uttrykk og vises fortsatt. Et semikolon gjør ikke to JSX-søsken til ett uttrykk, og sletting av avsnittet oppfyller ikke oppgavens krav. Fragmenter er et alternativ vi lærer mer om i neste leksjon.",
    },
    {
      id: "complete-remaining-value", type: "FillInCodeQuestion", title: "Vis antall gjenstående økter", skill: "Kombiner JavaScript og JSX",
      prompt: "StudySessions regner allerede ut hvor mange økter som gjenstår. Fullfør JSX-en ved å skrive bare navnet på den beregnede variabelen, uten klammeparenteser eller anførselstegn.",
      code: 'function StudySessions() {\n  const planned = 8;\n  const completed = 3;\n  const remaining = planned - completed;\n\n  return <p>Gjenstår: {___} økter</p>;\n}',
      validAnswers: ["remaining"], whitespace: "trim",
      explanation: "remaining inneholder resultatet av planned - completed, altså antall økter som gjenstår. Klammeparentesene er allerede på plass. Med {remaining} viser denne komponenten Gjenstår: 5 økter. Å skrive et av de opprinnelige variabelnavnene ville vist en annen verdi.",
    },
  ],
};
