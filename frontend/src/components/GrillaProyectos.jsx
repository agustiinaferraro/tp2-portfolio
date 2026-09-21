//grilla de proyectos (parte dinamica de la seccion)
//se apoya en la capa de datos (api/proyectos.js) para obtener la informacion
//maneja los estados: "cargando", "con datos", "sin datos" y "error"
import { useEffect, useState } from 'react';
import { obtenerProyectos } from '../api/proyectos.js';

export default function GrillaProyectos() {
  const [proyectos, setProyectos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    obtenerProyectos()
      .then((datos) => setProyectos(datos))
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, []);

  //estado: error
  if (error) {
    return (
      <p role="alert" className="text-red-400 text-center">
        No se pudieron cargar los proyectos. Verificá que el backend esté corriendo.
      </p>
    );
  }

  //estado: cargando
  if (cargando) {
    return <p className="text-zinc-400 text-center">Cargando proyectos...</p>;
  }

  //estado: sin datos
  if (proyectos.length === 0) {
    return (
      <p className="text-zinc-400 text-center">
        Todavía no hay proyectos cargados. Pronto vas a poder ver mis trabajos acá.
      </p>
    );
  }

  //estado: con datos
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {proyectos.map((proyecto) => (
        <li key={proyecto._id}>
          <article className="h-full flex flex-col overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-violet-500/50 transition-colors">
            {/*imagen si la tiene*/}
            {proyecto.imagen && (
              <figure className="m-0">
                <img
                  src={proyecto.imagen}
                  alt={`Imagen del proyecto ${proyecto.titulo}`}
                  className="w-full h-44 object-cover"
                />
              </figure>
            )}
            <div className="p-6 flex flex-col gap-3 flex-1">
              <h3 className="text-xl font-bold text-white">{proyecto.titulo}</h3>
              {/*tags / roles aplicados*/}
              {proyecto.tags?.length > 0 && (
                <ul className="flex flex-wrap gap-2" aria-label="Etiquetas del proyecto">
                  {proyecto.tags.map((tag) => (
                    <li
                      key={tag}
                      className="text-xs px-2 py-1 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-zinc-400 text-sm leading-relaxed flex-1">
                {proyecto.resumen}
              </p>
              {proyecto.link && (
                <p className="mt-auto">
                  <a
                    href={proyecto.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors inline-flex items-center gap-1"
                  >
                    Ver proyecto <span aria-hidden="true">→</span>
                  </a>
                </p>
              )}
            </div>
          </article>
        </li>
      ))}
    </ul>
  );
}