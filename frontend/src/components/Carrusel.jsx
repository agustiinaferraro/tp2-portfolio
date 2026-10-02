//carrusel horizontal reutilizable: lista que se desliza con flechas y, si se pide, sola
//decisiones que comparte todos los carruseles del sitio:
//  - se ve un pedazo de la tarjeta siguiente, para dar la idea de que hay mas para deslizar
//  - la lista tiene aire arriba y abajo, asi la card que se agranda con el hover no se corta
//  - al cambiar los items (por ejemplo al cambiar el filtro de proyectos) vuelve al principio
//  - las flechas se desactivan en los bordes y dan la vuelta al llegar al final
import { Children, useCallback, useEffect, useRef, useState } from 'react';

//ancho de una tarjeta: hasta 18rem pero nunca mas del 78% del ancho disponible,
//asi siempre queda a la vista un fragmento de la siguiente
export const TARJETA_CARRUSEL = 'w-[clamp(13rem,78%,18rem)]';

//alto de las tarjetas de proyecto, la mas alta de las tres grillas
export const ALTO_PROYECTO = 'h-[26rem]';

//distancia que se avanza cada vez que se aprieta una flecha (ancho de la card + separacion)
function pasoDe(lista) {
  const hijo = lista.firstElementChild;
  const estilos = getComputedStyle(lista);
  const gap = parseFloat(estilos.columnGap) || parseFloat(estilos.gap) || 24;
  return (hijo?.offsetWidth ?? 320) + gap;
}

export default function Carrusel({
  titulo = null,
  etiqueta,
  children,
  claseItem = TARJETA_CARRUSEL,
  claseLista = '',
  claseContenedor = '',
  auto = false,
  intervaloMs = 5000,
  conFlechas = true,
  //clave para reiniciar el carrusel cuando cambia el contenido (ej: filtro de categorias)
  clave = '',
}) {
  const listaRef = useRef(null);
  const [alInicio, setAlInicio] = useState(true);
  const [alFinal, setAlFinal] = useState(false);
  //con el mouse encima el carrusel automatico se frena para poder mirar la card con calma
  const [pausado, setPausado] = useState(false);
  const cantidad = Children.count(children);

  //al scrollear se avisa si queda contenido a cada lado para (des)habilitar las flechas
  useEffect(() => {
    const lista = listaRef.current;
    if (!lista) return undefined;
    const actualizar = () => {
      const tolerancia = 8;
      const fin = lista.scrollWidth - lista.clientWidth;
      setAlInicio(lista.scrollLeft <= tolerancia);
      setAlFinal(lista.scrollLeft >= fin - tolerancia);
    };
    actualizar();
    lista.addEventListener('scroll', actualizar, { passive: true });
    window.addEventListener('resize', actualizar);
    return () => {
      lista.removeEventListener('scroll', actualizar);
      window.removeEventListener('resize', actualizar);
    };
  }, [cantidad, clave]);

  //cambian los items (o el filtro): la lista vuelve siempre al principio
  useEffect(() => {
    const lista = listaRef.current;
    if (!lista) return;
    lista.scrollTo({ left: 0 });
    setAlInicio(true);
    setAlFinal(false);
  }, [cantidad, clave]);

  //avanza una card; en los bordes da la vuelta para que nunca quede trabado
  const ir = useCallback((direccion) => {
    const lista = listaRef.current;
    if (!lista) return;
    const tolerancia = 8;
    const fin = Math.max(0, lista.scrollWidth - lista.clientWidth);
    if (direccion > 0 && lista.scrollLeft >= fin - tolerancia) {
      lista.scrollTo({ left: 0, behavior: 'smooth' });
    } else if (direccion < 0 && lista.scrollLeft <= tolerancia) {
      lista.scrollTo({ left: fin, behavior: 'smooth' });
    } else {
      lista.scrollTo({ left: lista.scrollLeft + direccion * pasoDe(lista), behavior: 'smooth' });
    }
  }, []);

  //rotacion automatica: se frena con el mouse, al tocar el teclado o si el sistema pide menos movimiento
  useEffect(() => {
    if (!auto || pausado || cantidad < 2) return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    const intervalo = setInterval(() => ir(1), intervaloMs);
    return () => clearInterval(intervalo);
  }, [auto, pausado, cantidad, intervaloMs, ir]);

  const claseFlecha = (desactivado) =>
    `shrink-0 self-center w-11 h-11 rounded-full bg-black/80 border border-zinc-700 text-zinc-200 transition-all duration-200 cursor-pointer ${
      desactivado
        ? 'opacity-40 cursor-not-allowed'
        : 'hover:scale-110 hover:bg-verde-app hover:text-black hover:border-verde-app active:scale-90 active:bg-violeta-app active:text-black active:border-violeta-app'
    }`;

  return (
    <div
      className={claseContenedor}
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocus={() => setPausado(true)}
      onBlur={() => setPausado(false)}
    >
      {titulo}
      {conFlechas ? (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => ir(-1)}
            disabled={alInicio}
            aria-label={`Anterior en ${etiqueta ?? 'el carrusel'}`}
            className={claseFlecha(alInicio)}
          >
            <span aria-hidden="true">←</span>
          </button>
          <div className="flex-1 min-w-0">
            <ul
              ref={listaRef}
              aria-label={etiqueta}
              className={`flex gap-6 overflow-x-auto snap-x pt-5 pb-10 carrusel-scroll ${claseLista}`}
            >
              {children}
            </ul>
          </div>
          <button
            type="button"
            onClick={() => ir(1)}
            disabled={alFinal}
            aria-label={`Siguiente en ${etiqueta ?? 'el carrusel'}`}
            className={claseFlecha(alFinal)}
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>
      ) : (
        <ul
          ref={listaRef}
          aria-label={etiqueta}
          className={`flex gap-6 overflow-x-auto snap-x pt-5 pb-10 carrusel-scroll ${claseLista}`}
        >
          {children}
        </ul>
      )}
    </div>
  );
}