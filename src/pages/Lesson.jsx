import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { loadLesson } from "../content/loadLesson.js";
import {
  coursePath,
  getCourse,
  getLessonNavigation,
  lessonPath,
  modulePath,
} from "../content/courses.js";
import Breadcrumbs from "../components/Breadcrumbs.jsx";
import LessonView from "../components/LessonView.jsx";
import NotFound from "./NotFound.jsx";

function LessonContent({ courseId, moduleId, lessonId, lessonKey, navigation }) {
  const [result, setResult] = useState({ lesson: null, error: false });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    loadLesson(courseId, moduleId, lessonId).then(
      (lesson) => { if (active) setResult({ lesson, error: false }); },
      () => { if (active) setResult({ lesson: null, error: true }); },
    );
    return () => { active = false; };
  }, [courseId, moduleId, lessonId, attempt]);
  if (result.error) return <div role="alert"><p>Leksjonen kunne ikke lastes. Kontroller forbindelsen og prøv igjen.</p>
    <button type="button" onClick={() => { setResult({ lesson: null, error: false }); setAttempt((n) => n + 1); }}>Prøv igjen</button></div>;
  if (!result.lesson) return <p role="status">Laster leksjon…</p>;
  return <LessonView lessonKey={lessonKey} lesson={result.lesson} navigation={navigation} />;
}

export default function Lesson() {
  const { courseId, moduleId, lessonId } = useParams();
  const course = getCourse(courseId);
  const module = course?.modules.find((item) => item.id === moduleId);
  const lesson = module?.lessons.find((item) => item.id === lessonId);
  if (!lesson) return <NotFound />;

  return (
    <>
      <Breadcrumbs items={[
        { label: course.title, to: coursePath(course.id) },
        { label: module.title, to: modulePath(course.id, module.id) },
        { label: lesson.title },
      ]} />
      <LessonContent
        key={lessonPath(course.id, module.id, lesson.id)}
        courseId={course.id}
        moduleId={module.id}
        lessonId={lesson.id}
        lessonKey={lessonPath(course.id, module.id, lesson.id)}
        navigation={getLessonNavigation(course, module.id, lesson.id)}
      />
    </>
  );
}
