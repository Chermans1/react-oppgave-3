import { Link, useParams } from "react-router-dom";
import { coursePath, getCourse, getLessonCount, lessonPath, modulePath } from "../content/courses.js";
import Breadcrumbs from "../components/Breadcrumbs.jsx";
import NotFound from "./NotFound.jsx";

export default function CourseDetails() {
  const { courseId } = useParams();
  const course = getCourse(courseId);
  if (!course) return <NotFound />;
  const firstAvailable = course.modules.flatMap((module) =>
    module.lessons.map((lesson) => ({ module, lesson })),
  ).find(({ lesson }) => lesson.status !== "planned");

  return (
    <>
      <Breadcrumbs items={[{ label: course.title }]} />
      <header className="intro">
        <span className="eyebrow">KURSPLAN · UNDER UTVIKLING</span>
        <h1>{course.title}</h1>
        <p>{course.description}</p>
      </header>
      <div className="course-summary">
        <span><strong>{course.modules.length}</strong> moduler</span>
        <span><strong>{getLessonCount(course)}</strong> leksjoner</span>
        <span>Fra grunnleggende til avansert</span>
      </div>
      <p className="notice">
        {firstAvailable ? (
          <>
            Prøv en leksjon: <Link to={lessonPath(course.id, firstAvailable.module.id, firstAvailable.lesson.id)}>
              {firstAvailable.lesson.title}
            </Link>. Flere leksjoner kommer etter hvert.
          </>
        ) : "Kursstrukturen er klar. Undervisningsinnhold og oppgaver kommer senere."}
      </p>
      <section className="page-section" aria-labelledby="modules-title">
        <div className="section-heading">
          <h2 id="modules-title">Moduler i kurset</h2>
          <Link className="text-link" to={`${coursePath(course.id)}/moduler`}>
            Se moduloversikten →
          </Link>
        </div>
        <ol className="module-list">
          {course.modules.map((module, index) => (
            <li key={module.id}>
              <span className="module-number" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3><Link to={modulePath(course.id, module.id)}>{module.title}</Link></h3>
                <p>{module.description}</p>
                <span className="muted">{module.lessons.length} leksjoner</span>
              </div>
              <span className="module-arrow" aria-hidden="true">↗</span>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
