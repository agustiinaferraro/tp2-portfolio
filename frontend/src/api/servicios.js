// Capa de datos: funciones para consultar los servicios
import { peticionGET } from './client.js';

// Devuelve la lista de servicios cargados en la base de datos
export function obtenerServicios() {
  return peticionGET('/api/servicios');
}