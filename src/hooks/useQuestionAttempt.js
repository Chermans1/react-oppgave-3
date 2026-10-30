import { useState } from "react";
import { checkAnswer } from "../components/exercises/answers.js";
import {
  canRevealSolution, changeAnswer, freshRound, revealSolution, roundFor, startNewRound, submitAnswer,
} from "../components/exercises/attemptRound.js";
import { isSolutionShown } from "../progress/progress.js";

// The round (answer, result, wrong count) is local. "Solution shown" is also saved with the answer,
// so a reload cannot turn a round that has seen the solution into an independent one.
export function useQuestionAttempt(question, onAnswer, { attempt, onRevealSolution, onStartNewRound } = {}) {
  const [stored, setStored] = useState(() => freshRound(question.id));
  const round = roundFor(stored, question.id);
  if (round !== stored) setStored(round);
  const state = isSolutionShown(attempt, question) && !round.revealed ? { ...round, revealed: true } : round;

  return {
    answer: state.answer,
    result: state.result,
    wrongCount: state.wrongCount,
    revealed: state.revealed,
    round: state.round,
    canReveal: canRevealSolution(state),
    changeAnswer: (value) => setStored(changeAnswer(state, value)),
    handleSubmit(event) {
      event.preventDefault();
      if (!state.answer.trim() || state.result !== null) return;
      const next = submitAnswer(state, checkAnswer(question, state.answer));
      setStored(next.state);
      onAnswer(next.state.result.correct, next.assisted);
    },
    revealSolution() {
      const next = revealSolution(state);
      if (next === state) return;
      setStored(next);
      onRevealSolution?.();
    },
    startNewRound() {
      setStored(startNewRound(state));
      onStartNewRound?.();
    },
  };
}
