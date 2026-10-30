import { isCurrentAnswer } from "../../progress/progress.js";
import { useId } from "react";
import { getSolution } from "./answers.js";

const typeLabels = {
  MultipleChoiceQuestion: "Flervalg",
  FillInCodeQuestion: "Kodeutfylling",
  FindTheBugQuestion: "Finn feilen",
};

export default function QuestionFrame({ question, number, attempt, state, children }) {
  const headingId = useId();
  return (
    <form className="question-card" onSubmit={state.handleSubmit} aria-labelledby={headingId}>
      <div className="question-meta">
        <span className="eyebrow">Oppgave {number}{question.skill ? ` · ${question.skill}` : ""}</span>
        <span className="status-badge">{typeLabels[question.type]}</span>
      </div>
      <h3 id={headingId}>{question.title}</h3>
      <p>{question.prompt}</p>
      {question.code && <pre><code>{question.code}</code></pre>}
      {attempt && !isCurrentAnswer(attempt, question) && <p className="notice">Du har tidligere svart på en eldre utgave. Resultatet er bevart, men denne oppgaven må besvares på nytt for å inngå i gjeldende kunnskapskontroll.</p>}
      {isCurrentAnswer(attempt, question) && (
        <p className="muted">
          {attempt.attempts} innsendte forsøk · Sist besvart {attempt.correct ? "riktig" : "feil"}.
        </p>
      )}
      {children}
      <button className="primary-button question-submit" type="submit" disabled={!state.answer.trim() || state.result !== null}>
        Sjekk svar
      </button>
      <div className="question-feedback" role="status" aria-live="polite" aria-atomic="true">
        {state.result !== null && (
          <div className={state.result.correct ? "answer-correct" : "answer-incorrect"}>
            <strong>{state.result.correct ? "Riktig!" : "Ikke helt riktig ennå."}</strong>
            <p>Riktig svar: {getSolution(question)}</p>
            <p>{question.explanation}</p>
            <p className="muted">Endre svaret for å prøve igjen.</p>
          </div>
        )}
      </div>
    </form>
  );
}
