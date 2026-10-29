import { useId } from "react";
import { useQuestionAttempt } from "../../hooks/useQuestionAttempt.js";
import QuestionFrame from "./QuestionFrame.jsx";

export default function ChoiceQuestion({ question, number, attempt, onAnswer }) {
  const state = useQuestionAttempt(question, onAnswer);
  const groupId = useId();
  return (
    <QuestionFrame question={question} number={number} attempt={attempt} state={state}>
      <fieldset className="answer-options">
        <legend>Velg ett svar</legend>
        {question.options.map((option) => (
          <label key={option.id} className="answer-option">
            <input
              type="radio"
              name={groupId}
              value={option.id}
              checked={state.answer === option.id}
              onChange={() => state.changeAnswer(option.id)}
            />
            <span>{option.text}</span>
          </label>
        ))}
      </fieldset>
    </QuestionFrame>
  );
}
