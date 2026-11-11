'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/compartido/lib/utils';

const TRANSICION =
  'transition-[padding,background-color,border-color,border-radius,box-shadow] duration-300 ease-out motion-reduce:transition-none';

/**
 * Marco del header (SCRUM-157). Arriba de todo, flota: una píldora de vidrio esmerilado separada
 * de los bordes, con la portada del inicio detrás. Al desplazarse se vuelve una barra sólida a
 * todo el ancho, fija arriba. Los dos estados miden lo mismo (`h-[72px] md:h-[76px]
 * lg:h-[84px]`, ver SUBIR_BAJO_HEADER), así el contenido no salta al cambiar.
 *
 * Sabe si la página está arriba con un IntersectionObserver sobre un punto al inicio del
 * documento, sin escuchar el scroll. Sin observador (o en el servidor), queda flotando.
 */
export function MarcoHeader({ children }: { children: ReactNode }) {
  const punto = useRef<HTMLDivElement>(null);
  const [arriba, setArriba] = useState(true);

  useEffect(() => {
    const elemento = punto.current;
    if (!elemento || typeof IntersectionObserver === 'undefined') return;
    const observador = new IntersectionObserver(([entrada]) =>
      setArriba(entrada.isIntersecting),
    );
    observador.observe(elemento);
    return () => observador.disconnect();
  }, []);

  return (
    <>
      <div
        ref={punto}
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 h-2 w-px"
      />
      <header
        data-flotante={arriba || undefined}
        className={cn(
          'sticky top-0 z-40 h-[72px] md:h-[76px] lg:h-[84px]',
          TRANSICION,
          arriba
            ? 'pointer-events-none px-2 pt-2 md:px-4 md:pt-3 lg:px-6'
            : 'border-b border-fondo-hueso-oscuro bg-fondo-hueso/95 backdrop-blur-md',
        )}
      >
        <div
          className={cn(
            'pointer-events-auto mx-auto flex h-full max-w-[1440px] flex-col justify-center border',
            TRANSICION,
            arriba
              ? 'rounded-full border-fondo-superficie/70 bg-fondo-hueso/80 shadow-tarjeta backdrop-blur-md'
              : 'rounded-none border-transparent',
          )}
        >
          {children}
        </div>
      </header>
    </>
  );
}
