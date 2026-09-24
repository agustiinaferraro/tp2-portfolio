//chat del visitante: muestra su conversacion con la admin y permite seguir mandando mensajes
//esta mostrando el lado del visitante: sus mensajes a la izquierda y las respuestas de agustina a la derecha
import { useEffect, useState } from 'react';
import { enviarMensaje, obtenerMensajesPublicos } from '../api/mensajes.js';
import Loading from './Loading.jsx';

export default function ChatVisitante({ email, token, nombre, whatsapp, onVolver }) {
  const [mensajes, setMensajes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);

  //al abrir se trae la conversacion completa (lo que mando y lo que le respondieron)
  useEffect(() => {
    let activo = true;
    obtenerMensajesPublicos(email, token)
      .then((lista) => {
        if (activo) setMensajes(lista);
      })
      .catch((err) => {
        if (activo) setError(err.message);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => {
      activo = false;
    };
  }, [email, token]);

  //manda un mensaje nuevo y lo agrega al final de la conversacion
  async function manejarEnvio(e) {
    e.preventDefault();
    if (enviando || !texto.trim()) return;

    setEnviando(true);
    setError('');
    try {
      const respuesta = await enviarMensaje({ nombre, email, mensaje: texto.trim() });
      const nuevo = respuesta?.datos;
      if (nuevo) setMensajes((prev) => [...prev, nuevo]);
      setTexto('');
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  let contenido;
  if (cargando) {
    contenido = <Loading claseContenedor="h-48" />;
  } else if (error && mensajes.length === 0) {
    contenido = (
      <div className="py-12 text-center space-y-3">
        <p className="text-zinc-400 text-sm">No se pudo cargar la conversación.</p>
        <button type="button" onClick={() => window.location.reload()} className="text-violeta-app text-sm underline">Reintentar</button>
      </div>
    );
  } else {
    contenido = (
      <ul className="space-y-3 overflow-y-auto max-h-72 pr-1">
        {mensajes.map((m) => {
          const esDeAgustina = m.esRespuesta === true;
          return (
            <li key={m._id} className={`flex flex-col ${esDeAgustina ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm ${
                  esDeAgustina
                    ? 'bg-violeta-app/20 border border-violeta-app/30 text-violeta-app text-right'
                    : 'bg-zinc-800 border border-zinc-700 text-zinc-200'
                }`}
              >
                <p className="m-0 whitespace-pre-wrap break-words">{m.mensaje}</p>
              </div>
              <span className={`text-[11px] text-zinc-500 mt-1 ${esDeAgustina ? 'text-right' : ''}`}>
                {esDeAgustina ? m.nombre || 'Agustina' : nombre}
              </span>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="font-bold text-zinc-100">Tu chat con Agustina</p>
        <button
          type="button"
          onClick={onVolver}
          className="text-sm text-violeta-app hover:text-violeta-app/80 underline transition-colors"
        >
          Volver
        </button>
      </div>

      {contenido}

      {error && mensajes.length > 0 && (
        <p role="alert" className="text-red-400 text-sm">{error}</p>
      )}

      <form onSubmit={manejarEnvio} className="flex items-end gap-2">
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escribí tu mensaje..."
          aria-label="Escribí tu mensaje"
          className="flex-1 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-violeta-app"
        />
        <button
          type="submit"
          disabled={enviando || !texto.trim()}
          className="px-4 py-2 rounded-xl bg-violeta-app hover:bg-violeta-app/90 text-[#1c1c21] text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Enviar
        </button>
      </form>

      {whatsapp && (
        <a
          href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Hola! Soy ${nombre}. Quiero seguir hablando sobre mi proyecto.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center text-sm text-emerald-300 underline hover:text-emerald-200 transition-colors"
        >
          Preferís WhatsApp? Continuar la charla por ahí
        </a>
      )}
    </div>
  );
}