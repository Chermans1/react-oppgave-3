import { Link } from "react-router-dom";

import LessonExercises from "./LessonExercises.jsx";
import LessonSections from "./lesson/LessonSections.jsx";
import LessonGoals from "./LessonGoals.jsx";
import LessonProgress from "./LessonProgress.jsx";

export default function LessonView({ lesson, navigation, lessonKey }) {
  return (
    <>
      <header className="intro">
        <span className="eyebrow">
          LEKSJON · {lesson.status === "planned" ? "PLANLAGT" : "KURSINNHOLD"}
        </span>
        <h1>{lesson.title}</h1>
      </header>
      <article className="lesson-panel">
        {lesson.status === "planned" && (
          <p className="notice">
            Denne leksjonen er planlagt. Undervisningsinnhold og oppgaver kommer senere.
          </p>
        )}
        <LessonGoals lesson={lesson} lessonKey={lessonKey} />
        {lesson.sections?.length ? (
          <LessonSections lesson={lesson} lessonKey={lessonKey} />
        ) : (
          <>
            <section>
              <h2>Forklaring</h2>
              {lesson.content.length ? (
                lesson.content.map((paragraph, index) => <p key={index}>{paragraph}</p>)
              ) : (
                <p className="muted">Forklaringsteksten er ikke publisert ennå.</p>
              )}
            </section>
            <section>
              <h2>Kodeeksempler</h2>
              {lesson.codeExamples.length ? (
                lesson.codeExamples.map((example) => (
                  <figure key={example.id}>
                    <figcaption>{example.title}</figcaption>
                    <pre><code>{example.code}</code></pre>
                  </figure>
                ))
              ) : (
                <p className="muted">Kodeeksempler kommer her.</p>
              )}
            </section>
            <section className="exercise-placeholder">
              <span className="eyebrow">PRØV SELV</span>
              <h2>Interaktive oppgaver</h2>
              <LessonExercises lesson={lesson} lessonKey={lessonKey} />
            </section>
            <LessonProgress lesson={lesson} lessonKey={lessonKey} />
          </>
        )}
      </article>
      <nav className="lesson-navigation" aria-label="Leksjonsnavigasjon">
        {navigation.previous ? (
          <Link to={navigation.previous.path}>
            <span>← Forrige leksjon</span>
            <strong>{navigation.previous.title}</strong>
          </Link>
        ) : (
          <p className="muted">Dette er kursets første leksjon.</p>
        )}
        {navigation.next ? (
          <Link to={navigation.next.path}>
            <span>Neste leksjon →</span>
            <strong>{navigation.next.title}</strong>
          </Link>
        ) : (
          <p className="muted">Dette er kursets siste leksjon.</p>
        )}
      </nav>
    </>
  );
}
