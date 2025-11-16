import React, { useState, useEffect } from "react";

const API_URL = "https://umb-web-taller-l5h5.onrender.com/index.php";

export default function App() {
  const [tareas, setTareas] = useState([]);
  const [nuevaTarea, setNuevaTarea] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editandoId, setEditandoId] = useState(null);
  const [tituloEditado, setTituloEditado] = useState("");

  const fetchTareas = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error();
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

  const handleToggleCompletada = async (tarea) => {
    try {
      const res = await fetch(API_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: tarea.id,
          completada: tarea.completada ? 0 : 1,
        }),
      });
      if (res.ok) fetchTareas();
    } catch (err) {
      setError("Error al actualizar estado.");
    }
  };

  const handleEditarTitulo = async (tarea) => {
    if (!tituloEditado.trim()) return;
    try {
      const res = await fetch(API_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: tarea.id, titulo: tituloEditado }),
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
    <div className="max-w-xl mx-auto p-6 md:p-10 bg-gradient-to-br from-indigo-50 to-white border border-indigo-200 shadow-2xl rounded-2xl mt-10">
      <h1 className="text-3xl font-extrabold text-center mb-6 text-indigo-700 drop-shadow-sm">
        📋 Lista de Tareas
      </h1>

      <form onSubmit={handleCrearTarea} className="flex gap-3 mb-6">
        <input
          type="text"
          value={nuevaTarea}
          onChange={(e) => setNuevaTarea(e.target.value)}
          placeholder="Escribe una nueva tarea..."
          className="flex-grow p-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white/80"
        />
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-5 rounded-xl shadow-md transition-all"
        >
          Añadir
        </button>
      </form>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 shadow">
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <p className="text-center text-gray-500 animate-pulse">
          Cargando tareas...
        </p>
      ) : (
        <ul className="space-y-4">
          {tareas.length > 0 ? (
            tareas.map((tarea) => (
              <li
                key={tarea.id}
                className={`flex items-center justify-between p-4 rounded-2xl border shadow-sm transition-all backdrop-blur-sm hover:shadow-lg ${
                  tarea.completada
                    ? "bg-green-50 border-green-400"
                    : "bg-white border-indigo-300"
                }`}
              >
                {editandoId === tarea.id ? (
                  <input
                    value={tituloEditado}
                    onChange={(e) => setTituloEditado(e.target.value)}
                    className="flex-grow p-2 border rounded-lg mr-3"
                  />
                ) : (
                  <span
                    onClick={() => handleToggleCompletada(tarea)}
                    className={`cursor-pointer flex-grow text-lg select-none transition-all ${
                      tarea.completada
                        ? "line-through text-gray-500"
                        : "text-gray-800 font-medium"
                    }`}
                  >
                    {tarea.titulo}
                  </span>
                )}

                {editandoId === tarea.id ? (
                  <button
                    onClick={() => handleEditarTitulo(tarea)}
                    className="ml-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-xl shadow"
                  >
                    Guardar
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setEditandoId(tarea.id);
                      setTituloEditado(tarea.titulo);
                    }}
                    className="ml-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-xl shadow"
                  >
                    Editar
                  </button>
                )}

                <button
                  onClick={() => handleEliminarTarea(tarea.id, tarea.titulo)}
                  className="ml-2 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-xl shadow"
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
