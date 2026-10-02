//grilla de servicios (parte dinamica de la seccion)
//se apoya en la capa de datos (api/servicios.js) para obtener la informacion
//cada servicio se ilustra con un proyecto destacado del mismo rubro
//es un carrusel horizontal igual que el de proyectos: se ve un poco de la siguiente
//maneja los estados: "cargando", "con datos", "sin datos" y "error"
import { useEffect, useState } from 'react';
import { obtenerServicios } from '../api/servicios.js';
import { obtenerProyectosDestacados } from '../api/proyectos.js';
import ServicioCard from './ServicioCard.jsx';
import Carrusel from './Carrusel.jsx';
import Loading from './Loading.jsx';

//categorias de un proyecto: la lista nueva ("servicios") o la vieja ("servicio")
function categoriasDeProyecto(proyecto) {
  const lista = Array.isArray(proyecto.servicios) && proyecto.servicios.length
    ? proyecto.servicios
    : proyecto.servicio
      ? [proyecto.servicio]
      : [];
  return lista.map((s) => String(s).trim());
}

//portada por rubro: el primer destacado del servicio que tenga imagen con una resolucion util
//(las capturas de pantalla muy grandes pesan mucho y no sirven de portada)
function PortadasPorRubro(destacados) {
  const portadas = new Map();
  const candidatas = [...destacados].sort((a, b) => (b.imagen?.length ?? 0) - (a.imagen?.length ?? 0));
  for (const proyecto of candidatas) {
    const imagen = proyecto.imagen || proyecto.imagenes?.[0];
    //se descartan las capturas gigante: tardan mucho en cargar y se ven peor de portada
    if (!imagen || /^data:image\/svg\+xml/i.test(imagen)) continue;
    if (imagen.length > 200000) continue;
    for (const slug of categoriasDeProyecto(proyecto)) {
      if (!portadas.has(slug)) portadas.set(slug, imagen);
    }
  }
  return portadas;
}

export default function GrillaServicios() {
  const [servicios, setServicios] = useState([]); //lista de servicios
  const [portadas, setPortadas] = useState(new Map()); //imagen de portada por rubro
  const [cargando, setCargando] = useState(true); //¿esta cargando?
  const [error, setError] = useState(null); //¿hubo error?

  //se ejecuta una vez al montar el componente: pide los servicios al backend
  useEffect(() => {
    obtenerServicios()
      .then((datos) => setServicios(datos))
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
    //en paralelo busca un proyecto destacado por cada rubro, para usarlo de portada
    obtenerProyectosDestacados()
      .then((destacados) => setPortadas(PortadasPorRubro(destacados)))
      .catch(() => {});
  }, []);

  //estado: error
  if (error) {
    return (
      <p role="alert" className="text-red-400 text-center">
        No se pudieron cargar los servicios. Verificá que el backend esté corriendo.
      </p>
    );
  }

  //estado: cargando
  if (cargando) {
    return <Loading claseContenedor="h-48" />;
  }

  //estado: sin datos
  if (servicios.length === 0) {
    return <p className="text-zinc-400 text-center">Todavía no hay servicios cargados.</p>;
  }

  //estado: con datos → se muestran las tarjetas en un carrusel horizontal
  return (
    <Carrusel etiqueta="Servicios" clave="servicios">
      {servicios.map((servicio) => (
        <li
          key={servicio._id}
          className="shrink-0 snap-start w-[clamp(15rem,72%,20rem)]"
        >
          <ServicioCard
            servicio={servicio}
            portada={portadas.get(servicio.slug ?? servicio._id) ?? null}
          />
        </li>
      ))}
    </Carrusel>
  );
}