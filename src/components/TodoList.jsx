function TodoList({ todos, onToggle, onDelete }) {
  if (todos.length === 0) {
    return (
      <div className="empty-state">
        <p>No hay tareas en esta vista.</p>
        <p>Agrega una nueva tarea para empezar.</p>
      </div>
    );
  }

  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <li key={todo.id} className={`todo-item ${todo.completed ? "completed" : ""}`}>
          <button
            type="button"
            className="check-button"
            onClick={() => onToggle(todo.id)}
            aria-pressed={todo.completed}
            aria-label={todo.completed ? "Marcar como pendiente" : "Marcar como completada"}
          >
            ✓
          </button>

          <div className="todo-content">
            <div className="todo-copy">
              <span className="todo-text" onClick={() => onToggle(todo.id)}>
                {todo.text}
              </span>
              {todo.dueDate ? (
                <span className="todo-date">
                  {new Intl.DateTimeFormat("es-ES", {
                    day: "numeric",
                    month: "short",
                  }).format(new Date(`${todo.dueDate}T12:00:00`))}
                </span>
              ) : null}
            </div>
            <button type="button" className="delete-button" onClick={() => onDelete(todo.id)}>
              Eliminar
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default TodoList;