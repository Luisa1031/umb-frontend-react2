import React, { useState, useEffect } from "react";
import "./styles.css";

// URL de tu servicio de Render (AJUSTA SI ES DIFERENTE)
const API_URL = "https://umb-web-taller-l5h5.onrender.com";

export default function App() {
  const [tareas, setTareas] = useState([]);
  const [nuevaTarea, setNuevaTarea] = useState("");
  const [loading, setLoading] = useState(true);

  // === (READ) OBTENER TODAS LAS TAREAS ===
  const fetchTareas = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setTareas(data);
    } catch (error) {
      console.error("Error al obtener las tareas:", error);
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

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo: tituloLimpio }),
      });

      if (response.ok) {
        setNuevaTarea("");
        fetchTareas();
      }
    } catch (error) {
      console.error("Error al crear la tarea:", error);
    }
  };

  // === (UPDATE) CAMBIAR ESTADO DE COMPLETADA (PUT) ===
  const handleToggleCompletada = async (id, completadaActual) => {
    try {
      const response = await fetch(API_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: id,
          completada: completadaActual == 1 ? 0 : 1,
        }),
      });

      if (response.ok) {
        fetchTareas();
      }
    } catch (error) {
      console.error("Error al actualizar la tarea:", error);
    }
  };

  // === (DELETE) ELIMINAR UNA TAREA ===
  const handleEliminarTarea = async (id) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar esta tarea?"))
      return;

    try {
      const response = await fetch(API_URL, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: id }),
      });

      if (response.ok) {
        fetchTareas();
      }
    } catch (error) {
      console.error("Error al eliminar la tarea:", error);
    }
  };

  return (
    <div className="App max-w-xl mx-auto p-4 md:p-8 bg-white shadow-xl rounded-lg mt-10">
      <h1 className="text-3xl font-bold text-center mb-6 text-indigo-700">
        Lista de Tareas (React + PHP/MySQL)
      </h1>

      {/* Formulario para añadir tareas */}
      <form onSubmit={handleCrearTarea} className="flex gap-2 mb-6">
        <input
          type="text"
          value={nuevaTarea}
          onChange={(e) => setNuevaTarea(e.target.value)}
          placeholder="Escribe una nueva tarea..."
          className="flex-grow p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={!nuevaTarea.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200 disabled:opacity-50"
        >
          Añadir
        </button>
      </form>

      {/* Contenido de la lista */}
      {loading ? (
        <p className="text-center text-gray-500">Cargando tareas...</p>
      ) : (
        <ul className="space-y-3">
          {tareas.length > 0 ? (
            tareas.map((tarea) => (
              <li
                key={tarea.id}
                className={`flex justify-between items-center p-3 rounded-lg border transition duration-150 ${
                  tarea.completada == 1
                    ? "bg-green-50 border-green-200"
                    : "bg-gray-50 border-gray-200 hover:bg-white"
                }`}
              >
                {/* Título de la tarea (al hacer click, se cambia el estado) */}
                <span
                  onClick={() =>
                    handleToggleCompletada(tarea.id, tarea.completada)
                  }
                  className={`cursor-pointer flex-grow text-lg ${
                    tarea.completada == 1
                      ? "line-through text-gray-500"
                      : "text-gray-800"
                  }`}
                >
                  {tarea.titulo}
                </span>

                {/* Botón para eliminar */}
                <button
                  onClick={() => handleEliminarTarea(tarea.id)}
                  className="ml-4 bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-1 px-3 rounded-lg shadow-sm transition duration-150"
                >
                  Eliminar
                </button>
              </li>
            ))
          ) : (
            <li className="text-center text-gray-500 p-4 border rounded-lg bg-white">
              ¡Parece que no hay tareas! Empieza a añadir algunas.
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
