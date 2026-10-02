//carrusel de proyectos destacados de la home: se desliza solo, sin flechas ni filtros
//cada tarjeta lleva al detalle del proyecto, igual que en la seccion de proyectos
import { useEffect, useState } from 'react';
import { obtenerProyectosDestacados } from '../api/proyectos.js';
import Carrusel, { ALTO_PROYECTO, TARJETA_CARRUSEL } from './Carrusel.jsx';
import ProyectoCard from './ProyectoCard.jsx';
import Loading from './Loading.jsx';

//cada cuanto se mueve una tarjeta
const INTERVALO_MS = 5000;

export default function CarruselDestacados() {
  const [proyectos, setProyectos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    obtenerProyectosDestacados()
      .then((datos) => setProyectos(datos))
      .catch(() => setProyectos([]))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <Loading claseContenedor="h-40" />;
  //si no hay nada destacado todavia, la seccion no se muestra
  if (proyectos.length === 0) return null;

  return (
    <Carrusel
      etiqueta="Proyectos destacados"
      auto
      intervaloMs={INTERVALO_MS}
      conFlechas={false}
      clave="destacados"
    >
      {proyectos.map((proyecto) => (
        <li key={proyecto._id} className={`shrink-0 snap-start ${TARJETA_CARRUSEL} ${ALTO_PROYECTO}`}>
          <ProyectoCard proyecto={proyecto} />
        </li>
      ))}
    </Carrusel>
  );
}