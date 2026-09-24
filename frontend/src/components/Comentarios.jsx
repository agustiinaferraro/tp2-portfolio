//seccion de comentarios de un proyecto: leer es publico, comentar pide estar registrado
//los visitantes pueden crear una cuenta o entrar, y una vez logueados dejan su comentario
import { useEffect, useState } from 'react';
import { obtenerComentarios, publicarComentario } from '../api/comentarios.js';
import { registrarUsuario, iniciarSesion, leerSesion, guardarSesion, borrarSesion } from '../api/usuarios.js';
import Loading from './Loading.jsx';

//colores del circulo del avatar segun la primera letra del nombre
const coloresAvatar = [
  'bg-violeta-app/20 text-violeta-app border-violeta-app/30',
  'bg-verde-app/15 text-verde-app border-verde-app/30',
  'bg-sky-500/15 text-sky-300 border-sky-500/30',
  'bg-amber-400/15 text-amber-300 border-amber-400/30',
];

function inicialAvatar(nombre) {
  return (nombre ?? '?').trim().charAt(0).toUpperCase() || '?';
}

function colorAvatar(nombre) {
  const letra = inicialAvatar(nombre).charCodeAt(0);
  return coloresAvatar[letra % coloresAvatar.length];
}

function formatearFecha(fecha) {
  try {
    return new Date(fecha).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
}

const claseInput =
  'w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-verde-app transition-all';

export default function Comentarios({ proyectoId }) {
  const [comentarios, setComentarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [sesion, setSesion] = useState(null);
  //"formulario" | "login" | "registro"
  const [modo, setModo] = useState('formulario');
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [form, setForm] = useState({ nombre: '', email: '', clave: '' });
  const [enviandoAuth, setEnviandoAuth] = useState(false);
  const [errorAuth, setErrorAuth] = useState('');

  //al abrir se cargan los comentarios del proyecto y la sesion guardada
  useEffect(() => {
    let activo = true;
    obtenerComentarios(proyectoId)
      .then((lista) => {
        if (activo) setComentarios(lista);
      })
      .catch(() => {
        if (activo) setError('No se pudieron cargar los comentarios.');
      })
      .finally(() => {
        if (activo) setCargando(false);
      });
    setSesion(leerSesion());
    return () => {
      activo = false;
    };
  }, [proyectoId]);

  //publica el comentario escrito
  async function manejarComentar(e) {
    e.preventDefault();
    if (enviando || !texto.trim() || !sesion?.token) return;

    setEnviando(true);
    setError('');
    try {
      const respuesta = await publicarComentario(proyectoId, texto.trim(), sesion.token);
      const nuevo = respuesta?.datos;
      if (nuevo) setComentarios((prev) => [...prev, nuevo]);
      setTexto('');
    } catch (err) {
      if (/401/.test(err.message)) {
        borrarSesion();
        setSesion(null);
        setModo('formulario');
      }
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  //registro o login: guarda la sesion en el navegador y habilita el comentario
  async function manejarAuth(e) {
    e.preventDefault();
    if (enviandoAuth) return;

    setEnviandoAuth(true);
    setErrorAuth('');
    try {
      const respuesta =
        modo === 'registro' ? await registrarUsuario(form) : await iniciarSesion(form);
      guardarSesion({ token: respuesta.token, nombre: respuesta.usuario.nombre, email: respuesta.usuario.email });
      setSesion({ token: respuesta.token, nombre: respuesta.usuario.nombre, email: respuesta.usuario.email });
      setForm({ nombre: '', email: '', clave: '' });
      setModo('formulario');
    } catch (err) {
      setErrorAuth(err.message);
    } finally {
      setEnviandoAuth(false);
    }
  }

  function cerrarSesion() {
    borrarSesion();
    setSesion(null);
    setModo('formulario');
    setTexto('');
  }

  function cambiarCampo(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  let contenido;
  if (cargando) {
    contenido = <Loading claseContenedor="h-32" />;
  } else if (comentarios.length === 0) {
    contenido = <p className="text-zinc-500 text-sm">Todavía no hay comentarios. ¡Si te gustó, contalo!</p>;
  } else {
    contenido = (
      <ul className="space-y-4">
        {comentarios.map((comentario) => (
          <li key={comentario._id} className="flex gap-3">
            <span
              aria-hidden="true"
              className={`shrink-0 flex items-center justify-center w-10 h-10 rounded-full border font-bold text-base ${colorAvatar(comentario.nombre)}`}
            >
              {inicialAvatar(comentario.nombre)}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-zinc-100 text-sm">{comentario.nombre}</span>
                <span className="text-xs text-zinc-500">{formatearFecha(comentario.createdAt)}</span>
              </div>
              <p className="text-zinc-300 text-sm whitespace-pre-wrap break-words mt-1">{comentario.texto}</p>
            </div>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section className="mt-12 space-y-6" aria-label="Comentarios del proyecto">
      <h2 className="flex items-center gap-3 text-2xl font-bold text-white">
        <svg aria-hidden="true" className="w-7 h-7 text-violeta-app" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
        Comentarios
        {!cargando && comentarios.length > 0 && (
          <span className="text-sm px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
            {comentarios.length}
          </span>
        )}
      </h2>

      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-4">
        {contenido}

        {error && <p role="alert" className="text-red-400 text-sm">{error}</p>}

        {sesion?.token ? (
          /*logueado: caja para escribir el comentario*/
          <form onSubmit={manejarComentar} className="pt-4 border-t border-zinc-800 space-y-3">
            <p className="text-sm text-zinc-400">
              Comentás como <span className="font-bold text-white">{sesion.nombre}</span>
              <button type="button" onClick={cerrarSesion} className="ml-2 text-xs text-zinc-500 underline hover:text-zinc-300 transition-colors">
                Cerrar sesión
              </button>
            </p>
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Dejá un comentario..."
              aria-label="Dejá un comentario"
              rows={3}
              className={`${claseInput} resize-none`}
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={enviando || !texto.trim()}
                className="px-5 py-2 rounded-full bg-violeta-app hover:bg-violeta-app/90 text-[#1c1c21] text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95"
              >
                {enviando ? 'Publicando...' : 'Comentar'}
              </button>
            </div>
          </form>
        ) : (
          /*sin sesion: botones para entrar o crear cuenta*/
          <div className="pt-4 border-t border-zinc-800 space-y-4">
            <p className="text-sm text-zinc-400">¿Querés dejar tu opinión? Ingresá o creá tu cuenta para comentar.</p>
            {modo === 'formulario' ? (
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setModo('login')}
                  className="px-5 py-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-sm transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  Iniciar sesión
                </button>
                <button
                  type="button"
                  onClick={() => setModo('registro')}
                  className="px-5 py-2 rounded-full bg-violeta-app hover:bg-violeta-app/90 text-[#1c1c21] text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  Crear cuenta
                </button>
              </div>
            ) : (
              <form onSubmit={manejarAuth} className="space-y-3 max-w-md">
                {modo === 'registro' && (
                  <input
                    name="nombre"
                    type="text"
                    value={form.nombre}
                    onChange={cambiarCampo}
                    placeholder="Tu nombre"
                    aria-label="Tu nombre"
                    autoComplete="name"
                    className={claseInput}
                  />
                )}
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={cambiarCampo}
                  placeholder="Email"
                  aria-label="Email"
                  autoComplete="email"
                  className={claseInput}
                />
                <input
                  name="clave"
                  type="password"
                  value={form.clave}
                  onChange={cambiarCampo}
                  placeholder="Contraseña (mínimo 6 caracteres)"
                  aria-label="Contraseña"
                  autoComplete={modo === 'registro' ? 'new-password' : 'current-password'}
                  className={claseInput}
                />
                {errorAuth && <p role="alert" className="text-red-400 text-sm">{errorAuth}</p>}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    disabled={enviandoAuth}
                    className="px-5 py-2 rounded-full bg-violeta-app hover:bg-violeta-app/90 text-[#1c1c21] text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    {enviandoAuth ? 'Esperá...' : modo === 'registro' ? 'Crear cuenta' : 'Entrar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setModo('formulario');
                      setErrorAuth('');
                    }}
                    className="text-sm text-zinc-500 underline hover:text-zinc-300 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </section>
  );
}