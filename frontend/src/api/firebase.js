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
    nombre: usuarioFirebase.displayName || usuarioFirebase.email || 'Visitante',
    email: usuarioFirebase.email,
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