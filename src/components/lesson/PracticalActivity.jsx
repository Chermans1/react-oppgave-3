import { useId } from "react";

export default function PracticalActivity({ activity }) {
  const headingId = useId();
  if (!activity) return null;
  return (
    <section className="practical-activity" aria-labelledby={headingId}>
      <span className="eyebrow">PRAKTISK PROGRAMMERING · EGET PROSJEKT</span>
      <h3 id={headingId}>{activity.title}</h3>
      <p>{activity.description}</p>
      <h4>Forkunnskaper</h4>
      <p>{activity.prerequisites}</p>
      <h4>Startpunkt</h4>
      <p>{activity.startpoint}</p>
      {activity.starter && <figure className="teaching-code">
        <figcaption>Startpunkt – utdrag</figcaption>
        <pre><code>{activity.starter}</code></pre>
      </figure>}
      <h4>Obligatoriske krav og akseptansekriterier</h4>
      <ul>{activity.criteria.map((item) => <li key={item}>{item}</li>)}</ul>
      <h4>Slik kontrollerer du resultatet</h4>
      <ol>{activity.checks?.map((item) => <li key={item}>{item}</li>)}</ol>
      <h4>Valgfri fordypning</h4>
      <ul>{activity.extensions?.map((item) => <li key={item}>{item}</li>)}</ul>
      <h4>Tips og feilsøking</h4>
      <ul>{activity.hints.map((item) => <li key={item}>{item}</li>)}</ul>
      <p className="notice">Denne arbeidsoppgaven vurderes ikke automatisk. Gjennomfør den i eget prosjekt og kontroller hvert akseptansekriterium. Riktige kunnskapssvar gir ingen godkjenning av praktisk gjennomføring.</p>
    </section>
  );
}
