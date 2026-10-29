import { Link, useParams } from "react-router-dom";
import { coursePath, getCourse, lessonPath, modulePath } from "../content/courses.js";
import Breadcrumbs from "../components/Breadcrumbs.jsx";
import NotFound from "./NotFound.jsx";

export default function Modules() {
  const { courseId, moduleId } = useParams();
  const course = getCourse(courseId);
  const selectedModule = course?.modules.find((module) => module.id === moduleId);
  if (!course || (moduleId && !selectedModule)) return <NotFound />;

  const modules = selectedModule ? [selectedModule] : course.modules;
  const breadcrumbs = [
    { label: course.title, to: coursePath(course.id) },
    ...(selectedModule
      ? [
          { label: "Moduler", to: `${coursePath(course.id)}/moduler` },
          { label: selectedModule.title },
        ]
      : [{ label: "Moduler" }]),
  ];

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <header className="intro">
        <span className="eyebrow">
          {selectedModule ? `MODUL ${course.modules.indexOf(selectedModule) + 1}` : "KURSSTRUKTUR"}
        </span>
        <h1>{selectedModule?.title ?? "Moduloversikt"}</h1>
        <p>{selectedModule?.description ?? `Se alle modulene og de planlagte leksjonene i ${course.title}.`}</p>
      </header>
      <div className="module-sections page-section">
        {modules.map((module) => (
          <section className="module-panel" key={module.id}>
            {!selectedModule && (
              <>
                <h2><Link to={modulePath(course.id, module.id)}>{module.title}</Link></h2>
                <p className="muted">{module.description}</p>
              </>
            )}
            <h2 className="lessons-heading">Planlagte leksjoner</h2>
            <ol className="lesson-list">
              {module.lessons.map((lesson) => (
                <li key={lesson.id}>
                  <Link to={lessonPath(course.id, module.id, lesson.id)}>
                    <span>{lesson.title}</span>
                    <span className="status-badge">Planlagt</span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </>
  );
}
