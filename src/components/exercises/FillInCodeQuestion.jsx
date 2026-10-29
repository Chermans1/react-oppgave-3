import { useId } from "react";
import { useQuestionAttempt } from "../../hooks/useQuestionAttempt.js";
import QuestionFrame from "./QuestionFrame.jsx";

export default function FillInCodeQuestion({ question, number, attempt, onAnswer }) {
  const state = useQuestionAttempt(question, onAnswer);
  const inputId = useId();
  return (
    <QuestionFrame question={question} number={number} attempt={attempt} state={state}>
      <label className="code-answer-label" htmlFor={inputId}>Manglende uttrykk</label>
      <input
        className="code-answer"
        id={inputId}
        type="text"
        value={state.answer}
        onChange={(event) => state.changeAnswer(event.target.value)}
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
      />
    </QuestionFrame>
  );
}
