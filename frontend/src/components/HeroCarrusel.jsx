//hero de la home: carrusel de proyectos destacados con fundido
//toma los proyectos de la api y los va rotando cada 10 segundos
//el cambio se hace con un fondo negro de transicion: fade out, swap, fade in
import { useEffect, useState } from 'react';
import { obtenerProyectos, obtenerProyectosDestacados } from '../api/proyectos.js';
import { servicios as serviciosEstaticos } from '../data/servicios.js';
import Loading from './Loading.jsx';

//tiempo entre una rotacion y la siguiente y duracion del fundido
const INTERVALO_MS = 10000;
const DURACION_FUNDIDO_MS = 500;

export default function HeroCarrusel() {
  const [proyectos, setProyectos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [actual, setActual] = useState(0);
  const [fade, setFade] = useState(true);

  //carga: primero los destacados; si no hay ninguno, se usan todos los que tengan portada
  useEffect(() => {
    obtenerProyectosDestacados()
      .then((destacados) => {
        if (destacados.length > 0) return destacados;
        return obtenerProyectos();
      })
      .then((datos) => setProyectos(datos.filter((p) => p.imagen || p.imagenes?.[0])))
      .catch(() => setProyectos([]))
      .finally(() => setCargando(false));
  }, []);

  //rotacion automatica: cada 10 segundos se apaga, se cambia la imagen y se prende de nuevo
  useEffect(() => {
    if (proyectos.length === 0) return;
    let temporizador;
    const intervalo = setInterval(() => {
      setFade(false);
      temporizador = setTimeout(() => {
        setActual((previo) => (previo + 1) % proyectos.length);
        setFade(true);
      }, DURACION_FUNDIDO_MS);
    }, INTERVALO_MS);
    return () => {
      clearInterval(intervalo);
      clearTimeout(temporizador);
    };
  }, [proyectos]);

  if (cargando) {
    return (
      <section aria-label="Proyectos destacados" className="max-w-3xl mx-auto px-4 pb-10">
        <div className="h-[400px] md:h-[500px] bg-black rounded-2xl flex overflow-hidden">
          <Loading claseContenedor="" />
        </div>
      </section>
    );
  }

  if (proyectos.length === 0) return null;

  const proyecto = proyectos[actual];
  const categoria = serviciosEstaticos.find((s) => s.slug === proyecto.servicio);

  return (
    <section aria-label="Proyectos destacados" className="max-w-3xl mx-auto px-4 pb-10">
      <a
        href={`/proyectos/?id=${proyecto._id}`}
        className="block relative w-full h-[400px] md:h-[500px] overflow-hidden rounded-2xl bg-black group"
      >
        {/*fondo negro que tapa el cambio entre una imagen y la otra*/}
        <div
          className={`absolute inset-0 bg-black transition-opacity duration-500 ${fade ? 'opacity-0' : 'opacity-100'}`}
        />

        {/*portada del proyecto actual*/}
        <img
          key={proyecto._id}
          src={proyecto.imagen || proyecto.imagenes[0]}
          alt={`Proyecto ${proyecto.titulo}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-0'}`}
        />

        {/*degradado para que el texto se lea sobre cualquier imagen*/}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/90" />

        {/*datos del proyecto sobre la imagen*/}
        <div className="absolute inset-0 flex flex-col justify-center items-start px-5 md:px-10 text-white">
          {categoria && (
            <span className="text-verde-app font-medium tracking-widest uppercase text-sm mb-2">
              {categoria.nombre}
            </span>
          )}
          <h2 className="text-3xl md:text-5xl font-extrabold leading-tight mb-3">{proyecto.titulo}</h2>
          {proyecto.resumen && (
            <p className="text-zinc-300 md:text-lg line-clamp-2 max-w-xl">{proyecto.resumen}</p>
          )}
          <span className="mt-4 font-medium text-verde-app inline-flex items-center gap-1 group-hover:gap-2 transition-all">
            Ver proyecto <span aria-hidden="true">→</span>
          </span>
        </div>
      </a>
    </section>
  );
}