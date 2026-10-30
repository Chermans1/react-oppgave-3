import { useRef, useState } from "react";
import { LearningProgressContext } from "./LearningProgressContext.js";
import { recordAnswer, updateLessonProgress } from "../progress/progress.js";
import { changeProgressSession, loadProgressSession, recoverProgressSession, saveProgressSession } from "../progress/storage.js";

const browserStorage = () => window.localStorage;

export default function LearningProgressProvider({ children, getStorage = browserStorage }) {
  const [state, setState] = useState(() => loadProgressSession(getStorage));
  const sessionRef = useRef(state);

  function applySession(next) {
    sessionRef.current = next;
    setState(next);
  }

  function updateProgress(change) {
    applySession(changeProgressSession(sessionRef.current, change, getStorage));
  }

  function setReviewed(lessonKey, reviewed) {
    updateProgress((progress) => updateLessonProgress(progress, lessonKey, (lesson) => ({ ...lesson, reviewed })));
  }

  function submitAnswer(lessonKey, questionId, correct, revision = 1) {
    updateProgress((progress) => recordAnswer(progress, lessonKey, questionId, correct, revision));
  }

  function recoverStoredProgress() {
    applySession(recoverProgressSession(sessionRef.current, getStorage));
  }

  function replaceStoredProgress() {
    applySession(saveProgressSession(sessionRef.current, getStorage));
  }

  return <LearningProgressContext.Provider value={{ ...state, setReviewed, submitAnswer, recoverStoredProgress, replaceStoredProgress }}>
    {children}
  </LearningProgressContext.Provider>;
}
