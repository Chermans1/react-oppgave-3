import { practiceApiSource, lessonQueryViewSource } from "../examples/exampleSources.js";
import { code, list, paragraph, section, sequence } from "./extendLesson.js";
export const apiModuleCode = practiceApiSource.slice(practiceApiSource.indexOf("export async function readJson"));
const setup = section("kontrollert-api", "Øv lokalt med et kontrollert API",
  paragraph("Dette oppsettet bruker vanlige Response-objekter og en injisert request-funksjon. Det sender ingen nettverkskall og trenger ingen backend eller nye pakker. Kopier hver navngitte fil til ditt eget Vite-prosjekt. Ikke erstatt window.fetch globalt. Alle komponenter i øvingen bruker samme practice-instans."),
  code("practiceApi.js – komplett simulert transport", practiceApiSource.slice(0, practiceApiSource.indexOf("export async function readJson")), "js"),
  code("api.js – domenekontraktene som brukes videre i kurset", apiModuleCode, "js"),
  code("practice.js – én delt instans i øvingsappen", `import { createPracticeApi } from "./practiceApi.js";
import { getCourses, getLessons, createCourse, getCoursePage } from "./api.js";
export const practice = createPracticeApi();
export const api = {
  getCourses: (options = {}) => getCourses({ ...options, request: practice.request }),
  getLessons: (id, options = {}) => getLessons(id, { ...options, request: practice.request }),
  createCourse: (draft) => createCourse(draft, { request: practice.request }),
  getCoursePage: (page, options = {}) => getCoursePage(page, { ...options, request: practice.request }),
};`, "js"),
  list("GET /api/courses → [{ id: 'react', title: 'React' }, { id: 'css', title: 'CSS' }, { id: 'js', title: 'JavaScript' }].",
    "GET /api/courses/react/lessons → [{ id: 'jsx', title: 'JSX' }]. css gir Grid; js gir []. Ukjent id gir HTTP 404.",
    "GET /api/courses?page=1 → { items: [React, CSS], hasMore: true }. Side 2 inneholder JavaScript og hasMore: false. Sideverdier starter på 1.",
    "POST /api/courses med JSON { title: 'Testing' } → HTTP 201 og et kurs med stabil id. Blank tittel gir HTTP 400. Den neste GET-en inkluderer det nye kurset.",
    "practice.setScenario('success' | 'empty' | 'error' | 'slow') endrer neste forespørsel. empty gir vellykket tom liste, error gir HTTP 503, slow venter 800 ms og kan avbrytes.",
    "Data lever i minnet og nullstilles ved reload. Dette er en kontrollert React-øving, ikke vedvarende serverlagring."),
  code("Kontroller kontrakten før du kobler på UI", `import { api, practice } from "./practice.js";
console.log(await api.getLessons("react"));
practice.setScenario("empty");
console.log(await api.getCourses()); // [] – vellykket, men tomt
practice.setScenario("error");
try { await api.getCourses(); } catch (error) { console.log(error.message); }
practice.setScenario("slow");
const controller = new AbortController();
const pending = api.getLessons("css", { signal: controller.signal });
controller.abort();
try { await pending; } catch (error) { console.log(error.name); }`, "js"),
);
const queryFlow = section("query-arbeidsflyt", "Fra kursvalg til riktig cachepost",
  paragraph("Bruk API-filene fra øvingsoppsettet i fetch-leksjonen. Installer TanStack Query 5 bare i ditt separate øvingsprosjekt hvis det mangler. Koden har én klient, validerer kursvalget før henting og gir både query key og API-funksjon samme id. Feil har en Prøv igjen-handling."),
  code("App.jsx – sammenhengende Query 5-eksempel", `import { useState } from "react";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { api } from "./practice.js";
import LessonQueryResult from "./LessonQueryResult.jsx";
const client = new QueryClient();
function Lessons() {
  const [courseId, setCourseId] = useState("");
  const result = useQuery({
    queryKey: ["lessons", courseId],
    queryFn: ({ signal }) => api.getLessons(courseId, { signal }),
    enabled: Boolean(courseId),
    staleTime: 60_000,
    networkMode: "always", // Øvings-API-et bruker bare minne, ikke nettverk.
  });
  return <main><label>Kurs<select value={courseId} onChange={(e) => setCourseId(e.target.value)}>
    <option value="">Velg</option><option value="react">React</option>
    <option value="css">CSS</option><option value="js">JavaScript</option>
  </select></label><LessonQueryResult courseId={courseId} result={result} /></main>;
}
export default function App() {
  return <QueryClientProvider client={client}><Lessons /></QueryClientProvider>;
}`),
  code("LessonQueryResult.jsx – alle datatilstander før listevisning", lessonQueryViewSource),
  paragraph("networkMode: always passer dette minnebaserte øvings-API-et, som ikke trenger nettforbindelse. Med et ekte HTTP-API beholder du normalt standardmodusen online. Visningen håndterer derfor også isPaused: uten data vises en ventemelding, mens tidligere data beholdes ved pauset oppfrisking. isPending beskriver at et første resultat mangler; isLoading beskriver aktiv første henting. Ingen av grenene gjør en feil om til en vellykket tom liste."),
  sequence("To cacheposter og en oppfrisking", [["Velg React", "Nøkkel ['lessons', 'react'] henter /api/courses/react/lessons. Resultatet er JSX."], ["Velg CSS", "Nøkkel ['lessons', 'css'] henter et annet datasett. Resultatet er Grid."], ["Tilbake innen 60 s", "React-data kan brukes fra egen fersk cachepost uten nytt automatisk kall."], ["Trykk Oppfrisk", "Eksisterende data blir stående mens isFetching viser bakgrunnsarbeid. En feil skal ikke forveksles med tom liste."]]),
);
export const workshops = {
  "fetch-http": { sections: [setup], practice: { description: "Opprett øvings-API-et og en React-visning som henter kurs gjennom api.getCourses. Behold HTTP-kontroll og validering i API-laget.", startpoint: "Opprett practiceApi.js, api.js og practice.js fra de komplette eksemplene. Begynn med konsollkontrollen før du bygger React-visningen. Ingen backend kreves.", checks: ["getLessons('react') gir JSX og getLessons('css') gir Grid.", "Bytt mellom success, empty og error før et nytt kall; bekreft data, [] og avvist Promise hver for seg.", "Aborter et slow-kall: feilen skal ha name AbortError."], extensions: ["Bytt den injiserte transporten mot et dokumentert ekte GET-API; behold datavalideringen."] } },
  "last-feil-tomt": { sections: [section("api-tilstander", "Gjør lastetilstandene observerbare", paragraph("Bruk practiceApi.js, api.js og practice.js fra forrige leksjon. Kall api.getCourses i effekten. Sett scenario før ny henting, og håndter abort separat fra feil som brukeren skal se."), sequence("Samme handling med tre ulike svar", [["Start", "status=loading; forrige feilmelding nullstilles."], ["success", "Et gyldig svar gir en liste."], ["empty", "HTTP 200 og [] gir Ingen kurs, ikke feil."], ["error", "HTTP 503 avviser API-funksjonen. Vis feil og en knapp for nytt forsøk."]]))], practice: { startpoint: "Fortsett fra det kontrollerte øvingsoppsettet i fetch-http. Bruk api.getCourses({ signal }).", checks: ["slow gjør lasting synlig før resultatet kommer.", "empty viser en tomtilstand, error viser en feiltilstand.", "Bytt fra error til success og bruk Prøv igjen uten sideoppdatering."], extensions: ["Behold tidligere data ved oppfrisking og skill ny henting fra første lasting."] } },
  "api-axios": { sections: [section("felles-kontrakt", "Én kontrakt fra klient til query", paragraph("Gjenbruk det komplette API-oppsettet i fetch-http. Funksjonssignaturen er getLessons(courseId, { signal, request } = {}). courseId bestemmer URL-en. signal bestemmer kansellering. request lar testene velge en kontrollert transport. Axios er et valgfritt klientalternativ; du trenger ikke Axios for å gjennomføre arbeidsoppgaven."), code("Samme parameter hele veien", `useQuery({
  queryKey: ["lessons", courseId],
  queryFn: ({ signal }) => api.getLessons(courseId, { signal }),
  enabled: Boolean(courseId),
});`, "jsx"))], practice: { description: "Bruk det kontrollerte API-et og trekk kurshenting ut av visningskomponenten. Velg fetch; Axios kan prøves som fordypning med samme kontrakt.", startpoint: "Bruk api.js og practice.js fra fetch-http. Behold getLessons-signaturen når du trekker ut et eget API-lag.", checks: ["To ulike courseId-er gir to ulike forespørsler og leksjonslister.", "HTTP 404 og 503 avviser; de returneres ikke som [].", "Et avbrutt kall beholder AbortError gjennom API-laget."], extensions: ["Bytt til Axios i ditt eget prosjekt og behold samme domenekontrakt."] } },
  "queries-cache": { sections: [queryFlow], practice: { startpoint: "Bruk den komplette App.jsx over og API-filene fra fetch-http i en egen Query 5-app.", checks: ["React → CSS → React viser henholdsvis JSX, Grid og JSX. Ingen kursvalg viser Velg et kurs.", "Sett error før Oppfrisk: tidligere liste beholdes og feilmelding vises.", "Med en ny QueryClient og retry: false i en test skal første feil gi feilvisning uten gamle data."], extensions: ["Mål nettverkskall ved remontering før og etter staleTime. Forklar resultatet, ikke bare antall renderinger."] } },
  "klient-server": { practice: { startpoint: "Gjenbruk det kontrollerte API-oppsettet fra fetch-http. Start med api.getCourses og én QueryClientProvider. Installer bare Query 5 i øvingsappen hvis det mangler.", checks: ["Søkefeltet endrer klientstate uten å kopiere serverlisten.", "En ny montering med samme klient kan lese samme cachepost.", "En ny test oppretter egen QueryClient, slik at gammel cache ikke skjuler lasting eller feil."], extensions: ["Flytt delbare filtre til søkeparametere."] } },
  mutasjoner: { sections: [section("skrivekontrakt", "Fra innsending til ny liste", paragraph("Øvings-API-et støtter POST /api/courses med { title }. Bruk api.createCourse som mutationFn og api.getCourses i ['courses']-queryen. Koble tittel-nullstilling og invalidateQueries til onSuccess. Ved error må utkastet bli stående; ved success gir neste GET det opprettede kurset."), sequence("Bekreftet endring", [["Send", "Valider trimmet tittel og deaktiver submit mens mutasjonen venter."], ["Feil", "Vis feil. Behold samme utkast og tillat nytt forsøk."], ["Suksess", "Tøm utkastet, invalider ['courses'] og vent på oppfrisket liste."]]))], practice: { startpoint: "Bruk api.createCourse og api.getCourses fra øvingsoppsettet. Koble et kontrollert tittelfelt til den eksisterende QueryClient-en.", checks: ["Opprett Testing: ett nytt id vises etter oppfrisking.", "Sett error, send og kontroller at feltet fortsatt inneholder utkastet.", "Sett success og prøv igjen. Kontroller at det bare ble opprettet ett kurs."], extensions: ["Legg til optimistisk UI med rollback først etter at bekreftet lagring fungerer."] } },
  paginering: { practice: { description: "Bruk det kontrollerte API-et med tre kurs fordelt på to sider og hasMore. Ingen backend kreves.", startpoint: "Bruk api.getCoursePage(page, { signal }) fra øvingsoppsettet. API-et teller fra 1 og har to elementer per side. Start med state page=1.", checks: ["Side 1 viser React og CSS, hasMore=true. Side 2 viser JavaScript, hasMore=false.", "Forrige er deaktivert på side 1 og Neste på siste side.", "Bruk slow for å kontrollere at placeholder-data markeres som tidligere side, og at Neste venter."], extensions: ["Lagre sidevalget i URL-en og valider ugyldige sideverdier."] } },
};
