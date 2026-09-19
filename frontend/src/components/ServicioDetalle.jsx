//detalle de un servicio: pagina dinamica por slug
//trae el contenido desde la api y maneja los estados cargando / error / vacio / datos
import { useEffect, useState } from 'react';
import { obtenerServicioPorSlug } from '../api/servicios.js';

export default function ServicioDetalle({ slug }) {
  const [servicio, setServicio] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  //se pide el servicio cada vez que cambia el slug
  useEffect(() => {
    setCargando(true);
    setError(null);
    obtenerServicioPorSlug(slug)
      .then((datos) => setServicio(datos))
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, [slug]);

  //estado: error
  if (error) {
    return (
      <section className="max-w-3xl mx-auto px-4 py-24 text-center">
        <p role="alert" className="text-red-400">
          No se pudo cargar el servicio. Verificá que el backend esté corriendo.
        </p>
      </section>
    );
  }

  //estado: cargando
  if (cargando) {
    return (
      <section className="max-w-3xl mx-auto px-4 py-24 text-center">
        <p className="text-zinc-400">Cargando servicio...</p>
      </section>
    );
  }

  //estado: sin datos
  if (!servicio) {
    return (
      <section className="max-w-3xl mx-auto px-4 py-24 text-center">
        <p className="text-zinc-400">No encontramos ese servicio.</p>
      </section>
    );
  }

  //estado: con datos
  return (
    <section className="max-w-3xl mx-auto px-4 py-24">
      <p className="text-indigo-400 font-medium tracking-widest uppercase text-sm">Servicio</p>
      <h1 className="text-4xl sm:text-5xl font-extrabold text-white mt-2">{servicio.nombre}</h1>
      <p className="text-lg text-zinc-400 leading-relaxed mt-6">{servicio.descripcion}</p>
    </section>
  );
}