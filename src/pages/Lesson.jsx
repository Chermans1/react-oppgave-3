import { useParams } from "react-router-dom";
import {
  coursePath,
  getCourse,
  getLessonNavigation,
  modulePath,
} from "../content/courses.js";
import Breadcrumbs from "../components/Breadcrumbs.jsx";
import LessonView from "../components/LessonView.jsx";
import NotFound from "./NotFound.jsx";

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
      <LessonView
        lesson={lesson}
        navigation={getLessonNavigation(course, module.id, lesson.id)}
      />
    </>
  );
}
