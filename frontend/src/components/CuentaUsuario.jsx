//pagina "mi cuenta": registro y login del usuario visitante
//las cuentas se crean en firebase authentication y la sesion se guarda en el navegador
//la misma sesion se usa para comentar en los proyectos
//si la cuenta es de la dueña, tambien se le ofrece entrar al panel de administracion
import { useEffect, useRef, useState } from 'react';
import {
  registrarUsuario,
  iniciarSesion,
  entrarConGoogle as entrarConGoogleCuenta,
  leerSesion,
  guardarSesion,
  borrarSesion,
  actualizarFoto,
  actualizarNombre,
  listarCuentas,
  guardarCuenta,
  olvidarCuenta,
  cuentaConfigurada,
  obtenerEmailDueno,
} from '../api/usuarios.js';
import { comprimirImagen } from '../utils/imagen.js';

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

//lapiz para editar los datos del perfil
function IconoLapiz({ className }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  );
}

export default function CuentaUsuario() {
  const [sesion, setSesion] = useState(leerSesion());
  //"login" | "registro" (al llegar con ?modo=registro se abre la creacion de cuenta)
  const [modo, setModo] = useState(() => {
    if (typeof window === 'undefined') return 'login';
    return new URLSearchParams(window.location.search).get('modo') === 'registro' ? 'registro' : 'login';
  });
  const [form, setForm] = useState({ nombre: '', email: '', clave: '' });
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  //email de la dueña del sitio, para ofrecerle el panel de administracion
  const [emailDueno, setEmailDueno] = useState('');
  //input oculto para elegir la foto de perfil
  const fotoInputRef = useRef(null);
  //edicion del nombre de usuario (fila del perfil)
  const [editandoNombre, setEditandoNombre] = useState(false);
  const [formNombre, setFormNombre] = useState('');
  const [enviandoNombre, setEnviandoNombre] = useState(false);
  //dialogo de cuentas: "" (cerrado) | "cambiar" | "agregar"
  const [ventana, setVentana] = useState('');
  //cuentas guardadas en el navegador (varias cuentas como en ig)
  const [cuentas, setCuentas] = useState(() => listarCuentas());
  //foto elegida pero sin guardar todavia (se confirma en el perfil)
  const [fotoNueva, setFotoNueva] = useState(null);
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  //donde se editan los campos, para cerrar el modo edicion al tocar afuera
  const nombreEditRef = useRef(null);
  const fotoEditRef = useRef(null);

  //solo deja ver el panel si la cuenta logueada es de la dueña
  const esDueno = !!sesion && sesion.email?.toLowerCase() === emailDueno.toLowerCase();

  useEffect(() => {
    obtenerEmailDueno()
      .then((email) => setEmailDueno(email ?? ''))
      .catch(() => {});
  }, []);

  //si se toca afuera de un campo en edicion, se cancela y queda el valor normal
  useEffect(() => {
    if (!editandoNombre && !fotoNueva) return;
    function alTocarAfuera(e) {
      const dentroNombre = nombreEditRef.current?.contains(e.target);
      const dentroFoto = fotoEditRef.current?.contains(e.target);
      if (dentroNombre || dentroFoto) return;
      setEditandoNombre(false);
      setFotoNueva(null);
      setError('');
    }
    document.addEventListener('mousedown', alTocarAfuera);
    return () => document.removeEventListener('mousedown', alTocarAfuera);
  }, [editandoNombre, fotoNueva]);

  //guarda la sesion devuelta por firebase, la suma a las cuentas guardadas y actualiza la pantalla
  //si viene del dialogo "agregar cuenta", al final lo cierra
  function aplicarSesion(respuesta, desdeVentana = false) {
    const nuevaSesion = {
      token: respuesta.token,
      nombre: respuesta.usuario.nombre,
      email: respuesta.usuario.email,
      foto: respuesta.usuario.foto ?? '',
    };
    guardarCuenta(nuevaSesion);
    setCuentas(listarCuentas());
    guardarSesion(nuevaSesion);
    setSesion(nuevaSesion);
    setForm({ nombre: '', email: '', clave: '' });
    setFotoNueva(null);
    setEditandoNombre(false);
    if (desdeVentana) setVentana('');
  }

  //elige una foto de perfil, se comprime y queda lista para confirmar
  async function cambiarFoto(e) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    setError('');
    try {
      const foto = await comprimirImagen(archivo);
      setFotoNueva(foto);
    } catch (err) {
      setError(err.message);
    }
  }

  //confirma la foto nueva y la guarda en la sesion
  async function guardarFoto() {
    if (!fotoNueva || enviandoFoto) return;
    setEnviandoFoto(true);
    setError('');
    try {
      const nueva = actualizarFoto(fotoNueva);
      guardarCuenta(nueva);
      setCuentas(listarCuentas());
      setSesion(nueva);
      setFotoNueva(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviandoFoto(false);
    }
  }

  //cancela la foto nueva sin guardarla
  function cancelarFoto() {
    setFotoNueva(null);
    setError('');
  }

  //abre la edicion del nombre con el valor actual
  function empezarEditarNombre() {
    setFormNombre(sesion?.nombre ?? '');
    setError('');
    setEditandoNombre(true);
  }

  //guarda el nombre de usuario que se acaba de escribir
  async function guardarNombre(e) {
    e.preventDefault();
    const limpio = formNombre.trim();
    if (!limpio || enviandoNombre) return;
    setEnviandoNombre(true);
    setError('');
    try {
      const nueva = await actualizarNombre(limpio);
      guardarCuenta(nueva);
      setCuentas(listarCuentas());
      setSesion(nueva);
      setEditandoNombre(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviandoNombre(false);
    }
  }

  //entra con una cuenta de google (firebase abre el selector de cuentas)
  //desdeVentana: true cuando se agrega otra cuenta desde el dialogo
  async function entrarConGoogle(desdeVentana = false) {
    if (enviando) return;
    setEnviando(true);
    setError('');
    try {
      aplicarSesion(await entrarConGoogleCuenta(), desdeVentana);
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
  async function manejarEnvio(e, desdeVentana = false) {
    e.preventDefault();
    if (enviando) return;
    setEnviando(true);
    setError('');
    try {
      const respuesta = modo === 'registro' ? await registrarUsuario(form) : await iniciarSesion(form);
      aplicarSesion(respuesta, desdeVentana);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  //cambia la sesion activa a otra cuenta guardada (como cambiar de cuenta en ig)
  function cambiarCuentaActiva(cuenta) {
    guardarSesion(cuenta);
    setSesion(cuenta);
    setError('');
    setFotoNueva(null);
    setEditandoNombre(false);
    setVentana('');
  }

  //olvida una cuenta guardada en el navegador
  function olvidarCuentaGuardada(email) {
    olvidarCuenta(email);
    setCuentas(listarCuentas());
  }

  //formulario de acceso (google + entrar/crear) usado en la portada y en "agregar cuenta"
  function renderAcceso(desdeVentana) {
    return (
      <>
        <button
          type="button"
          onClick={() => entrarConGoogle(desdeVentana)}
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

        <form onSubmit={(e) => manejarEnvio(e, desdeVentana)} className="space-y-3">
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
      </>
    );
  }

  function cerrarSesion() {
    borrarSesion();
    setSesion(null);
    setModo('login');
    setError('');
    setFotoNueva(null);
    setEditandoNombre(false);
    setVentana('');
  }

  return (
    <section className="max-w-md mx-auto px-4 py-16" aria-label="Mi cuenta">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-extrabold text-white">Editar perfil</h1>
        <p className="text-zinc-400">
          {sesion ? `${sesion.nombre}, este es tu perfil` : 'Registrate o entrá para participar'}
        </p>
      </div>

      {sesion ? (
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden">
          <input
            ref={fotoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={cambiarFoto}
          />

          {/*cabecera del perfil: foto, nombre y estado (tipo wsp)*/}
          <div className="flex items-center gap-4 p-6">
            <button
              type="button"
              onClick={() => fotoInputRef.current?.click()}
              aria-label="Cambiar foto de perfil"
              className="group relative shrink-0 cursor-pointer"
            >
              <span className="flex items-center justify-center w-20 h-20 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700 transition-colors group-hover:border-verde-app">
                {fotoNueva ? (
                  <img src={fotoNueva} alt="Foto nueva" className="w-full h-full object-cover" />
                ) : sesion.foto ? (
                  <img src={sesion.foto} alt="Foto de perfil" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-verde-app font-extrabold text-3xl">
                    {(sesion.nombre ?? '?').charAt(0).toUpperCase()}
                  </span>
                )}
              </span>
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/55 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <IconoLapiz className="w-4 h-4" />
              </span>
            </button>
            <div className="min-w-0 text-left">
              <p className="font-bold text-white text-lg truncate">{sesion.nombre}</p>
              <p className="text-zinc-400 text-sm truncate">{sesion.email}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-xs text-verde-app mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-verde-app" aria-hidden="true"></span>
                  Sesión activa
                </span>
                <button
                  type="button"
                  onClick={() => setVentana('cambiar')}
                  aria-label="Cambiar de cuenta"
                  title="Cambiar de cuenta"
                  className="mt-1 inline-flex items-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <IconoLapiz className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/*barra de confirmacion de la foto nueva (se guarda aca, no en un boton general)*/}
          {fotoNueva && (
            <div ref={fotoEditRef} className="border-t border-zinc-800 px-6 py-3 flex items-center justify-between gap-3">
              <p className="text-xs text-zinc-400">Foto nueva lista para guardar</p>
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={cancelarFoto}
                  className="shrink-0 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm border border-zinc-700 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={guardarFoto}
                  disabled={enviandoFoto}
                  className="shrink-0 px-4 py-2 rounded-xl bg-verde-app hover:bg-verde-app/90 text-black text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  {enviandoFoto ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          )}

          {/*opciones del perfil: una fila por dato (nombre editable, email fijo)*/}
          <div className="border-t border-zinc-800 divide-y divide-zinc-800">
            <div className="px-6 py-4">
              <p className="text-xs text-zinc-500 mb-1 uppercase tracking-wide">Nombre de usuario</p>
              {editandoNombre ? (
                <form ref={nombreEditRef} onSubmit={guardarNombre} className="flex gap-2">
                  <input
                    type="text"
                    autoFocus
                    maxLength={30}
                    value={formNombre}
                    onChange={(e) => setFormNombre(e.target.value)}
                    aria-label="Nombre de usuario"
                    className={claseInput}
                  />
                  <button
                    type="submit"
                    disabled={enviandoNombre || !formNombre.trim()}
                    className="shrink-0 px-4 py-2 rounded-xl bg-verde-app hover:bg-verde-app/90 text-black text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    {enviandoNombre ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditandoNombre(false);
                      setError('');
                    }}
                    className="shrink-0 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm border border-zinc-700 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={empezarEditarNombre}
                  className="w-full flex items-center justify-between gap-3 text-left cursor-pointer group"
                >
                  <span className="font-medium text-zinc-100 truncate">{sesion.nombre}</span>
                  <span className="inline-flex items-center gap-1.5 text-sm text-zinc-400 group-hover:text-white transition-colors shrink-0">
                    <IconoLapiz className="w-4 h-4" />
                    Editar
                  </span>
                </button>
              )}
              <p className="text-xs text-zinc-500 mt-1">Así te ven los demás en los comentarios.</p>
            </div>

            <div className="px-6 py-4">
              <p className="text-xs text-zinc-500 mb-1 uppercase tracking-wide">Email</p>
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium text-zinc-100 truncate">{sesion.email}</span>
                <span className="text-xs text-zinc-500 shrink-0">Lo usás para entrar</span>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-zinc-800 space-y-3">
              <p className="text-sm text-zinc-500 text-center">
                Entrá a los proyectos y comentá los que más te gusten.
              </p>
              {error && <p role="alert" className="text-red-400 text-sm text-center">{error}</p>}
              {esDueno && (
                <a
                  href="/admin"
                  className="block w-full px-5 py-2.5 rounded-full bg-verde-app hover:bg-verde-app/90 text-black text-sm font-medium text-center transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  Gestionar mis proyectos
                </a>
              )}
              <button
                type="button"
                onClick={() => {
                  setVentana('cambiar');
                  setError('');
                }}
                className="w-full flex items-center justify-between gap-3 px-5 py-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span className="inline-flex items-center gap-2">
                  <svg aria-hidden="true" className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Agregar otra cuenta
                </span>
                <svg aria-hidden="true" className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={cerrarSesion}
                className="w-full px-5 py-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-sm transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
              >
                Cerrar sesión
              </button>
            </div>
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
          {renderAcceso(false)}
        </div>
      )}

      {/*dialogo para cambiar o agregar cuentas (como en ig)*/}
      {ventana && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => { setVentana(''); setError(''); }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={ventana === 'cambiar' ? 'Tus cuentas' : 'Agregar cuenta'}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm max-h-[85vh] overflow-y-auto rounded-2xl bg-zinc-900 border border-zinc-700 p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-white">
                {ventana === 'cambiar' ? 'Tus cuentas' : 'Agregar cuenta'}
              </h2>
              <button
                type="button"
                onClick={() => { setVentana(''); setError(''); }}
                aria-label="Cerrar"
                className="text-zinc-500 hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {ventana === 'cambiar' ? (
              <>
                <ul className="divide-y divide-zinc-800">
                  {/*cuenta actual, arriba y marcada (como el selector de gmail)*/}
                  <li className="flex items-center gap-3 py-3">
                    <span className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700">
                      {sesion.foto ? (
                        <img src={sesion.foto} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-verde-app font-bold">{sesion.nombre?.charAt(0).toUpperCase() ?? '?'}</span>
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium text-zinc-100 truncate">{sesion.nombre}</span>
                      <span className="block text-xs text-zinc-500 truncate">{sesion.email}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-verde-app shrink-0">
                      <svg aria-hidden="true" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                      Sesión actual
                    </span>
                  </li>
                  {cuentas.filter((c) => c.email !== sesion.email).map((cuenta) => (
                    <li key={cuenta.email} className="flex items-center gap-3 py-3">
                      <button
                        type="button"
                        onClick={() => cambiarCuentaActiva(cuenta)}
                        className="flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer group"
                      >
                        <span className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700">
                          {cuenta.foto ? (
                            <img src={cuenta.foto} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-verde-app font-bold">{cuenta.nombre?.charAt(0).toUpperCase() ?? '?'}</span>
                          )}
                        </span>
                        <span className="min-w-0">
                          <span className="block font-medium text-zinc-100 truncate">{cuenta.nombre}</span>
                          <span className="block text-xs text-zinc-500 truncate">{cuenta.email}</span>
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => olvidarCuentaGuardada(cuenta.email)}
                        aria-label={`Olvidar cuenta de ${cuenta.email}`}
                        title="Olvidar cuenta"
                        className="text-zinc-500 hover:text-red-400 transition-colors cursor-pointer shrink-0"
                      >
                        <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" viewBox="0 0 24 24">
                          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => {
                    setVentana('agregar');
                    setModo('login');
                    setForm({ nombre: '', email: '', clave: '' });
                    setError('');
                  }}
                  className="w-full px-5 py-2.5 rounded-full bg-violeta-app hover:bg-violeta-app/90 text-black text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                >
                  Agregar cuenta
                </button>
              </>
            ) : (
              <div className="space-y-5">{renderAcceso(true)}</div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}