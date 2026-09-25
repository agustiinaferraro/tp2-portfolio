//hero de la home: carrusel de proyectos destacados con fundido
//toma los proyectos de la api y los va rotando cada 10 segundos
//el cambio se hace con un fondo negro de transicion: fade out, swap, fade in
//tiene puntitos para saltar a un proyecto, flechas para avanzar/volver y pausa al pasar el mouse
import { useEffect, useRef, useState } from 'react';
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
  const [pausado, setPausado] = useState(false);
  const temporizador = useRef(null);

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

  //arranca un fundido hacia el proximo indice (lo calcula la funcion pasada con el indice previo)
  function fundirEntre(calcular) {
    clearTimeout(temporizador.current);
    setFade(false);
    temporizador.current = setTimeout(() => {
      setActual((previo) => calcular(previo));
      setFade(true);
    }, DURACION_FUNDIDO_MS);
  }

  //rotacion automatica cada 10 segundos, frenada mientras el mouse este encima
  useEffect(() => {
    if (proyectos.length === 0 || pausado) return;
    const intervalo = setInterval(
      () => fundirEntre((previo) => (previo + 1) % proyectos.length),
      INTERVALO_MS
    );
    return () => clearInterval(intervalo);
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proyectos.length, pausado]);

  //al pausar se cancela el fundido a medio hacer para que la imagen quede visible
  useEffect(() => {
    if (pausado) {
      clearTimeout(temporizador.current);
      setFade(true);
    }
  }, [pausado]);

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

  function anterior() {
    fundirEntre((previo) => (previo - 1 + proyectos.length) % proyectos.length);
  }

  function siguiente() {
    fundirEntre((previo) => (previo + 1) % proyectos.length);
  }

  function irA(indice) {
    if (indice === actual) return;
    fundirEntre(() => indice);
  }

  return (
    <section aria-label="Proyectos destacados" className="max-w-3xl mx-auto px-4 pb-10">
      <div
        className="relative w-full h-[400px] md:h-[500px] overflow-hidden rounded-2xl"
        onMouseEnter={() => setPausado(true)}
        onMouseLeave={() => setPausado(false)}
      >
        <a
          href={`/proyectos/?id=${proyecto._id}`}
          className="block absolute inset-0 bg-black group"
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

        {/*flechas para avanzar o volver, independientes del link de la portada*/}
        <button
          type="button"
          onClick={anterior}
          aria-label="Proyecto anterior"
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 inline-flex items-center justify-center w-11 h-11 rounded-full bg-black/80 border border-zinc-700 text-white hover:scale-110 hover:bg-verde-app hover:text-black hover:border-verde-app active:scale-90 active:bg-violeta-app active:text-black active:border-violeta-app transition-all duration-200 cursor-pointer"
        >
          <span aria-hidden="true">←</span>
        </button>
        <button
          type="button"
          onClick={siguiente}
          aria-label="Siguiente proyecto"
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 inline-flex items-center justify-center w-11 h-11 rounded-full bg-black/80 border border-zinc-700 text-white hover:scale-110 hover:bg-verde-app hover:text-black hover:border-verde-app active:scale-90 active:bg-violeta-app active:text-black active:border-violeta-app transition-all duration-200 cursor-pointer"
        >
          <span aria-hidden="true">→</span>
        </button>

        {/*puntitos: muestran en que proyecto estas y saltan al tocarlos*/}
        <div className="absolute bottom-4 inset-x-0 z-20 flex justify-center gap-2">
          {proyectos.map((p, indice) => (
            <button
              key={p._id}
              type="button"
              onClick={() => irA(indice)}
              aria-label={`Ir al proyecto ${indice + 1}`}
              aria-current={indice === actual ? 'true' : undefined}
              className={`w-2.5 h-2.5 rounded-full transition-colors cursor-pointer ${
                indice === actual ? 'bg-verde-app' : 'bg-white/35 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}