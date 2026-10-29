import { useRef, useState } from "react";
import { LearningProgressContext } from "./LearningProgressContext.js";
import {
  emptyProgress,
  PROGRESS_KEY,
  readProgress,
  recordAnswer,
  updateLessonProgress,
} from "../progress/progress.js";

function loadProgress() {
  try {
    return { progress: readProgress(window.localStorage), storageError: "" };
  } catch {
    return {
      progress: emptyProgress(),
      storageError: "Lagret progresjon kunne ikke leses. Du kan fortsatt øve i denne økten.",
    };
  }
}

export default function LearningProgressProvider({ children }) {
  const [state, setState] = useState(loadProgress);
  // Keep consecutive actions in sync without side effects inside a state updater.
  const progressRef = useRef(state.progress);

  function updateProgress(change) {
    const progress = change(progressRef.current);
    progressRef.current = progress;
    let storageError = "";
    try {
      window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    } catch {
      storageError = "Progresjonen kunne ikke lagres på enheten. Den beholdes bare i denne økten.";
    }
    setState({ progress, storageError });
  }

  function setReviewed(lessonKey, reviewed) {
    updateProgress((progress) => updateLessonProgress(progress, lessonKey, (lesson) => ({
      ...lesson,
      reviewed,
    })));
  }

  function submitAnswer(lessonKey, questionId, correct) {
    updateProgress((progress) => recordAnswer(progress, lessonKey, questionId, correct));
  }

  return (
    <LearningProgressContext.Provider value={{ ...state, setReviewed, submitAnswer }}>
      {children}
    </LearningProgressContext.Provider>
  );
}
