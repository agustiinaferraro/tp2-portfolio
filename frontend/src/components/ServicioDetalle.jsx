// Detalle de un servicio: página dinámica por slug
// Trae el contenido desde la API y maneja los estados cargando / error / vacío / datos
import { useEffect, useState } from 'react';
import { obtenerServicioPorSlug } from '../api/servicios.js';

export default function ServicioDetalle({ slug }) {
  const [servicio, setServicio] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Se pide el servicio cada vez que cambia el slug
  useEffect(() => {
    setCargando(true);
    setError(null);
    obtenerServicioPorSlug(slug)
      .then((datos) => setServicio(datos))
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, [slug]);

  // Estado: error
  if (error) {
    return (
      <section className="max-w-3xl mx-auto px-4 py-24 text-center space-y-4">
        <p role="alert" className="text-red-400">
          No se pudo cargar el servicio. Verificá que el backend esté corriendo.
        </p>
        <a href="/#servicios" className="text-indigo-400 hover:text-indigo-300 transition-colors">
          ← Volver a los servicios
        </a>
      </section>
    );
  }

  // Estado: cargando
  if (cargando) {
    return (
      <section className="max-w-3xl mx-auto px-4 py-24 text-center">
        <p className="text-zinc-400">Cargando servicio...</p>
      </section>
    );
  }

  // Estado: sin datos
  if (!servicio) {
    return (
      <section className="max-w-3xl mx-auto px-4 py-24 text-center space-y-4">
        <p className="text-zinc-400">No encontramos ese servicio.</p>
        <a href="/#servicios" className="text-indigo-400 hover:text-indigo-300 transition-colors">
          ← Volver a los servicios
        </a>
      </section>
    );
  }

  // Estado: con datos
  return (
    <section className="max-w-3xl mx-auto px-4 py-24">
      <p className="text-indigo-400 font-medium tracking-widest uppercase text-sm">Servicio</p>
      <h1 className="text-4xl sm:text-5xl font-extrabold text-white mt-2">{servicio.nombre}</h1>
      <p className="text-lg text-zinc-400 leading-relaxed mt-6">{servicio.descripcion}</p>
      <p className="mt-10">
        <a href="/#servicios" className="text-indigo-400 hover:text-indigo-300 transition-colors">
          ← Volver a los servicios
        </a>
      </p>
    </section>
  );
}