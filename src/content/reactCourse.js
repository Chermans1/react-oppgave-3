import { jsxRulesLesson } from "./lessons/jsxRules.js";
import { mainToAppLesson } from "./lessons/mainToApp.js";
import { reactComponentsLesson } from "./lessons/reactComponents.js";

// Stable IDs keep links valid when titles or the order of modules change.
const modulePlans = [
  {
    id: "javascript-grunnlag",
    title: "JavaScript-grunnlaget for React",
    description: "Bli trygg på JavaScript-teknikkene som brukes i React.",
    lessons: [
      ["moduler-funksjoner", "Moduler og funksjoner"],
      ["objekter-spread", "Objekter, destrukturering og spread"],
      ["lister-immutabilitet", "Map, filter og immutable oppdateringer"],
      ["asynkron-javascript", "Promises og async/await"],
    ],
  },
  {
    id: "jsx-komponenter",
    title: "JSX og komponenter",
    description: "Forstå hvordan React bygger en visning av små komponenter.",
    lessons: [
      ["funksjonskomponenter", "Hva er en React-komponent?"],
      ["fra-main-til-app", "Fra main.jsx til App"],
      ["jsx-regler", "JSX-regler og uttrykk"],
      ["fragmenter-komponenttraer", "Fragmenter og komponenttrær"],
    ],
  },
  {
    id: "props-komposisjon",
    title: "Props, komposisjon og lister",
    description: "Lag gjenbrukbare komponenter med data og tydelig dataflyt.",
    lessons: [
      ["dataflyt-props", "Dataflyt med props"],
      ["destrukturering-spread", "Destrukturering og spread i props"],
      ["children", "Komposisjon med children"],
      ["lister-nokler", "Lister og stabile nøkler"],
    ],
  },
  {
    id: "styling-tilgjengelighet",
    title: "Styling og tilgjengelige komponenter",
    description: "Bygg responsive og tilgjengelige visninger med en ryddig stylingstrategi.",
    lessons: [
      ["css-modules", "Vanlig CSS og CSS Modules"],
      ["inline-layout", "Inline styles og layoutkomposisjon"],
      ["responsivitet", "Responsivt oppsett"],
      ["tastatur-labels", "Labels, knapper og tastaturfokus"],
      ["tailwind", "Valgfritt: introduksjon til Tailwind"],
    ],
  },
  {
    id: "state-hendelser",
    title: "State og hendelser",
    description: "Gjør visningen interaktiv og forstå hvordan state påvirker rendering.",
    lessons: [
      ["usestate", "State med useState"],
      ["hendelser", "Hendelsesbehandlere"],
      ["betinget-rendering", "Betinget rendering"],
      ["state-rendering", "State som øyeblikksbilde"],
      ["oppdateringer-batching", "Funksjonelle oppdateringer og batching"],
    ],
  },
  {
    id: "skjemaer-samarbeid",
    title: "Skjemaer og samarbeid mellom komponenter",
    description: "La skjemaer og lister samarbeide gjennom props og delt state.",
    lessons: [
      ["kontrollerte-felt", "Kontrollerte felt og onSubmit"],
      ["validering", "Input-state og validering"],
      ["loftet-state", "Løftet state og callbacks"],
      ["listeoppdateringer", "Opprette, redigere, fullføre og slette"],
    ],
  },
  {
    id: "effekter-api",
    title: "Effekter og API-henting",
    description: "Synkroniser med eksterne systemer og håndter asynkrone data robust.",
    lessons: [
      ["hendelse-effekt", "Hendelse kontra effekt"],
      ["avhengigheter-cleanup", "Avhengigheter og cleanup"],
      ["fetch-http", "Fetch og HTTP-status"],
      ["last-feil-tomt", "Laste-, feil- og tomtilstand"],
      ["utdaterte-svar", "Utdaterte svar og avbryting"],
      ["strictmode", "Effekter i StrictMode"],
    ],
  },
  {
    id: "egne-hooks",
    title: "Egne hooks og lokal lagring",
    description: "Gjenbruk logikk og bevar data mellom sideoppdateringer.",
    lessons: [
      ["hook-regler", "Hook-regler og gjenbruk av logikk"],
      ["lazy-state", "Lazy initialisering av state"],
      ["localstorage", "useLocalStorage og JSON-feil"],
      ["debouncing", "Debouncing med egne hooks"],
    ],
  },
  {
    id: "context-state",
    title: "Context og organisering av state",
    description: "Organiser delt state og velg mellom props, Context og reducer.",
    lessons: [
      ["props-context", "Props kontra Context"],
      ["provider-consumer", "Provider og consumer"],
      ["context-hooks", "Separate Context-er og egne hooks"],
      ["avledede-verdier", "Avledede verdier"],
      ["reducer-actions", "useReducer og actions"],
    ],
  },
  {
    id: "routing",
    title: "Routing og URL som state",
    description: "Lag delbare adresser og navigasjon mellom kurs og leksjoner.",
    lessons: [
      ["router-layout", "Router, layout og Outlet"],
      ["lenker-parametere", "Link og dynamiske parametere"],
      ["sokeparametere", "Søkeparametere og URL-state"],
      ["navigasjon-feilruter", "Navigasjon og ukjente adresser"],
    ],
  },
  {
    id: "serverdata",
    title: "Serverdata med TanStack Query",
    description: "Skill serverdata fra klientstate og håndter henting og caching.",
    lessons: [
      ["klient-server", "Klientstate kontra serverstate"],
      ["api-axios", "API-lag og Axios"],
      ["queries-cache", "Query keys, enabled og staleTime"],
      ["mutasjoner", "Mutasjoner og invalidering"],
      ["paginering", "Paginering"],
    ],
  },
  {
    id: "testing",
    title: "Testing og feilsøking",
    description: "Test brukeradferd og finn årsaken til feil i dataflyt og visning.",
    lessons: [
      ["brukeradferd", "Tester av brukeradferd"],
      ["komponent-integrasjon", "Komponent- og integrasjonstester"],
      ["simulert-nettverk", "Simulert nettverk"],
      ["selektorer", "Tilgjengelige selektorer"],
      ["devtools", "Feilsøking med React DevTools"],
    ],
  },
  {
    id: "robusthet",
    title: "Robusthet, ytelse og TypeScript",
    description: "Bygg robuste visninger og bli kjent med måling og typesikkerhet.",
    lessons: [
      ["refs-fokus", "useRef og fokusstyring"],
      ["dialoger", "Tilgjengelige dialoger"],
      ["error-boundaries", "Error Boundaries"],
      ["lazy-suspense", "Lazy loading og Suspense"],
      ["ytelse", "Ytelsesmåling og målrettet memoization"],
      ["typescript", "Typer for props, state og API-data"],
    ],
  },
  {
    id: "sluttprosjekt",
    title: "Avsluttende prosjekt: interaktiv læringsplattform",
    description: "Planlegg hvordan React-konseptene kan samles i en helhetlig læringsplattform.",
    lessons: [
      ["datamodell", "Datamodell for kurs, moduler og leksjoner"],
      ["state-lagring", "Valg av state og lagring"],
      ["oppgaver-progresjon", "Integrasjon av oppgaver og progresjon"],
      ["testing-publisering", "Testing og publisering"],
    ],
  },
];

const implementedLessons = {
  [reactComponentsLesson.id]: reactComponentsLesson,
  [mainToAppLesson.id]: mainToAppLesson,
  [jsxRulesLesson.id]: jsxRulesLesson,
};

export const reactCourse = {
  id: "react",
  title: "React – fra grunnlag til læringsplattform",
  description: "En stegvis læringsreise fra JavaScript og JSX til routing, serverdata og robuste React-applikasjoner.",
  status: "planned",
  modules: modulePlans.map((module) => ({
    ...module,
    lessons: module.lessons.map(([id, title]) =>
      module.id === "jsx-komponenter" && implementedLessons[id]
        ? implementedLessons[id]
        : {
            id,
            title,
            status: "planned",
            learningObjectives: [],
            content: [],
            codeExamples: [],
            exercises: [],
          },
    ),
  })),
};
