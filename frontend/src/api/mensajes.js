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

//devuelve la conversacion publica del visitante (sus mensajes y las respuestas del admin)
//usa el token secreto que se genero al enviar el primer mensaje
export function obtenerMensajesPublicos(email, token) {
  return peticionGET(
    `/api/mensajes/publico/${encodeURIComponent(email)}?token=${encodeURIComponent(token)}`
  );
}

//devuelve los mensajes agrupados por persona (como chats, solo admin)
export function obtenerConversaciones(clave) {
  return peticionAdmin('GET', '/api/mensajes/conversaciones', undefined, clave);
}

//guarda una respuesta del dueño del portfolio dentro del chat de una persona (solo admin)
//email es el id de la conversacion (el email en minusculas de esa persona)
export function responderConversacion(email, respuesta, nombre, clave) {
  return peticionAdmin(
    'POST',
    `/api/mensajes/conversaciones/${encodeURIComponent(email)}/respuesta`,
    { respuesta, nombre },
    clave
  );
}

//borra un mensaje (solo admin)
export function borrarMensaje(id, clave) {
  return peticionAdmin('DELETE', `/api/mensajes/${id}`, undefined, clave);
}