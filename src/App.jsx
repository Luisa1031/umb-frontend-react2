import React, { useState, useEffect } from "react";

const API_URL = "https://umb-web-taller-l5h5.onrender.com";

/**
 * @typedef {object} Tarea
 * @property {number} id
 * @property {string} titulo
 * @property {number} completada
 */

export default function App() {
  const [tareas, setTareas] = useState([]);
  const [nuevaTarea, setNuevaTarea] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para editar
  const [editandoId, setEditandoId] = useState(null);
  const [tituloEditado, setTituloEditado] = useState("");

  // === GET ===
  const fetchTareas = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Error cargando tareas");

      const data = await res.json();
      setTareas(data.sort((a, b) => a.completada - b.completada));
    } catch (err) {
      setError("No se pudieron cargar las tareas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTareas();
  }, []);

  // === POST ===
  const handleCrearTarea = async (e) => {
    e.preventDefault();
    if (!nuevaTarea.trim()) return;

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo: nuevaTarea }),
      });

      if (res.ok) {
        setNuevaTarea("");
        fetchTareas();
      }
    } catch (err) {
      setError("No se pudo crear la tarea.");
    }
  };

  // === PUT (toggle completada) ===
  const handleToggleCompletada = async (tarea) => {
    try {
      const res = await fetch(API_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: tarea.id,
          completada: tarea.completada === 1 ? 0 : 1,
        }),
      });

      if (res.ok) fetchTareas();
    } catch (err) {
      setError("Error al actualizar estado.");
    }
  };

  // === PUT (editar título) ===
  const handleEditarTitulo = async (tarea) => {
    if (!tituloEditado.trim()) return;

    try {
      const res = await fetch(API_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: tarea.id,
          titulo: tituloEditado,
        }),
      });

      if (res.ok) {
        setEditandoId(null);
        setTituloEditado("");
        fetchTareas();
      }
    } catch (err) {
      setError("No se pudo editar la tarea.");
    }
  };

  // === DELETE ===
  const handleEliminarTarea = async (id, titulo) => {
    if (!window.confirm(`¿Eliminar "${titulo}"?`)) return;

    try {
      const res = await fetch(API_URL, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) setTareas(tareas.filter((t) => t.id !== id));
    } catch (err) {
      setError("Error al eliminar tarea.");
    }
  };

  return (
    <div className="task-container max-w-xl mx-auto p-4 md:p-8 bg-white shadow-2xl rounded-xl mt-10">
      <h1 className="text-3xl font-extrabold text-center mb-6 text-indigo-700">
        Lista de Tareas (React + Backend)
      </h1>

      {/* Crear tarea */}
      <form onSubmit={handleCrearTarea} className="flex gap-2 mb-6">
        <input
          type="text"
          value={nuevaTarea}
          onChange={(e) => setNuevaTarea(e.target.value)}
          placeholder="Escribe una nueva tarea..."
          className="flex-grow p-2 border border-gray-300 rounded-lg shadow-inner"
        />
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md"
        >
          Añadir
        </button>
      </form>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <p className="text-center text-gray-500 animate-pulse">
          Cargando tareas...
        </p>
      ) : (
        <ul className="space-y-3">
          {tareas.length > 0 ? (
            tareas.map((tarea) => (
              <li
                key={tarea.id}
                className={`flex justify-between items-center p-4 rounded-xl border-l-4 shadow-sm ${
                  tarea.completada
                    ? "bg-green-50 border-green-500"
                    : "bg-white border-indigo-500"
                }`}
              >
                {/* EDITAR o TÍTULO */}
                {editandoId === tarea.id ? (
                  <input
                    value={tituloEditado}
                    onChange={(e) => setTituloEditado(e.target.value)}
                    className="p-2 border rounded-lg flex-grow mr-3"
                  />
                ) : (
                  <span
                    onClick={() => handleToggleCompletada(tarea)}
                    className={`cursor-pointer flex-grow text-lg ${
                      tarea.completada
                        ? "line-through text-gray-500 italic"
                        : "text-gray-800 font-medium"
                    }`}
                  >
                    {tarea.titulo}
                  </span>
                )}

                {/* Botón Editar / Guardar */}
                {editandoId === tarea.id ? (
                  <button
                    onClick={() => handleEditarTitulo(tarea)}
                    className="ml-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-full shadow-md"
                  >
                    Guardar
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setEditandoId(tarea.id);
                      setTituloEditado(tarea.titulo);
                    }}
                    className="ml-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-full shadow-md"
                  >
                    Editar
                  </button>
                )}

                {/* Botón eliminar */}
                <button
                  onClick={() => handleEliminarTarea(tarea.id, tarea.titulo)}
                  className="ml-2 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-full shadow-md"
                >
                  Eliminar
                </button>
              </li>
            ))
          ) : (
            <li className="text-center text-gray-600 p-6 border-2 border-dashed border-indigo-200 rounded-xl bg-indigo-50">
              🎉 ¡Lista vacía!
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
