import { useContext, useState } from "react";
import { TodoContext } from "../context/TodoContext.js";

function AddTodo() {
  const { addTodo } = useContext(TodoContext);
  const [text, setText] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    if (!text.trim()) return;
    addTodo(text);
    setText("");
  }

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <label htmlFor="learning-goal">Hva ønsker du å lære?</label>
      <div className="input-row">
        <input
          id="learning-goal"
          type="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="F.eks. forstå hvordan useContext fungerer"
          required
        />
        <button
          className="primary-button"
          type="submit"
          disabled={!text.trim()}
        >
          <span aria-hidden="true">+</span> Legg til
        </button>
      </div>
      <p className="input-hint">
        Et konkret mål gjør det enklere å komme i gang.
      </p>
    </form>
  );
}

export default AddTodo;
