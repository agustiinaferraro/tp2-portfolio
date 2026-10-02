//tarjeta de un servicio: muestra la portada de un proyecto del mismo rubro, el icono y los datos
//la portada se elige sola (un proyecto destacado del servicio), no se carga a mano
//se reusa en la grilla de servicios
import IconoServicio from './IconoServicio.jsx';

export default function ServicioCard({ servicio, portada = null }) {
  return (
    <a
      href={`/servicios/${servicio.slug ?? servicio._id}`}
      className="block h-full group"
    >
      <article className="h-full rounded-2xl bg-white/10 group-hover:bg-white/20 backdrop-blur-md border border-verde-app/40 group-hover:border-verde-app/70 group-hover:scale-[1.03] active:scale-95 shadow-lg shadow-verde-app/10 transition-all duration-200 flex flex-col overflow-hidden relative z-0 hover:z-10 focus-within:z-10">
        {/*portada: un proyecto destacado del mismo rubro (si hay)*/}
        {portada && (
          <figure className="m-0 overflow-hidden">
            <img
              src={portada}
              alt=""
              loading="lazy"
              className="w-full h-40 object-cover group-hover:opacity-90 transition-opacity"
            />
          </figure>
        )}
        <div className="p-6 flex flex-col flex-1">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 border border-verde-app/40 text-verde-app mb-4">
            <IconoServicio slug={servicio.slug ?? servicio._id} className="w-6 h-6" />
          </span>
          <h3 className="text-xl font-bold text-white mb-2">{servicio.nombre}</h3>
          <p className="text-zinc-400 text-sm leading-relaxed flex-1">
            {servicio.descripcion}
          </p>
          <p className="mt-4">
            <span className="inline-flex items-center gap-1 text-sm font-medium text-verde-app group-hover:text-verde-app/80 hover:scale-105 active:scale-95 transition-all duration-200">
              Ver más <span aria-hidden="true">→</span>
            </span>
          </p>
        </div>
      </article>
    </a>
  );
}