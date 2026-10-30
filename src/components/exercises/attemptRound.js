// Ren logikk for én øvingsrunde på én oppgave. Tilstanden er bevisst lokal og ikke lagret:
// en sideoppdatering eller leksjonsbytte starter alltid en ny runde.
// Å vise fasit registrerer ingenting i progresjonen. Et riktig svar etter at fasiten er vist
// er "assisted" og teller som øving, ikke som mestring.

// Antall feil i runden som kreves før studenten kan velge å se fasiten.
export const WRONG_BEFORE_SOLUTION = 2;

export const freshRound = (questionId, round = 0) => ({
  questionId, round, answer: "", result: null, wrongCount: 0, revealed: false,
});

// Tilstand som tilhører en annen oppgave gjenbrukes aldri.
export const roundFor = (state, questionId) => state.questionId === questionId ? state : freshRound(questionId);

export const changeAnswer = (state, answer) => ({ ...state, answer, result: null });

export const canRevealSolution = (state) => state.wrongCount >= WRONG_BEFORE_SOLUTION && !state.revealed;

export function submitAnswer(state, correct) {
  const assisted = correct && state.revealed;
  return {
    assisted,
    state: { ...state, result: { correct, assisted }, wrongCount: correct ? state.wrongCount : state.wrongCount + 1 },
  };
}

export const revealSolution = (state) => canRevealSolution(state) ? { ...state, revealed: true } : state;

export const startNewRound = (state) => freshRound(state.questionId, state.round + 1);
