//seccion del panel admin para ver los mensajes del formulario de contacto como chats
//primero se muestra la lista de conversaciones (una por persona), como en instagram:
//nombre, cantidad y el ultimo mensaje. al tocar una se abre el hilo completo
//depende de una sesion ya iniciada (el componente principal le pasa la clave)
import { useCallback, useEffect, useState } from 'react';
import { obtenerConversaciones, borrarMensaje } from '../api/mensajes.js';

//convierte la fecha de la base a un texto corto y legible (ej: 19/09/2026)
function formatearFecha(fechaISO) {
  const fecha = new Date(fechaISO);
  if (Number.isNaN(fecha.getTime())) return '';
  return fecha.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

//para la lista de chats: "Hoy", "Ayer" o la fecha corta segun corresponda
function formatearChat(fechaISO) {
  const fecha = new Date(fechaISO);
  if (Number.isNaN(fecha.getTime())) return '';
  const hoy = new Date();
  const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const inicioMensaje = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
  const dias = Math.round((inicioHoy - inicioMensaje) / 86400000);
  if (dias <= 0) return 'Hoy';
  if (dias === 1) return 'Ayer';
  if (dias < 7) return fecha.toLocaleDateString('es-AR', { weekday: 'short' });
  return formatearFecha(fechaISO);
}

//fecha y hora para un mensaje dentro del hilo (ej: 19/09/2026 14:32)
function formatearHora(fechaISO) {
  const fecha = new Date(fechaISO);
  if (Number.isNaN(fecha.getTime())) return '';
  return fecha.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

//avatar circular con la inicial de la persona (como las fotos de los chats)
function AvatarInicial({ nombre, className }) {
  const saludo = nombre || 'Contacto';
  const inicial = saludo.trim()[0]?.toUpperCase() ?? '?';
  return (
    <span
      aria-hidden="true"
      className={`inline-flex items-center justify-center rounded-full bg-violeta-app text-[#1c1c21] font-bold ${className}`}
    >
      {inicial}
    </span>
  );
}

//icono de flecha para volver de un chat a la lista
function FlechaAtras({ className }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  );
}

export default function AdminMensajes({ clave, alCambiar }) {
  const [conversaciones, setConversaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  //chat abierto: la conversacion completa que se esta viendo (null = lista)
  const [chat, setChat] = useState(null);

  const cargar = useCallback(() => {
    setCargando(true);
    setError(null);
    obtenerConversaciones(clave)
      .then(setConversaciones)
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, [clave]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  function abrirChat(conversacion) {
    setChat(conversacion);
    setError(null);
  }

  function volverAlista() {
    setChat(null);
    if (alCambiar) alCambiar();
  }

  async function borrarUnMensaje(mensaje) {
    if (!window.confirm(`¿Borrar el mensaje de ${chat.nombre}?`)) return;
    setError(null);
    try {
      await borrarMensaje(mensaje._id, clave);
      const nuevos = chat.mensajes.filter((m) => m._id !== mensaje._id);
      if (nuevos.length === 0) {
        //si no queda ninguno, se cierra el chat y se recarga la lista
        setChat(null);
        cargar();
        if (alCambiar) alCambiar();
      } else {
        setChat({ ...chat, cantidad: nuevos.length, mensajes: nuevos });
      }
    } catch (e) {
      setError(e.message);
    }
  }

  //hilo con los mensajes de una persona
  if (chat) {
    return (
      <section aria-label={`Chat con ${chat.nombre}`} className="space-y-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={volverAlista}
            aria-label="Volver a la lista de chats"
            className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-zinc-700 text-zinc-300 hover:text-white hover:border-verde-app hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <FlechaAtras className="w-4 h-4" />
          </button>
          <AvatarInicial nombre={chat.nombre} className="w-11 h-11 text-lg" />
          <div className="min-w-0">
            <p className="font-medium text-white truncate">{chat.nombre}</p>
            <a
              href={`mailto:${chat.email}`}
              className="text-sm text-verde-app hover:text-verde-app/80 transition-colors break-all"
            >
              {chat.email}
            </a>
          </div>
          <span className="ml-auto shrink-0 text-xs px-2 py-1 rounded-full bg-verde-app/10 text-verde-app border border-verde-app/20">
            {chat.cantidad} mensaje{chat.cantidad === 1 ? '' : 's'}
          </span>
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-400">
            {error}
          </p>
        )}

        <ul className="space-y-3">
          {chat.mensajes.map((mensaje) => (
            <li key={mensaje._id} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
              <div className="flex items-start justify-between gap-4">
                <span className="text-xs text-zinc-500">{formatearHora(mensaje.createdAt)}</span>
                <button
                  type="button"
                  onClick={() => borrarUnMensaje(mensaje)}
                  className="text-sm text-red-400 hover:text-red-300 transition-colors"
                >
                  Borrar
                </button>
              </div>
              <p className="text-zinc-300 text-sm mt-1 leading-relaxed whitespace-pre-line">{mensaje.mensaje}</p>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  //lista de conversaciones (como la bandeja de un chat)
  return (
    <section aria-label="Mensajes recibidos" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">
          Mensajes{' '}
          {conversaciones.length > 0 && (
            <span className="ml-1 text-sm font-normal text-zinc-500">({conversaciones.length})</span>
          )}
        </h2>
        <button type="button" onClick={cargar} className="text-sm text-zinc-400 hover:text-white transition-colors">
          Refrescar
        </button>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}

      {cargando ? (
        <p className="text-zinc-400">Cargando...</p>
      ) : conversaciones.length === 0 ? (
        <div className="p-10 rounded-2xl bg-zinc-900 border border-zinc-800 text-center">
          <p className="text-zinc-400">Todavía no recibiste ningún mensaje.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {conversaciones.map((conversacion) => (
            <li key={conversacion._id}>
              <button
                type="button"
                onClick={() => abrirChat(conversacion)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-verde-app/50 hover:scale-[1.01] active:scale-100 transition-all cursor-pointer text-left"
              >
                <AvatarInicial nombre={conversacion.nombre} className="w-11 h-11 text-lg shrink-0" />
                <span className="flex-1 min-w-0">
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="font-medium text-white truncate">{conversacion.nombre}</span>
                    <span className="text-xs text-zinc-500 shrink-0">{formatearChat(conversacion.ultimaFecha)}</span>
                  </span>
                  <span className="flex items-center justify-between gap-3">
                    <span className="text-sm text-zinc-400 truncate">{conversacion.mensajes[0]?.mensaje}</span>
                    <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-violeta-app text-[#1c1c21] font-medium">
                      {conversacion.cantidad}
                    </span>
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}