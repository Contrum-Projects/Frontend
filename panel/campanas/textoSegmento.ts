'use client';

import { useMemo } from 'react';
import type { components } from '@/compartido/api/esquema';
import type { CategoriaTienda } from '@/compartido/api/respuestas';
import { useCategorias, useMarcas } from '@/panel/catalogo/consultasCatalogo';

/** El segmento guardado de una campaña, como lo entrega el backend (SCRUM-150). */
export type SegmentoGuardado = components['schemas']['SegmentoGuardadoDto'];
export type TipoDestinatario = SegmentoGuardado['tipos'][number];

/**
 * Nombre de cada tipo de destinatario en el panel. Los valores son los de
 * `TIPOS_DESTINATARIO_CAMPANA` del backend (`src/common/dominio/valores.ts`).
 */
export const NOMBRES_TIPO: Record<TipoDestinatario, string> = {
  cliente: 'Clientes',
  profesional: 'Profesionales',
  suscriptor: 'Suscriptores sin cuenta',
};

/** Ids → nombre de las categorías (con sus subcategorías) y de las marcas. */
export interface NombresCatalogo {
  categorias: ReadonlyMap<number, string>;
  marcas: ReadonlyMap<number, string>;
}

const aplanar = (categorias: CategoriaTienda[]): [number, string][] =>
  categorias.flatMap((categoria) => [
    [categoria.id, categoria.nombre] as [number, string],
    ...aplanar(categoria.subcategorias),
  ]);

/** Los nombres para mostrar un segmento. Mientras cargan, los mapas vienen vacíos. */
export const useNombresCatalogo = (): NombresCatalogo => {
  const categorias = useCategorias();
  const marcas = useMarcas();
  return useMemo(
    () => ({
      categorias: new Map(aplanar(categorias.data ?? [])),
      marcas: new Map(
        (marcas.data ?? []).map((marca) => [marca.id, marca.nombre]),
      ),
    }),
    [categorias.data, marcas.data],
  );
};

const lista = (partes: string[]) =>
  partes.length <= 1
    ? (partes[0] ?? '')
    : `${partes.slice(0, -1).join(', ')} y ${partes.at(-1)}`;

/**
 * «Clientes y Profesionales · compraron en Coloración o L'Oréal». Solo arma el texto: a quién llega
 * de verdad lo decide el backend. Una categoría o marca que no está en la lista (desactivada) se
 * nombra por su id.
 */
export const textoSegmento = (
  segmento: SegmentoGuardado,
  nombres: NombresCatalogo,
): string => {
  const tipos = lista(segmento.tipos.map((tipo) => NOMBRES_TIPO[tipo]));
  const compras = [
    ...segmento.categorias.map(
      (id) => nombres.categorias.get(id) ?? `la categoría ${id}`,
    ),
    ...segmento.marcas.map((id) => nombres.marcas.get(id) ?? `la marca ${id}`),
  ];
  if (compras.length === 0) return tipos;
  const filtro = `compraron en ${compras.length <= 1 ? compras[0] : `${compras.slice(0, -1).join(', ')} o ${compras.at(-1)}`}`;
  return `${tipos} · ${filtro}`;
};
