import { useState } from "react";

function TodoForm({ onAdd }) {
  const [input, setInput] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const value = input.trim();

    if (!value) {
      setError("Escribe una tarea para continuar.");
      return;
    }

    setError("");
    onAdd(value, dueDate);
    setInput("");
    setDueDate("");
  };

  return (
    <form className="todo-form" onSubmit={handleSubmit} noValidate>
      <label className="sr-only" htmlFor="todo-input">
        Nueva tarea
      </label>
      <input
        id="todo-input"
        type="text"
        placeholder="Añade una nueva tarea..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        aria-label="Fecha de vencimiento"
      />
      <button type="submit">Agregar tarea</button>
      {error ? <p className="form-error">{error}</p> : null}
    </form>
  );
}

export default TodoForm;