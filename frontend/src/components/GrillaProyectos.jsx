//grilla de proyectos (parte dinamica de la seccion)
//se apoya en la capa de datos (api/proyectos.js) para obtener la informacion
//maneja los estados: "cargando", "con datos", "sin datos" y "error"
//los chips de arriba filtran la grilla por categoria (interaccion significativa)
//un proyecto puede estar en varias categorias (campo "servicios") y aparece en todas
//si la url trae ?id=, en lugar de la grilla muestra el detalle de ese proyecto
import { useEffect, useRef, useState } from 'react';
import { obtenerProyectos } from '../api/proyectos.js';
import { obtenerServicios } from '../api/servicios.js';
import ProyectoDetalle from './ProyectoDetalle.jsx';
import ProyectoCard from './ProyectoCard.jsx';
import Loading from './Loading.jsx';
import { servicios as serviciosEstaticos } from '../data/servicios.js';

//marca interna para el chip "sin categoria"
const SIN_CATEGORIA = '__sin_categoria__';

//junta los servicios de la base con la lista estatica para tener siempre los nombres
function juntarServicios(listaApi) {
  const porSlug = new Map();
  for (const servicio of serviciosEstaticos) porSlug.set(servicio.slug, servicio);
  for (const servicio of listaApi) porSlug.set(servicio.slug, servicio);
  return [...porSlug.values()];
}

//categorias de un proyecto: la lista nueva ("servicios") o la vieja ("servicio")
function categoriasDeProyecto(proyecto) {
  const lista = Array.isArray(proyecto.servicios) && proyecto.servicios.length
    ? proyecto.servicios
    : proyecto.servicio
      ? [proyecto.servicio]
      : [];
  return [...new Set(lista.map((s) => String(s).trim()).filter(Boolean))];
}

//desplazamiento del carrusel: usa el scroll animado nativo del navegador, que es mas fluido
//el snap de las tarjetas se aplica solo al final, sin pelear con la animacion
function desplazarSuave(contenedor, dir) {
  if (!contenedor) return;
  const paso = Math.max(320, contenedor.clientWidth * 0.75);
  contenedor.scrollTo({ left: contenedor.scrollLeft + dir * paso, behavior: 'smooth' });
}

//seccion con titulo y carrusel horizontal de proyectos
//las flechas se desactivan cuando no hay mas proyectos para ese lado (evita confusion)
function SeccionCarrusel({ clave, nombre, items }) {
  const ref = useRef(null);
  const [alInicio, setAlInicio] = useState(true);
  const [alFinal, setAlFinal] = useState(items.length <= 1);

  //al scrollear se avisa si queda contenido a cada lado para (des)habilitar las flechas
  useEffect(() => {
    const contenedor = ref.current;
    if (!contenedor) return;
    const actualizar = () => {
      const tolerancia = 8;
      const fin = contenedor.scrollWidth - contenedor.clientWidth;
      setAlInicio(contenedor.scrollLeft <= tolerancia);
      setAlFinal(contenedor.scrollLeft >= fin - tolerancia);
    };
    actualizar();
    contenedor.addEventListener('scroll', actualizar);
    window.addEventListener('resize', actualizar);
    return () => {
      contenedor.removeEventListener('scroll', actualizar);
      window.removeEventListener('resize', actualizar);
    };
  }, [items.length]);

  const claseFlecha = (desactivado) =>
    `shrink-0 self-center w-11 h-11 rounded-full bg-black/80 border border-zinc-700 text-zinc-200 transition-all duration-200 cursor-pointer ${
      desactivado
        ? 'opacity-40 cursor-not-allowed'
        : 'hover:scale-110 hover:bg-verde-app hover:text-black hover:border-verde-app active:scale-90 active:bg-violeta-app active:text-black active:border-violeta-app'
    }`;

  return (
    <section aria-labelledby={`proyectos-seccion-${clave}`}>
      <h2 id={`proyectos-seccion-${clave}`} className="text-2xl font-bold text-white mb-4">
        {nombre} <span className="ml-2 text-sm font-normal text-zinc-500">({items.length})</span>
      </h2>
      <div className="flex items-center gap-2">
        {/*flechas a los costados del carrusel (no tapan las tarjetas)*/}
        <button
          type="button"
          onClick={() => desplazarSuave(ref.current, -1)}
          disabled={alInicio}
          aria-label={`Ver proyectos anteriores de ${nombre}`}
          className={claseFlecha(alInicio)}
        >
          <span aria-hidden="true">←</span>
        </button>
        <div className="flex-1 min-w-0">
          <ul ref={ref} className="flex gap-6 overflow-x-auto snap-x pb-3 carrusel-scroll">
            {items.map((proyecto) => (
              <li key={proyecto._id} className="shrink-0 snap-start w-72 h-[26rem]">
                <ProyectoCard proyecto={proyecto} />
              </li>
            ))}
          </ul>
        </div>
        <button
          type="button"
          onClick={() => desplazarSuave(ref.current, 1)}
          disabled={alFinal}
          aria-label={`Ver más proyectos de ${nombre}`}
          className={claseFlecha(alFinal)}
        >
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  );
}

export default function GrillaProyectos() {
  const [proyectos, setProyectos] = useState([]);
  const [servicios, setServicios] = useState(serviciosEstaticos);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [detalleId, setDetalleId] = useState(null);
  const [categoria, setCategoria] = useState('');

  //se lee la url del lado del cliente (en el server no existe window)
  useEffect(() => {
    setDetalleId(new URLSearchParams(window.location.search).get('id'));
  }, []);

  //se cargan los proyectos y la lista de servicios para los filtros
  useEffect(() => {
    obtenerProyectos()
      .then((datos) => setProyectos(datos))
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
    obtenerServicios()
      .then((lista) => setServicios(juntarServicios(lista)))
      .catch(() => {});
  }, []);

  //si el usuario usa el boton "atras" del navegador, se re-sincroniza con la url
  useEffect(() => {
    const alVolverPagina = () => {
      setDetalleId(new URLSearchParams(window.location.search).get('id'));
    };
    window.addEventListener('popstate', alVolverPagina);
    return () => window.removeEventListener('popstate', alVolverPagina);
  }, []);

  //categorias con proyectos para mostrar como chips de filtro
  const conCategoria = [
    ...new Set(proyectos.flatMap((p) => categoriasDeProyecto(p))),
  ];
  const tieneSinCategoria = proyectos.some((p) => categoriasDeProyecto(p).length === 0);
  const categorias = [
    { slug: '', nombre: 'Todos' },
    ...conCategoria.map((slug) => ({
      slug,
      nombre: servicios.find((s) => s.slug === slug)?.nombre ?? slug,
    })),
    ...(tieneSinCategoria ? [{ slug: SIN_CATEGORIA, nombre: 'Sin categoría' }] : []),
  ];

  //filtro local por categoria
  const visibles =
    categoria === ''
      ? proyectos
      : categoria === SIN_CATEGORIA
        ? proyectos.filter((p) => categoriasDeProyecto(p).length === 0)
        : proyectos.filter((p) => categoriasDeProyecto(p).includes(categoria));

  //los proyectos visibles se agrupan por categoria (un proyecto puede aparecer en varias)
  const grupos = [];
  const ordenCategorias = categorias.map((c) => c.slug).filter((slug) => slug && slug !== SIN_CATEGORIA);
  for (const slug of ordenCategorias) {
    const items = visibles.filter((p) => categoriasDeProyecto(p).includes(slug));
    if (items.length) {
      grupos.push({
        clave: slug,
        nombre: servicios.find((s) => s.slug === slug)?.nombre ?? slug,
        items,
      });
    }
  }
  const sinCategoria = visibles.filter((p) => categoriasDeProyecto(p).length === 0);
  if (sinCategoria.length) {
    grupos.push({ clave: 'sincategoria', nombre: 'Sin categoría', items: sinCategoria });
  }

  //estado: detalle de un proyecto (al llegar con ?id= o al tocar una tarjeta)
  if (detalleId) {
    const yaCargado = proyectos.find((p) => p._id === detalleId);
    return (
      <ProyectoDetalle
        id={detalleId}
        proyectoInicial={yaCargado ?? null}
        alVolver={() => {
          setDetalleId(null);
          window.history.replaceState({}, '', window.location.pathname);
        }}
      />
    );
  }

  //estado: error
  if (error) {
    return (
      <p role="alert" className="text-red-400 text-center">
        No se pudieron cargar los proyectos. Verificá que el backend esté corriendo.
      </p>
    );
  }

  //estado: cargando
  if (cargando) {
    return <Loading claseContenedor="h-48" />;
  }

  //estado: sin datos
  if (proyectos.length === 0) {
    return (
      <p className="text-zinc-400 text-center">
        Todavía no hay proyectos cargados. Pronto vas a poder ver mis trabajos acá.
      </p>
    );
  }

  //estado: con datos
  //cada tarjeta lleva a la pagina de detalle con ?id=
  return (
    <div className="space-y-6">
      {/*filtro por categoria: scroll horizontal, en pantallas chicas se ve apenas la proxima*/}
      {categorias.length > 1 && (
        <ul
          className="flex gap-2 overflow-x-auto snap-x pb-2 carrusel-scroll"
          aria-label="Filtrar proyectos por categoría"
          role="group"
        >
          {categorias.map((c) => (
            <li key={c.slug} className="shrink-0 snap-start">
              <button
                type="button"
                onClick={() => setCategoria(c.slug)}
                aria-pressed={categoria === c.slug}
                className={`px-3 py-1 rounded-full text-sm border transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 ${
                  categoria === c.slug
                    ? 'bg-violeta-app text-black border-violeta-app'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:border-verde-app/50'
                }`}
              >
                {c.nombre}
              </button>
            </li>
          ))}
        </ul>
      )}

      {visibles.length === 0 ? (
        <p className="text-zinc-400 text-center">No hay proyectos en esta categoría todavía.</p>
      ) : (
        <div className="space-y-12">
          {grupos.map((g) => (
            <SeccionCarrusel key={g.clave} clave={g.clave} nombre={g.nombre} items={g.items} />
          ))}
        </div>
      )}
    </div>
  );
}