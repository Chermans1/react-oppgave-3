import { code, paragraph, section } from "./extendLesson.js";
export const goalFormExample = `import { useState } from "react";
export default function GoalForm({ onCreate }) {
  const [title, setTitle] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const invalid = submitted && !title.trim();
  function submit(event) {
    event.preventDefault();
    setSubmitted(true);
    if (!title.trim()) return;
    onCreate(title.trim());
    setTitle("");
    setSubmitted(false);
  }
  return <form onSubmit={submit}>
    <label>Tittel<input value={title} aria-invalid={invalid}
      onChange={(e) => setTitle(e.target.value)} /></label>
    {invalid && <p role="alert">Skriv en tittel.</p>}
    <button type="submit">Legg til</button>
  </form>;
}`;
export const emptySubmitTest = `import { test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GoalForm from "./GoalForm.jsx";
test.each(["", "   "])("avviser blank tittel %j", async (input) => {
  const onCreate = vi.fn();
  const user = userEvent.setup();
  render(<GoalForm onCreate={onCreate} />);
  if (input) await user.type(screen.getByRole("textbox", { name: "Tittel" }), input);
  await user.click(screen.getByRole("button", { name: "Legg til" }));
  expect(screen.getByRole("alert")).toBeTruthy();
  expect(onCreate).not.toHaveBeenCalled();
});
test("sender trimmet gyldig tittel", async () => {
  const onCreate = vi.fn();
  const user = userEvent.setup();
  render(<GoalForm onCreate={onCreate} />);
  await user.type(screen.getByRole("textbox", { name: "Tittel" }), "  Les CSS  ");
  await user.click(screen.getByRole("button", { name: "Legg til" }));
  expect(onCreate).toHaveBeenCalledExactlyOnceWith("Les CSS");
});`;
export const workshops = {
  brukeradferd: {
    beforeTopic: { scenario: [
      paragraph("Før du kjører en test: opprett et separat Vite/React-prosjekt med testoppsettet vist i seksjonen om konfigurering nedenfor. I det prosjektet trenger du vitest, jsdom, @testing-library/react og @testing-library/user-event. Kjør npx vitest run. Filene i eksemplene er separate filer; config/setup må finnes før testene kan kjøres."),
      code("Counter.jsx – komponenten som den første testen undersøker", `import { useState } from "react";
export default function Counter() {
  const [count, setCount] = useState(0);
  return <><p>Antall: {count}</p>
    <button onClick={() => setCount((n) => n + 1)}>Øk</button></>;
}`),
    ], regression: [code("GoalForm.jsx – faktisk valideringskontrakt", goalFormExample)] },
    sections: [section("valideringsregresjon", "En test som faktisk avdekker tom oppretting",
      paragraph("Feilmelding alene er ikke nok. Komponenten kan både vise feil og sende tom tekst videre ved en feil. Derfor kontrollerer vi callbacken som oppretter data. I en integrasjonstest kontrollerer vi også antall faktiske listeposter; å lete etter en bestemt tittel kan overse en tom post."),
      code("GoalForm.test.jsx – test både ugyldig og gyldig input", emptySubmitTest),
      paragraph("Fjern den tidlige returen i GoalForm midlertidig. Da skal testen for blank tittel feile fordi onCreate ble kalt. Sett returen tilbake og kjør begge testene. Dette kontrollerer at testen kan oppdage akkurat den feilen."),
    )], practice: { startpoint: "Opprett Counter.jsx, GoalForm.jsx og de viste testfilene med Vite-konfigurasjonen fra denne leksjonen. Setup-filen må importere afterEach og cleanup og kalle afterEach(cleanup).", checks: ["Kjør npx vitest run: teller-testen og de tre skjema-tilfellene skal være grønne.", "Fjern valideringsreturen: de blanke tilfellene skal feile selv om feilmeldingen fortsatt vises.", "Fjern tellerens setter: klikk-testen skal feile."], extensions: ["Legg til Enter-innsending og retting fra ugyldig til gyldig tittel."] },
  },
  "komponent-integrasjon": {
    beforeTopic: { providers: [paragraph("MemoryRouter er en router med adresser i minnet, beregnet på blant annet tester. initialEntries er startadressene, og en parameter som :courseId erstattes av en konkret id i adressen. Dette gir Link, Route og useParams ekte routerkontekst uten å endre nettleserens adresse."), code("Et annet detaljscenario – importer alle routerdelene", `import { MemoryRouter, Routes, Route, useParams } from "react-router-dom";
function Detail() { return <h1>Kurs {useParams().courseId}</h1>; }
render(<MemoryRouter initialEntries={["/courses/css"]}>
  <Routes><Route path="/courses/:courseId" element={<Detail />} /></Routes>
</MemoryRouter>);
expect(screen.getByRole("heading", { name: "Kurs css" })).toBeTruthy();`)] },
    sections: [section("form-liste-integrasjon", "Se at opprettingskontrakten når listen",
      paragraph("Gjenbruk GoalForm fra forrige leksjon. Denne lille siden gir en navngitt liste også når den er tom, slik at testen kan telle faktiske poster. onCreate er koblet til ekte state; den er ikke mocket bort."),
      code("Workspace.jsx", `import { useState } from "react";
import GoalForm from "./GoalForm.jsx";
export default function Workspace() {
  const [tasks, setTasks] = useState([]);
  function create(title) {
    setTasks((all) => [...all, { id: crypto.randomUUID(), title }]);
  }
  return <><GoalForm onCreate={create} />
    <ul aria-label="Mål">{tasks.map((task) => <li key={task.id}>{task.title}</li>)}</ul></>;
}`),
      code("Workspace.test.jsx – sjekk faktiske poster", `import { test, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Workspace from "./Workspace.jsx";
test("blank innsending lager ingen oppføring", async () => {
  const user = userEvent.setup();
  render(<Workspace />);
  const list = screen.getByRole("list", { name: "Mål" });
  await user.type(screen.getByRole("textbox", { name: "Tittel" }), "   ");
  await user.click(screen.getByRole("button", { name: "Legg til" }));
  expect(screen.getByRole("alert")).toBeTruthy();
  expect(within(list).queryAllByRole("listitem")).toHaveLength(0);
});`),
    )], practice: { startpoint: "Bruk GoalForm fra forrige leksjon og Workspace over. Utvid først Workspace med fullføringsknapp og done-felt, og skriv så integrasjonstesten.", checks: ["To gyldige innsendinger gir nøyaktig to listitem-elementer.", "Blank innsending gir alert og fortsatt samme antall poster.", "Fullføring av den andre posten endrer bare dens synlige status; kjør med to like titler for å teste id-koblingen."], extensions: ["Test samme flyt med den ekte Context-provideren fra øvingsappen."] },
  },
};
