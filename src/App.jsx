import { useState } from "react";
import TodoForm from "./components/TodoForm";
import TodoList from "./components/TodoList";
import "./App.css";

function App() {
  const [todos, setTodos] = useState([]);

  const addTodo = (text) => {
    console.info("agregando tarea...");

    if (!text.trim()) {
      console.error("Error: el texto está vacío");
      return;
    }

    const newTodo = { id: Date.now(), text, completed: false };
    console.log(" Tarea creada:", newTodo);
    setTodos((prev) => [...prev, newTodo]);
  };

  const toggleTodo = (id) => {
    console.log("Cambiando estado de tarea id:", id);
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id) => {
    const tarea = todos.find((t) => t.id === id);
    if (!tarea) {
      console.error("No se encontró tarea con id:", id);
      return;
    }
    console.info("Eliminando tarea:", tarea);
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  console.log("Estado actual:", todos);

  return (
    <div className="app">
      <h1>📝 To do List</h1>
      <TodoForm onAdd={addTodo} />
      <TodoList todos={todos} onToggle={toggleTodo} onDelete={deleteTodo} />
    </div>
  );
}

export default App;