// Componente de Servicios
// Se apoya en la capa de datos (api/servicios.js) para obtener la información
// Maneja los estados: "cargando", "con datos", "sin datos" y "error"
import { useEffect, useState } from 'react';
import { obtenerServicios } from '../api/servicios.js';

export default function SeccionServicios() {
  const [servicios, setServicios] = useState([]); // lista de servicios
  const [cargando, setCargando] = useState(true); // ¿está cargando?
  const [error, setError] = useState(null); // ¿hubo error?

  // Se ejecuta una vez al montar el componente: pide los servicios al backend
  useEffect(() => {
    obtenerServicios()
      .then((datos) => setServicios(datos))
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, []);

  // Estado: error
  if (error) {
    return (
      <p className="text-red-400 text-center">
        No se pudieron cargar los servicios. Verificá que el backend esté corriendo.
      </p>
    );
  }

  // Estado: cargando
  if (cargando) {
    return <p className="text-zinc-400 text-center">Cargando servicios...</p>;
  }

  // Estado: sin datos
  if (servicios.length === 0) {
    return <p className="text-zinc-400 text-center">Todavía no hay servicios cargados.</p>;
  }

  // Estado: con datos → se muestran las tarjetas
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {servicios.map((servicio) => (
        <article
          key={servicio._id}
          className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 transition-colors"
        >
          <h3 className="text-xl font-bold text-white mb-2">{servicio.nombre}</h3>
          <p className="text-zinc-400 text-sm leading-relaxed">{servicio.descripcion}</p>
        </article>
      ))}
    </div>
  );
}