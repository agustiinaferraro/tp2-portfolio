import { useState } from 'react';

export default function Saludo() {
  const [nombre, setNombre] = useState('');
  const [nombreGuardado, setNombreGuardado] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (nombre.trim() !== '') {
      setNombreGuardado(nombre.trim());
    }
  };

  return (
    <div className="max-w-md w-full mx-auto my-6 p-6 bg-zinc-900 text-white rounded-2xl border border-zinc-800 shadow-xl text-center">
      {nombreGuardado ? (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-violet-400">
            ¡Hola, {nombreGuardado}! 👋
          </h2>
          <p className="text-zinc-300 text-sm">
            Bienvenido/a a mi portfolio. Espero que disfrutes la experiencia.
          </p>
          <button 
            onClick={() => setNombreGuardado('')}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold rounded-lg transition-colors border border-zinc-700 cursor-pointer"
          >
            Cambiar nombre
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-xl font-semibold text-zinc-100">¿Cómo te llamás?</h3>
          <input
            type="text"
            placeholder="Ingresá tu nombre..."
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all text-center"
          />
          <button
            type="submit"
            className="w-full py-2 px-4 bg-violet-600 hover:bg-violet-500 font-medium text-white rounded-lg transition-colors shadow-lg shadow-violet-500/20 cursor-pointer"
          >
            Guardar
          </button>
        </form>
      )}
    </div>
  );
}