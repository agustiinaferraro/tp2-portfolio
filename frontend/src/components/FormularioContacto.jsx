// Formulario de contacto
// Muestra los estados: formulario → enviando → éxito / error
import { useState } from 'react';
import { enviarMensaje } from '../api/mensajes.js';

export default function FormularioContacto() {
  const [formulario, setFormulario] = useState({ nombre: '', email: '', mensaje: '' });
  const [estado, setEstado] = useState('idle'); // idle | enviando | exito | error
  const [error, setError] = useState('');

  // Cada tecla que escribís actualiza el campo correspondiente
  function manejarCambio(e) {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  }

  // Al enviar el formulario se llama a la API
  async function manejarEnvio(e) {
    e.preventDefault();
    if (estado === 'enviando') return;

    setEstado('enviando');
    setError('');
    try {
      await enviarMensaje(formulario);
      setEstado('exito');
      setFormulario({ nombre: '', email: '', mensaje: '' });
    } catch (err) {
      setEstado('error');
      setError(err.message);
    }
  }

  // Estado: mensaje enviado
  if (estado === 'exito') {
    return (
      <div
        role="status"
        className="p-6 rounded-2xl bg-emerald-950/50 border border-emerald-700/40 text-center"
      >
        <p className="font-bold text-emerald-200">Mensaje enviado</p>
        <p className="text-sm mt-1">Gracias por escribirme, te respondo a la brevedad.</p>
        <button
          type="button"
          onClick={() => setEstado('idle')}
          className="mt-4 text-sm text-emerald-200 underline"
        >
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={manejarEnvio} className="space-y-4 text-left" noValidate>
      <div>
        <label htmlFor="nombre" className="block text-sm font-medium text-zinc-300 mb-1">
          Nombre
        </label>
        <input
          id="nombre"
          name="nombre"
          type="text"
          required
          value={formulario.nombre}
          onChange={manejarCambio}
          placeholder="Tu nombre"
          className="w-full px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-1">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={formulario.email}
          onChange={manejarCambio}
          placeholder="tu@email.com"
          className="w-full px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
        />
      </div>
      <div>
        <label htmlFor="mensaje" className="block text-sm font-medium text-zinc-300 mb-1">
          Mensaje
        </label>
        <textarea
          id="mensaje"
          name="mensaje"
          required
          rows="4"
          value={formulario.mensaje}
          onChange={manejarCambio}
          placeholder="Contame sobre tu proyecto..."
          className="w-full px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 resize-none"
        />
      </div>
      {estado === 'error' && (
        <p role="alert" className="text-red-400 text-sm">{error}</p>
      )}
      <button
        type="submit"
        disabled={estado === 'enviando'}
        className="w-full px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {estado === 'enviando' ? 'Enviando...' : 'Enviar mensaje'}
      </button>
    </form>
  );
}