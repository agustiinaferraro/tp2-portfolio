//selector de varias imagenes para un proyecto: se usa en el panel admin y en el detalle al editar
//la primera imagen actua como portada y el resto como galeria del detalle
//las imagenes se comprimen en el navegador antes de guardarse en la base
import { useState } from 'react';
import { comprimirImagen } from '../utils/imagen.js';

//presupuesto total de la galeria en base64 para que el guardado no falle en vercel
const PRESUPUESTO_TOTAL = 1.4 * 1024 * 1024;
const MAX_POR_IMAGEN = 8 * 1024 * 1024;

export default function SelectorImagenes({ imagenes, alCambiar, mostrarMensaje }) {
  const [comprimiendo, setComprimiendo] = useState(false);

  async function alElegirArchivos(evento) {
    const archivos = [...(evento.target.files ?? [])];
    if (archivos.length === 0) return;
    evento.target.value = '';
    setComprimiendo(true);
    const nuevas = [...imagenes];
    for (const archivo of archivos) {
      if (archivo.size > MAX_POR_IMAGEN) {
        mostrarMensaje(`La imagen "${archivo.name}" pesa más de 8 MB. Probá con otra.`, 'error');
        continue;
      }
      try {
        const base64 = await comprimirImagen(archivo);
        const total = nuevas.reduce((suma, img) => suma + img.length, 0);
        if (total + base64.length > PRESUPUESTO_TOTAL) {
          mostrarMensaje('Las imágenes ocupan demasiado espacio en total. Quitá alguna o usá versiones más livianas.', 'error');
          continue;
        }
        nuevas.push(base64);
      } catch (error) {
        mostrarMensaje(error.message, 'error');
      }
    }
    setComprimiendo(false);
    if (nuevas.length !== imagenes.length) alCambiar(nuevas);
  }

  function quitar(indice) {
    alCambiar(imagenes.filter((_, i) => i !== indice));
  }

  return (
    <div className="space-y-3">
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={alElegirArchivos}
        disabled={comprimiendo}
        className="block w-full text-sm text-zinc-400 file:mr-4 file:px-4 file:py-2 file:rounded-lg file:border-0 file:bg-violet-600 file:text-white file:font-medium file:cursor-pointer hover:file:bg-violet-500 file:transition-colors disabled:opacity-50"
      />
      <p className="text-xs text-zinc-600">
        Podés elegir varias a la vez. Cada una se comprime sola. La primera es la portada y el resto se ven en el detalle.
      </p>

      {comprimiendo && <p className="text-xs text-zinc-500">Procesando imágenes...</p>}

      {imagenes.length > 0 && (
        <ul className="flex flex-wrap gap-3">
          {imagenes.map((img, indice) => (
            <li key={indice} className="relative">
              <img
                src={img}
                alt={`Imagen ${indice + 1} del proyecto`}
                className="h-24 w-24 object-cover rounded-lg border border-zinc-700 bg-zinc-950"
              />
              <button
                type="button"
                onClick={() => quitar(indice)}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs font-bold leading-none transition-colors"
                aria-label={`Quitar imagen ${indice + 1}`}
              >
                ×
              </button>
              {indice === 0 && (
                <span className="absolute bottom-1 left-1 text-[10px] px-1.5 py-0.5 rounded bg-violet-600 text-white">
                  Portada
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}