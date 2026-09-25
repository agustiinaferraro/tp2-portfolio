//avatar del navbar: muestra la foto de perfil (o una silueta si todavia no hay)
//y es el acceso al panel de administracion
//la foto se sube desde el panel con el lapiz y aparece sola aca
import { useEffect, useState } from 'react';
import { obtenerPerfil } from '../api/perfil.js';
import { leerSesion } from '../api/sesionAdmin.js';

//prop "texto" opcional: si viene, se muestra el avatar junto a un texto (menu movil)
export default function AvatarAdmin({ texto }) {
  //el logo aparece solo si hay una sesion de administrador iniciada
  const [logueado, setLogueado] = useState(() => leerSesion() !== null);
  const [foto, setFoto] = useState('');
  const [nombre, setNombre] = useState('');

  //se entera de los cambios de sesion para mostrar o esconder el logo
  useEffect(() => {
    const actualizarSesion = () => setLogueado(leerSesion() !== null);
    window.addEventListener('sesion-admin', actualizarSesion);
    return () => window.removeEventListener('sesion-admin', actualizarSesion);
  }, []);

  useEffect(() => {
    const cargar = () => {
      obtenerPerfil()
        .then((perfil) => {
          setFoto(perfil.foto ?? '');
          setNombre(perfil.nombre ?? '');
        })
        .catch(() => {});
    };
    cargar();
    //si el perfil se guardo desde el panel, se vuelve a cargar solo
    window.addEventListener('perfil-actualizado', cargar);
    return () => window.removeEventListener('perfil-actualizado', cargar);
  }, []);

  const nombreAccesible =
    logueado && nombre ? `Panel de administración (${nombre})` : 'Panel de administración';

  //si no hay sesion iniciada o no hay foto, se muestra una silueta de persona en el circulo
  const contenido = logueado && foto ? (
    <img src={foto} alt="" className="w-full h-full object-cover" />
  ) : (
    <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm0 2c-4.4 0-8 2-8 4v2h16v-2c0-2-3.6-4-8-4z" />
    </svg>
  );

  if (texto) {
    return (
      <a
        href="/admin"
        aria-label={nombreAccesible}
        className="w-full flex items-center gap-3 py-2 text-left text-zinc-300 hover:text-white transition-colors"
      >
        <span className="w-8 h-8 rounded-full overflow-hidden shrink-0 inline-flex items-center justify-center bg-zinc-800 border border-zinc-700">
          {contenido}
        </span>
        <span>{texto}</span>
      </a>
    );
  }

  return (
    <a
      href="/admin"
      aria-label={nombreAccesible}
      title="Panel de administración"
      className="inline-flex items-center justify-center w-9 h-9 rounded-full overflow-hidden border border-zinc-700 bg-zinc-800 text-zinc-300 hover:text-white hover:border-verde-app hover:scale-105 transition-all duration-200"
    >
      {contenido}
    </a>
  );
}