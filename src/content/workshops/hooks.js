import { code, paragraph, section, sequence } from "./extendLesson.js";
export const workshops = {
  localstorage: { sections: [section("lagringshook", "Sett lesing og skriving sammen uten datatap",
    paragraph("Legg TASKS_KEY, validTasks, readTasks og writeTasks fra utdragene over i taskStorage.js og eksporter dem. Hooken sender en funksjon som henter window.localStorage inne i hjelperens try/catch. Også SecurityError fra selve egenskapstilgangen fanges dermed. Manglende nøkkel er fortsatt en normal førstegangsstart. En lesefeil gir en arbeidsliste og sperrer skriving. Brukeren må få vite at nullstilling erstatter gamle data; velger brukeren ikke det, fortsetter økten i minnet."),
    code("useStoredTasks.js", `import { useEffect, useState } from "react";
import { readTasks, writeTasks } from "./taskStorage.js";
export function useStoredTasks() {
  const [loaded] = useState(() => readTasks(() => window.localStorage));
  const [tasks, setTasks] = useState(loaded.tasks);
  const [canWrite, setCanWrite] = useState(loaded.canWrite);
  const [storageError, setStorageError] = useState(loaded.error);
  useEffect(() => {
    if (!canWrite) return;
    const error = writeTasks(() => window.localStorage, tasks, true);
    setStorageError(error);
    if (error) setCanWrite(false);
  }, [tasks, canWrite]);
  function resetStorage() {
    // Kall bare etter et uttrykkelig valg om å erstatte gammel lagring.
    const error = writeTasks(() => window.localStorage, tasks, true);
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
    sequence("Tre ulike starttilstander", [["Nøkkel mangler", "Tom liste, ingen feil, skriving tillatt."], ["Gyldig lagring", "Validert liste, skriving tillatt."], ["Uleselige data", "Tom arbeidsliste og feilmelding. canWrite=false; originalen beholdes også når listen endres."]]),
    paragraph("Lesing er isolert i initialisering og endrer ikke lagringen. React kan kontrollere initialisering ekstra i utvikling. Denne enkle hooken løser ikke samtidige endringer fra flere faner og bruker én fast nøkkel."),
  )], practice: { startpoint: "Bruk taskStorage.js fra utdragene og hooken over sammen med mållisten fra listeoppdateringer. Datamodellen er { id: string, title: string, done: boolean }.", criteria: ["Gyldige mål og done-status finnes etter sideoppdatering.", "Ugyldig JSON, feil done-type og dupliserte id-er gir feilmelding uten automatisk overskriving.", "Skrivefeil bevarer aktive mål i minnet; nullstilling krever et uttrykkelig valg."], checks: ["Sett lagringsverdien til ugyldig JSON i DevTools. Oppdater og endre arbeidslisten: originalteksten skal fortsatt være lagret.", "Prøv gyldig JSON med done: \"false\" og med to like id-er. Begge skal avvises.", "Bruk en lagringsadapter der setItem kaster. Nye mål skal fortsatt være synlige i økten.", "Velg uttrykkelig Erstatt gammel lagring. Etter vellykket skriving og reload vises den nye arbeidslisten."], extensions: ["Legg til en eksportmulighet før nullstilling eller en eksplisitt strategi for flere faner."] } },
};
