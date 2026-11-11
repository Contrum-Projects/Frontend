'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/compartido/lib/utils';

const TRANSICION =
  'transition-[background-color,border-color,box-shadow] duration-300 ease-out motion-reduce:transition-none';

/**
 * Marco del header (SCRUM-157). Arriba de todo, sobre la portada del inicio, es una franja de
 * vidrio esmerilado a todo el ancho y sin borde (decisión del 11-11-2026): la foto se ve
 * desenfocada detrás. El hueso al 70 % es lo mínimo para que el texto oscuro mantenga contraste
 * AA (unos 5,8:1) sobre una foto negra; menos, y no se lee. Al desplazarse se vuelve una barra sólida, fija arriba. Los dos estados miden lo mismo
 * (`h-[72px] md:h-[76px] lg:h-[84px]`, ver SUBIR_BAJO_HEADER), así el contenido no salta.
 *
 * Sabe si la página está arriba con un IntersectionObserver sobre un punto al inicio del
 * documento, sin escuchar el scroll. Sin observador (o en el servidor), queda transparente.
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
          'sticky top-0 z-40 h-[72px] border-b md:h-[76px] lg:h-[84px]',
          TRANSICION,
          arriba
            ? 'border-transparent bg-fondo-hueso/70 backdrop-blur-xl backdrop-saturate-150'
            : 'border-fondo-hueso-oscuro bg-fondo-hueso/95 shadow-tarjeta backdrop-blur-md',
        )}
      >
        <div className="mx-auto flex h-full max-w-[1440px] flex-col justify-center">
          {children}
        </div>
      </header>
    </>
  );
}
