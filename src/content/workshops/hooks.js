import { code, paragraph, section, sequence } from "./extendLesson.js";
export const workshops = {
  localstorage: { sections: [section("lagringshook", "Sett lesing og skriving sammen uten datatap",
    paragraph("Legg TASKS_KEY, validTasks, readTasks og writeTasks fra utdragene over i taskStorage.js og eksporter dem. Hooken sender en funksjon som henter window.localStorage inne i hjelperens try/catch. Også SecurityError fra selve egenskapstilgangen fanges dermed. Manglende nøkkel er fortsatt en normal førstegangsstart. En lesefeil gir en arbeidsliste og sperrer skriving. Brukeren må få vite at nullstilling erstatter gamle data; velger brukeren ikke det, fortsetter økten i minnet."),
    code("useStoredTasks.js", `import { useEffect, useState } from "react";
import { readTasks, writeTasks } from "./taskStorage.js";
const browserStorage = () => window.localStorage;
export function useStoredTasks(getStorage = browserStorage) {
  const [loaded] = useState(() => readTasks(getStorage));
  const [tasks, setTasks] = useState(loaded.tasks);
  const [canWrite, setCanWrite] = useState(loaded.canWrite);
  const [storageError, setStorageError] = useState(loaded.error);
  useEffect(() => {
    if (!canWrite) return;
    const error = writeTasks(getStorage, tasks, true);
    setStorageError(error);
    if (error) setCanWrite(false);
  }, [tasks, canWrite, getStorage]);
  function resetStorage() {
    // Kall bare etter et uttrykkelig valg om å erstatte gammel lagring.
    const error = writeTasks(getStorage, tasks, true);
    setStorageError(error);
    if (!error) setCanWrite(true);
  }
  return { tasks, setTasks, storageError, canWrite, resetStorage };
}`),
    code("Bruk i App – legg til disse kontrollene ved din eksisterende liste", `const { tasks, setTasks, storageError, canWrite, resetStorage } = useStoredTasks();
// I returverdien, ved siden av listen:
{storageError && <p role="alert">{storageError}</p>}
{!canWrite && <button type="button" onClick={resetStorage}>
  Erstatt gammel lagring med arbeidslisten
</button>}`),
    paragraph("Hookens valgfrie argument er en funksjon som henter lagringsadapteren. Uten argument brukes nettleserens localStorage. Velg adapter når komponenten monteres, og hold hentefunksjonen stabil utenfor komponenten. For å bytte adapter: monter komponenten på nytt. Prøv kontrollpunkt 3 med denne komplette App.jsx i stedet for den vanlige App-komponenten:"),
    code("App.jsx – simuler full lagring uten å endre nettleserens data", `import { useStoredTasks } from "./useStoredTasks.js";
const quotaStorage = {
  getItem: () => null,
  setItem() { throw new DOMException("Lagringen er full", "QuotaExceededError"); },
};
const getQuotaStorage = () => quotaStorage;
export default function App() {
  const { tasks, setTasks, storageError } = useStoredTasks(getQuotaStorage);
  function addTask() {
    setTasks((all) => [...all, { id: crypto.randomUUID(), title: "Les React", done: false }]);
  }
  return <main>
    <button onClick={addTask}>Legg til mål</button>
    {storageError && <p role="alert">{storageError}</p>}
    <ul>{tasks.map((task) => <li key={task.id}>{task.title}</li>)}</ul>
  </main>;
}`),
    sequence("Tre ulike starttilstander", [["Nøkkel mangler", "Tom liste, ingen feil, skriving tillatt."], ["Gyldig lagring", "Validert liste, skriving tillatt."], ["Uleselige data", "Tom arbeidsliste og feilmelding. canWrite=false; originalen beholdes også når listen endres."]]),
    paragraph("Lesing er isolert i initialisering og endrer ikke lagringen. React kan kontrollere initialisering ekstra i utvikling. Denne enkle hooken løser ikke samtidige endringer fra flere faner og bruker én fast nøkkel."),
  )], practice: { startpoint: "Bruk taskStorage.js fra utdragene og hooken over sammen med mållisten fra listeoppdateringer. Datamodellen er { id: string, title: string, done: boolean }.", criteria: ["Gyldige mål og done-status finnes etter sideoppdatering.", "Ugyldig JSON, feil done-type og dupliserte id-er gir feilmelding uten automatisk overskriving.", "Skrivefeil bevarer aktive mål i minnet; nullstilling krever et uttrykkelig valg."], checks: ["Sett lagringsverdien til ugyldig JSON i DevTools. Oppdater og endre arbeidslisten: originalteksten skal fortsatt være lagret.", "Prøv gyldig JSON med done: \"false\" og med to like id-er. Begge skal avvises.", "Kjør App.jsx med getQuotaStorage som vist over. Trykk Legg til mål to ganger: to mål og en lagringsfeil skal vises. Adapteren lagrer ingenting, så målene forsvinner ved reload. Bytt tilbake til vanlig App før neste kontroll.", "Velg uttrykkelig Erstatt gammel lagring. Etter vellykket skriving og reload vises den nye arbeidslisten."], extensions: ["Legg til en eksportmulighet før nullstilling eller en eksplisitt strategi for flere faner."] } },
};
