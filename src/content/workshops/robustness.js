import { code, list, paragraph, section, sequence } from "./extendLesson.js";
export const workshops = {
  "error-boundaries": { sections: [section("boundary-forlop", "Fra renderingsfeil til et nytt forsøk",
    paragraph("En boundary har egen feilstate. Når et barn kaster under rendering, bytter den til fallback. Den enkleste komplette implementasjonen er en klasse; du trenger ikke lære generell klassearkitektur for å bruke den. getDerivedStateFromError velger fallback, mens componentDidCatch kan rapportere feilen. En boundary fanger ikke sin egen rendering eller vanlige avviste hendelses-Promises."),
    code("ErrorBoundary.jsx – komplett komponent", `import { Component } from "react";
export default class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error, info) {
    console.error("Renderingsfeil", error, info.componentStack);
  }
  render() {
    if (this.state.failed) return <div role="alert">
      Denne delen kunne ikke vises.
      <button onClick={this.props.onReset}>Vis fungerende eksempel</button>
    </div>;
    return this.props.children;
  }
}`),
    code("App.jsx – fremprovoser og nullstill én avgrenset feil", `import { useState } from "react";
import ErrorBoundary from "./ErrorBoundary.jsx";
function Course({ broken }) {
  if (broken) throw new Error("Kontrollert renderingsfeil");
  return <p>Kurset kan vises.</p>;
}
export default function App() {
  const [broken, setBroken] = useState(false);
  const [attempt, setAttempt] = useState(0);
  function reset() {
    setBroken(false);
    setAttempt((n) => n + 1);
  }
  return <main><h1>Kursrommet</h1>
    <button onClick={() => setBroken(true)}>Utløs feil</button>
    <ErrorBoundary key={attempt} onReset={reset}><Course broken={broken} /></ErrorBoundary>
  </main>;
}`),
    sequence("En avgrenset feilflyt", [["Normal", "Overskrift, knapp og kursinnhold vises."], ["Feil", "Course kaster under rendering. Overskriften består; fallback erstatter bare den beskyttede delen."], ["Gjenoppretting", "reset retter inputen og endrer key. En ny boundary starter uten gammel feilstate."]]),
    paragraph("Å endre key uten å rette inputen ville bare utløst samme feil igjen. Utviklingsverktøy kan samtidig vise sin egen feilvisning eller logge feilen; kontroller også appens fallback. HTTP-feil håndteres fortsatt i API-/query-flyten."),
  )], practice: { startpoint: "Bruk de to filene over i et separat prosjekt. Behold overskriften utenfor boundaryen for å se avgrensningen.", checks: ["Utløs feil: overskriften består og fallback får alert-rolle.", "Vis fungerende eksempel: kursinnholdet kommer tilbake med ny boundaryinstans.", "Legg til et API-kall som avvises i en knapp-handler og håndter det med egen try/catch og feiltekst."], extensions: ["Legg en ekstra boundary rundt et uavhengig sidepanel og kontroller at feilområdene er isolerte."] } },
  ytelse: { sections: [section("mal-forst", "Mål samme oppførsel før og etter en endring",
    paragraph("En optimalisering skal løse et observert problem og bevare resultatet. Denne øvingen har to hendelser: bytte tema og endre søk. Først bruker vi en bevisst gjentatt beregning for å gjøre kostnaden målbar. Det er øvingsdata, ikke anbefalt produksjonskode. Velg en datamengde som passer maskinen din."),
    code("results.js – deterministisk beregning", `export const rows = Array.from({ length: 3000 }, (_, index) => ({
  id: String(index), title: "Kurs " + index,
}));
export function selectRows(rows, query) {
  // Bevisst gjentatt arbeid: gjør en måleøving av en ellers liten filtrering.
  let result;
  for (let pass = 0; pass < 40; pass += 1) {
    result = rows.filter((row) => row.title.includes(query));
  }
  return result;
}`, "js"),
    code("App.jsx – startversjon uten memoization", `import { useState } from "react";
import { rows, selectRows } from "./results.js";
export default function App() {
  const [query, setQuery] = useState("12");
  const [dark, setDark] = useState(false);
  const visible = selectRows(rows, query);
  return <main className={dark ? "dark" : "light"}>
    <button onClick={() => setDark((v) => !v)}>Bytt tema</button>
    <label>Søk<input value={query} onChange={(e) => setQuery(e.target.value)} /></label>
    <p>{visible.length} treff</p>
    <ul>{visible.slice(0, 20).map((row) => <li key={row.id}>{row.title}</li>)}</ul>
  </main>;
}`),
    list("Ta opp Bytt tema og ett søk i React DevTools Profiler. Noter scenario, antall opptak og observert renderingstid. Ikke sammenlign to forskjellige handlinger.",
      "Importer useMemo og erstatt bare beregningen med const visible = useMemo(() => selectRows(rows, query), [query]). rows er en stabil modulkonstant her; mottas rows som prop, må rows også være avhengighet.",
      "Ta opp nøyaktig samme handlinger igjen. Temabytte trenger ikke ny filtrering; et nytt query skal fortsatt beregnes. Sammenlign medianen av flere opptak på samme maskin.",
      "Fjern den kunstige gjentakelsen til slutt. Vurder om den virkelige gevinsten fortsatt forsvarer useMemo. Uendrede listeelementer kan fortsatt rendre selv om beregningen er cachet."),
    code("En egen memo-grense – et separat neste forsøk", `import { memo, useCallback } from "react";
const ResultButton = memo(function ResultButton({ row, onSelect }) {
  return <button onClick={() => onSelect(row.id)}>{row.title}</button>;
});
// I forelderen, der setSelectedId er en stabil setter:
const onSelect = useCallback((id) => setSelectedId(id), []);
// Behold også row-objektenes identitet:
<ResultButton row={visible[0]} onSelect={onSelect} />;`),
    paragraph("Det siste utdraget forutsetter minst ett treff og en selectedId-state i forelderen. Bruk en betingelse ved tom liste. memo sammenligner props; egen state og Context kan fortsatt oppdatere barnet. Det er ingen gevinst å cache alt uten måling, og React Compiler kan endre behovet for manuelle grenser i prosjekter der den er konfigurert."),
  )], practice: { startpoint: "Kopier results.js og startversjonen av App.jsx. Bruk samme søkeverdi og datamengde i alle sammenligninger.", criteria: ["Dokumenter baseline og nye målinger for minst fem temabytter og fem søk med samme oppsett.", "Søk og antall treff er identiske før og etter memoization, også ved null treff.", "Forklar hvilke avhengigheter som gjør cachen gyldig og når den skal beregnes på nytt."], checks: ["Søk etter 12 og deretter en tekst uten treff; bekreft samme treff før og etter endringen.", "Endre bare tema: undersøk i Profiler om kostnaden faktisk ble lavere.", "Endre query: verifiser at filtreringen fortsatt oppdateres. Ikke presenter faste millisekundtall som et forventet fasitsvar."], extensions: ["Mål en memo-komponent med stabil og ustabil callback, og begrunn om ekstra kompleksitet lønner seg."] } },
  typescript: { sections: [section("typer-stegvis", "Fra propkontrakt til kontrollert API-data",
    paragraph("Bruk en separat Vite React/TypeScript-mal, med .tsx-filer, og kjør npx tsc -p tsconfig.app.json --noEmit etter hvert steg. Vite-malens tsconfig.json i roten peker på andre prosjektkonfigurasjoner og har ingen egne appfiler. -p tsconfig.app.json velger konfigurasjonen som faktisk inkluderer src-filene. Malens npm run build bruker tsc -b for prosjektreferansene og bygger deretter appen. TypeScript er en statisk kontroll før kjøring; det validerer ikke JSON fra nettet. Eksemplene krever ikke at EduPlan bytter fra JavaScript."),
    code("1. TaskRow.tsx – props og callback", `type Task = { id: string; title: string; done: boolean };
type Props = { task: Task; onToggle: (id: string) => void };
export default function TaskRow({ task, onToggle }: Props) {
  return <label><input type="checkbox" checked={task.done}
    onChange={() => onToggle(task.id)} />{task.title}</label>;
}`, "tsx"),
    code("2. App.tsx – liste, hendelse og immutable oppdatering", `import { useState, type FormEvent } from "react";
import TaskRow from "./TaskRow";
type Task = { id: string; title: string; done: boolean };
export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) return;
    setTasks((all) => [...all, { id: crypto.randomUUID(), title: title.trim(), done: false }]);
    setTitle("");
  }
  function toggle(id: string) {
    setTasks((all) => all.map((task) => task.id === id ? { ...task, done: !task.done } : task));
  }
  return <><form onSubmit={submit}><label>Tittel<input value={title}
    onChange={(e) => setTitle(e.target.value)} /></label><button>Legg til</button></form>
    {tasks.map((task) => <TaskRow key={task.id} task={task} onToggle={toggle} />)}</>;
}`, "tsx"),
    code("3. tasksApi.ts – unknown blir ikke trygt før validering", `type Task = { id: string; title: string; done: boolean };
function isTask(value: unknown): value is Task {
  if (typeof value !== "object" || value === null) return false;
  return "id" in value && typeof value.id === "string" && value.id.trim().length > 0 &&
    "title" in value && typeof value.title === "string" && value.title.trim().length > 0 &&
    "done" in value && typeof value.done === "boolean";
}
export function parseTasks(value: unknown): Task[] {
  if (!Array.isArray(value) || !value.every(isTask)) throw new Error("Ugyldige mål");
  const tasks = value as Task[];
  if (new Set(tasks.map((task) => task.id)).size !== tasks.length) throw new Error("Duplisert id");
  return tasks;
}`, "tsx"),
    list("Prøv onToggle={42}: typekontrollen skal stoppe bruken fordi en callback kreves. Rett feilen før du fortsetter.",
      "Prøv done: 'false' i en Task: kompilatoren skal avvise strengverdien. For JSON som unknown skal parseTasks i stedet kaste ved kjøring.",
      "Test parseTasks med en gyldig liste, feil done-type og dupliserte id-er. Typekontroll og runtime-validering beskytter to forskjellige grenser."),
  )], practice: { description: "Type TaskRow, mållisten og en unknown-grense med parseTasks. Behold oppretting og fullføring som fungerende brukerhandlinger.", startpoint: "Opprett en separat React/TypeScript-øving og de tre filene over. Bruk typene i egne komponenter; EduPlan forblir JavaScript/JSX.", criteria: ["npx tsc -p tsconfig.app.json --noEmit passerer for fungerende kode og avviser en bevisst feil prop eller callback.", "Oppretting og fullføring fungerer med Task[] og id-basert oppdatering.", "parseTasks avviser feil felttyper og dupliserte id-er fra unknown-data."], checks: ["Kontroller både en compile-feil og en runtime-feil; dokumenter hvilken kontroll som oppdaget hva.", "Kjør den typede komponenten og test tom og gyldig innsending.", "Bruk enhetstester for gyldig og ugyldig parseTasks-input."], extensions: ["Del Task-typen i en egen modul og modeller lastetilstander som en diskriminert union."] } },
};
