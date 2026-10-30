export function normalizeCodeAnswer(answer, whitespace = "trim") {
  const trimmed = answer.trim();
  if (whitespace === "json") {
    // Parse data only; string contents remain intact and no JavaScript is run.
    try { return JSON.stringify(JSON.parse(trimmed)); } catch { return trimmed; }
  }
  if (whitespace === "jsx-integer") {
    // Only a brace-wrapped decimal integer. Never rewrite arbitrary JavaScript.
    const match = /^\{\s*([0-9]+)\s*\}$/.exec(trimmed);
    return match ? `{${match[1]}}` : trimmed;
  }
  return whitespace === "collapse" ? trimmed.replace(/\s+/g, " ") : trimmed;
}

export function checkAnswer(question, answer) {
  if (question.type === "FillInCodeQuestion") {
    const normalized = normalizeCodeAnswer(answer, question.whitespace);
    return normalized.length > 0 && question.validAnswers.some(
      (valid) => normalizeCodeAnswer(valid, question.whitespace) === normalized,
    );
  }
  if (["MultipleChoiceQuestion", "FindTheBugQuestion"].includes(question.type)) {
    return question.options.some((option) => option.id === answer) && answer === question.correctAnswer;
  }
  return false;
}

export function getSolution(question) {
  if (question.type === "FillInCodeQuestion") return question.validAnswers[0];
  return question.options.find((option) => option.id === question.correctAnswer)?.text;
}
