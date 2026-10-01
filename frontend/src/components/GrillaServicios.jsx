//grilla de servicios (parte dinamica de la seccion)
//se apoya en la capa de datos (api/servicios.js) para obtener la informacion
//maneja los estados: "cargando", "con datos", "sin datos" y "error"
import { useEffect, useState } from 'react';
import { obtenerServicios } from '../api/servicios.js';
import ServicioCard from './ServicioCard.jsx';
import Loading from './Loading.jsx';

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
    return <Loading claseContenedor="h-48" />;
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
          <ServicioCard servicio={servicio} />
        </li>
      ))}
    </ul>
  );
}