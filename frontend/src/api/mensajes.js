// Capa de datos: funciones para los mensajes de contacto
import { peticionPOST } from './client.js';

// Envía un mensaje del formulario al backend
// datos = { nombre, email, mensaje }
export function enviarMensaje(datos) {
  return peticionPOST('/api/mensajes', datos);
}