'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getImageProps } from 'next/image';
import Link from 'next/link';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { cn } from '@/compartido/lib/utils';
import { hrefDestino, type SlidePortada } from './destinoPortada';
import { useArrastreMouse } from './useArrastreMouse';

/** Segundos que se ve cada imagen antes de pasar a la siguiente (SCRUM-157, criterio 8). */
export const SEGUNDOS_POR_SLIDE = 6;

/**
 * La portada ocupa todo el ancho de la pantalla, en 12:5 en escritorio (sin pasar del 85 % del
 * alto de la ventana) y 4:5 en celular; el panel recomienda 2400 × 1000 y 1080 × 1350. Sin imagen
 * de celular, la de escritorio se recorta al centro.
 */
const SIZES = '100vw';

const CONSULTA_REDUCIDO = '(prefers-reduced-motion: reduce)';

const suscribirReducido = (avisar: () => void) => {
  if (typeof window.matchMedia !== 'function') return () => {};
  const consulta = window.matchMedia(CONSULTA_REDUCIDO);
  consulta.addEventListener('change', avisar);
  return () => consulta.removeEventListener('change', avisar);
};

/** «Reducir movimiento» del sistema; en el servidor se asume que no. */
const useMovimientoReducido = () =>
  useSyncExternalStore(
    suscribirReducido,
    () =>
      typeof window.matchMedia === 'function' &&
      window.matchMedia(CONSULTA_REDUCIDO).matches,
    () => false,
  );

/**
 * Portada del inicio (SCRUM-157): las imágenes que la tienda carga en el panel, cada una enlazada
 * a su destino. Se desliza con el dedo (scroll-snap nativo), con las flechas o los puntos, y
 * avanza sola cada 6 s. El avance se detiene con el mouse encima, con el foco dentro o con la
 * pestaña oculta; con «reducir movimiento» no avanza sola.
 */
export function SliderPortada({ slides }: { slides: SlidePortada[] }) {
  const pista = useRef<HTMLUListElement>(null);
  const [activo, setActivo] = useState(0);
  const [encima, setEncima] = useState(false);
  const [enfocado, setEnfocado] = useState(false);
  const [oculta, setOculta] = useState(false);
  const reducido = useMovimientoReducido();
  const total = slides.length;
  const varios = total > 1;
  const avanzando = varios && !reducido && !encima && !enfocado;

  const irA = useCallback(
    (indice: number) => {
      const elemento = pista.current;
      if (!elemento) return;
      const destino = (indice + total) % total;
      // Sin IntersectionObserver (navegadores muy antiguos) el punto se marca aquí
      setActivo(destino);
      elemento.scrollTo?.({
        left: destino * elemento.clientWidth,
        behavior: reducido ? 'auto' : 'smooth',
      });
    },
    [total, reducido],
  );

  const { arrastrando, manejadores } = useArrastreMouse({
    pista,
    total,
    alSoltar: irA,
  });

  // El slide visible lo dice el desplazamiento real: también cuando se desliza con el dedo
  useEffect(() => {
    const elemento = pista.current;
    if (!elemento || !varios || typeof IntersectionObserver === 'undefined') {
      return;
    }
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (entrada.isIntersecting) {
            setActivo(Number((entrada.target as HTMLElement).dataset.indice));
          }
        }
      },
      { root: elemento, threshold: 0.6 },
    );
    for (const hijo of Array.from(elemento.children)) observador.observe(hijo);
    return () => observador.disconnect();
  }, [varios, total]);

  useEffect(() => {
    const alCambiar = () => setOculta(document.hidden);
    document.addEventListener('visibilitychange', alCambiar);
    return () => document.removeEventListener('visibilitychange', alCambiar);
  }, []);

  useEffect(() => {
    if (!avanzando || oculta) return;
    const espera = window.setTimeout(
      () => irA(activo + 1),
      SEGUNDOS_POR_SLIDE * 1000,
    );
    return () => window.clearTimeout(espera);
  }, [avanzando, oculta, activo, irA]);

  return (
    <section
      aria-roledescription="carrusel"
      aria-label="Portada"
      className="w-full"
      onMouseEnter={() => setEncima(true)}
      onMouseLeave={() => setEncima(false)}
      onFocus={() => setEnfocado(true)}
      onBlur={(evento) => {
        if (!evento.currentTarget.contains(evento.relatedTarget)) {
          setEnfocado(false);
        }
      }}
    >
      <div className="relative overflow-hidden bg-marca-acento-suave">
        <ul
          ref={pista}
          aria-live={avanzando ? 'off' : 'polite'}
          {...manejadores}
          // overflow-y-hidden: la pista solo se desplaza de lado; la rueda del mouse pasa a la página.
          // Al arrastrar con el mouse se quita el imán para que la pista siga al cursor
          className={cn(
            'flex [scrollbar-width:none] overflow-x-auto overflow-y-hidden overscroll-x-contain select-none [&::-webkit-scrollbar]:hidden',
            arrastrando ? 'cursor-grabbing snap-none' : 'snap-x snap-mandatory',
            varios && !arrastrando && 'md:cursor-grab',
          )}
        >
          {slides.map((slide, indice) => (
            <li
              key={slide.id}
              data-indice={indice}
              role="group"
              aria-roledescription="imagen"
              aria-label={`${indice + 1} de ${total}`}
              className="relative aspect-[4/5] w-full shrink-0 snap-start md:aspect-[12/5] md:max-h-[85dvh]"
            >
              <ImagenSlide
                slide={slide}
                primera={indice === 0}
                visible={indice === activo}
              />
            </li>
          ))}
        </ul>
        {varios && <Controles total={total} activo={activo} alIr={irA} />}
      </div>
    </section>
  );
}

/**
 * La imagen y su enlace. `<picture>` elige la versión de celular o de escritorio: el navegador
 * baja solo una (art direction de next/image con `getImageProps`).
 */
const ImagenSlide = ({
  slide,
  primera,
  visible,
}: {
  slide: SlidePortada;
  primera: boolean;
  visible: boolean;
}) => {
  const href = hrefDestino(slide.destino);
  if (!href) return null;
  const comun = {
    alt: '',
    fill: true,
    sizes: SIZES,
    ...(primera
      ? { loading: 'eager' as const, fetchPriority: 'high' as const }
      : {}),
  };
  const {
    props: { srcSet: escritorio },
  } = getImageProps({
    ...comun,
    src: slide.imagenEscritorio,
  });
  const {
    props: { srcSet: celular, ...img },
  } = getImageProps({
    ...comun,
    sizes: '100vw',
    src: slide.imagenCelular ?? slide.imagenEscritorio,
  });
  return (
    <Link
      href={href}
      // Las que no se ven no reciben el foco: el teclado usa las flechas y los puntos
      tabIndex={visible ? undefined : -1}
      aria-hidden={visible ? undefined : true}
      draggable={false}
      className="group absolute inset-0 block outline-none focus-visible:ring-4 focus-visible:ring-marca-profundo focus-visible:ring-inset"
    >
      {/* El texto de la imagen (si lo tiene) no se puede leer: se anuncia el destino */}
      <span className="sr-only">Ver {slide.destino.nombre}</span>
      <picture>
        <source media="(min-width: 768px)" srcSet={escritorio} />
        {/* Art direction documentado de next/image: <picture> con getImageProps */}
        <img
          {...img}
          alt=""
          draggable={false}
          srcSet={celular}
          className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.015] motion-reduce:transition-none"
        />
      </picture>
    </Link>
  );
};

interface ControlesProps {
  total: number;
  activo: number;
  alIr: (indice: number) => void;
}

/**
 * Flechas y puntos en una píldora sobre la esquina inferior. El fondo de superficie
 * semitransparente con desenfoque mantiene el contraste sobre cualquier foto.
 */
const Controles = ({ total, activo, alIr }: ControlesProps) => (
  <div className="absolute right-3 bottom-3 flex items-center gap-1 rounded-full border border-fondo-superficie/60 bg-fondo-superficie/85 p-1 shadow-tarjeta backdrop-blur-md md:right-16 md:bottom-8">
    <BotonControl
      etiqueta="Imagen anterior"
      onClick={() => alIr(activo - 1)}
      className="max-md:hidden"
    >
      <ChevronLeft aria-hidden />
    </BotonControl>
    <div className="flex items-center px-1">
      {Array.from({ length: total }, (_, indice) => (
        <button
          key={indice}
          type="button"
          aria-label={`Ir a la imagen ${indice + 1} de ${total}`}
          aria-current={indice === activo || undefined}
          onClick={() => alIr(indice)}
          className="group/punto flex size-6 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-marca-profundo"
        >
          <span
            className={cn(
              'block h-1.5 rounded-full transition-[width,background-color] duration-300 motion-reduce:transition-none',
              indice === activo
                ? 'w-4 bg-marca-profundo'
                : 'w-1.5 bg-texto-secundario/50 group-hover/punto:bg-texto-secundario',
            )}
          />
        </button>
      ))}
    </div>
    <BotonControl
      etiqueta="Imagen siguiente"
      onClick={() => alIr(activo + 1)}
      className="max-md:hidden"
    >
      <ChevronRight aria-hidden />
    </BotonControl>
  </div>
);

const BotonControl = ({
  etiqueta,
  onClick,
  className,
  children,
}: {
  etiqueta: string;
  onClick: () => void;
  className?: string;
  children: ReactNode;
}) => (
  <button
    type="button"
    aria-label={etiqueta}
    onClick={onClick}
    className={cn(
      'flex size-9 items-center justify-center rounded-full text-marca-profundo transition-colors outline-none hover:bg-marca-acento-suave focus-visible:ring-2 focus-visible:ring-marca-profundo active:scale-95 motion-reduce:active:scale-100 [&_svg]:size-4 [&_svg]:stroke-[1.75]',
      className,
    )}
  >
    {children}
  </button>
);
