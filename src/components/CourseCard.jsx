import { Link } from "react-router-dom";
import { coursePath, getLessonCount } from "../content/courses.js";

export default function CourseCard({ course }) {
  return (
    <article className="course-card">
      <div className="course-card-top">
        <span className="course-icon" aria-hidden="true">⌘</span>
        <span className="status-badge">{course.status === "available" ? "Tilgjengelig" : "Under utvikling"}</span>
      </div>
      <h2><Link to={coursePath(course.id)}>{course.title}</Link></h2>
      <p>{course.description}</p>
      <div className="course-meta">
        <span>{course.modules.length} moduler</span>
        <span>{getLessonCount(course)} leksjoner</span>
      </div>
      <Link className="text-link" to={coursePath(course.id)}>
        Utforsk kurset <span aria-hidden="true">→</span>
      </Link>
    </article>
  );
}
