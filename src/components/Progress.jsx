import { useContext } from "react";
import { TodoContext } from "../context/TodoContext.js";

function Progress() {
  const { todos } = useContext(TodoContext);
  const completedCount = todos.filter((todo) => todo.done).length;
  const percentage =
    todos.length === 0 ? 0 : Math.round((completedCount / todos.length) * 100);

  return (
    <section className="progress-panel" aria-labelledby="progress-title">
      <span className="eyebrow">SE HVOR LANGT DU HAR KOMMET</span>
      <h2 id="progress-title">Din progresjon</h2>
      <div className="progress-number" aria-live="polite">
        {completedCount}
        <span> / {todos.length}</span>
      </div>
      <p className="progress-caption">læringsmål fullført</p>
      <div className="progress-label">
        <span>Fullført</span>
        <strong>{percentage} %</strong>
      </div>
      <progress
        value={completedCount}
        max={todos.length || 1}
        aria-label="Andel fullførte læringsmål"
      />
      <p className="progress-message">
        {todos.length === 0
          ? "Klar for en ny start? Legg til et mål!"
          : completedCount === todos.length
            ? "Godt jobbet! Du har fullført alle målene dine."
            : "Du er på vei. Ett mål av gangen!"}
      </p>
    </section>
  );
}

export default Progress;
