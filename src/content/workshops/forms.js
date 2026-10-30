import { code, paragraph, section, sequence } from "./extendLesson.js";
export const workshops = {
  "listeoppdateringer": {
    sections: [section("redigeringsflyt", "Fra valgt mål til lagret endring",
      paragraph("En redigeringsflyt har to forskjellige verdier: den lagrede tittelen og utkastet i feltet. Forelderen eier listen og valgt id; editoren eier utkastet. Avbryt skal forkaste utkastet uten å endre listen. En ny key gir et nytt utkast når vi velger et annet mål."),
      code("TaskEditor.jsx – utkast, validering og avbryt", `import { useState } from "react";
export default function TaskEditor({ task, onSave, onCancel }) {
  const [draft, setDraft] = useState(task.title);
  const [error, setError] = useState("");
  function submit(event) {
    event.preventDefault();
    const title = draft.trim();
    if (!title) { setError("Skriv en tittel."); return; }
    onSave(task.id, title);
  }
  return <form onSubmit={submit}>
    <label>Tittel<input value={draft} aria-invalid={Boolean(error)}
      aria-describedby={error ? "edit-error" : undefined}
      onChange={(e) => setDraft(e.target.value)} /></label>
    {error && <p id="edit-error" role="alert">{error}</p>}
    <button type="submit">Lagre</button>
    <button type="button" onClick={onCancel}>Avbryt</button>
  </form>;
}`),
      code("App.jsx – samme id gjennom hele flyten", `import { useState } from "react";
import TaskEditor from "./TaskEditor.jsx";
export default function App() {
  const [tasks, setTasks] = useState([
    { id: "a", title: "Les JSX", done: false },
    { id: "b", title: "Prøv selv", done: true },
  ]);
  const [editingId, setEditingId] = useState(null);
  const selected = tasks.find((task) => task.id === editingId);
  function save(id, title) {
    setTasks((all) => all.map((task) => task.id === id ? { ...task, title } : task));
    setEditingId(null);
  }
  return <main><ul>{tasks.map((task) => <li key={task.id}>
    {task.title} – {task.done ? "Ferdig" : "Åpen"}
    <button onClick={() => setEditingId(task.id)}>Rediger {task.title}</button>
  </li>)}</ul>
    {selected && <TaskEditor key={selected.id} task={selected}
      onSave={save} onCancel={() => setEditingId(null)} />}
  </main>;
}`),
      sequence("Kontrollpunkt for hver handling", [["1. Velg a", "Listen er uendret. Editor viser Les JSX."], ["2. Skriv utkast", "Bare feltet endres; den lagrede tittelen er fortsatt Les JSX."], ["3a. Avbryt", "Editor lukkes. Listen beholder Les JSX."], ["3b. Lagre", "Bare a får ny tittel. b beholder både tittel og done=true."]]),
    )],
    practice: { startpoint: "Start med de to filene over i et eget Vite-prosjekt. Behold save-flyten. Legg til oppretting, fullføring og sletting fra de tidligere utdragene.",
      checks: ["Rediger a, skriv bare mellomrom og trykk Enter: feilmelding vises og listen endres ikke.", "Skriv en ny tittel og velg Avbryt: gammel tittel og done-status beholdes.", "Opprett to mål med samme tittel. Rediger, fullfør og slett bare ett; kontroller id-ene før og etter sortering."],
      extensions: ["Legg til en bekreftelse før et ulagret utkast forkastes. Dette er ikke et minimumskrav."] },
  },
};
