// Capa de datos: client base para llamar a la API del backend
// El frontend consulta la API desde acá, no desde los componentes

// URL base del backend. Se configura con PUBLIC_API_URL o usa localhost en desarrollo
const API_BASE = import.meta.env.PUBLIC_API_URL ?? 'http://localhost:4000';

// Función genérica que hace una petición a la API y devuelve los datos en JSON
// Si la respuesta no es correcta, lanza un error explicando qué pasó
export async function peticionGET(ruta) {
  const respuesta = await fetch(`${API_BASE}${ruta}`);
  if (!respuesta.ok) {
    throw new Error(`Error al consultar ${ruta}: ${respuesta.status}`);
  }
  return respuesta.json();
}