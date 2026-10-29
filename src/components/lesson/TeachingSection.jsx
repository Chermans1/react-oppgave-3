import { useId } from "react";
import TeachingBlock from "./TeachingBlock.jsx";

export default function TeachingSection({ section, number, lesson, lessonKey, sectionRef }) {
  const headingId = useId();
  return (
    <section className="teaching-section" aria-labelledby={headingId} tabIndex={-1} ref={sectionRef}>
      <header className="teaching-section-heading">
        <span className="eyebrow">Seksjon {number} · {section.stage}</span>
        <h2 id={headingId}>{section.title}</h2>
      </header>
      {section.blocks.map((block, index) => (
        <TeachingBlock key={index} block={block} lesson={lesson} lessonKey={lessonKey} />
      ))}
    </section>
  );
}
