//panel de administracion: sirve para cargar, editar y borrar proyectos
//se pide usuario y clave al entrar y las modificaciones se envian con esa clave
//la imagen se convierte a base64 y se guarda en la base junto al resto de los datos
import { useEffect, useState, useRef } from 'react';
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

//modal de confirmacion para borrar un proyecto (reemplaza al alert del navegador)
//se cierra con esc, con la x o tocando afuera; el foco vuelve al boton que lo abrio
function ModalEliminar({ proyecto, alConfirmar, alCancelar }) {
  const cancelarRef = useRef(null);

  //al abrir: se guarda el foco anterior, se enfoca el boton cancelar y se levanta la tecla esc
  useEffect(() => {
    const previo = document.activeElement;
    cancelarRef.current?.focus();
    function cerrarConEsc(evento) {
      if (evento.key === 'Escape') alCancelar();
    }
    window.addEventListener('keydown', cerrarConEsc);
    return () => {
      window.removeEventListener('keydown', cerrarConEsc);
      if (previo && previo.isConnected && previo.focus) previo.focus();
    };
    //alCancelar cambia en cada render pero aca solo interesa el cierre
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={alCancelar}
      aria-hidden={false}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-700 p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Eliminar proyecto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-white">Eliminar proyecto</h2>
        <p className="mt-2 text-zinc-400">
          ¿Borrar el proyecto "{proyecto.titulo}"? Esta acción no se puede deshacer.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            ref={cancelarRef}
            onClick={alCancelar}
            className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={alConfirmar}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium transition-colors cursor-pointer"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
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
  //marcan en rojo el campo del login que no coincide (usuario y/o clave)
  const [errorUsuario, setErrorUsuario] = useState(false);
  const [errorClave, setErrorClave] = useState(false);

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
  //proyecto que espera confirmacion antes de borrarse (para el modal)
  const [proyectoAEliminar, setProyectoAEliminar] = useState(null);

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
    setErrorUsuario(false);
    setErrorClave(false);
    try {
      await verificarClave(usuario.trim(), clave.trim());
      guardarSesion(usuario.trim(), clave.trim());
      setSesion(true);
      cargarProyectos();
    } catch (error) {
      //el servidor avisa cual de los dos campos no coincide para marcarlo en rojo
      setErrorUsuario(error.campos?.usuario === false);
      setErrorClave(error.campos?.clave === false);
      mostrarMensaje(error.message, 'error');
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

  //borra el proyecto que pidio confirmacion en el modal
  async function ejecutarBorrar() {
    if (!proyectoAEliminar) return;
    const unProyecto = proyectoAEliminar;
    setProyectoAEliminar(null);
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
    'w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-verde-app transition-all';
  //igual que claseInput pero con el borde rojo para marcar el campo del login que fallo
  const claseCampoLoginError =
    'w-full px-4 py-2 bg-zinc-900 border border-red-500 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all';
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
            onChange={(e) => {
              setUsuario(e.target.value);
              setErrorUsuario(false);
            }}
            placeholder="Usuario"
            aria-label="Usuario de administrador"
            aria-invalid={errorUsuario}
            autoComplete="username"
            className={errorUsuario ? claseCampoLoginError : claseInput}
          />
          <input
            type="password"
            value={clave}
            onChange={(e) => {
              setClave(e.target.value);
              setErrorClave(false);
            }}
            placeholder="Contraseña"
            aria-label="Contraseña de administrador"
            aria-invalid={errorClave}
            autoComplete="current-password"
            className={errorClave ? claseCampoLoginError : claseInput}
          />
          <button
            type="submit"
            disabled={cargandoSesion || !usuario.trim() || !clave.trim()}
            className={`${claseBoton} w-full bg-violeta-app hover:bg-violeta-app/90 text-[#1c1c21] disabled:bg-zinc-800`}
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
            className="w-4 h-4 accent-verde-app cursor-pointer"
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
          <div className="space-y-3 rounded-xl border border-verde-app/30 bg-verde-app/5 p-4">
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
            className={`${claseBoton} bg-violeta-app hover:bg-violeta-app/90 text-[#1c1c21]`}
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
                    <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-verde-app/10 text-verde-app border border-verde-app/20">
                      {nombreServicio(listaServicios, proyecto.servicio)}
                    </span>
                  )}
                  <p className="text-sm text-zinc-500 line-clamp-2">{proyecto.resumen || 'Sin descripción'}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => editarProyecto(proyecto)}
                    aria-label={`Editar ${proyecto.titulo}`}
                    title="Editar"
                    className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-zinc-700 text-verde-app hover:text-[#1c1c21] hover:bg-verde-app hover:border-verde-app hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setProyectoAEliminar(proyecto)}
                    aria-label={`Eliminar ${proyecto.titulo}`}
                    title="Eliminar"
                    className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-zinc-700 text-red-400 hover:text-white hover:bg-red-600 hover:border-red-600 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      <line x1="10" y1="11" x2="10" y2="17" />
                      <line x1="14" y1="11" x2="14" y2="17" />
                    </svg>
                  </button>
                </div>
              </li>
            ))}
</ul>
      )}
      </div>

      <AdminMensajes clave={clave} />

      {proyectoAEliminar && (
        <ModalEliminar
          proyecto={proyectoAEliminar}
          alConfirmar={ejecutarBorrar}
          alCancelar={() => setProyectoAEliminar(null)}
        />
      )}
    </section>
  );
}