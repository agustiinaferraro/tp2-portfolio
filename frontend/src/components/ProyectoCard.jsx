//tarjeta de un proyecto: casi toda la card es clickeable y lleva al detalle
//lo unico aparte es el link externo (behance/web), que no puede ir dentro del otro
//se reusa en los carruseles de la grilla de proyectos
//los textos que no entran salen cortados con "...": el resumen completo se ve en el detalle
const TOPE_RESUMEN = 140;

function recortar(texto, tope) {
  const limpio = String(texto ?? '').trim();
  if (limpio.length <= tope) return limpio;
  return `${limpio.slice(0, tope).trimEnd()}...`;
}

export default function ProyectoCard({ proyecto }) {
  return (
    <article className="group relative z-0 hover:z-10 focus-within:z-10 h-full flex flex-col overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-verde-app/50 hover:scale-105 active:scale-95 transition-all duration-200">
      {/*link al detalle: abarca la portada y el contenido de la card*/}
      <a href={`/proyectos/?id=${proyecto._id}`} className="flex flex-col flex-1 min-h-0">
        {/*portada: la principal o la primera de la galeria*/}
        {(proyecto.imagen || proyecto.imagenes?.[0]) && (
          <figure className="m-0">
            <img
              src={proyecto.imagen || proyecto.imagenes[0]}
              alt={`Imagen del proyecto ${proyecto.titulo}`}
              className="w-full h-44 object-cover group-hover:opacity-90 transition-opacity"
            />
          </figure>
        )}
        <div className="p-6 flex flex-col gap-3 flex-1 min-h-0">
          <h3 className="text-xl font-bold text-white line-clamp-2 group-hover:text-verde-app/80 transition-colors">
            {recortar(proyecto.titulo, 60)}
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
          <p className="text-zinc-400 text-sm leading-relaxed flex-1 min-h-0">
            {recortar(proyecto.resumen, TOPE_RESUMEN)}
          </p>
        </div>
      </a>
      {/*link externo del proyecto (sale de la card para no anidar links)*/}
      {proyecto.link && (
        <p className="px-6 pb-6">
          <a
            href={proyecto.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-medium text-verde-app hover:text-verde-app/80 hover:scale-105 active:scale-95 transition-all duration-200"
          >
            {proyecto.link.includes('behance.net') ? 'Ver detalle' : 'Abrir web'} <span aria-hidden="true">→</span>
          </a>
        </p>
      )}
    </article>
  );
}