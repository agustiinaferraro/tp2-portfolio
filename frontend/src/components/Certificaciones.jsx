//certificaciones: grilla de imagenes con zoom
//al tocar una se abre en grande, con cruz para cerrar y se cierra tambien tocando afuera
import { useEffect, useState } from 'react';

//certificaciones: cada una con su imagen (carpeta public/img/certificaciones)
const CERTIFICACIONES = [
  {
    nombre: 'Photoshop',
    descripcion: 'Certificado académico de Adobe Photoshop',
    imagen: '/img/certificaciones/photoshop.jpg',
  },
  {
    nombre: 'Illustrator',
    descripcion: 'Certificado académico de Adobe Illustrator',
    imagen: '/img/certificaciones/illustrator.jpg',
  },
  {
    nombre: 'Figma',
    descripcion: 'Certificado de diseño de interfaces con Figma',
    imagen: '/img/certificaciones/figma.jpg',
  },
  {
    nombre: 'Ayudantía en Negocios Digitales II',
    descripcion: 'Ayudantía en la materia Negocios Digitales II',
    imagen: '/img/certificaciones/negocios-digitales.png',
  },
  {
    nombre: 'Ayudantía en Diseño de Interfaces',
    descripcion: 'Ayudantía en la materia Diseño de Interfaces',
    imagen: '/img/certificaciones/diseno-de-interfaces.png',
  },
];

function Cruz() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function Certificaciones() {
  const [abierta, setAbierta] = useState(null);

  // Escape tambien cierra
  useEffect(() => {
    if (!abierta) return undefined;
    const alPresionar = (e) => {
      if (e.key === 'Escape') setAbierta(null);
    };
    window.addEventListener('keydown', alPresionar);
    return () => window.removeEventListener('keydown', alPresionar);
  }, [abierta]);

  return (
    <>
      <div className="px-4 pb-16 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-white text-left inline-flex items-center gap-3 mb-8">
          <svg
            aria-hidden="true"
            className="w-8 h-8 text-violeta-app"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
          </svg>
          Certificaciones
        </h2>

        <ul className="grid sm:grid-cols-2 gap-4">
          {CERTIFICACIONES.map((cert) => (
            <li
              key={cert.nombre}
              className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden transition-colors hover:border-violeta-app/40"
            >
              <button type="button" onClick={() => setAbierta(cert)} className="block w-full text-left cursor-pointer">
                <img
                  src={cert.imagen}
                  alt={cert.nombre}
                  loading="lazy"
                  className="w-full h-56 object-cover object-top bg-zinc-800 transition-transform duration-200 hover:scale-105"
                />
                <p className="flex items-center gap-2 px-4 py-3 text-zinc-200 text-sm">
                  <svg
                    aria-hidden="true"
                    className="w-5 h-5 text-verde-app shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {cert.nombre}
                </p>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/*la imagen abierta encima de todo, con fondo oscuro*/}
      {abierta && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={abierta.nombre}
          onClick={() => setAbierta(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 overflow-y-auto"
        >
          <div className="relative max-w-4xl w-full animacion-aparecer">
            <button
              type="button"
              onClick={() => setAbierta(null)}
              aria-label="Cerrar"
              className="absolute -top-2 -right-2 z-10 w-11 h-11 rounded-full bg-zinc-900 border border-zinc-700 text-white transition-all duration-200 cursor-pointer hover:scale-110 hover:bg-verde-app hover:text-black hover:border-verde-app active:scale-90"
            >
              <Cruz />
            </button>
            <img
              src={abierta.imagen}
              alt={abierta.nombre}
              className="w-full max-h-[80vh] object-contain rounded-xl border border-zinc-700 bg-zinc-900"
            />
            <p className="mt-4 text-center text-zinc-200 text-sm">{abierta.descripcion}</p>
          </div>
        </div>
      )}
    </>
  );
}
