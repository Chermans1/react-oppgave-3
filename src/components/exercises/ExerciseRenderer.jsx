import { useLearningProgress } from "../../hooks/useLearningProgress.js";
import MultipleChoiceQuestion from "./MultipleChoiceQuestion.jsx";
import FillInCodeQuestion from "./FillInCodeQuestion.jsx";
import FindTheBugQuestion from "./FindTheBugQuestion.jsx";

const questionTypes = { MultipleChoiceQuestion, FillInCodeQuestion, FindTheBugQuestion };

export default function ExerciseRenderer({ question, number, lessonKey }) {
  const { progress, submitAnswer } = useLearningProgress();
  const Component = questionTypes[question.type];
  if (!Component) return <p className="notice">Denne oppgavetypen støttes ikke ennå.</p>;

  return (
    <Component
      question={question}
      number={number}
      attempt={progress.lessons[lessonKey]?.answers[question.id]}
      onAnswer={(correct) => submitAnswer(lessonKey, question.id, correct)}
    />
  );
}
