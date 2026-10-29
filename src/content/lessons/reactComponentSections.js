export const reactComponentSections = [
  {
    id: "hvorfor-komponenter",
    title: "Hvorfor trenger vi komponenter?",
    stage: "Introduksjon",
    blocks: [
      { type: "paragraph", text: "Tenk deg en skoleplattform med en logo, navigasjon, en kursliste og informasjon nederst. Hvis alt skrives i én stor komponent, blir det vanskelig å finne frem når siden vokser. Vi kan i stedet dele grensesnittet i mindre deler med tydelige oppgaver." },
      { type: "paragraph", text: "En React-komponent beskriver en del av brukergrensesnittet. Komponenten kan være liten, som et kurskort, eller sette sammen flere andre komponenter til en hel side." },
      {
        type: "componentTree",
        caption: "Et mulig komponenttre for skoleplattformen",
        root: {
          name: "App", description: "Setter sammen skoleplattformen",
          children: [
            { name: "Header", description: "Logo og sidetittel" },
            { name: "Navigation", description: "Lenker mellom sidene" },
            { name: "CourseList", description: "Viser kursene", children: [
              { name: "CourseCard", description: "Ett kurskort" },
              { name: "CourseCard", description: "Et nytt kort av samme type" },
            ] },
            { name: "Footer", description: "Informasjon nederst på siden" },
          ],
        },
      },
      { type: "paragraph", text: "I treet bruker App komponentene under seg. CourseList bruker flere CourseCard-komponenter. Navnene beskriver ansvaret til hver del; dette er én mulig oppdeling, ikke en fast regel for alle apper." },
      { type: "list", items: [
        "Forståelse: Et beskrivende navn gjør det enklere å se hva en del av siden gjør.",
        "Vedlikehold: Når kurskortene skal endres, kan vi endre CourseCard ett sted.",
        "Gjenbruk: Samme komponent kan brukes flere steder, uten å kopiere hele definisjonen.",
      ] },
    ],
  },
  {
    id: "forste-komponent",
    title: "Din første React-komponent",
    stage: "Forklaring",
    blocks: [
      { type: "paragraph", text: "En funksjonskomponent er en JavaScript-funksjon som beskriver hva React skal vise. Denne komponenten viser en velkomstoverskrift." },
      {
        type: "code", title: "Definer Welcome", language: "jsx",
        code: 'function Welcome() {\n  return <h1>Velkommen til React!</h1>;\n}',
        notes: [
          { term: "function Welcome()", text: "Definerer en funksjon med navnet Welcome. Stor forbokstav gjør at React kan skille egne komponenter fra innebygde elementer som h1." },
          { term: "return", text: "Sender beskrivelsen av brukergrensesnittet tilbake fra funksjonen. Når funksjonen har en blokk med klammeparenteser, skriver vi return eksplisitt." },
          { term: "<h1>…</h1>", text: "Er JSX som beskriver en overskrift. JSX ligner HTML, men er en syntaks vi bruker i JavaScript for å beskrive grensesnittet." },
        ],
      },
      { type: "paragraph", text: "JSX-koden er en beskrivelse, ikke tekst som studenten skal se. Når Welcome brukes og React rendrer den, får nettleseren en overskrift med teksten nedenfor." },
      { type: "preview", caption: "Resultat når Welcome vises i nettleseren", nodes: [
        { tag: "h1", text: "Velkommen til React!" },
      ] },
    ],
  },
  {
    id: "bruke-komponenten",
    title: "Hvordan bruker vi komponenten?",
    stage: "Eksempler",
    blocks: [
      { type: "paragraph", text: "Å definere Welcome gjør komponenten tilgjengelig i koden. For å få den med i grensesnittet må en annen komponent bruke den. Her gjør App nettopp det." },
      {
        type: "code", title: "Bruk Welcome i App", language: "jsx",
        code: 'function Welcome() {\n  return <h1>Velkommen til React!</h1>;\n}\n\nfunction App() {\n  return <Welcome />;\n}\n\nexport default App;',
        notes: [
          { term: "function Welcome() { … }", text: "Definisjonen forteller hva Welcome skal vise. Definisjonen alene legger ingen overskrift på siden." },
          { term: "<Welcome />", text: "Bruker komponenten inne i JSX-en til App. Skråstreken avslutter elementet, siden vi ikke plasserer noe innhold mellom en start- og sluttagg her." },
          { term: "export default App", text: "Gjør App tilgjengelig for import fra en annen fil. I prosjektets oppstartskode blir App gitt til React for å vises." },
        ],
      },
      { type: "paragraph", text: "Når React rendrer App, finner den at App bruker Welcome. React leser resultatet fra Welcome og oppretter den tilsvarende overskriften i nettleserens DOM. I JSX bruker vi <Welcome />; vi trenger ikke selv å skrive et vanlig funksjonskall for å vise komponenten." },
      { type: "preview", caption: "App viser innholdet fra Welcome", nodes: [
        { tag: "h1", text: "Velkommen til React!" },
      ] },
    ],
  },
  {
    id: "gjenbruk",
    title: "Gjenbruk av komponenter",
    stage: "Eksempler",
    blocks: [
      { type: "paragraph", text: "Vi kan definere ett kurskort og bruke det flere ganger. Hver bruk av CourseCard gir et eget kort i grensesnittet." },
      {
        type: "code", title: "Én definisjon, tre kurskort", language: "jsx",
        code: 'function CourseCard() {\n  return (\n    <article>\n      <h2>React for nybegynnere</h2>\n      <p>Lær grunnleggende React.</p>\n    </article>\n  );\n}\n\nfunction App() {\n  return (\n    <main>\n      <CourseCard />\n      <CourseCard />\n      <CourseCard />\n    </main>\n  );\n}',
        notes: [
          { term: "CourseCard", text: "Definerer kortets innhold én gang. Parentesene etter return lar oss skrive JSX-en over flere linjer." },
          { term: "Tre <CourseCard />", text: "Bruker samme komponent tre ganger inne i main. Vi kopierer bruken av komponenten, ikke hele definisjonen." },
        ],
      },
      { type: "preview", caption: "Tre like kurskort fra de tre brukene av CourseCard", nodes: [
        { tag: "main", children: [
          { tag: "article", children: [{ tag: "h2", text: "React for nybegynnere" }, { tag: "p", text: "Lær grunnleggende React." }] },
          { tag: "article", children: [{ tag: "h2", text: "React for nybegynnere" }, { tag: "p", text: "Lær grunnleggende React." }] },
          { tag: "article", children: [{ tag: "h2", text: "React for nybegynnere" }, { tag: "p", text: "Lær grunnleggende React." }] },
        ] },
      ] },
      { type: "paragraph", text: "Kortene har identisk innhold fordi teksten står fast i komponenten. Endrer vi teksten i CourseCard, endres alle tre. Senere lærer du props: data som kan sendes inn til samme komponent, slik at kortene kan vise forskjellige kurs." },
    ],
  },
  {
    id: "jsx-regler",
    title: "JSX-regler",
    stage: "Forklaring",
    blocks: [
      { type: "list", items: [
        "Bruk stor forbokstav i egne komponentnavn, som Welcome. Innebygde elementer som h1 og span skrives med liten forbokstav.",
        "Avslutt JSX-elementer korrekt: en starttagg som <section> må ha en passende </section>. Elementer uten innhold kan selvavsluttes, for eksempel <img />. Nøstede elementer må lukkes i riktig rekkefølge.",
        "I denne leksjonen returnerer komponentene gyldig JSX, eller null når de ikke skal vise noe. Flere elementer kan samles under ett element eller et fragment, skrevet <>…</>. React kan også vise andre renderbare verdier, men det tar vi senere.",
        "JavaScript-uttrykk kan brukes i JSX med {}. React leser verdien av uttrykket; klammeparentesene vises ikke som tekst på siden.",
      ] },
      {
        type: "code", title: "Vis en variabel i JSX", language: "jsx",
        code: 'function CourseBadge() {\n  const course = "React";\n\n  return <span>{course}</span>;\n}',
        notes: [
          { term: 'const course = "React"', text: "Lager en lokal variabel. course er navnet, og tekststrengen React er verdien." },
          { term: "{course}", text: "Leser variabelens verdi inne i JSX. Navnet må stemme med variabelen som er definert i akkurat denne komponenten." },
        ],
      },
      { type: "preview", caption: "Variabelens verdi vises som tekst i et span-element", nodes: [{ tag: "span", text: "React" }] },
      { type: "paragraph", text: "I kodeutfyllingsoppgaven møter du en annen variant av CourseBadge. Finn variabelen i den oppgavens kode, og bruk navnet fra akkurat den varianten. Eksemplet her viser fremgangsmåten, ikke uttrykket som skal leveres i oppgaven." },
    ],
  },
  {
    id: "oppgaver",
    title: "Interaktive oppgaver",
    stage: "Oppgaver",
    blocks: [
      { type: "paragraph", text: "Prøv begrepsforståelse, anvendelse og feilsøking. Du kan løse oppgavene i valgfri rekkefølge og gå tilbake til forklaringene underveis. Send inn på hver oppgave for å få vurdering og en begrunnelse. Du kan endre svaret og prøve igjen." },
      { type: "exercises" },
    ],
  },
  {
    id: "oppsummering",
    title: "Oppsummering",
    stage: "Oppsummering",
    blocks: [
      { type: "list", items: [
        "En komponent beskriver en del av brukergrensesnittet, fra et lite kort til en hel side.",
        "Komponenter gir tydelige ansvarsområder og gjør koden lettere å forstå, vedlikeholde og gjenbruke.",
        "En funksjonskomponent defineres som en JavaScript-funksjon med stor forbokstav og returnerer en beskrivelse av grensesnittet.",
        "JSX ligner HTML og brukes i JavaScript til å beskrive det React skal vise. Uttrykk i {} kan hente inn JavaScript-verdier.",
        "Vi bruker en komponent i en annen komponent med JSX, som <Welcome />. React rendrer resultatet i nettleseren.",
        "Samme komponent kan brukes flere ganger. Props vil senere gjøre det mulig å gi hver bruk forskjellige data.",
      ] },
      { type: "goals", title: "Kursmål og mestring" },
      { type: "progress" },
    ],
  },
];
