// Capa de datos: funciones para consultar los servicios
import { peticionGET } from './client.js';

// Devuelve la lista de servicios cargados en la base de datos
export function obtenerServicios() {
  return peticionGET('/api/servicios');
}

// Devuelve un solo servicio según su slug (ej. diseno-ux-ui)
export function obtenerServicioPorSlug(slug) {
  return peticionGET(`/api/servicios/${slug}`);
}