//chat del visitante: muestra su conversacion con la admin y permite seguir mandando mensajes
//el header va estilo chat de red social: el nombre de agustina arriba con la flecha de volver al lado
import { useEffect, useState } from 'react';
import { enviarMensaje, obtenerMensajesPublicos } from '../api/mensajes.js';
import Loading from './Loading.jsx';

export default function ChatVisitante({ email, token, nombre, whatsapp, onVolver, nombreAdmin = 'Agustina Ferraro' }) {
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
    <div className="p-6 rounded-2xl bg-black/60 border border-zinc-800 space-y-4">
      {/*header tipo redes: flecha de volver al lado del nombre de agustina*/}
      <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
        <button
          type="button"
          onClick={onVolver}
          aria-label="Volver"
          title="Volver"
          className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-zinc-900/70 border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-violeta-app/20 border border-violeta-app/30 text-violeta-app font-bold text-lg">
            {nombreAdmin.charAt(0).toUpperCase()}
          </span>
          <div className="leading-tight">
            <p className="font-bold text-zinc-100">{nombreAdmin}</p>
            <p className="text-xs text-emerald-400 flex items-center gap-1">
              <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              En línea
            </p>
          </div>
        </div>
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
          className="px-4 py-2 rounded-xl bg-violeta-app hover:bg-violeta-app/90 text-black text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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