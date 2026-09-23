//formulario de contacto
//muestra los estados: formulario - enviando - exito / error
import { useEffect, useState } from 'react';
import { enviarMensaje } from '../api/mensajes.js';
import { obtenerPerfil } from '../api/perfil.js';

//arma el link de whatsapp con el mensaje ya escrito
function armarLinkWhatsApp({ nombre, email, mensaje }, telefono) {
  const texto = `Hola! Soy ${nombre} (${email}). ${mensaje}`;
  return `https://wa.me/${telefono}?text=${encodeURIComponent(texto)}`;
}

export default function FormularioContacto() {
  const [formulario, setFormulario] = useState({ nombre: '', email: '', mensaje: '' });
  const [estado, setEstado] = useState('idle'); //idle | enviando | exito | error
  const [error, setError] = useState('');
  //numero de whatsapp actual: sale del perfil (ocupado desde el panel) con uno por defecto
  const [telefonoWhatsapp, setTelefonoWhatsapp] = useState('5491131166948');

  //al abrir se trae el perfil para usar el numero de whatsapp configurado
  useEffect(() => {
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
    return () => window.removeEventListener('perfil-actualizado', cargar);
  }, []);

  //cada tecla que se escribe actualiza el campo correspondiente
  function manejarCambio(e) {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  }

  //al enviar el formulario se llama a la api
  async function manejarEnvio(e) {
    e.preventDefault();
    if (estado === 'enviando') return;

    setEstado('enviando');
    setError('');
    try {
      await enviarMensaje(formulario);
      //se abre whatsapp con el mensaje precargado (pestana nueva)
      window.open(armarLinkWhatsApp(formulario, telefonoWhatsapp), '_blank');
      setEstado('exito');
      setFormulario({ nombre: '', email: '', mensaje: '' });
    } catch (err) {
      setEstado('error');
      setError(err.message);
    }
  }

  //estado: mensaje enviado
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
          className="mt-4 text-sm text-emerald-200 underline transition-all duration-200 hover:scale-105 active:scale-95 active:text-emerald-100"
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
          className="w-full px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-verde-app"
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
          className="w-full px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-verde-app"
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
          className="w-full px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-verde-app resize-none"
        />
      </div>
      {estado === 'error' && (
        <p role="alert" className="text-red-400 text-sm">{error}</p>
      )}
      <button
        type="submit"
        disabled={estado === 'enviando'}
        className="w-full px-6 py-3 rounded-full bg-violeta-app hover:bg-violeta-app/90 hover:scale-105 active:scale-95 active:bg-violeta-app/80 transition-all duration-200 font-medium text-[#1c1c21] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {estado === 'enviando' ? 'Enviando...' : 'Enviar mensaje'}
      </button>
    </form>
  );
}