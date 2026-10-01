//hero de la home: carrusel de videos de los proyectos de behance
//cada video se reproduce solo (muted, loop) unos segundos y luego funde al siguiente
//sin descripciones: toda el area es clickeable y lleva al detalle del proyecto
import { useEffect, useState } from 'react';
import { obtenerProyectos, obtenerProyectosDestacados } from '../api/proyectos.js';
import { urlVideoCcV } from '../api/behance.js';
import Loading from './Loading.jsx';

//segundos que se reproduce cada video y duracion del fundido entre uno y otro
const INTERVALO_MS = 5000;
const DURACION_FUNDIDO_MS = 500;

//los videos de behance se alojan en adobe ccv con una url firmada que expira:
//el proyecto guarda el embed estable y aca se resuelve el mp4 actual cuando hace falta
function esUrlCcV(url) {
  return /player\/ccv\/([A-Za-z0-9_-]{6,})\//.test(url ?? '');
}

function idCcV(url) {
  const m = String(url ?? '').match(/player\/ccv\/([A-Za-z0-9_-]{6,})\//);
  return m ? m[1] : null;
}

//convierte la url del proyecto en algo reproducible:
//  - embed de adobe (behance) → mp4 directo resuelto en vivo
//  - links de youtube/vimeo → iframe (autoplay mudo en loop)
//  - cualquier .mp4/.webm → video directo
function urlDelVideo(url, mp4s) {
  if (esUrlCcV(url)) {
    const mp4 = mp4s?.[idCcV(url)];
    //si el mp4 todavia no cargo, se muestra la portada mientras tanto
    return mp4 ? { tipo: 'video', src: mp4 } : null;
  }
  const youtube = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  if (youtube) {
    const id = youtube[1];
    return {
      tipo: 'iframe',
      src: `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&modestbranding=1&rel=0`,
    };
  }
  const vimeo = url.match(/(?:vimeo\.com|player\.vimeo\.com\/video)\/(\d{6,})/);
  if (vimeo) {
    return {
      tipo: 'iframe',
      src: `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1&muted=1&loop=1&background=1`,
    };
  }
  return { tipo: 'video', src: url };
}

export default function HeroCarrusel() {
  const [proyectos, setProyectos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [actual, setActual] = useState(0);
  const [fade, setFade] = useState(true);
  //videos de adobe resueltos: id del ccv → url del mp4 actual
  const [mp4s, setMp4s] = useState({});

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

  //resuelve los videos de adobe (url firmada que expira) apenas llegan los proyectos
  useEffect(() => {
    if (proyectos.length === 0) return;
    const pendientes = {};
    for (const proyecto of proyectos) {
      if (!proyecto.video || !esUrlCcV(proyecto.video)) continue;
      const ccv = idCcV(proyecto.video);
      if (ccv && !mp4s[ccv]) {
        pendientes[ccv] = urlVideoCcV(ccv).then((r) => r.mp4).catch(() => null);
      }
    }
    const ids = Object.keys(pendientes);
    if (ids.length === 0) return;
    Promise.all(Object.values(pendientes)).then((resultados) => {
      setMp4s((previo) => {
        const nuevo = { ...previo };
        ids.forEach((ccv, i) => {
          if (resultados[i]) nuevo[ccv] = resultados[i];
        });
        return nuevo;
      });
    });
  }, [proyectos.length]);

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
  const video = proyecto.video ? urlDelVideo(proyecto.video, mp4s) : null;
  const esVideo = video?.tipo === 'video';
  const esIframe = video?.tipo === 'iframe';

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
        {esVideo ? (
          <video
            key={proyecto._id}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              fade ? 'opacity-100' : 'opacity-0'
            }`}
            src={video.src}
            autoPlay
            muted
            loop
            playsInline
          />
        ) : esIframe ? (
          <iframe
            key={proyecto._id}
            title={`Video del proyecto ${proyecto.titulo}`}
            src={video.src}
            className={`absolute inset-0 w-full h-full border-0 transition-opacity duration-500 ${
              fade ? 'opacity-100' : 'opacity-0'
            }`}
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            allowFullScreen
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