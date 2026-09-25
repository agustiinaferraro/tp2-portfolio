//pagina "mi cuenta": registro y login del usuario visitante
//las cuentas se crean en firebase authentication y la sesion se guarda en el navegador
//la misma sesion se usa para comentar en los proyectos
//si la cuenta es de la dueña, tambien se le ofrece entrar al panel de administracion
import { useEffect, useState } from 'react';
import {
  registrarUsuario,
  iniciarSesion,
  entrarConGoogle as entrarConGoogleCuenta,
  leerSesion,
  guardarSesion,
  borrarSesion,
  cuentaConfigurada,
  obtenerEmailDueno,
} from '../api/usuarios.js';

const claseInput =
  'w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-verde-app transition-all';

function IconoGoogle() {
  return (
    <svg className="w-5 h-5" aria-hidden="true" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export default function CuentaUsuario() {
  const [sesion, setSesion] = useState(leerSesion());
  //"login" | "registro"
  const [modo, setModo] = useState('login');
  const [form, setForm] = useState({ nombre: '', email: '', clave: '' });
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  //email de la dueña del sitio, para ofrecerle el panel de administracion
  const [emailDueno, setEmailDueno] = useState('');

  //solo deja ver el panel si la cuenta logueada es de la dueña
  const esDueno = !!sesion && sesion.email?.toLowerCase() === emailDueno.toLowerCase();

  useEffect(() => {
    obtenerEmailDueno()
      .then((email) => setEmailDueno(email ?? ''))
      .catch(() => {});
  }, []);

  //guarda la sesion devuelta por firebase y actualiza la pantalla
  function aplicarSesion(respuesta) {
    const nuevaSesion = {
      token: respuesta.token,
      nombre: respuesta.usuario.nombre,
      email: respuesta.usuario.email,
    };
    guardarSesion(nuevaSesion);
    setSesion(nuevaSesion);
    setForm({ nombre: '', email: '', clave: '' });
  }

  //entra con una cuenta de google (firebase abre el selector de cuentas)
  async function entrarConGoogle() {
    if (enviando) return;
    setEnviando(true);
    setError('');
    try {
      aplicarSesion(await entrarConGoogleCuenta());
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

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
      aplicarSesion(respuesta);
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
            {esDueno && (
              <a
                href="/admin"
                className="block w-full px-5 py-2.5 rounded-full bg-verde-app hover:bg-verde-app/90 text-black text-sm font-medium text-center transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Gestionar mis proyectos
              </a>
            )}
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
      ) : !cuentaConfigurada ? (
        /*si firebase no esta configurado se avisa que el registro no esta disponible*/
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-8 space-y-4 text-center">
          <span
            aria-hidden="true"
            className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
          </span>
          <p className="text-zinc-300 text-sm">
            El registro de cuentas todavía no está configurado por la dueña del sitio.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-8 space-y-5">
          {/*acceso con google (plataforma de identidad integrada)*/}
          <button
            type="button"
            onClick={entrarConGoogle}
            disabled={enviando}
            className="w-full inline-flex items-center justify-center gap-3 px-5 py-2.5 rounded-full bg-white text-black text-sm font-medium border border-zinc-700 transition-all duration-200 hover:bg-zinc-100 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <IconoGoogle />
            Continuar con Google
          </button>

          <div className="flex items-center gap-3 text-xs text-zinc-500">
            <span className="flex-1 h-px bg-zinc-700" aria-hidden="true" />
            o
            <span className="flex-1 h-px bg-zinc-700" aria-hidden="true" />
          </div>

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

          {modo === 'login' ? (
            <p className="text-center text-sm text-zinc-400">
              ¿No tenés cuenta?{' '}
              <button
                type="button"
                onClick={() => { setModo('registro'); setError(''); }}
                className="font-medium text-verde-app hover:text-verde-app/80 underline transition-colors cursor-pointer"
              >
                Registrate acá
              </button>
            </p>
          ) : (
            <p className="text-center text-sm text-zinc-400">
              ¿Ya tenés cuenta?{' '}
              <button
                type="button"
                onClick={() => { setModo('login'); setError(''); }}
                className="font-medium text-verde-app hover:text-verde-app/80 underline transition-colors cursor-pointer"
              >
                Entrá directamente
              </button>
            </p>
          )}

          <p className="text-xs text-zinc-500 text-center">
            Con tu cuenta podés dejar comentarios en los proyectos. Sin registro podés mirar todo.
          </p>
        </div>
      )}
    </section>
  );
}