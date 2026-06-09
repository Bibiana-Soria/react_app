function TodoList({ todos, onToggle, onDelete }) {
  console.info("Renderizando lista con", todos.length, "tareas");

  if (todos.length === 0) {
    return <p>No hay tareas aún. ¡Agrega una!</p>;
  }

  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>
          <span
            onClick={() => onToggle(todo.id)}
            style={{
              textDecoration: todo.completed ? "line-through" : "none",
              cursor: "pointer",
              marginRight: "10px",
            }}
          >
            {todo.text}
          </span>
          <button onClick={() => onDelete(todo.id)}>🗑️</button>
        </li>
      ))}
    </ul>
  );
}

export default TodoList;