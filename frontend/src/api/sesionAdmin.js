//sesion de administrador en sessionstorage
//se guarda al iniciar sesion en cualquier lugar del sitio y se comparte entre paginas
//se borra al cerrar la sesion (y sola al cerrar la pestana)
const LLAVE = 'admin_sesion';

//devuelve { usuario, clave } si hay sesion activa, o null
export function leerSesion() {
  try {
    const datos = sessionStorage.getItem(LLAVE);
    return datos ? JSON.parse(datos) : null;
  } catch {
    return null;
  }
}

//guarda la sesion activa
export function guardarSesion(usuario, clave) {
  sessionStorage.setItem(LLAVE, JSON.stringify({ usuario, clave }));
}

//borra la sesion activa
export function borrarSesion() {
  sessionStorage.removeItem(LLAVE);
}