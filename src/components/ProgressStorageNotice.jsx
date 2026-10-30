import { useState } from "react";
import { useLearningProgress } from "../hooks/useLearningProgress.js";

export default function ProgressStorageNotice() {
  const { storageError, storageBlocked, recoverStoredProgress, replaceStoredProgress } = useLearningProgress();
  const [confirmed, setConfirmed] = useState(false);
  if (!storageError) return null;
  return <aside className="notice" aria-label="Lagring av progresjon">
    <p role="alert">{storageError}</p>
    {storageBlocked && <>
      <p>Lesing på nytt erstatter øktens progresjon med dataene fra lagringen dersom de kan leses. Et mislykket forsøk beholder arbeidet ditt i minnet.</p>
      <button type="button" onClick={() => { setConfirmed(false); recoverStoredProgress(); }}>Les lagret progresjon på nytt</button>
      <details>
        <summary>Erstatt uleselige eller gamle lagringsdata</summary>
        <p>Dette erstatter dataene under EduPlans progresjonsnøkkel med progresjonen som vises i denne økten. Andre lagringsnøkler berøres ikke. Hvis du vil bevare originaldata, kan du kopiere dem fra nettleserens utviklerverktøy først.</p>
        <label><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />
          Jeg forstår at de tidligere lagrede progresjonsdataene blir erstattet.
        </label>
        <button type="button" disabled={!confirmed} onClick={() => { setConfirmed(false); replaceStoredProgress(); }}>Erstatt lagring med øktens progresjon</button>
      </details>
    </>}
  </aside>;
}
