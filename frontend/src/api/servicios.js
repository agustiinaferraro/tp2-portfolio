//capa de datos: funciones para consultar los servicios
import { peticionGET } from './client.js';

//devuelve la lista de servicios cargados en la base de datos
export function obtenerServicios() {
  return peticionGET('/api/servicios');
}

//devuelve un solo servicio segun su slug (ej. diseno-ux-ui)
export function obtenerServicioPorSlug(slug) {
  return peticionGET(`/api/servicios/${slug}`);
}