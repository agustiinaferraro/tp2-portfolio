//panel de administracion: sirve para cargar, editar y borrar proyectos
//se pide una clave al entrar y las modificaciones se envian con esa clave
//la imagen se convierte a base64 y se guarda en la base junto al resto de los datos
import { useEffect, useState } from 'react';
import {
  obtenerProyectos,
  verificarClave,
  crearProyecto,
  actualizarProyecto,
  borrarProyecto,
} from '../api/proyectos.js';
import AdminMensajes from './AdminMensajes.jsx';

//mensaje de error para saber si el problema fue la clave (401) o algo mas
function claveIncorrecta(error) {
  return /401/.test(error.message);
}

export default function AdminProyectos() {
  const [clave, setClave] = useState('');
  const [sesion, setSesion] = useState(false);
  const [cargandoSesion, setCargandoSesion] = useState(false);

  const [proyectos, setProyectos] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [titulo, setTitulo] = useState('');
  const [resumen, setResumen] = useState('');
  const [imagen, setImagen] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const [mensaje, setMensaje] = useState(null);

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
      await verificarClave(clave.trim());
      setSesion(true);
      cargarProyectos();
    } catch (error) {
      mostrarMensaje(claveIncorrecta(error) ? 'Contraseña incorrecta' : error.message, 'error');
    } finally {
      setCargandoSesion(false);
    }
  }

  function salir() {
    setSesion(false);
    setClave('');
    setProyectos([]);
    resetearFormulario();
    setMensaje(null);
  }

  function resetearFormulario() {
    setTitulo('');
    setResumen('');
    setImagen('');
    setEditandoId(null);
  }

  function editarProyecto(proyecto) {
    setEditandoId(proyecto._id);
    setTitulo(proyecto.titulo ?? '');
    setResumen(proyecto.resumen ?? '');
    setImagen(proyecto.imagen ?? '');
    setMensaje(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function quitarImagen() {
    setImagen('');
  }

  async function guardarProyecto(evento) {
    evento.preventDefault();
    if (!titulo.trim()) {
      mostrarMensaje('El título es obligatorio', 'error');
      return;
    }
    setGuardando(true);
    setMensaje(null);
    const datos = { titulo: titulo.trim(), resumen: resumen.trim() };
    if (imagen) datos.imagen = imagen;
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

  function alElegirImagen(evento) {
    const archivo = evento.target.files?.[0];
    if (!archivo) return;
    //se limita el tamaño para que entre en la base de datos sin problemas
    if (archivo.size > 8 * 1024 * 1024) {
      mostrarMensaje('La imagen pesa más de 8 MB. Probá con otra más liviana.', 'error');
      evento.target.value = '';
      return;
    }
    const lector = new FileReader();
    lector.onload = () => {
      setImagen(lector.result);
      mostrarMensaje(null);
    };
    lector.readAsDataURL(archivo);
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
          <p className="text-sm text-zinc-400">Ingresá la contraseña para gestionar los proyectos.</p>
          <input
            type="password"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            placeholder="Contraseña"
            aria-label="Contraseña de administrador"
            autoFocus
            className={claseInput}
          />
          <button
            type="submit"
            disabled={cargandoSesion || !clave.trim()}
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

        <div className="space-y-1">
          <label htmlFor="admin-imagen" className="block text-sm text-zinc-300">
            Imagen del proyecto
          </label>
          <input
            id="admin-imagen"
            type="file"
            accept="image/*"
            onChange={alElegirImagen}
            className="block w-full text-sm text-zinc-400 file:mr-4 file:px-4 file:py-2 file:rounded-lg file:border-0 file:bg-violet-600 file:text-white file:font-medium file:cursor-pointer hover:file:bg-violet-500 file:transition-colors"
          />
          <p className="text-xs text-zinc-600">Máximo 8 MB. La imagen se guarda en la base de datos.</p>
        </div>

        {imagen && (
          <div className="space-y-2">
            <img
              src={imagen}
              alt="Vista previa de la imagen del proyecto"
              className="h-40 object-contain rounded-lg border border-zinc-800 bg-zinc-950"
            />
            <button type="button" onClick={quitarImagen} className="text-xs text-red-400 hover:text-red-300 transition-colors">
              Quitar imagen
            </button>
          </div>
        )}

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
                {proyecto.imagen ? (
                  <img
                    src={proyecto.imagen}
                    alt=""
                    className="w-16 h-16 object-cover rounded-lg shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-zinc-800 shrink-0" aria-hidden="true" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{proyecto.titulo}</p>
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