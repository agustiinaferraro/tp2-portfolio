//zona de contacto
//si la persona está logueada se muestra el chat directo con agustina (sin rellenar un formulario)
//si no está logueada se le pide entrar o crearse una cuenta para poder escribir
import { useEffect, useState } from 'react';
import { obtenerPerfil } from '../api/perfil.js';
import { leerSesion } from '../api/usuarios.js';
import ChatVisitante from './ChatVisitante.jsx';
import Loading from './Loading.jsx';

export default function FormularioContacto() {
  //sesion de la cuenta en el navegador (nombre, email y token de firebase)
  const [sesion, setSesion] = useState(null);
  const [cargando, setCargando] = useState(true);
  //numero de whatsapp actual: sale del perfil (ocupado desde el panel) con uno por defecto
  const [telefonoWhatsapp, setTelefonoWhatsapp] = useState('5491131166948');

  //al abrir se trae la sesion y el perfil (para el numero de whatsapp configurado)
  useEffect(() => {
    setSesion(leerSesion());
    setCargando(false);
    const cargar = () => {
      obtenerPerfil()
        .then((perfil) => {
          if (perfil.whatsapp) setTelefonoWhatsapp(perfil.whatsapp);
        })
        .catch(() => {});
    };
    cargar();
    //si el perfil se guardo desde el panel, se actualiza el numero
    window.addEventListener('perfil-actualizado', cargar);
    //si la persona entra o sale de su cuenta en otra pestaña, el chat se actualiza
    window.addEventListener('storage', () => setSesion(leerSesion()));
    return () => {
      window.removeEventListener('perfil-actualizado', cargar);
      window.removeEventListener('storage', () => setSesion(leerSesion()));
    };
  }, []);

  if (cargando) {
    return <Loading claseContenedor="h-32" />;
  }

  //estado: persona logueada → chat directo con la admin (muestra su charla y puede seguir mandando)
  if (sesion?.token) {
    return (
      <ChatVisitante
        sesion={sesion}
        whatsapp={telefonoWhatsapp}
      />
    );
  }

  //estado: sin cuenta → se pide registrarse/entrar para poder escribir
  return (
    <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center space-y-4">
      <p className="text-zinc-300 font-medium">
        Para escribirme necesitás una cuenta.
      </p>
      <p className="text-sm text-zinc-400 leading-relaxed">
        Registrate o entrá a tu cuenta y vas a poder hablar directo conmigo:
        tu mensaje y la respuesta quedan en un chat.
      </p>
      <a
        href="/cuenta"
        className="inline-block px-6 py-3 rounded-full bg-violeta-app hover:bg-violeta-app/90 text-black font-medium transition-all duration-200 hover:scale-105 active:scale-95"
      >
        Crear cuenta o entrar
      </a>
    </div>
  );
}