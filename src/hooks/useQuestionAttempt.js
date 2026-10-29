import { useState } from "react";
import { checkAnswer } from "../components/exercises/answers.js";

export function useQuestionAttempt(question, onAnswer) {
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState(null);

  function changeAnswer(value) {
    setAnswer(value);
    setResult(null);
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!answer.trim() || result !== null) return;
    const correct = checkAnswer(question, answer);
    setResult({ correct });
    onAnswer(correct);
  }

  return { answer, result, changeAnswer, handleSubmit };
}
