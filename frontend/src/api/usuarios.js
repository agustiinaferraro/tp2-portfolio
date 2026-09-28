//capa de datos para los usuarios del portfolio
//las cuentas viven en firebase authentication; la sesion se guarda en el navegador
//la misma sesion se usa para comentar en los proyectos (el backend valida el token)
import {
  crearCuentaFirebase,
  entrarConEmailFirebase,
  entrarConGoogleFirebase,
  actualizarNombreFirebase,
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
    return {
      token: sesion.token,
      usuario: { nombre: sesion.nombre, email: sesion.email, foto: sesion.foto },
    };
  } catch (error) {
    throw new Error(traducirErrorFirebase(error));
  }
}

//entra con email y contraseña. devuelve usuario y token
export async function iniciarSesion(datos) {
  try {
    const sesion = await entrarConEmailFirebase(datos);
    return {
      token: sesion.token,
      usuario: { nombre: sesion.nombre, email: sesion.email, foto: sesion.foto },
    };
  } catch (error) {
    throw new Error(traducirErrorFirebase(error));
  }
}

//entra con una cuenta de google. devuelve usuario y token
export async function entrarConGoogle() {
  try {
    const sesion = await entrarConGoogleFirebase();
    return {
      token: sesion.token,
      usuario: { nombre: sesion.nombre, email: sesion.email, foto: sesion.foto },
    };
  } catch (error) {
    throw new Error(traducirErrorFirebase(error));
  }
}

//sesion del usuario que comenta: se guarda en el localstorage del navegador
const CLAVE_SESION = 'sesion-usuario';
//lista de cuentas guardadas en el navegador (para cambiar de cuenta como en ig)
const CLAVE_CUENTAS = 'cuentas-usuario';

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

//guarda una nueva foto de perfil en la sesion (se elige desde "mi cuenta")
//devuelve la sesion actualizada para refrescar la pantalla
export function actualizarFoto(foto) {
  const sesion = leerSesion();
  const nueva = { ...(sesion ?? { nombre: '', email: '', token: '' }), foto };
  guardarSesion(nueva);
  return nueva;
}

//cambia el nombre de usuario en firebase y refresca la sesion guardada
//conserva la foto local (la de google o la que subio la persona)
export async function actualizarNombre(nombre) {
  const sesion = await actualizarNombreFirebase(nombre);
  const previa = leerSesion() ?? {};
  const nueva = {
    ...previa,
    token: sesion.token,
    nombre: sesion.nombre,
    email: sesion.email,
    foto: previa.foto ?? sesion.foto ?? '',
  };
  guardarSesion(nueva);
  return nueva;
}

//devuelve las cuentas guardadas en el navegador (varias cuentas como en ig)
export function listarCuentas() {
  try {
    const lista = JSON.parse(localStorage.getItem(CLAVE_CUENTAS) ?? '[]');
    return Array.isArray(lista) ? lista : [];
  } catch {
    return [];
  }
}

//guarda (o actualiza) una cuenta en la lista de cuentas del navegador
export function guardarCuenta(cuenta) {
  const lista = listarCuentas().filter((c) => c.email !== cuenta.email);
  lista.push(cuenta);
  try {
    localStorage.setItem(CLAVE_CUENTAS, JSON.stringify(lista));
  } catch {
    //si se llena el espacio (por fotos pesadas) se conserva la cuenta activa sola
  }
  return lista;
}

//olvida una cuenta guardada (no borra la cuenta de firebase)
export function olvidarCuenta(email) {
  const lista = listarCuentas().filter((c) => c.email !== email);
  try {
    localStorage.setItem(CLAVE_CUENTAS, JSON.stringify(lista));
  } catch {}
  return lista;
}