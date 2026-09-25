//pagina "mi cuenta": registro y login del usuario visitante
//si ya hay sesion guardada (localstorage) muestra los datos y permite cerrarla
//la misma sesion se usa para comentar en los proyectos
import { useState } from 'react';
import { registrarUsuario, iniciarSesion, leerSesion, guardarSesion, borrarSesion } from '../api/usuarios.js';

const claseInput =
  'w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-verde-app transition-all';

export default function CuentaUsuario() {
  const [sesion, setSesion] = useState(leerSesion());
  //"login" | "registro"
  const [modo, setModo] = useState('login');
  const [form, setForm] = useState({ nombre: '', email: '', clave: '' });
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  function cambiarCampo(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  //registro o login: guarda la sesion y muestra los datos del usuario
  async function manejarEnvio(e) {
    e.preventDefault();
    if (enviando) return;
    setEnviando(true);
    setError('');
    try {
      const respuesta = modo === 'registro' ? await registrarUsuario(form) : await iniciarSesion(form);
      const nuevaSesion = {
        token: respuesta.token,
        nombre: respuesta.usuario.nombre,
        email: respuesta.usuario.email,
      };
      guardarSesion(nuevaSesion);
      setSesion(nuevaSesion);
      setForm({ nombre: '', email: '', clave: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  function cerrarSesion() {
    borrarSesion();
    setSesion(null);
    setModo('login');
    setError('');
  }

  return (
    <section className="max-w-md mx-auto px-4 py-16" aria-label="Mi cuenta">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-extrabold text-white">Mi cuenta</h1>
        <p className="text-zinc-400">
          {sesion ? 'Ya estás adentro' : 'Registrate o entrá para participar'}
        </p>
      </div>

      {sesion ? (
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-8 space-y-6 text-center">
          <span className="mx-auto flex items-center justify-center w-20 h-20 rounded-full bg-verde-app/15 text-verde-app border border-verde-app/30 font-extrabold text-3xl">
            {(sesion.nombre ?? '?').charAt(0).toUpperCase()}
          </span>
          <div className="space-y-1">
            <p className="font-bold text-white text-xl">{sesion.nombre}</p>
            <p className="text-zinc-400 text-sm">{sesion.email}</p>
          </div>
          <div className="space-y-3 pt-2">
            <a
              href="/proyectos"
              className="block w-full px-5 py-2.5 rounded-full bg-violeta-app hover:bg-violeta-app/90 text-black text-sm font-medium text-center transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Dejá tu opinión en los proyectos
            </a>
            <button
              type="button"
              onClick={cerrarSesion}
              className="w-full px-5 py-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-sm transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-8 space-y-5">
          {/*selector entre entrar y crear cuenta*/}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-zinc-800">
            <button
              type="button"
              onClick={() => { setModo('login'); setError(''); }}
              className={`py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                modo === 'login' ? 'bg-violeta-app text-black' : 'text-zinc-300 hover:text-white'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => { setModo('registro'); setError(''); }}
              className={`py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                modo === 'registro' ? 'bg-violeta-app text-black' : 'text-zinc-300 hover:text-white'
              }`}
            >
              Crear cuenta
            </button>
          </div>

          <form onSubmit={manejarEnvio} className="space-y-3">
            {modo === 'registro' && (
              <input
                name="nombre"
                type="text"
                value={form.nombre}
                onChange={cambiarCampo}
                placeholder="Tu nombre"
                aria-label="Tu nombre"
                autoComplete="name"
                required
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
              required
              className={claseInput}
            />
            <input
              name="clave"
              type="password"
              value={form.clave}
              onChange={cambiarCampo}
              placeholder={modo === 'registro' ? 'Contraseña (mínimo 6 caracteres)' : 'Tu contraseña'}
              aria-label="Contraseña"
              autoComplete={modo === 'registro' ? 'new-password' : 'current-password'}
              required
              className={claseInput}
            />
            {error && <p role="alert" className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={enviando}
              className="w-full px-5 py-2.5 rounded-full bg-violeta-app hover:bg-violeta-app/90 text-black text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
            >
              {enviando ? 'Esperá...' : modo === 'registro' ? 'Crear cuenta' : 'Entrar'}
            </button>
          </form>

          <p className="text-xs text-zinc-500 text-center">
            Con tu cuenta podés dejar comentarios en los proyectos. Sin registro podés mirar todo.
          </p>
        </div>
      )}
    </section>
  );
}