import { useContext } from "react";
import { LearningProgressContext } from "../context/LearningProgressContext.js";

export function useLearningProgress() {
  const context = useContext(LearningProgressContext);
  if (!context) throw new Error("useLearningProgress må brukes i LearningProgressProvider.");
  return context;
}
