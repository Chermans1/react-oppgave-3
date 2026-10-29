import { useContext } from "react";
import { TodoContext } from "../context/TodoContext.js";

function TodoList() {
  const { todos, toggleTodo, removeTodo } = useContext(TodoContext);

  return (
    <div className="goals-list-section">
      <div className="list-heading">
        <h3>
          Dine mål <span className="count-badge">{todos.length}</span>
        </h3>
        <span>Små steg fremover</span>
      </div>
      {todos.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon" aria-hidden="true">
            ◎
          </span>
          <h3>Det starter med ett mål</h3>
          <p>
            Legg til ditt første læringsmål ovenfor.
            <br />
            Din neste mestringsopplevelse venter.
          </p>
        </div>
      ) : (
        <ul className="todo-list">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className={todo.done ? "todo-item completed" : "todo-item"}
            >
              <label className="todo-label">
                <input
                  type="checkbox"
                  checked={todo.done}
                  onChange={() => toggleTodo(todo.id)}
                />
                <span>{todo.text}</span>
              </label>
              <button
                className="remove-button"
                type="button"
                onClick={() => removeTodo(todo.id)}
                aria-label={`Slett læringsmål: ${todo.text}`}
                title="Slett læringsmål"
              >
                X
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default TodoList;
