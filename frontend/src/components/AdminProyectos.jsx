//panel de administracion: sirve para cargar, editar y borrar proyectos
//se pide usuario y clave al entrar y las modificaciones se envian con esa clave
//la imagen se convierte a base64 y se guarda en la base junto al resto de los datos
import { useEffect, useState } from 'react';
import {
  obtenerProyectos,
  verificarClave,
  crearProyecto,
  actualizarProyecto,
  borrarProyecto,
} from '../api/proyectos.js';
import { obtenerServicios, crearServicio } from '../api/servicios.js';
import { leerSesion, guardarSesion, borrarSesion } from '../api/sesionAdmin.js';
import { OPCION_NUEVA_CATEGORIA } from '../utils/imagen.js';
import AdminMensajes from './AdminMensajes.jsx';
import SelectorImagenes from './SelectorImagenes.jsx';
import { servicios as serviciosEstaticos } from '../data/servicios.js';

//mensaje de error para saber si el problema fue la clave (401) o algo mas
function claveIncorrecta(error) {
  return /401/.test(error.message);
}

//junta los servicios de la base con la lista estatica para que nunca quede vacia
//si hay repetidos, gana el de la base (puede tener nombre actualizado)
function juntarServicios(listaApi) {
  const porSlug = new Map();
  for (const servicio of serviciosEstaticos) porSlug.set(servicio.slug, servicio);
  for (const servicio of listaApi) porSlug.set(servicio.slug, servicio);
  return [...porSlug.values()];
}

//nombre del servicio a partir de su slug, para mostrar la categoría del proyecto
function nombreServicio(lista, slug) {
  return lista.find((s) => s.slug === slug)?.nombre ?? '';
}

export default function AdminProyectos() {
  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [sesion, setSesion] = useState(false);
  const [cargandoSesion, setCargandoSesion] = useState(false);

  const [proyectos, setProyectos] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [titulo, setTitulo] = useState('');
  const [resumen, setResumen] = useState('');
  const [servicio, setServicio] = useState('');
  const [nuevaNombre, setNuevaNombre] = useState('');
  const [nuevaDescripcion, setNuevaDescripcion] = useState('');
  const [imagenes, setImagenes] = useState([]);
  const [destacado, setDestacado] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const [listaServicios, setListaServicios] = useState(serviciosEstaticos);
  const [mensaje, setMensaje] = useState(null);

  //al entrar: si ya hay sesion guardada (por ejemplo desde el detalle de un proyecto) se reusa
  useEffect(() => {
    const sesion = leerSesion();
    if (sesion) {
      setSesion(true);
      setClave(sesion.clave);
      setUsuario(sesion.usuario);
      cargarProyectos();
    }
    obtenerServicios()
      .then((lista) => setListaServicios(juntarServicios(lista)))
      .catch(() => {});
  }, []);

  function mostrarMensaje(texto, tipo = 'ok') {
    setMensaje({ texto, tipo });
  }

  function cargarProyectos() {
    setCargando(true);
    obtenerProyectos()
      .then(setProyectos)
      .catch((error) => mostrarMensaje(error.message, 'error'))
      .finally(() => setCargando(false));
  }

  async function iniciarSesion(evento) {
    evento.preventDefault();
    setCargandoSesion(true);
    setMensaje(null);
    try {
      await verificarClave(usuario.trim(), clave.trim());
      guardarSesion(usuario.trim(), clave.trim());
      setSesion(true);
      cargarProyectos();
    } catch (error) {
      mostrarMensaje(claveIncorrecta(error) ? 'Usuario o contraseña incorrecta' : error.message, 'error');
    } finally {
      setCargandoSesion(false);
    }
  }

  function salir() {
    borrarSesion();
    setSesion(false);
    setUsuario('');
    setClave('');
    setProyectos([]);
    resetearFormulario();
    setMensaje(null);
  }

  function resetearFormulario() {
    setTitulo('');
    setResumen('');
    setServicio('');
    setNuevaNombre('');
    setNuevaDescripcion('');
    setImagenes([]);
    setDestacado(false);
    setEditandoId(null);
  }

  function editarProyecto(proyecto) {
    setEditandoId(proyecto._id);
    setTitulo(proyecto.titulo ?? '');
    setResumen(proyecto.resumen ?? '');
    setServicio(proyecto.servicio ?? '');
    setNuevaNombre('');
    setNuevaDescripcion('');
    setImagenes([proyecto.imagen, ...(proyecto.imagenes ?? [])].filter(Boolean));
    setDestacado(!!proyecto.destacado);
    setMensaje(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function guardarProyecto(evento) {
    evento.preventDefault();
    if (!titulo.trim()) {
      mostrarMensaje('El título es obligatorio', 'error');
      return;
    }
    setGuardando(true);
    setMensaje(null);
    let slugServicio = servicio.trim();
    //si se elige "crear categoria nueva", se crea o se reusa una con ese nombre
    if (slugServicio === OPCION_NUEVA_CATEGORIA) {
      if (!nuevaNombre.trim()) {
        mostrarMensaje('Escribí el nombre de la categoría nueva', 'error');
        setGuardando(false);
        return;
      }
      const creado = await crearServicio(nuevaNombre.trim(), nuevaDescripcion.trim(), clave);
      slugServicio = creado.datos.slug;
      obtenerServicios()
        .then((lista) => setListaServicios(juntarServicios(lista)))
        .catch(() => {});
    }
    //la primera imagen del formulario es la portada y el resto la galeria del detalle
    const datos = {
      titulo: titulo.trim(),
      resumen: resumen.trim(),
      servicio: slugServicio,
      imagen: imagenes[0] ?? '',
      imagenes: imagenes.slice(1),
      destacado,
    };
    try {
      if (editandoId) {
        await actualizarProyecto(editandoId, datos, clave);
        mostrarMensaje('Proyecto actualizado');
      } else {
        await crearProyecto(datos, clave);
        mostrarMensaje('Proyecto creado');
      }
      resetearFormulario();
      cargarProyectos();
    } catch (error) {
      if (claveIncorrecta(error)) {
        mostrarMensaje('La sesión expiró. Volvé a entrar.', 'error');
        salir();
      } else {
        mostrarMensaje(error.message, 'error');
      }
    } finally {
      setGuardando(false);
    }
  }

  async function borrar(unProyecto) {
    if (!window.confirm(`¿Borrar el proyecto "${unProyecto.titulo}"?`)) return;
    setMensaje(null);
    try {
      await borrarProyecto(unProyecto._id, clave);
      if (editandoId === unProyecto._id) resetearFormulario();
      mostrarMensaje('Proyecto borrado');
      cargarProyectos();
    } catch (error) {
      if (claveIncorrecta(error)) {
        mostrarMensaje('La sesión expiró. Volvé a entrar.', 'error');
        salir();
      } else {
        mostrarMensaje(error.message, 'error');
      }
    }
  }

  const claseInput =
    'w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all';
  const claseBoton =
    'px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

  if (!sesion) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <form onSubmit={iniciarSesion} className="space-y-4 p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
          <h1 className="text-2xl font-bold text-white">Panel de administración</h1>
          <p className="text-sm text-zinc-400">Ingresá tu usuario y contraseña para gestionar los proyectos.</p>
          <input
            type="text"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            placeholder="Usuario"
            aria-label="Usuario de administrador"
            autoComplete="username"
            className={claseInput}
          />
          <input
            type="password"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            placeholder="Contraseña"
            aria-label="Contraseña de administrador"
            autoComplete="current-password"
            className={claseInput}
          />
          <button
            type="submit"
            disabled={cargandoSesion || !usuario.trim() || !clave.trim()}
            className={`${claseBoton} w-full bg-violet-600 hover:bg-violet-500 text-white disabled:bg-zinc-800`}
          >
            {cargandoSesion ? 'Verificando...' : 'Entrar'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <section aria-label="Administración de proyectos" className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Mis proyectos</h1>
        <button type="button" onClick={salir} className="text-sm text-zinc-400 hover:text-white transition-colors">
          Salir
        </button>
      </div>

      {mensaje && (
        <p
          role={mensaje.tipo === 'error' ? 'alert' : 'status'}
          className={`text-sm px-4 py-2 rounded-lg border ${
            mensaje.tipo === 'error'
              ? 'text-red-400 border-red-500/30 bg-red-500/10'
              : 'text-green-400 border-green-500/30 bg-green-500/10'
          }`}
        >
          {mensaje.texto}
        </p>
      )}

      <form onSubmit={guardarProyecto} className="space-y-4 p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
        <h2 className="text-lg font-semibold text-white">
          {editandoId ? 'Editar proyecto' : 'Cargar un proyecto nuevo'}
        </h2>

        <div className="space-y-1">
          <label htmlFor="admin-titulo" className="block text-sm text-zinc-300">
            Título *
          </label>
          <input
            id="admin-titulo"
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Nombre del proyecto"
            className={claseInput}
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="admin-resumen" className="block text-sm text-zinc-300">
            Descripción (opcional)
          </label>
          <textarea
            id="admin-resumen"
            value={resumen}
            onChange={(e) => setResumen(e.target.value)}
            placeholder="Contá de qué se trata el proyecto..."
            rows={4}
            className={`${claseInput} resize-y`}
          />
        </div>

        <label htmlFor="admin-destacado" className="flex items-center gap-3 text-sm text-zinc-300 cursor-pointer">
          <input
            id="admin-destacado"
            type="checkbox"
            checked={destacado}
            onChange={(e) => setDestacado(e.target.checked)}
            className="w-4 h-4 accent-violet-500 cursor-pointer"
          />
          Destacado en la portada
        </label>

        <div className="space-y-1">
          <label htmlFor="admin-servicio" className="block text-sm text-zinc-300">
            Categoría / servicio
          </label>
          <select
            id="admin-servicio"
            value={servicio}
            onChange={(e) => setServicio(e.target.value)}
            className={claseInput}
          >
            <option value="">Sin categoría</option>
            {listaServicios.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.nombre}
              </option>
            ))}
            <option value={OPCION_NUEVA_CATEGORIA}>+ Crear categoría nueva...</option>
          </select>
          <p className="text-xs text-zinc-600">Elegí en qué servicio aparece este proyecto.</p>
        </div>

        {servicio === OPCION_NUEVA_CATEGORIA && (
          <div className="space-y-3 rounded-xl border border-violet-500/30 bg-violet-500/5 p-4">
            <div className="space-y-1">
              <label htmlFor="admin-nueva-nombre" className="block text-sm text-zinc-300">
                Nombre de la categoría nueva *
              </label>
              <input
                id="admin-nueva-nombre"
                type="text"
                value={nuevaNombre}
                onChange={(e) => setNuevaNombre(e.target.value)}
                placeholder="Ej: Fotografía"
                className={claseInput}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="admin-nueva-desc" className="block text-sm text-zinc-300">
                Descripción breve (opcional)
              </label>
              <input
                id="admin-nueva-desc"
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
          <label htmlFor="admin-imagen" className="block text-sm text-zinc-300">
            Imágenes del proyecto
          </label>
          <SelectorImagenes imagenes={imagenes} alCambiar={setImagenes} mostrarMensaje={mostrarMensaje} />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={guardando}
            className={`${claseBoton} bg-violet-600 hover:bg-violet-500 text-white`}
          >
            {guardando ? 'Guardando...' : editandoId ? 'Guardar cambios' : 'Guardar proyecto'}
          </button>
          {editandoId && (
            <button
              type="button"
              onClick={() => {
                resetearFormulario();
                setMensaje(null);
              }}
              className={`${claseBoton} bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700`}
            >
              Cancelar edición
            </button>
          )}
        </div>
      </form>

      <div className="border-t border-zinc-800 pt-6">
        <h2 className="text-lg font-semibold text-white mb-4">Proyectos cargados</h2>
        {cargando ? (
          <p className="text-zinc-400">Cargando...</p>
        ) : proyectos.length === 0 ? (
          <p className="text-zinc-400">Todavía no cargaste ningún proyecto.</p>
        ) : (
          <ul className="space-y-3">
            {proyectos.map((proyecto) => (
              <li
                key={proyecto._id}
                className="flex items-center gap-4 p-3 rounded-xl bg-zinc-900 border border-zinc-800"
              >
                {(proyecto.imagen || proyecto.imagenes?.[0]) ? (
                  <img
                    src={proyecto.imagen || proyecto.imagenes[0]}
                    alt=""
                    className="w-16 h-16 object-cover rounded-lg shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-zinc-800 shrink-0" aria-hidden="true" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{proyecto.titulo}</p>
                  {nombreServicio(listaServicios, proyecto.servicio) && (
                    <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20">
                      {nombreServicio(listaServicios, proyecto.servicio)}
                    </span>
                  )}
                  <p className="text-sm text-zinc-500 line-clamp-2">{proyecto.resumen || 'Sin descripción'}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => editarProyecto(proyecto)}
                    className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => borrar(proyecto)}
                    className="text-sm text-red-400 hover:text-red-300 transition-colors"
                  >
                    Borrar
                  </button>
                </div>
              </li>
            ))}
</ul>
      )}
      </div>

      <AdminMensajes clave={clave} />
    </section>
  );
}