//tarjeta de un servicio: muestra el icono y los datos, y lleva al detalle
//se reusa en la grilla de servicios
import IconoServicio from './IconoServicio.jsx';

export default function ServicioCard({ servicio }) {
  return (
    <a
      href={`/servicios/${servicio.slug ?? servicio._id}`}
      className="block h-full group"
    >
      <article className="h-full p-6 rounded-2xl bg-white/10 group-hover:bg-white/20 backdrop-blur-md border border-verde-app/40 group-hover:border-verde-app/70 group-hover:scale-[1.03] active:scale-95 shadow-lg shadow-verde-app/10 transition-all duration-200 flex flex-col">
        <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 border border-verde-app/40 text-verde-app mb-4">
          <IconoServicio slug={servicio.slug ?? servicio._id} className="w-6 h-6" />
        </span>
        <h3 className="text-xl font-bold text-white mb-2">{servicio.nombre}</h3>
        <p className="text-zinc-400 text-sm leading-relaxed">
          {servicio.descripcion}
        </p>
        <p className="mt-4">
          <span className="inline-flex items-center gap-1 text-sm font-medium text-verde-app group-hover:text-verde-app/80 hover:scale-105 active:scale-95 transition-all duration-200">
            Ver más <span aria-hidden="true">→</span>
          </span>
        </p>
      </article>
    </a>
  );
}