import { useState } from "react";

function TodoForm({ onAdd }) {
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submit con valor:", input);
    onAdd(input);
    setInput("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Escribe una tarea..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button type="submit">Agregar</button>
    </form>
  );
}

export default TodoForm;