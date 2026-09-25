//capa de datos para los usuarios del portfolio
//las cuentas viven en firebase authentication; la sesion se guarda en el navegador
//la misma sesion se usa para comentar en los proyectos (el backend valida el token)
import {
  crearCuentaFirebase,
  entrarConEmailFirebase,
  entrarConGoogleFirebase,
  traducirErrorFirebase,
  firebaseConfigurado,
} from './firebase.js';
import { peticionGET } from './client.js';

//true cuando la plataforma de cuentas esta configurada (variables public_firebase_*)
export const cuentaConfigurada = firebaseConfigurado;

//email de la cuenta de firebase de la dueña del sitio (para ofrecer el panel en "mi cuenta")
export async function obtenerEmailDueno() {
  const datos = await peticionGET('/api/admin/dueno');
  return datos.email;
}

//crea la cuenta en firebase: nombre, email y contraseña. devuelve usuario y token
export async function registrarUsuario(datos) {
  try {
    const sesion = await crearCuentaFirebase(datos);
    return { token: sesion.token, usuario: { nombre: sesion.nombre, email: sesion.email } };
  } catch (error) {
    throw new Error(traducirErrorFirebase(error));
  }
}

//entra con email y contraseña. devuelve usuario y token
export async function iniciarSesion(datos) {
  try {
    const sesion = await entrarConEmailFirebase(datos);
    return { token: sesion.token, usuario: { nombre: sesion.nombre, email: sesion.email } };
  } catch (error) {
    throw new Error(traducirErrorFirebase(error));
  }
}

//entra con una cuenta de google. devuelve usuario y token
export async function entrarConGoogle() {
  try {
    const sesion = await entrarConGoogleFirebase();
    return { token: sesion.token, usuario: { nombre: sesion.nombre, email: sesion.email } };
  } catch (error) {
    throw new Error(traducirErrorFirebase(error));
  }
}

//sesion del usuario que comenta: se guarda en el localstorage del navegador
const CLAVE_SESION = 'sesion-usuario';

export function leerSesion() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_SESION) ?? 'null');
  } catch {
    return null;
  }
}

export function guardarSesion(sesion) {
  try {
    localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
  } catch {}
}

export function borrarSesion() {
  try {
    localStorage.removeItem(CLAVE_SESION);
  } catch {}
}