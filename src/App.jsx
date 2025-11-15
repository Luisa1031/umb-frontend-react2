import React, { useState, useEffect } from "react";
import "./styles.css";

// 🚨 URL de tu servicio de Render (AJUSTA SI ES DIFERENTE)
// Esta es la URL de ejemplo que usaste: https://umb-web-taller-l5h5.onrender.com
const API_URL = "https://umb-web-taller-l5h5.onrender.com";

// Definición de tipos para las tareas
/**
 * @typedef {object} Tarea
 * @property {number} id - ID único de la tarea.
 * @property {string} titulo - Título de la tarea.
 * @property {number} completada - 0 (no completada) o 1 (completada).
 */

export default function App() {
  /** @type {[Tarea[], React.Dispatch<React.SetStateAction<Tarea[]>>]} */
  const [tareas, setTareas] = useState([]);
  const [nuevaTarea, setNuevaTarea] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // =========================================================
  // CRUD: READ (OBTENER TODAS LAS TAREAS)
  // =========================================================
  const fetchTareas = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      /** @type {Tarea[]} */
      const data = await response.json();
      setTareas(data);
    } catch (err) {
      console.error("Error al obtener tareas:", err);
      setError(
        "Error al cargar las tareas. Asegúrate de que el Backend de Render esté activo."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTareas();
  }, []);

  // =========================================================
  // CRUD: CREATE (AÑADIR UNA NUEVA TAREA)
  // =========================================================
  const agregarTarea = async (e) => {
    e.preventDefault();
    if (!nuevaTarea.trim()) return;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ titulo: nuevaTarea }),
      });

      if (!response.ok) {
        throw new Error("Fallo al agregar la tarea");
      }

      // Recarga la lista después de agregar
      await fetchTareas();
      setNuevaTarea(""); // Limpia el input
    } catch (err) {
      console.error("Error al agregar tarea:", err);
      setError("Error al crear tarea. Verifica la conexión con el Backend.");
    }
  };

  // =========================================================
  // CRUD: DELETE (ELIMINAR TAREA)
  // =========================================================
  const eliminarTarea = async (id, titulo) => {
    if (!window.confirm(`¿Estás seguro de eliminar la tarea: "${titulo}"?`)) {
      return;
    }

    try {
      // Envía el ID en el query string para que el Backend lo procese
      const response = await fetch(`${API_URL}?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Fallo al eliminar la tarea");
      }

      // Actualiza el estado localmente (más rápido)
      setTareas(tareas.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Error al eliminar tarea:", err);
      setError("Error al eliminar tarea. Inténtalo de nuevo.");
    }
  };

  // =========================================================
  // CRUD: UPDATE (MARCAR/DESMARCAR TAREA COMO COMPLETADA)
  // =========================================================
  const toggleCompletada = async (tarea) => {
    // Calcula el nuevo estado (1 si estaba en 0, 0 si estaba en 1)
    const nuevoEstado = tarea.completada === 1 ? 0 : 1;

    try {
      const response = await fetch(API_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: tarea.id,
          completada: nuevoEstado,
        }),
      });

      if (!response.ok) {
        throw new Error("Fallo al actualizar el estado");
      }

      // Actualiza el estado localmente
      setTareas(
        tareas.map((t) =>
          t.id === tarea.id ? { ...t, completada: nuevoEstado } : t
        )
      );
    } catch (err) {
      console.error("Error al actualizar tarea:", err);
      setError("Error al actualizar la tarea. Revisa el log del servidor.");
    }
  };

  // =========================================================
  // RENDERIZADO DEL COMPONENTE
  // =========================================================
  return (
    <div className="task-container">
      <h1>Lista de Tareas (React + PHP/MySQL)</h1>

      {/* Formulario para Crear Tarea */}
      <form onSubmit={agregarTarea} className="task-form">
        <input
          type="text"
          placeholder="Escribe una nueva tarea..."
          value={nuevaTarea}
          onChange={(e) => setNuevaTarea(e.target.value)}
          aria-label="Nueva tarea"
        />
        <button type="submit">Añadir</button>
      </form>

      {/* Manejo de Estados */}
      {error && <p className="error-message">{error}</p>}

      {loading ? (
        <p className="loading">Cargando tareas...</p>
      ) : (
        <ul className="task-list">
          {tareas.length === 0 ? (
            <p className="no-tasks">No hay tareas pendientes. ¡Añade una!</p>
          ) : (
            tareas.map((tarea) => (
              <li
                key={tarea.id}
                className={`task-item ${
                  tarea.completada === 1 ? "completed" : ""
                }`}
              >
                {/* Título (Al hacer clic, cambia el estado) */}
                <span
                  className="task-title"
                  onClick={() => toggleCompletada(tarea)}
                >
                  {tarea.titulo}
                </span>

                {/* Botón de Eliminar */}
                <button
                  onClick={() => eliminarTarea(tarea.id, tarea.titulo)}
                  className="delete-btn"
                  // Accesibilidad: importante para botones sin texto visible
                  aria-label={`Eliminar tarea ${tarea.titulo}`}
                >
                  Eliminar
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
