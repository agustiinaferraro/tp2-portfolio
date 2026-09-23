//detalle de un proyecto (estilo behance): muestra todo el proyecto en grande
//si sos administrador, hay un boton de editar que deja cambiar los datos y la categoria
//al editar hay una opcion de crear una categoria nueva si ninguna coincide
import { useEffect, useState } from 'react';
import { obtenerProyectoPorId, actualizarProyecto, verificarClave } from '../api/proyectos.js';
import { obtenerServicios, crearServicio } from '../api/servicios.js';
import { leerSesion, guardarSesion, borrarSesion } from '../api/sesionAdmin.js';
import { OPCION_NUEVA_CATEGORIA } from '../utils/imagen.js';
import SelectorImagenes from './SelectorImagenes.jsx';
import { servicios as serviciosEstaticos } from '../data/servicios.js';

//junta los servicios de la base con la lista estatica para que nunca quede vacia
//si hay repetidos, gana el de la base (puede tener nombre actualizado)
function juntarServicios(listaApi) {
  const porSlug = new Map();
  for (const servicio of serviciosEstaticos) porSlug.set(servicio.slug, servicio);
  for (const servicio of listaApi) porSlug.set(servicio.slug, servicio);
  return [...porSlug.values()];
}

//categorias conocidas (las que tienen paginas generadas en el build)
//las nuevas no tienen pagina pero si se muestran como chip
function esCategoriaConocida(slug) {
  return serviciosEstaticos.some((s) => s.slug === slug);
}

export default function ProyectoDetalle({ id, proyectoInicial = null, alVolver = null }) {
  const [proyecto, setProyecto] = useState(proyectoInicial);
  const [servicios, setServicios] = useState(serviciosEstaticos);
  const [cargando, setCargando] = useState(!proyectoInicial);
  const [error, setError] = useState(null);

  const [admin, setAdmin] = useState(false);
  const [clave, setClave] = useState('');
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  //imagen elegida en la galeria del detalle
  const [indiceGaleria, setIndiceGaleria] = useState(0);

  //formulario de edicion
  const [titulo, setTitulo] = useState('');
  const [resumen, setResumen] = useState('');
  const [link, setLink] = useState('');
  const [tagsTexto, setTagsTexto] = useState('');
  const [servicio, setServicio] = useState('');
  const [nuevaNombre, setNuevaNombre] = useState('');
  const [nuevaDescripcion, setNuevaDescripcion] = useState('');
  const [imagenes, setImagenes] = useState([]);
  const [destacado, setDestacado] = useState(false);

  //login inline si no hay sesion guardada
  const [usuarioLogin, setUsuarioLogin] = useState('');
  const [claveLogin, setClaveLogin] = useState('');
  const [verificando, setVerificando] = useState(false);

  function mostrarMensaje(texto, tipo = 'ok') {
    setMensaje({ texto, tipo });
  }

  //al entrar: se trae el proyecto (si no vino) y la lista de servicios
  useEffect(() => {
    const sesion = leerSesion();
    if (sesion) {
      setAdmin(true);
      setClave(sesion.clave);
    }

    obtenerServicios()
      .then((lista) => setServicios(juntarServicios(lista)))
      .catch(() => {});

    if (!proyectoInicial) {
      obtenerProyectoPorId(id)
        .then(setProyecto)
        .catch((e) => setError(e.message))
        .finally(() => setCargando(false));
    }
  }, [id]);

  //al ver otro proyecto la galeria vuelve a arrancar desde la primera imagen
  useEffect(() => {
    setIndiceGaleria(0);
  }, [proyecto?._id]);

  function abrirEditor() {
    if (!proyecto) return;
    setTitulo(proyecto.titulo ?? '');
    setResumen(proyecto.resumen ?? '');
    setLink(proyecto.link ?? '');
    setTagsTexto((proyecto.tags ?? []).join(', '));
    setServicio(proyecto.servicio ?? '');
    setNuevaNombre('');
    setNuevaDescripcion('');
    setImagenes([proyecto.imagen, ...(proyecto.imagenes ?? [])].filter(Boolean));
    setDestacado(!!proyecto.destacado);
    setMensaje(null);
    setEditando(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function iniciarSesion(evento) {
    evento.preventDefault();
    setVerificando(true);
    setMensaje(null);
    try {
      await verificarClave(usuarioLogin.trim(), claveLogin.trim());
      guardarSesion(usuarioLogin.trim(), claveLogin.trim());
      setAdmin(true);
      setClave(claveLogin.trim());
      setUsuarioLogin('');
      setClaveLogin('');
      abrirEditor();
    } catch (e) {
      mostrarMensaje('Usuario o contraseña incorrecta', 'error');
    } finally {
      setVerificando(false);
    }
  }

  function cerrarSesion() {
    borrarSesion();
    setAdmin(false);
    setClave('');
    setEditando(false);
    setMensaje(null);
  }

  async function guardarCambios(evento) {
    evento.preventDefault();
    if (!titulo.trim()) {
      mostrarMensaje('El título es obligatorio', 'error');
      return;
    }
    setGuardando(true);
    setMensaje(null);
    try {
      let slugServicio = servicio;
      //si se elige "crear categoria nueva", se crea o se reusa una con ese nombre
      if (servicio === OPCION_NUEVA_CATEGORIA) {
        if (!nuevaNombre.trim()) {
          mostrarMensaje('Escribí el nombre de la categoría nueva', 'error');
          setGuardando(false);
          return;
        }
        const creado = await crearServicio(nuevaNombre.trim(), nuevaDescripcion.trim(), clave);
        slugServicio = creado.datos.slug;
        obtenerServicios()
          .then((lista) => setServicios(juntarServicios(lista)))
          .catch(() => {});
      }

      const datos = {
        titulo: titulo.trim(),
        resumen: resumen.trim(),
        link: link.trim(),
        tags: tagsTexto.split(',').map((t) => t.trim()).filter(Boolean),
        servicio: slugServicio,
        //la primera imagen del formulario es la portada y el resto la galeria
        imagen: imagenes[0] ?? '',
        imagenes: imagenes.slice(1),
        destacado,
      };

      const actualizado = await actualizarProyecto(id, datos, clave);
      setProyecto(actualizado.datos);
      setEditando(false);
      mostrarMensaje('Proyecto actualizado');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      if (/401/.test(e.message)) {
        mostrarMensaje('La sesión expiró. Entrá de nuevo para editar.', 'error');
        cerrarSesion();
      } else {
        mostrarMensaje(e.message, 'error');
      }
    } finally {
      setGuardando(false);
    }
  }

  const claseInput =
    'w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-verde-app transition-all';
  const claseBoton =
    'px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

  //boton para volver a la lista de proyectos
  const volver = alVolver ? (
    <button type="button" onClick={alVolver} className="text-sm font-medium text-verde-app hover:text-verde-app/80 transition-colors inline-flex items-center gap-1">
      <span aria-hidden="true">←</span> Volver a los proyectos
    </button>
  ) : (
    <a href="/proyectos" className="text-sm font-medium text-verde-app hover:text-verde-app/80 transition-colors inline-flex items-center gap-1">
      <span aria-hidden="true">←</span> Volver a los proyectos
    </a>
  );

  //estado: error
  if (error) {
    return (
      <section className="max-w-3xl mx-auto px-4 py-16">
        {volver}
        <p role="alert" className="text-red-400 mt-6">
          No se pudo cargar el proyecto.
        </p>
      </section>
    );
  }

  //estado: cargando
  if (cargando) {
    return (
      <section className="max-w-3xl mx-auto px-4 py-16">
        {volver}
        <p className="text-zinc-400 mt-6">Cargando proyecto...</p>
      </section>
    );
  }

  //estado: sin datos
  if (!proyecto) {
    return (
      <section className="max-w-3xl mx-auto px-4 py-16">
        {volver}
        <p className="text-zinc-400 mt-6">No encontramos ese proyecto.</p>
      </section>
    );
  }

  const nombreCategoria =
    servicios.find((s) => s.slug === proyecto.servicio)?.nombre ?? (proyecto.servicio ? proyecto.servicio : '');

  //todas las imagenes del proyecto: la portada primero y la galeria extra despues
  const galeria = [proyecto.imagen, ...(proyecto.imagenes ?? [])].filter(Boolean);

  return (
    <section className="max-w-3xl mx-auto px-4 py-16">
      <div className="space-y-2">
        {volver}
        <div className="flex items-center justify-between">
          <p className="text-verde-app font-medium tracking-widest uppercase text-sm mt-4">Proyecto</p>
          {admin ? (
            <div className="flex items-center gap-4 mt-4">
              <button
                type="button"
                onClick={editando ? () => setEditando(false) : abrirEditor}
                className={`${claseBoton} bg-violeta-app hover:bg-violeta-app/90 text-[#1c1c21]`}
              >
                {editando ? 'Cancelar edición' : 'Editar'}
              </button>
              <button type="button" onClick={cerrarSesion} className="text-sm text-zinc-400 hover:text-white transition-colors">
                Cerrar sesión
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={abrirEditor}
              className={`${claseBoton} bg-violeta-app hover:bg-violeta-app/90 text-[#1c1c21] mt-4`}
            >
              Editar
            </button>
          )}
        </div>
      </div>

      {/*login inline: solo aparece si se quiere editar sin haber entrado como admin*/}
      {!admin && editando && (
        <form onSubmit={iniciarSesion} className="mt-6 p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
          <p className="text-sm text-zinc-400">Ingresá tu usuario y contraseña para editar este proyecto.</p>
          <input
            type="text"
            value={usuarioLogin}
            onChange={(e) => setUsuarioLogin(e.target.value)}
            placeholder="Usuario"
            autoComplete="username"
            className={claseInput}
          />
          <input
            type="password"
            value={claveLogin}
            onChange={(e) => setClaveLogin(e.target.value)}
            placeholder="Contraseña"
            autoComplete="current-password"
            className={claseInput}
          />
          <button
            type="submit"
            disabled={verificando || !usuarioLogin.trim() || !claveLogin.trim()}
            className={`${claseBoton} w-full bg-violeta-app hover:bg-violeta-app/90 text-[#1c1c21]`}
          >
            {verificando ? 'Verificando...' : 'Entrar'}
          </button>
        </form>
      )}

      {mensaje && (
        <p
          role={mensaje.tipo === 'error' ? 'alert' : 'status'}
          className={`mt-6 text-sm px-4 py-2 rounded-lg border ${
            mensaje.tipo === 'error'
              ? 'text-red-400 border-red-500/30 bg-red-500/10'
              : 'text-green-400 border-green-500/30 bg-green-500/10'
          }`}
        >
          {mensaje.texto}
        </p>
      )}

      {galeria.length > 0 && (
        <figure className="mt-8 space-y-3">
          {galeria.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {galeria.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndiceGaleria(i)}
                  className={`shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-colors cursor-pointer ${
                    i === indiceGaleria ? 'border-verde-app' : 'border-zinc-800 hover:border-zinc-600'
                  }`}
                  aria-label={`Ver imagen ${i + 1}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
          <img
            src={galeria[Math.min(indiceGaleria, galeria.length - 1)]}
            alt={`Imagen del proyecto ${proyecto.titulo}`}
            className="w-full rounded-2xl border border-zinc-800"
          />
        </figure>
      )}

      <h1 className="text-4xl font-bold text-white mt-8">{proyecto.titulo}</h1>

      <ul className="flex flex-wrap gap-2 mt-4">
        {nombreCategoria && (
          <li>
            {esCategoriaConocida(proyecto.servicio) ? (
              <a
                href={`/servicios/${proyecto.servicio}`}
                className="text-xs px-3 py-1 rounded-full bg-verde-app/10 text-verde-app border border-verde-app/20 hover:bg-verde-app/20 transition-colors"
              >
                {nombreCategoria}
              </a>
            ) : (
              <span className="text-xs px-3 py-1 rounded-full bg-verde-app/10 text-verde-app border border-verde-app/20">
                {nombreCategoria}
              </span>
            )}
          </li>
        )}
        {(proyecto.tags ?? []).map((tag) => (
          <li
            key={tag}
            className="text-xs px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700"
          >
            {tag}
          </li>
        ))}
      </ul>

      {proyecto.resumen && (
        <p className="text-lg text-zinc-400 leading-relaxed mt-6 whitespace-pre-line">{proyecto.resumen}</p>
      )}

      {proyecto.link && (
        <p className="mt-8">
          <a
            href={proyecto.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-violeta-app hover:bg-violeta-app/90 text-[#1c1c21] font-medium transition-colors"
          >
            Visitar proyecto <span aria-hidden="true">↗</span>
          </a>
        </p>
      )}

      {/*formulario de edicion, solo para admin*/}
      {admin && editando && (
        <form onSubmit={guardarCambios} className="mt-12 p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
          <h2 className="text-lg font-semibold text-white">Editar proyecto</h2>

          <div className="space-y-1">
            <label htmlFor="det-titulo" className="block text-sm text-zinc-300">
              Título *
            </label>
            <input
              id="det-titulo"
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Nombre del proyecto"
              className={claseInput}
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="det-resumen" className="block text-sm text-zinc-300">
              Descripción
            </label>
            <textarea
              id="det-resumen"
              value={resumen}
              onChange={(e) => setResumen(e.target.value)}
              placeholder="Contá de qué se trata el proyecto..."
              rows={4}
              className={`${claseInput} resize-y`}
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="det-link" className="block text-sm text-zinc-300">
              Link del proyecto (opcional)
            </label>
            <input
              id="det-link"
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://..."
              className={claseInput}
            />
          </div>

          <label htmlFor="det-destacado" className="flex items-center gap-3 text-sm text-zinc-300 cursor-pointer">
            <input
              id="det-destacado"
              type="checkbox"
              checked={destacado}
              onChange={(e) => setDestacado(e.target.checked)}
              className="w-4 h-4 accent-verde-app cursor-pointer"
            />
            Destacado en la portada
          </label>

          <div className="space-y-1">
            <label htmlFor="det-tags" className="block text-sm text-zinc-300">
              Tags (separados por comas)
            </label>
            <input
              id="det-tags"
              type="text"
              value={tagsTexto}
              onChange={(e) => setTagsTexto(e.target.value)}
              placeholder="ux/ui, ilustración, branding"
              className={claseInput}
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="det-servicio" className="block text-sm text-zinc-300">
              Categoría / servicio
            </label>
            <select
              id="det-servicio"
              value={servicio}
              onChange={(e) => setServicio(e.target.value)}
              className={claseInput}
            >
              <option value="">Sin categoría</option>
              {servicios.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.nombre}
                </option>
              ))}
              <option value={OPCION_NUEVA_CATEGORIA}>+ Crear categoría nueva...</option>
            </select>
          </div>

          {servicio === OPCION_NUEVA_CATEGORIA && (
            <div className="space-y-3 rounded-xl border border-verde-app/30 bg-verde-app/5 p-4">
              <div className="space-y-1">
                <label htmlFor="det-nueva-nombre" className="block text-sm text-zinc-300">
                  Nombre de la categoría nueva *
                </label>
                <input
                  id="det-nueva-nombre"
                  type="text"
                  value={nuevaNombre}
                  onChange={(e) => setNuevaNombre(e.target.value)}
                  placeholder="Ej: Fotografía"
                  className={claseInput}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="det-nueva-desc" className="block text-sm text-zinc-300">
                  Descripción breve (opcional)
                </label>
                <input
                  id="det-nueva-desc"
                  type="text"
                  value={nuevaDescripcion}
                  onChange={(e) => setNuevaDescripcion(e.target.value)}
                  placeholder="De qué se trata esta categoría"
                  className={claseInput}
                />
              </div>
              <p className="text-xs text-zinc-500">
                La categoría queda guardada y se puede usar en otros proyectos. Su página propia se suma con la próxima actualización de la web.
              </p>
            </div>
          )}

          <div className="space-y-1">
            <label htmlFor="det-imagen" className="block text-sm text-zinc-300">
              Imágenes del proyecto
            </label>
            <SelectorImagenes imagenes={imagenes} alCambiar={setImagenes} mostrarMensaje={mostrarMensaje} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={guardando} className={`${claseBoton} bg-violeta-app hover:bg-violeta-app/90 text-[#1c1c21]`}>
              {guardando ? 'Guardando...' : 'Guardar cambios'}
            </button>
            <button
              type="button"
              onClick={() => setEditando(false)}
              className={`${claseBoton} bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700`}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </section>
  );
}