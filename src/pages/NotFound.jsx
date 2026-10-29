import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="intro">
      <span className="eyebrow">SIDEN FINNES IKKE</span>
      <h1>Vi fant ikke det du lette etter</h1>
      <p>Adressen kan være feil, eller kurset, modulen eller leksjonen finnes ikke.</p>
      <Link className="text-link page-section" to="/kurs">Til kursoversikten →</Link>
    </section>
  );
}
