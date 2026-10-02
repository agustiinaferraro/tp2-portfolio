//capa de firebase para los usuarios del portfolio
//las cuentas se crean y se administran en firebase authentication (plataforma integrada)
//con email/clave o con una cuenta de google se obtiene un token que valida despues el backend
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  getAuth,
  onIdTokenChanged,
} from 'firebase/auth';

//configuracion publica del proyecto de firebase
//se define como variables public_firebase_* (en vercel o en el .env local)
const config = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID,
};

//si falta la configuracion el sitio sigue andando, solo no se pueden crear cuentas
export const firebaseConfigurado = Boolean(
  config.apiKey && config.authDomain && config.projectId && config.appId
);

//devuelve la app de firebase ya inicializada (o inicializa la primera vez)
function obtenerAuth() {
  if (!firebaseConfigurado) {
    throw new Error('El acceso con cuentas todavía no está configurado por la dueña del sitio.');
  }
  if (!getApps().length) initializeApp(config);
  return getAuth(getApp());
}

//arma el perfil de sesion con el token firmado por firebase
async function sesionDesdeUsuario(usuarioFirebase) {
  const token = await usuarioFirebase.getIdToken();
  return {
    token,
    //nombre elegido por el usuario; si no hay, se usa el de antes de la arroba del correo
    nombre:
      usuarioFirebase.displayName ||
      (usuarioFirebase.email ? usuarioFirebase.email.split('@')[0] : 'Visitante'),
    email: usuarioFirebase.email,
    //la foto puede venir de la cuenta de google o elegirse despues desde "mi cuenta"
    foto: usuarioFirebase.photoURL || '',
  };
}

//crea la cuenta con email y contraseña en firebase
export async function crearCuentaFirebase({ nombre, email, clave }) {
  const credenciales = await createUserWithEmailAndPassword(obtenerAuth(), email, clave);
  if (nombre) {
    await updateProfile(credenciales.user, { displayName: String(nombre).trim() });
  }
  return sesionDesdeUsuario(credenciales.user);
}

//entra con email y contraseña a firebase
export async function entrarConEmailFirebase({ email, clave }) {
  const credenciales = await signInWithEmailAndPassword(obtenerAuth(), email, clave);
  return sesionDesdeUsuario(credenciales.user);
}

//entra con una cuenta de google (firebase muestra el selector de cuentas)
export async function entrarConGoogleFirebase() {
  const credenciales = await signInWithPopup(obtenerAuth(), new GoogleAuthProvider());
  return sesionDesdeUsuario(credenciales.user);
}

//cambia el nombre de usuario (displayName) en firebase y devuelve la sesion actualizada
//se pide un token fresco para que el backend lea el nombre nuevo en los comentarios
export async function actualizarNombreFirebase(nombre) {
  const auth = obtenerAuth();
  const usuario = auth.currentUser;
  if (!usuario) {
    throw new Error('No hay una sesión activa.');
  }
  await updateProfile(usuario, { displayName: String(nombre).trim() });
  const token = await usuario.getIdToken(true);
  return {
    token,
    nombre:
      usuario.displayName ||
      (usuario.email ? usuario.email.split('@')[0] : 'Visitante'),
    email: usuario.email,
    foto: usuario.photoURL || '',
  };
}

//el token de firebase dura una hora: si el navegador quedo mucho tiempo abierto (o la sesion es vieja),
//el guardado en el localstorage ya vencio y la api responde 401
//esta funcion devuelve el token siempre fresco (o null si no hay sesion de firebase)
export function tokenActual() {
  return new Promise((resolver) => {
    if (!firebaseConfigurado) return resolver(null);
    try {
      const auth = obtenerAuth();
      //espera a que firebase termine de leer la sesion guardada en el navegador
      const desuscribir = onIdTokenChanged(auth, (usuario) => {
        desuscribir();
        if (!usuario) return resolver(null);
        usuario.getIdToken().then(resolver).catch(() => resolver(null));
      });
      //si no responde rapido, se corta para no dejar la interfaz esperando
      setTimeout(() => {
        desuscribir();
        resolver(auth.currentUser ? auth.currentUser.getIdToken().catch(() => null) : null);
      }, 3000);
    } catch {
      resolver(null);
    }
  });
}

//traduce los errores de firebase a mensajes claros para el usuario
export function traducirErrorFirebase(error) {
  const mensajes = {
    'auth/email-already-in-use': 'Ya existe una cuenta con ese email. Probá entrar directamente.',
    'auth/invalid-email': 'Ingresá un email válido.',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
    'auth/user-not-found': 'Esta cuenta no pertenece a ningún usuario registrado.',
    'auth/wrong-password': 'Email o contraseña incorrectos.',
    'auth/invalid-credential': 'Email o contraseña incorrectos.',
    'auth/too-many-requests': 'Demasiados intentos. Probá de nuevo en unos minutos.',
    'auth/popup-closed-by-user': 'Cancelaste el acceso con Google.',
    'auth/cancelled-popup-request': 'Cancelaste el acceso con Google.',
    'auth/network-request-failed': 'No hay conexión. Probá de nuevo.',
    'auth/user-disabled': 'Esta cuenta fue deshabilitada.',
  };
  return (
    mensajes[error?.code] ??
    error?.message ??
    'No se pudo completar la operación. Probá de nuevo.'
  );
}