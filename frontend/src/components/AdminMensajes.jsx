//seccion del panel admin para ver los mensajes que llegan del formulario de contacto
//depende de una sesion ya iniciada (el componente principal le pasa la clave)
import { useCallback, useEffect, useState } from 'react';
import { obtenerMensajes, borrarMensaje } from '../api/mensajes.js';

//convierte la fecha de la base a un texto corto y legible (ej: 19/09/2026)
function formatearFecha(fechaISO) {
  const fecha = new Date(fechaISO);
  if (Number.isNaN(fecha.getTime())) return '';
  return fecha.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function AdminMensajes({ clave }) {
  const [mensajes, setMensajes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(() => {
    setCargando(true);
    setError(null);
    obtenerMensajes(clave)
      .then(setMensajes)
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, [clave]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function borrar(mensaje) {
    if (!window.confirm(`¿Borrar el mensaje de ${mensaje.nombre}?`)) return;
    setError(null);
    try {
      await borrarMensaje(mensaje._id, clave);
      setMensajes((actuales) => actuales.filter((m) => m._id !== mensaje._id));
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <section aria-label="Mensajes recibidos" className="border-t border-zinc-800 pt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Mensajes de contacto</h2>
        <button
          type="button"
          onClick={cargar}
          className="text-sm text-zinc-400 hover:text-white transition-colors"
        >
          Refrescar
        </button>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-400 mb-3">
          {error}
        </p>
      )}

      {cargando ? (
        <p className="text-zinc-400">Cargando...</p>
      ) : mensajes.length === 0 ? (
        <p className="text-zinc-400">Todavía no recibiste ningún mensaje.</p>
      ) : (
        <ul className="space-y-3">
          {mensajes.map((mensaje) => (
            <li key={mensaje._id} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-white">{mensaje.nombre}</p>
                  <a
                    href={`mailto:${mensaje.email}`}
                    className="text-sm text-verde-app hover:text-verde-app/80 transition-colors break-all"
                  >
                    {mensaje.email}
                  </a>
                </div>
                <div className="flex gap-4 shrink-0 items-center">
                  <span className="text-xs text-zinc-500">{formatearFecha(mensaje.createdAt)}</span>
                  <button
                    type="button"
                    onClick={() => borrar(mensaje)}
                    className="text-sm text-red-400 hover:text-red-300 transition-colors"
                  >
                    Borrar
                  </button>
                </div>
              </div>
              <p className="text-zinc-300 text-sm mt-3 leading-relaxed">{mensaje.mensaje}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}