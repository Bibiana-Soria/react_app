import { useEffect, useMemo, useState } from "react";
import TodoForm from "./components/TodoForm";
import TodoList from "./components/TodoList";
import "./App.css";

const STORAGE_KEY = "todo-app-items-v2";
const FILTERS = {
  all: "Todas",
  active: "Pendientes",
  completed: "Completadas",
};
const COLUMN_CONFIG = [
  { key: "todo", title: "Por hacer", accent: "todo" },
  { key: "doing", title: "En progreso", accent: "doing" },
  { key: "done", title: "Completadas", accent: "done" },
];

const normalizeTodo = (todo) => ({
  id: todo.id ?? Date.now(),
  text: todo.text ?? "",
  completed: Boolean(todo.completed),
  status: todo.status ?? (todo.completed ? "done" : "todo"),
  dueDate: todo.dueDate ?? "",
});

const toDateKey = (date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDateLabel = (value) => {
  if (!value) {
    return "Sin fecha";
  }

  const safeDate = new Date(`${value}T12:00:00`);
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
  }).format(safeDate);
};

function App() {
  const [todos, setTodos] = useState(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed.map(normalizeTodo) : [];
    } catch {
      return [];
    }
  });
  const [filter, setFilter] = useState("all");
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  const completedCount = todos.filter((todo) => todo.completed).length;
  const pendingCount = todos.length - completedCount;
  const progress = todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0;

  const filteredTodos = useMemo(() => {
    if (filter === "active") {
      return todos.filter((todo) => !todo.completed);
    }

    if (filter === "completed") {
      return todos.filter((todo) => todo.completed);
    }

    return todos;
  }, [filter, todos]);

  const groupedTasks = useMemo(() => {
    return COLUMN_CONFIG.reduce((acc, column) => {
      acc[column.key] = todos.filter((todo) => todo.status === column.key);
      return acc;
    }, {});
  }, [todos]);

  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];

    for (let i = startOffset; i > 0; i -= 1) {
      const date = new Date(year, month, 1 - i);
      days.push({ date, isCurrentMonth: false });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      days.push({ date: new Date(year, month, day), isCurrentMonth: true });
    }

    while (days.length % 7 !== 0) {
      const nextDate = new Date(year, month + 1, days.length - daysInMonth - startOffset + 1);
      days.push({ date: nextDate, isCurrentMonth: false });
    }

    return days;
  }, [viewDate]);

  const tasksByDate = useMemo(() => {
    return todos.reduce((acc, todo) => {
      if (!todo.dueDate) {
        return acc;
      }

      if (!acc.has(todo.dueDate)) {
        acc.set(todo.dueDate, []);
      }

      acc.get(todo.dueDate).push(todo);
      return acc;
    }, new Map());
  }, [todos]);

  const selectedTasks = useMemo(() => {
    return (tasksByDate.get(selectedDate) ?? []).sort((a, b) => a.text.localeCompare(b.text));
  }, [selectedDate, tasksByDate]);

  const addTodo = (text, dueDate) => {
    const cleanText = text.trim();

    if (!cleanText) {
      return;
    }

    const newTodo = { id: Date.now(), text: cleanText, completed: false, status: "todo", dueDate };
    setTodos((prev) => [newTodo, ...prev]);
  };

  const toggleTodo = (id) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id
          ? {
              ...todo,
              completed: !todo.completed,
              status: todo.completed ? "todo" : "done",
            }
          : todo
      )
    );
  };

  const moveTodo = (id, direction) => {
    const statusOrder = ["todo", "doing", "done"];

    setTodos((prev) =>
      prev.map((todo) => {
        if (todo.id !== id) {
          return todo;
        }

        const currentIndex = statusOrder.indexOf(todo.status);
        const nextIndex = Math.min(statusOrder.length - 1, Math.max(0, currentIndex + direction));
        return { ...todo, status: statusOrder[nextIndex], completed: statusOrder[nextIndex] === "done" };
      })
    );
  };

  const deleteTodo = (id) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  const clearCompleted = () => {
    setTodos((prev) => prev.filter((todo) => !todo.completed));
  };

  const changeMonth = (direction) => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
  };

  return (
    <div className="app-shell">
      <div className="app-card">
        <header className="app-header">
          <div>
            <p className="eyebrow">Productividad diaria</p>
            <h1>Gestor de tareas</h1>
            <p className="subtitle">
              Organiza tu agenda, prioriza lo importante y mantiene tu trabajo a la vista.
            </p>
          </div>

          <div className="stats" aria-label="Resumen de tareas">
            <div className="stat-pill">
              <span>{todos.length}</span>
              <small>Total</small>
            </div>
            <div className="stat-pill">
              <span>{pendingCount}</span>
              <small>Pendientes</small>
            </div>
            <div className="stat-pill">
              <span>{completedCount}</span>
              <small>Hechas</small>
            </div>
          </div>
        </header>

        <section className="hero-grid">
          <div className="progress-card" aria-label="Progreso de tareas">
            <div className="progress-meta">
              <span>Progreso del día</span>
              <strong>{progress}%</strong>
            </div>
            <div className="progress-bar" aria-hidden="true">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="insight-card">
            <h2>Tu espacio de trabajo</h2>
            <p>Combina seguimiento rápido, tablero visual y calendario para planificar mejor cada semana.</p>
          </div>
        </section>

        <section className="main-layout">
          <div className="panel panel-list">
            <TodoForm onAdd={addTodo} />

            <div className="toolbar">
              <div className="filter-group" role="tablist" aria-label="Filtrar tareas">
                {Object.entries(FILTERS).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    className={`filter-button ${filter === value ? "active" : ""}`}
                    onClick={() => setFilter(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {completedCount > 0 && (
                <button type="button" className="secondary-button" onClick={clearCompleted}>
                  Limpiar completadas
                </button>
              )}
            </div>

            <TodoList todos={filteredTodos} onToggle={toggleTodo} onDelete={deleteTodo} />
          </div>

          <div className="panel panel-side">
            <div className="panel-section">
              <div className="section-heading">
                <h2>Tablero Kanban</h2>
                <p>Mueve tus tareas entre etapas para visualizar tu flujo.</p>
              </div>

              <div className="kanban-board">
                {COLUMN_CONFIG.map((column) => (
                  <div className={`kanban-column ${column.accent}`} key={column.key}>
                    <div className="kanban-column-header">
                      <h3>{column.title}</h3>
                      <span>{groupedTasks[column.key].length}</span>
                    </div>

                    <div className="kanban-cards">
                      {groupedTasks[column.key].length === 0 ? (
                        <p className="empty-mini">Sin tareas</p>
                      ) : (
                        groupedTasks[column.key].map((todo) => (
                          <article className="kanban-card" key={todo.id}>
                            <p>{todo.text}</p>
                            {todo.dueDate ? <span className="chip">{formatDateLabel(todo.dueDate)}</span> : null}
                            <div className="kanban-actions">
                              <button
                                type="button"
                                className="mini-button"
                                onClick={() => moveTodo(todo.id, -1)}
                                disabled={column.key === "todo"}
                              >
                                ←
                              </button>
                              <button
                                type="button"
                                className="mini-button"
                                onClick={() => moveTodo(todo.id, 1)}
                                disabled={column.key === "done"}
                              >
                                →
                              </button>
                            </div>
                          </article>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel-section">
              <div className="section-heading">
                <h2>Calendario</h2>
                <p>Revisa tus tareas por fecha y mantén el seguimiento visual.</p>
              </div>

              <div className="calendar-toolbar">
                <button type="button" className="secondary-button" onClick={() => changeMonth(-1)}>
                  ←
                </button>
                <strong>
                  {viewDate.toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
                </strong>
                <button type="button" className="secondary-button" onClick={() => changeMonth(1)}>
                  →
                </button>
              </div>

              <div className="calendar-weekdays">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>

              <div className="calendar-grid">
                {calendarDays.map((item, index) => {
                  const dateKey = toDateKey(item.date);
                  const isSelected = dateKey === selectedDate;
                  const hasTasks = tasksByDate.has(dateKey);
                  const isToday = dateKey === toDateKey(new Date());

                  return (
                    <button
                      key={`${dateKey}-${index}`}
                      type="button"
                      className={`calendar-day ${item.isCurrentMonth ? "" : "muted"} ${isSelected ? "selected" : ""} ${isToday ? "today" : ""}`}
                      onClick={() => setSelectedDate(dateKey)}
                    >
                      <span>{item.date.getDate()}</span>
                      {hasTasks ? <small>•</small> : null}
                    </button>
                  );
                })}
              </div>

              <div className="calendar-details">
                <h3>{formatDateLabel(selectedDate)}</h3>
                {selectedTasks.length > 0 ? (
                  <ul>
                    {selectedTasks.map((todo) => (
                      <li key={todo.id}>{todo.text}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No hay tareas programadas para este día.</p>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;