import { isCurrentAnswer } from "../../progress/progress.js";
import { useEffect, useId, useRef } from "react";
import { getSolution } from "./answers.js";
import { getHint } from "../../content/exerciseHints.js";

const typeLabels = {
  MultipleChoiceQuestion: "Flervalg",
  FillInCodeQuestion: "Kodeutfylling",
  FindTheBugQuestion: "Finn feilen",
};

const FALLBACK_HINT = "Les oppgaven og koden én gang til, og sammenlign med forklaringen i leksjonen før du prøver igjen.";

function lastResultText(attempt) {
  if (!attempt.correct) return "Sist besvart feil.";
  return attempt.assisted ? "Sist besvart riktig etter at fasiten var vist (øving, ikke mestring)." : "Sist besvart riktig.";
}

export default function QuestionFrame({ question, number, attempt, state, children }) {
  const headingId = useId();
  const formRef = useRef(null);
  const solutionRef = useRef(null);
  const { result, wrongCount = 0, revealed = false, canReveal = false, round = 0 } = state;
  const hint = getHint(question) ?? FALLBACK_HINT;
  const assisted = result?.correct === true && result.assisted === true;
  const showRevealedPanel = revealed && !(result?.correct === true);

  // Keep keyboard focus useful when the button that was pressed disappears.
  const wasRevealed = useRef(revealed);
  useEffect(() => {
    if (revealed && !wasRevealed.current) solutionRef.current?.focus();
    wasRevealed.current = revealed;
  }, [revealed]);
  const firstRound = useRef(round);
  useEffect(() => {
    if (round !== firstRound.current) formRef.current?.querySelector("input")?.focus();
  }, [round]);

  return (
    <form ref={formRef} className="question-card" onSubmit={state.handleSubmit} aria-labelledby={headingId}>
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
          {attempt.attempts} innsendte forsøk · {lastResultText(attempt)}
        </p>
      )}
      {children}
      <button className="primary-button question-submit" type="submit" disabled={!state.answer.trim() || state.result !== null}>
        Sjekk svar
      </button>
      <div className="question-feedback" role="status" aria-live="polite" aria-atomic="true">
        {result !== null && result.correct && (
          <div className="answer-correct">
            <strong>Riktig!</strong>
            <p>Riktig svar: {getSolution(question)}</p>
            <p>{question.explanation}</p>
            {assisted ? (
              <>
                <p className="practice-note">Du så fasiten før dette svaret. Det teller derfor som øving og ikke som mestring.</p>
                <button className="secondary-button" type="button" onClick={state.startNewRound}>Start ny øvingsrunde</button>
              </>
            ) : <p className="muted">Endre svaret for å prøve igjen.</p>}
          </div>
        )}
        {result !== null && !result.correct && (
          <div className="answer-incorrect">
            <strong>Ikke helt riktig ennå.</strong>
            <p>{hint}</p>
            {canReveal && (
              <>
                <p>Du har svart feil {wrongCount} ganger. Du kan fortsette å prøve, eller velge å se fasiten. Å se fasiten er øving og gir ikke mestring i denne runden.</p>
                <button className="secondary-button" type="button" onClick={state.revealSolution}>Vis fasit</button>
              </>
            )}
            <p className="muted">Endre svaret for å prøve igjen.</p>
          </div>
        )}
        {showRevealedPanel && (
          <div className="answer-revealed" ref={solutionRef} tabIndex={-1}>
            <strong>Fasit (øving, ikke mestring)</strong>
            <p>Riktig svar: {getSolution(question)}</p>
            <p>{question.explanation}</p>
            <p className="practice-note">Et riktig svar i denne runden teller som øving. Start en ny øvingsrunde og løs oppgaven uten fasit for å dokumentere mestring.</p>
            <button className="secondary-button" type="button" onClick={state.startNewRound}>Start ny øvingsrunde</button>
          </div>
        )}
      </div>
    </form>
  );
}
