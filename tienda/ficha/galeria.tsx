'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { cn } from '@/compartido/lib/utils';

interface GaleriaProps {
  /** URLs de las fotos, la principal primero (vienen de la API). */
  imagenes: string[];
  /** Texto alternativo de las fotos: el nombre del producto y del formato. */
  alt: string;
}

/**
 * Galería de la ficha (Figma › 03 Ficha 2007:687 y 2007:1745). Celular: carrusel a todo el
 * ancho que se desliza con el dedo, con puntos. Escritorio: foto grande y miniaturas debajo.
 * Es el mismo carrusel: las miniaturas lo mueven. Quien la usa le pasa `key` del formato para
 * volver a la primera foto al cambiar de formato.
 */
export const Galeria = ({ imagenes, alt }: GaleriaProps) => {
  const [actual, setActual] = useState(0);
  const carrusel = useRef<HTMLDivElement>(null);

  const mostrar = (indice: number) => {
    setActual(indice);
    const elemento = carrusel.current;
    elemento?.scrollTo?.({ left: indice * elemento.clientWidth });
  };

  const alDeslizar = () => {
    const elemento = carrusel.current;
    if (!elemento || elemento.clientWidth === 0) return;
    setActual(Math.round(elemento.scrollLeft / elemento.clientWidth));
  };

  if (imagenes.length === 0) {
    return (
      <div className="-mx-4 aspect-[39/34] bg-marca-acento-suave md:mx-0 md:aspect-[16/15] md:rounded-xl" />
    );
  }

  const varias = imagenes.length > 1;
  return (
    <div className="flex flex-col gap-4">
      <div className="relative -mx-4 md:mx-0">
        <div
          ref={carrusel}
          role="group"
          aria-roledescription="carrusel"
          aria-label={`Fotos de ${alt}`}
          onScroll={alDeslizar}
          className="flex aspect-[39/34] snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto bg-marca-acento-suave md:aspect-[16/15] md:overflow-hidden md:rounded-xl"
        >
          {imagenes.map((imagen, i) => (
            <div
              key={imagen}
              className="relative w-full shrink-0 snap-center"
              aria-hidden={i !== actual}
            >
              <Image
                src={imagen}
                alt={
                  varias ? `${alt}, foto ${i + 1} de ${imagenes.length}` : alt
                }
                fill
                sizes="(min-width: 1280px) 640px, (min-width: 768px) 45vw, 100vw"
                priority={i === 0}
                className="object-cover"
              />
            </div>
          ))}
        </div>
        {varias && (
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-3 flex justify-center gap-2 md:hidden"
          >
            {imagenes.map((imagen, i) => (
              <span
                key={imagen}
                className={cn(
                  'size-2 rounded-full',
                  i === actual ? 'bg-marca-profundo' : 'bg-marca-profundo/30',
                )}
              />
            ))}
          </div>
        )}
      </div>
      {varias && (
        <ul className="hidden grid-cols-4 gap-4 md:grid">
          {imagenes.map((imagen, i) => (
            <li key={imagen}>
              <button
                type="button"
                aria-label={`Ver foto ${i + 1} de ${imagenes.length}`}
                aria-current={i === actual}
                onClick={() => mostrar(i)}
                className={cn(
                  'relative block aspect-[37/30] w-full overflow-hidden rounded-lg bg-marca-acento-suave outline-none focus-visible:ring-[3px] focus-visible:ring-ring/60',
                  i === actual
                    ? 'border-2 border-marca-profundo'
                    : 'opacity-75 hover:opacity-100',
                )}
              >
                <Image
                  src={imagen}
                  alt=""
                  fill
                  sizes="(min-width: 1440px) 148px, 10vw"
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
