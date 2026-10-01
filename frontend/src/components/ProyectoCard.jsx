//tarjeta de un proyecto: muestra la portada y los datos, con la opcion de ir al detalle
//se reusa en los carruseles de la grilla de proyectos
export default function ProyectoCard({ proyecto }) {
  return (
    <article className="h-full flex flex-col overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-verde-app/50 transition-colors">
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
      <div className="p-6 flex flex-col gap-3 flex-1 min-h-0">
        <h3 className="text-xl font-bold text-white line-clamp-2">
          <a href={`/proyectos/?id=${proyecto._id}`} className="hover:text-verde-app/80 transition-colors">
            {proyecto.titulo}
          </a>
        </h3>
        {/*tags / roles aplicados*/}
        {proyecto.tags?.length > 0 && (
          <ul className="flex flex-wrap gap-2" aria-label="Etiquetas del proyecto">
            {proyecto.tags.map((tag) => (
              <li
                key={tag}
                className="text-xs px-2 py-1 rounded-full bg-verde-app/10 text-verde-app border border-verde-app/20"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}
        <p className="text-zinc-400 text-sm leading-relaxed flex-1 min-h-0 line-clamp-3">{proyecto.resumen}</p>
        {proyecto.link && (
          <p className="mt-auto">
            <a
              href={proyecto.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-verde-app hover:text-verde-app/80 transition-colors inline-flex items-center gap-1"
            >
              {proyecto.link.includes('behance.net') ? 'Ver en Behance' : 'Abrir web'} <span aria-hidden="true">→</span>
            </a>
          </p>
        )}
      </div>
    </article>
  );
}