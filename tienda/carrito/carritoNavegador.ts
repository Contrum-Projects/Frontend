'use client';

import { useSyncExternalStore } from 'react';
import { z } from 'zod';

/**
 * Carrito del visitante (E5-H2): vive en el navegador y la API no lo guarda. Solo lleva el
 * artículo y su cantidad, sin precios ni datos de la persona: los precios y el stock los da
 * `POST /api/carrito/cotizar` al mostrarlo (RNF-03). Sobrevive a cerrar el navegador
 * (localStorage) y se mantiene igual en todas las pestañas. Al iniciar sesión se une al de la
 * cuenta y se quita de aquí (<UnionCarrito>).
 */

export interface ArticuloNavegador {
  /** Id del formato o del pack. */
  articuloId: number;
  cantidad: number;
}

/** Tope técnico del backend por artículo (`MAXIMO_UNIDADES_LINEA`); el stock lo revisa él. */
export const MAXIMO_UNIDADES_LINEA = 999;
/** Artículos distintos que acepta el backend (`MAXIMO_ARTICULOS_NAVEGADOR`). */
export const MAXIMO_ARTICULOS_NAVEGADOR = 50;

const CLAVE = 'cp:carrito';

const esquemaGuardado = z.object({
  version: z.literal(1),
  articulos: z.array(z.unknown()),
});

const esquemaArticulo = z.object({
  articuloId: z.number().int().positive(),
  cantidad: z.number().int().min(1).max(MAXIMO_UNIDADES_LINEA),
});

/** Entre 1 y el tope; lo que no es un número entero queda en 1. */
const acotar = (cantidad: number) =>
  Number.isInteger(cantidad)
    ? Math.min(Math.max(cantidad, 1), MAXIMO_UNIDADES_LINEA)
    : 1;

const VACIO: readonly ArticuloNavegador[] = [];

let instantanea: readonly ArticuloNavegador[] | null = null;
const escuchas = new Set<() => void>();

/**
 * Lo guardado; vacío si no hay, si no se entiende o si el navegador bloquea el almacenamiento.
 * Una entrada dañada o repetida se descarta sola, sin perder el resto (el backend rechaza la
 * lista entera con repetidos o con más de 50).
 */
const leerGuardado = (): readonly ArticuloNavegador[] => {
  try {
    const texto = window.localStorage.getItem(CLAVE);
    if (!texto) return VACIO;
    const resultado = esquemaGuardado.safeParse(JSON.parse(texto));
    if (!resultado.success) return VACIO;
    const vistos = new Set<number>();
    const articulos = resultado.data.articulos.flatMap((entrada) => {
      const articulo = esquemaArticulo.safeParse(entrada);
      if (!articulo.success || vistos.has(articulo.data.articuloId)) return [];
      vistos.add(articulo.data.articuloId);
      return [articulo.data];
    });
    return articulos.length === 0
      ? VACIO
      : articulos.slice(0, MAXIMO_ARTICULOS_NAVEGADOR);
  } catch {
    return VACIO;
  }
};

const avisar = () => escuchas.forEach((escucha) => escucha());

const guardar = (articulos: readonly ArticuloNavegador[]) => {
  instantanea = articulos.length === 0 ? VACIO : articulos;
  try {
    if (articulos.length === 0) window.localStorage.removeItem(CLAVE);
    else
      window.localStorage.setItem(
        CLAVE,
        JSON.stringify({ version: 1, articulos }),
      );
  } catch {
    // Sin almacenamiento (modo privado, bloqueado): sigue en memoria mientras la pestaña viva
  }
  avisar();
};

/** Otra pestaña cambió el carrito. */
const alCambiarEnOtraPestana = (evento: StorageEvent) => {
  if (evento.key !== null && evento.key !== CLAVE) return;
  instantanea = leerGuardado();
  avisar();
};

export const leerCarritoNavegador = (): readonly ArticuloNavegador[] => {
  instantanea ??= leerGuardado();
  return instantanea;
};

/** Vuelve a leer lo guardado, por si otra pestaña lo cambió (la unión lo usa con su bloqueo). */
export const releerCarritoNavegador = (): readonly ArticuloNavegador[] => {
  instantanea = leerGuardado();
  return instantanea;
};

const suscribir = (escucha: () => void) => {
  if (escuchas.size === 0) {
    window.addEventListener('storage', alCambiarEnOtraPestana);
  }
  escuchas.add(escucha);
  return () => {
    escuchas.delete(escucha);
    if (escuchas.size === 0) {
      window.removeEventListener('storage', alCambiarEnOtraPestana);
    }
  };
};

export const useCarritoNavegador = (): readonly ArticuloNavegador[] =>
  useSyncExternalStore(suscribir, leerCarritoNavegador, () => VACIO);

/**
 * Suma unidades a un artículo, como el carrito de la cuenta. Devuelve el mensaje del backend si
 * ya hay 50 artículos distintos; si no, `null`.
 */
export const agregarAlCarritoNavegador = ({
  articuloId,
  cantidad,
}: ArticuloNavegador): string | null => {
  const actual = leerCarritoNavegador();
  const existente = actual.find((a) => a.articuloId === articuloId);
  if (!existente) {
    if (actual.length >= MAXIMO_ARTICULOS_NAVEGADOR) {
      return `El carrito tiene hasta ${MAXIMO_ARTICULOS_NAVEGADOR} artículos distintos.`;
    }
    guardar([...actual, { articuloId, cantidad: acotar(cantidad) }]);
    return null;
  }
  guardar(
    actual.map((a) =>
      a.articuloId === articuloId
        ? {
            articuloId,
            cantidad: acotar(a.cantidad + cantidad),
          }
        : a,
    ),
  );
  return null;
};

export const cambiarCantidadNavegador = (
  articuloId: number,
  cantidad: number,
): void => {
  guardar(
    leerCarritoNavegador().map((a) =>
      a.articuloId === articuloId
        ? { articuloId, cantidad: acotar(cantidad) }
        : a,
    ),
  );
};

export const quitarDelCarritoNavegador = (articuloId: number): void => {
  guardar(leerCarritoNavegador().filter((a) => a.articuloId !== articuloId));
};

/**
 * Quita lo que ya se unió a la cuenta. Si mientras tanto se agregaron unidades o artículos,
 * quedan esas, para unirlas en el próximo ingreso.
 */
export const descontarDelCarritoNavegador = (
  unidos: readonly ArticuloNavegador[],
): void => {
  const enviadas = new Map(unidos.map((a) => [a.articuloId, a.cantidad]));
  guardar(
    releerCarritoNavegador().flatMap((a) => {
      const cantidad = a.cantidad - (enviadas.get(a.articuloId) ?? 0);
      return cantidad > 0 ? [{ articuloId: a.articuloId, cantidad }] : [];
    }),
  );
};

/** Solo para pruebas: olvida la lectura en memoria. */
export const reiniciarCarritoNavegadorParaPruebas = (): void => {
  instantanea = null;
};
