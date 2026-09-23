//capa de datos: funciones para los mensajes de contacto
import { peticionGET, peticionPOST, peticionAdmin } from './client.js';

//envia un mensaje del formulario al backend
//datos = { nombre, email, mensaje }
export function enviarMensaje(datos) {
  return peticionPOST('/api/mensajes', datos);
}

//devuelve todos los mensajes recibidos (solo admin)
export function obtenerMensajes(clave) {
  return peticionAdmin('GET', '/api/mensajes', undefined, clave);
}

//devuelve los mensajes agrupados por persona (como chats, solo admin)
export function obtenerConversaciones(clave) {
  return peticionAdmin('GET', '/api/mensajes/conversaciones', undefined, clave);
}

//borra un mensaje (solo admin)
export function borrarMensaje(id, clave) {
  return peticionAdmin('DELETE', `/api/mensajes/${id}`, undefined, clave);
}