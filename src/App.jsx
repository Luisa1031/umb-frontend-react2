import React, { useState, useEffect } from "react";
// Importar estilos no es necesario si utilizas la CDN de Tailwind en index.html o PostCSS/Vite.

// 🚨 URL de tu servicio de Render (AJUSTA SI ES DIFERENTE)
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
  const [error, setError] = useState(null); // Estado para mostrar errores de API

  // === (READ) OBTENER TODAS LAS TAREAS ===
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
      // Opcional: Ordenar para que las tareas no completadas vayan primero
      const tareasOrdenadas = data.sort((a, b) => a.completada - b.completada);
      setTareas(tareasOrdenadas);
    } catch (err) {
      console.error("Error al obtener las tareas:", err);
      setError(
        "Error al cargar las tareas. Verifica que la API de Render esté activa."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTareas();
  }, []);

  // === (CREATE) AÑADIR UNA NUEVA TAREA ===
  const handleCrearTarea = async (e) => {
    e.preventDefault();
    const tituloLimpio = nuevaTarea.trim();
    if (!tituloLimpio) return;

    setError(null);
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo: tituloLimpio }),
      });

      if (response.ok) {
        setNuevaTarea("");
        // Recargar la lista para incluir la nueva tarea con su ID y actualizar la vista
        fetchTareas();
      } else {
        throw new Error("Fallo en la creación de la tarea.");
      }
    } catch (err) {
      console.error("Error al crear la tarea:", err);
      setError("Error al crear tarea. ¿La API acepta el método POST?");
    }
  };

  // === (UPDATE) CAMBIAR ESTADO DE COMPLETADA (PUT) ===
  const handleToggleCompletada = async (tarea) => {
    setError(null);
    // Cambiar 1 (completada) -> 0 (pendiente) o 0 -> 1
    const nuevoEstado = tarea.completada === 1 ? 0 : 1;

    try {
      const response = await fetch(API_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: tarea.id,
          completada: nuevoEstado,
        }),
      });

      if (response.ok) {
        // Optimización: Actualizar estado localmente para una respuesta inmediata
        const tareasActualizadas = tareas
          .map((t) =>
            t.id === tarea.id ? { ...t, completada: nuevoEstado } : t
          )
          // Re-ordenar la lista para reflejar el cambio (completadas al final)
          .sort((a, b) => a.completada - b.completada);
        setTareas(tareasActualizadas);
      } else {
        throw new Error("Fallo en la actualización de la tarea.");
      }
    } catch (err) {
      console.error("Error al actualizar la tarea:", err);
      setError("Error al actualizar el estado. ¿La API acepta el método PUT?");
    }
  };

  // === (DELETE) ELIMINAR UNA TAREA ===
  const handleEliminarTarea = async (id, titulo) => {
    // Usamos una notificación UI o modal para confirmar en un entorno de producción,
    // pero mantendremos la confirmación simple por ahora.
    if (
      !window.confirm(
        `¿Estás seguro de que quieres eliminar la tarea: "${titulo}"?`
      )
    )
      return;

    setError(null);
    try {
      const response = await fetch(API_URL, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: id }),
      });

      if (response.ok) {
        // Optimización: Eliminar de la lista localmente
        setTareas(tareas.filter((t) => t.id !== id));
      } else {
        throw new Error("Fallo en la eliminación de la tarea.");
      }
    } catch (err) {
      console.error("Error al eliminar la tarea:", err);
      setError("Error al eliminar tarea. ¿La API acepta el método DELETE?");
    }
  };

  return (
    <div className="task-container max-w-xl mx-auto p-4 md:p-8 bg-white shadow-2xl rounded-xl mt-10">
      <h1 className="text-3xl font-extrabold text-center mb-6 text-indigo-700">
        Lista de Tareas (React + Backend)
      </h1>

      {/* Formulario para añadir tareas */}
      <form onSubmit={handleCrearTarea} className="flex gap-2 mb-6">
        <input
          type="text"
          value={nuevaTarea}
          onChange={(e) => setNuevaTarea(e.target.value)}
          placeholder="Escribe una nueva tarea..."
          aria-label="Nueva tarea"
          className="flex-grow p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-inner"
        />
        <button
          type="submit"
          disabled={!nuevaTarea.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
        >
          Añadir
        </button>
      </form>

      {/* Manejo de errores */}
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4 shadow-sm"
          role="alert"
        >
          <span className="block sm:inline font-medium">⚠️ {error}</span>
        </div>
      )}

      {/* Contenido de la lista */}
      {loading ? (
        <p className="text-center text-gray-500 p-4 animate-pulse">
          Cargando tareas...
        </p>
      ) : (
        <ul className="space-y-3">
          {tareas.length > 0 ? (
            tareas.map((tarea) => (
              <li
                key={tarea.id}
                className={`flex justify-between items-center p-4 rounded-xl border-l-4 transition duration-300 transform hover:shadow-lg ${
                  tarea.completada == 1
                    ? "bg-green-50 border-green-500"
                    : "bg-gray-50 border-indigo-500 hover:bg-white"
                }`}
              >
                {/* Título de la tarea (al hacer click, se cambia el estado) */}
                <span
                  onClick={() => handleToggleCompletada(tarea)}
                  className={`cursor-pointer flex-grow text-lg transition duration-200 ${
                    tarea.completada == 1
                      ? "line-through text-gray-500 italic"
                      : "text-gray-800 font-medium"
                  }`}
                >
                  {tarea.titulo}
                </span>

                {/* Botón para eliminar */}
                <button
                  onClick={() => handleEliminarTarea(tarea.id, tarea.titulo)}
                  className="ml-4 bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-2 px-4 rounded-full shadow-md transition duration-150 transform hover:scale-105"
                >
                  Eliminar
                </button>
              </li>
            ))
          ) : (
            <li className="text-center text-gray-600 p-6 border-2 border-dashed border-indigo-200 rounded-xl bg-indigo-50">
              <p className="text-lg font-semibold">🎉 ¡Lista vacía!</p>
              <p className="text-sm mt-1">Empieza a añadir tareas arriba.</p>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
