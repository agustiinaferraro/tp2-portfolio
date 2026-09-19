//capa de datos: client base para llamar a la api del backend
//el frontend consulta la api desde aca, no desde los componentes

//url base del backend. se configura con public_api_url o usa localhost en desarrollo
const API_BASE = import.meta.env.PUBLIC_API_URL ?? 'http://localhost:4000';

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
    throw new Error(`Error al enviar a ${ruta}: ${respuesta.status}`);
  }
  return respuesta.json();
}