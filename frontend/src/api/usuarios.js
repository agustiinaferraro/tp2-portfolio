//capa de datos para los usuarios del portfolio
//hace el registro y el login contra la api y guarda la sesion en el navegador
import { peticionPOST } from './client.js';

//crea la cuenta: nombre, email y contraseña. devuelve usuario y token
export function registrarUsuario(datos) {
  return peticionPOST('/api/usuarios/registro', datos);
}

//entra con email y contraseña. devuelve usuario y token
export function iniciarSesion(datos) {
  return peticionPOST('/api/usuarios/login', datos);
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