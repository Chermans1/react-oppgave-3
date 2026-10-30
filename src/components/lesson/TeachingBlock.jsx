import PracticalActivity from "./PracticalActivity.jsx";
import ComponentTree from "./ComponentTree.jsx";
import VisualExample from "./VisualExample.jsx";
import LessonExercises from "../LessonExercises.jsx";
import LessonGoals from "../LessonGoals.jsx";
import LessonProgress from "../LessonProgress.jsx";

export default function TeachingBlock({ block, lesson, lessonKey }) {
  switch (block.type) {
    case "paragraph":
      return <p className="teaching-paragraph">{block.text}</p>;
    case "list":
      return <ul className="teaching-list">{block.items.map((item, index) => <li key={index}>{item}</li>)}</ul>;
    case "code":
      return (
        <figure className="teaching-code">
          <figcaption>{block.title}<span>{block.language}</span></figcaption>
          <pre><code>{block.code}</code></pre>
          {block.notes?.length > 0 && (
            <dl className="code-notes">{block.notes.map((note) => (
              <div key={note.term}><dt><code>{note.term}</code></dt><dd>{note.text}</dd></div>
            ))}</dl>
          )}
        </figure>
      );
    case "componentTree":
      return <ComponentTree {...block} />;
    case "preview":
      return <VisualExample {...block} />;
    case "exercises":
      return <LessonExercises lesson={lesson} lessonKey={lessonKey} exerciseIds={block.exerciseIds} />;
    case "practical":
      return <PracticalActivity activity={lesson.practicalActivities?.find((activity) => activity.id === block.activityId)} />;
    case "resources":
      return <aside className="lesson-resources" aria-label="Videre lesing"><h3>Videre lesing</h3>
        <ul>{block.links.map((link) => <li key={link.url}><a href={link.url}>{link.title}</a></li>)}</ul>
      </aside>;
    case "goals":
      return <LessonGoals lesson={lesson} lessonKey={lessonKey} title={block.title} nested />;
    case "progress":
      return <LessonProgress lesson={lesson} lessonKey={lessonKey} nested />;
    default:
      return null;
  }
}
