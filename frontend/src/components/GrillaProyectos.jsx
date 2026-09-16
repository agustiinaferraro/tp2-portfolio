// Grilla de Proyectos (parte dinámica de la sección)
// Se apoya en la capa de datos (api/proyectos.js) para obtener la información
// Maneja los estados: "cargando", "con datos", "sin datos" y "error"
import { useEffect, useState } from 'react';
import { obtenerProyectos } from '../api/proyectos.js';

export default function SeccionProyectos() {
  const [proyectos, setProyectos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    obtenerProyectos()
      .then((datos) => setProyectos(datos))
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, []);

  // Estado: error
  if (error) {
    return (
      <p className="text-red-400 text-center">
        No se pudieron cargar los proyectos. Verificá que el backend esté corriendo.
      </p>
    );
  }

  // Estado: cargando
  if (cargando) {
    return <p className="text-zinc-400 text-center">Cargando proyectos...</p>;
  }

  // Estado: sin datos
  if (proyectos.length === 0) {
    return (
      <p className="text-zinc-400 text-center">
        Todavía no hay proyectos cargados. Pronto vas a poder ver mis trabajos acá.
      </p>
    );
  }

  // Estado: con datos
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {proyectos.map((proyecto) => (
        <article
          key={proyecto._id}
          className="overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 transition-colors flex flex-col"
        >
          {/* Imagen si la tiene */}
          {proyecto.imagen && (
            <img
              src={proyecto.imagen}
              alt={`Imagen del proyecto ${proyecto.titulo}`}
              className="w-full h-44 object-cover"
            />
          )}
          <div className="p-6 flex flex-col gap-3 flex-1">
            <h3 className="text-xl font-bold text-white">{proyecto.titulo}</h3>
            {/* Tags / roles aplicados */}
            {proyecto.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {proyecto.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <p className="text-zinc-400 text-sm leading-relaxed flex-1">{proyecto.resumen}</p>
            {proyecto.link && (
              <a
                href={proyecto.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center gap-1"
              >
                Ver proyecto →
              </a>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}