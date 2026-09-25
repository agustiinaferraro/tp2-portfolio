//capa de datos: client base para llamar a la api del backend
//el frontend consulta la api desde aca, no desde los componentes

//url base del backend. se configura con public_api_url o usa localhost en desarrollo
export const API_BASE = import.meta.env.PUBLIC_API_URL ?? 'http://localhost:4000';

//funcion generica que hace una peticion a la api y devuelve los datos en json
//si la respuesta no es correcta, lanza un error explicando que paso
export async function peticionGET(ruta) {
  const respuesta = await fetch(`${API_BASE}${ruta}`);
  if (!respuesta.ok) {
    throw new Error(`Error al consultar ${ruta}: ${respuesta.status}`);
  }
  return respuesta.json();
}

//funcion generica para enviar datos a la api (post)
//convierte el objeto a json y lo manda en el body de la peticion
export async function peticionPOST(ruta, datos) {
  const respuesta = await fetch(`${API_BASE}${ruta}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  });
  if (!respuesta.ok) {
    //se aprovecha el mensaje del servidor (y datos extra como que campo fallo)
    const cuerpo = await respuesta.json().catch(() => null);
    const error = new Error(cuerpo?.mensaje ?? `Error al enviar a ${ruta}: ${respuesta.status}`);
    error.campos = cuerpo;
    throw error;
  }
  return respuesta.json();
}

//funcion generica para enviar datos a la api como usuario logueado (post)
//manda el token de sesion en el header authorization para que el backend valide
export async function peticionConToken(ruta, datos, token) {
  const respuesta = await fetch(`${API_BASE}${ruta}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(datos),
  });
  if (!respuesta.ok) {
    const cuerpo = await respuesta.json().catch(() => null);
    const error = new Error(cuerpo?.mensaje ?? `Error al enviar a ${ruta}: ${respuesta.status}`);
    error.campos = cuerpo;
    throw error;
  }
  return respuesta.json();
}

//funcion generica para modificar datos del panel de admin (post, put o delete)
//manda la clave de administrador en el header x-admin-clave para que el backend valide
export async function peticionAdmin(metodo, ruta, datos, clave) {
  const respuesta = await fetch(`${API_BASE}${ruta}`, {
    method: metodo,
    headers: {
      'Content-Type': 'application/json',
      'x-admin-clave': clave,
    },
    body: datos ? JSON.stringify(datos) : undefined,
  });
  if (!respuesta.ok) {
    throw new Error(`Error en ${metodo} ${ruta}: ${respuesta.status}`);
  }
  return respuesta.json();
}