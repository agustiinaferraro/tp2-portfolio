//saludo de la home: saluda personalmente a la persona que está logueada
//si no hay sesión no muestra nada (el formulario de "como te llamas" ya no existe)
import { useEffect, useState } from 'react';
import { leerSesion } from '../api/usuarios.js';

export default function Saludo() {
  const [sesion, setSesion] = useState(null);

  useEffect(() => {
    setSesion(leerSesion());
    //si la persona entra o sale en otra pestaña, el saludo se actualiza
    window.addEventListener('storage', () => setSesion(leerSesion()));
    return () => window.removeEventListener('storage', () => setSesion(leerSesion()));
  }, []);

  if (!sesion?.nombre) return null;

  return (
    <div className="max-w-md w-full mx-auto my-6 p-6 bg-zinc-900 text-white rounded-2xl border border-zinc-800 shadow-xl text-center">
      <h2 className="text-2xl font-bold text-verde-app">
        ¡Hola, {sesion.nombre}! 👋
      </h2>
      <p className="text-zinc-300 text-sm mt-2">
        Bienvenido/a a mi portfolio. Espero que disfrutes la experiencia.
      </p>
    </div>
  );
}