//grilla de proyectos (parte dinamica de la seccion)
//se apoya en la capa de datos (api/proyectos.js) para obtener la informacion
//maneja los estados: "cargando", "con datos", "sin datos" y "error"
//los chips de arriba filtran la grilla por categoria (interaccion significativa)
//si la url trae ?id=, en lugar de la grilla muestra el detalle de ese proyecto
import { useEffect, useState } from 'react';
import { obtenerProyectos } from '../api/proyectos.js';
import { obtenerServicios } from '../api/servicios.js';
import ProyectoDetalle from './ProyectoDetalle.jsx';
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
  const conCategoria = [...new Set(proyectos.map((p) => p.servicio).filter(Boolean))];
  const tieneSinCategoria = proyectos.some((p) => !p.servicio);
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
      : proyectos.filter((p) => (categoria === SIN_CATEGORIA ? !p.servicio : p.servicio === categoria));

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
    return <p className="text-zinc-400 text-center">Cargando proyectos...</p>;
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
      {/*filtro por categoria: modifica que proyectos se ven*/}
      {categorias.length > 1 && (
        <ul className="flex flex-wrap gap-2" aria-label="Filtrar proyectos por categoría" role="group">
          {categorias.map((c) => (
            <li key={c.slug}>
              <button
                type="button"
                onClick={() => setCategoria(c.slug)}
                aria-pressed={categoria === c.slug}
                className={`px-3 py-1 rounded-full text-sm border transition-colors cursor-pointer ${
                  categoria === c.slug
                    ? 'bg-violet-600 text-white border-violet-600'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:border-violet-500/50'
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
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibles.map((proyecto) => (
            <li key={proyecto._id}>
              <article className="h-full flex flex-col overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-violet-500/50 transition-colors">
                {/*portada: la principal o la primera de la galeria, clickeable hacia el detalle*/}
                {(proyecto.imagen || proyecto.imagenes?.[0]) && (
                  <figure className="m-0">
                    <a href={`/proyectos/?id=${proyecto._id}`}>
                      <img
                        src={proyecto.imagen || proyecto.imagenes[0]}
                        alt={`Imagen del proyecto ${proyecto.titulo}`}
                        className="w-full h-44 object-cover hover:opacity-90 transition-opacity"
                      />
                    </a>
                  </figure>
                )}
                <div className="p-6 flex flex-col gap-3 flex-1">
                  <h3 className="text-xl font-bold text-white">
                    <a href={`/proyectos/?id=${proyecto._id}`} className="hover:text-violet-300 transition-colors">
                      {proyecto.titulo}
                    </a>
                  </h3>
                  {/*tags / roles aplicados*/}
                  {proyecto.tags?.length > 0 && (
                    <ul className="flex flex-wrap gap-2" aria-label="Etiquetas del proyecto">
                      {proyecto.tags.map((tag) => (
                        <li
                          key={tag}
                          className="text-xs px-2 py-1 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20"
                        >
                          {tag}
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="text-zinc-400 text-sm leading-relaxed flex-1">
                    {proyecto.resumen}
                  </p>
                  {proyecto.link && (
                    <p className="mt-auto">
                      <a
                        href={proyecto.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors inline-flex items-center gap-1"
                      >
                        Ver en Behance <span aria-hidden="true">→</span>
                      </a>
                    </p>
                  )}
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}