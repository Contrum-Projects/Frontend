'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/compartido/lib/utils';

const TRANSICION =
  'transition-[padding,background-color,border-color,box-shadow] duration-300 ease-out motion-reduce:transition-none';

/**
 * Marco del header (SCRUM-157). En el inicio, arriba de todo, flota: una píldora de vidrio esmerilado centrada,
 * del ancho justo de su contenido y separada del borde, sobre la portada del inicio (decisión del
 * 11-11-2026). El hueso al 70 % es lo mínimo para que el texto oscuro mantenga contraste AA (unos
 * 5,8:1) sobre una foto negra. Al desplazarse se vuelve una barra sólida a todo el ancho, fija
 * arriba. Los dos estados miden lo mismo (`h-[72px] md:h-[76px] lg:h-[84px]`, ver
 * SUBIR_BAJO_HEADER), así el contenido no salta.
 *
 * En las demás páginas es siempre la barra. Sabe si la página está arriba con un
 * IntersectionObserver sobre un punto al inicio del documento (`data-arriba`), sin escuchar el
 * scroll; que sea el inicio lo dice `data-inicio` en su <main>, con las variantes `flotante` y
 * `flotante-dentro` de globals.css.
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
        data-arriba={arriba || undefined}
        className={cn(
          'sticky top-0 z-40 h-[72px] border-b border-fondo-hueso-oscuro bg-fondo-hueso/95 shadow-tarjeta backdrop-blur-md md:h-[76px] lg:h-[84px]',
          'flotante:pointer-events-none flotante:border-transparent flotante:bg-transparent flotante:px-2 flotante:pt-2 flotante:shadow-none flotante:backdrop-blur-none md:flotante:pt-3',
          TRANSICION,
        )}
      >
        <div
          className={cn(
            'pointer-events-auto mx-auto flex h-full max-w-[1440px] flex-col justify-center px-4 lg:px-8 xl:px-16',
            'flotante-dentro:w-fit flotante-dentro:max-w-full flotante-dentro:rounded-full flotante-dentro:border flotante-dentro:border-fondo-superficie/60 flotante-dentro:bg-fondo-hueso/70 flotante-dentro:px-3 flotante-dentro:shadow-tarjeta flotante-dentro:backdrop-blur-xl flotante-dentro:backdrop-saturate-150 lg:flotante-dentro:px-6',
            TRANSICION,
          )}
        >
          {children}
        </div>
      </header>
    </>
  );
}
