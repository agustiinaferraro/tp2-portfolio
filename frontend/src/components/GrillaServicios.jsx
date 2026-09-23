//grilla de servicios (parte dinamica de la seccion)
//se apoya en la capa de datos (api/servicios.js) para obtener la informacion
//maneja los estados: "cargando", "con datos", "sin datos" y "error"
import { useEffect, useState } from 'react';
import { obtenerServicios } from '../api/servicios.js';
import IconoServicio from './IconoServicio.jsx';

export default function GrillaServicios() {
  const [servicios, setServicios] = useState([]); //lista de servicios
  const [cargando, setCargando] = useState(true); //¿esta cargando?
  const [error, setError] = useState(null); //¿hubo error?

  //se ejecuta una vez al montar el componente: pide los servicios al backend
  useEffect(() => {
    obtenerServicios()
      .then((datos) => setServicios(datos))
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, []);

  //estado: error
  if (error) {
    return (
      <p role="alert" className="text-red-400 text-center">
        No se pudieron cargar los servicios. Verificá que el backend esté corriendo.
      </p>
    );
  }

  //estado: cargando
  if (cargando) {
    return <p className="text-zinc-400 text-center">Cargando servicios...</p>;
  }

  //estado: sin datos
  if (servicios.length === 0) {
    return <p className="text-zinc-400 text-center">Todavía no hay servicios cargados.</p>;
  }

  //estado: con datos → se muestran las tarjetas
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {servicios.map((servicio) => (
        <li key={servicio._id}>
          <a
            href={`/servicios/${servicio.slug ?? servicio._id}`}
            className="block h-full group"
          >
            <article className="h-full p-6 rounded-2xl bg-white/10 group-hover:bg-white/20 backdrop-blur-md border border-verde-app/40 group-hover:border-verde-app/70 group-hover:scale-[1.03] active:scale-95 shadow-lg shadow-verde-app/10 transition-all duration-200 flex flex-col">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 border border-verde-app/40 text-verde-app mb-4">
                <IconoServicio slug={servicio.slug ?? servicio._id} className="w-6 h-6" />
              </span>
              <h3 className="text-xl font-bold text-white mb-2">{servicio.nombre}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                {servicio.descripcion}
              </p>
              <p className="mt-4 text-sm font-medium text-verde-app group-hover:text-verde-app/80 transition-colors">
                Ver más →
              </p>
            </article>
          </a>
        </li>
      ))}
    </ul>
  );
}