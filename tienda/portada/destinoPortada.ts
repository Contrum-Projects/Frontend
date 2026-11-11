import type { Route } from 'next';
import type { UrlObject } from 'node:url';
import type { components } from '@/compartido/api/esquema';
import {
  RUTAS,
  urlCatalogo,
  urlPack,
  urlProducto,
} from '@/tienda/diseno/enlaces';

/** Slide de la portada tal como lo entrega `GET /api/portada` (SCRUM-157). */
export type SlidePortada = components['schemas']['SlidePortadaDto'];
export type DestinoSlide = components['schemas']['DestinoSlideDto'];
export type TipoDestino = DestinoSlide['tipo'];

/** Páginas que el backend acepta como destino (`PAGINAS_PORTADA`) y su ruta en la tienda. */
const RUTAS_PAGINAS: Readonly<Record<string, Route>> = {
  catalogo: RUTAS.catalogo,
  packs: RUTAS.packs,
  'precio-profesional': RUTAS.precioProfesional,
};

const id = (destino: string): number | null => {
  const numero = Number(destino);
  return Number.isInteger(numero) && numero > 0 ? numero : null;
};

/**
 * A dónde lleva el slide. El backend ya eligió solo destinos a la venta; aquí se arma la ruta de
 * la tienda. Un destino que esta versión del frontend no conoce devuelve `null` y el slide no se
 * muestra (mejor sin slide que con un enlace roto).
 */
export const hrefDestino = (
  destino: Pick<DestinoSlide, 'tipo' | 'destino'>,
): Route | UrlObject | null => {
  if (destino.tipo === 'pagina') return RUTAS_PAGINAS[destino.destino] ?? null;
  const numero = id(destino.destino);
  if (numero === null) return null;
  switch (destino.tipo) {
    case 'producto':
      return urlProducto(numero);
    case 'pack':
      return urlPack(numero);
    case 'categoria':
      return urlCatalogo({ categoria: numero });
    case 'marca':
      return urlCatalogo({ marca: numero });
    default:
      return null;
  }
};

/** Cómo se nombra cada tipo de destino en el panel. */
export const NOMBRES_TIPO_DESTINO: Readonly<Record<TipoDestino, string>> = {
  producto: 'Producto',
  pack: 'Pack',
  categoria: 'Categoría',
  marca: 'Marca',
  pagina: 'Página',
};
