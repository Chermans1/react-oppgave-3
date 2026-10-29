import { useRef } from "react";
import TeachingSection from "./TeachingSection.jsx";

export default function LessonSections({ lesson, lessonKey }) {
  const sections = useRef({});

  function goToSection(id) {
    const section = sections.current[id];
    section?.focus({ preventScroll: true });
    section?.scrollIntoView({ block: "start" });
  }

  return (
    <>
      <nav className="lesson-contents" aria-label="Seksjoner i leksjonen">
        <h2>Velg hvor du vil begynne</h2>
        <p className="muted">Du kan gå rett til oppgavene og tilbake til forklaringene når du vil.</p>
        <ol>{lesson.sections.map((section, index) => (
          <li key={section.id}>
            <button type="button" onClick={() => goToSection(section.id)}>
              <span>{index + 1}</span>{section.title}
            </button>
          </li>
        ))}</ol>
      </nav>
      <div className="teaching-sections">
        {lesson.sections.map((section, index) => (
          <TeachingSection
            key={section.id}
            section={section}
            number={index + 1}
            lesson={lesson}
            lessonKey={lessonKey}
            sectionRef={(node) => { sections.current[section.id] = node; }}
          />
        ))}
      </div>
    </>
  );
}
