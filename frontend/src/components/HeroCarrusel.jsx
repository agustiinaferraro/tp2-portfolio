//hero de la home: carrusel de videos de los proyectos de behance
//cada video se reproduce solo (muted, loop) unos segundos y luego funde al siguiente
//sin descripciones: toda el area es clickeable y lleva al detalle del proyecto
import { useEffect, useState } from 'react';
import { obtenerProyectos, obtenerProyectosDestacados } from '../api/proyectos.js';
import Loading from './Loading.jsx';

//segundos que se reproduce cada video y duracion del fundido entre uno y otro
const INTERVALO_MS = 5000;
const DURACION_FUNDIDO_MS = 500;

export default function HeroCarrusel() {
  const [proyectos, setProyectos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [actual, setActual] = useState(0);
  const [fade, setFade] = useState(true);

  //carga: los que tienen video primero y despues los que tienen portada
  useEffect(() => {
    obtenerProyectosDestacados()
      .then((destacados) => {
        if (destacados.length > 0) return destacados;
        return obtenerProyectos();
      })
      .then((datos) => {
        const conMedia = datos.filter((p) => p.video || p.imagen || p.imagenes?.[0]);
        const conVideo = conMedia.filter((p) => p.video);
        const sinVideo = conMedia.filter((p) => !p.video);
        setProyectos([...conVideo, ...sinVideo]);
      })
      .catch(() => setProyectos([]))
      .finally(() => setCargando(false));
  }, []);

  //rotacion automatica: cada 5 segundos se apaga, cambia el proyecto y se enciende
  useEffect(() => {
    if (proyectos.length === 0) return;
    const intervalo = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setActual((previo) => (previo + 1) % proyectos.length);
        setFade(true);
      }, DURACION_FUNDIDO_MS);
    }, INTERVALO_MS);
    return () => clearInterval(intervalo);
  }, [proyectos.length]);

  if (cargando) {
    return (
      <section aria-label="Proyectos en video" className="max-w-5xl mx-auto px-4 pb-10">
        <div className="h-[400px] md:h-[500px] bg-black rounded-2xl flex overflow-hidden">
          <Loading claseContenedor="" />
        </div>
      </section>
    );
  }

  if (proyectos.length === 0) return null;

  const proyecto = proyectos[actual];
  const tieneVideo = Boolean(proyecto.video);

  return (
    <section aria-label="Proyectos en video" className="max-w-5xl mx-auto px-4 pb-10">
      <a href={`/proyectos/?id=${proyecto._id}`} className="block relative overflow-hidden rounded-2xl h-[400px] md:h-[500px]">
        {/*fondo negro que tapa el cambio entre un video y otro*/}
        <div
          className={`absolute inset-0 bg-black transition-opacity duration-500 ${
            fade ? 'opacity-0' : 'opacity-100'
          }`}
        />

        {/*video del proyecto (si carga) o su portada*/}
        {tieneVideo ? (
          <video
            key={proyecto._id}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              fade ? 'opacity-100' : 'opacity-0'
            }`}
            src={proyecto.video}
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <img
            key={proyecto._id}
            src={proyecto.imagen || proyecto.imagenes[0]}
            alt=""
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              fade ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/*degradado para dar profundidad visual sin cubrir el video*/}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/90" />
      </a>
    </section>
  );
}