'use client';

import {
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
  type RefObject,
} from 'react';

/** Píxeles que debe moverse el mouse para contar como arrastre y no como clic. */
const UMBRAL_ARRASTRE = 6;
/** Fracción del ancho que hay que arrastrar para pasar a la imagen vecina. */
const FRACCION_PARA_PASAR = 0.15;

/** Mueve la pista a mano, fuera del hook (la pista es un elemento del DOM, no estado de React). */
const desplazarA = (elemento: HTMLElement, izquierda: number) => {
  elemento.scrollLeft = izquierda;
};

interface Arrastre {
  x: number;
  desde: number;
  inicio: number;
  movido: boolean;
}

/**
 * Arrastrar la pista del carrusel con el mouse, como en los carruseles de siempre (SCRUM-157).
 * El dedo ya desliza con el scroll-snap nativo: aquí solo se atiende `pointerType === 'mouse'`.
 *
 * Mientras se arrastra, la pista sigue al cursor sin imán (`arrastrando` quita el snap). Al soltar
 * pasa a la imagen vecina si se movió más del 15 % del ancho; si no, vuelve a la suya. Un
 * arrastre no abre el enlace de la imagen; un clic sin movimiento, sí. La captura del puntero se
 * toma recién cuando el mouse se movió, para que un clic normal llegue al enlace.
 */
export const useArrastreMouse = ({
  pista,
  total,
  alSoltar,
}: {
  pista: RefObject<HTMLElement | null>;
  total: number;
  /** Índice al que debe ir la pista al soltar. */
  alSoltar: (indice: number) => void;
}) => {
  const arrastre = useRef<Arrastre | null>(null);
  const recienArrastrado = useRef(false);
  const [arrastrando, setArrastrando] = useState(false);

  const terminar = (evento: PointerEvent<HTMLElement>) => {
    const actual = arrastre.current;
    arrastre.current = null;
    if (!actual) return;
    if (evento.currentTarget.hasPointerCapture?.(evento.pointerId)) {
      evento.currentTarget.releasePointerCapture(evento.pointerId);
    }
    setArrastrando(false);
    if (!actual.movido) return;
    recienArrastrado.current = true;
    const ancho = pista.current?.clientWidth ?? 0;
    const delta = evento.clientX - actual.x;
    const umbral = ancho * FRACCION_PARA_PASAR;
    const salto = delta < -umbral ? 1 : delta > umbral ? -1 : 0;
    alSoltar(Math.min(total - 1, Math.max(0, actual.inicio + salto)));
  };

  return {
    arrastrando,
    manejadores: {
      onPointerDown: (evento: PointerEvent<HTMLElement>) => {
        const elemento = pista.current;
        if (
          evento.pointerType !== 'mouse' ||
          evento.button !== 0 ||
          total < 2 ||
          !elemento
        ) {
          return;
        }
        const ancho = elemento.clientWidth || 1;
        arrastre.current = {
          x: evento.clientX,
          desde: elemento.scrollLeft,
          inicio: Math.round(elemento.scrollLeft / ancho),
          movido: false,
        };
      },
      onPointerMove: (evento: PointerEvent<HTMLElement>) => {
        const actual = arrastre.current;
        const elemento = pista.current;
        if (!actual || !elemento) return;
        const delta = evento.clientX - actual.x;
        if (!actual.movido) {
          if (Math.abs(delta) < UMBRAL_ARRASTRE) return;
          arrastre.current = { ...actual, movido: true };
          setArrastrando(true);
          evento.currentTarget.setPointerCapture?.(evento.pointerId);
        }
        desplazarA(elemento, actual.desde - delta);
      },
      onPointerUp: terminar,
      onPointerCancel: terminar,
      // Después de arrastrar, el clic que dispara el navegador no abre el enlace
      onClickCapture: (evento: MouseEvent<HTMLElement>) => {
        if (!recienArrastrado.current) return;
        recienArrastrado.current = false;
        evento.preventDefault();
        evento.stopPropagation();
      },
      // Sin el arrastre nativo de imágenes y enlaces (la miniatura fantasma)
      onDragStart: (evento: MouseEvent<HTMLElement>) => evento.preventDefault(),
    },
  };
};
