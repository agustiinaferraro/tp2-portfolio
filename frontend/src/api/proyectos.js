// Capa de datos: funciones para consultar los proyectos
import { peticionGET } from './client.js';

// Devuelve todos los proyectos
export function obtenerProyectos() {
  return peticionGET('/api/proyectos');
}

// Devuelve solo los proyectos destacados
export function obtenerProyectosDestacados() {
  return peticionGET('/api/proyectos?destacados=true');
}