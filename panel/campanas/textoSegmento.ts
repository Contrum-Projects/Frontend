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
  const partes = [tipos];
  if (compras.length > 0) {
    partes.push(
      `compraron en ${compras.length <= 1 ? compras[0] : `${compras.slice(0, -1).join(', ')} o ${compras.at(-1)}`}`,
    );
  }
  return [...partes, ...textoFiltros(segmento)].join(' · ');
};

const pesos = (monto: number) => `$${monto.toLocaleString('es-CL')}`;
const plural = (cantidad: number, uno: string, varios: string) =>
  `${cantidad} ${cantidad === 1 ? uno : varios}`;

/** Un rango «de 2 a 5», «desde 2» o «hasta 5»; vacío sin ninguno. */
const rango = (
  desde: number | null,
  hasta: number | null,
  formato: (valor: number) => string = String,
): string | null => {
  if (desde !== null && hasta !== null)
    return `de ${formato(desde)} a ${formato(hasta)}`;
  if (desde !== null) return `desde ${formato(desde)}`;
  if (hasta !== null) return `hasta ${formato(hasta)}`;
  return null;
};

/** Los filtros de cuenta en palabras cortas (SCRUM-150), en el orden del formulario. */
const textoFiltros = (s: SegmentoGuardado): string[] => {
  const pedidos = rango(s.pedidosMinimo, s.pedidosMaximo);
  const gasto = rango(s.gastoMinimo, s.gastoMaximo, pesos);
  const edad = rango(s.edadMinima, s.edadMaxima);
  const lugares = [
    s.regiones.length > 0 && plural(s.regiones.length, 'región', 'regiones'),
    s.comunas.length > 0 && plural(s.comunas.length, 'comuna', 'comunas'),
  ].filter(Boolean);
  return [
    s.compraEnUltimosDias !== null &&
      `compraron en los últimos ${plural(s.compraEnUltimosDias, 'día', 'días')}`,
    s.sinComprarHaceDias !== null &&
      `sin comprar hace más de ${plural(s.sinComprarHaceDias, 'día', 'días')}`,
    pedidos && `${pedidos} pedidos`,
    gasto && `gastaron ${gasto}`,
    lugares.length > 0 && `en ${lugares.join(' y ')}`,
    s.mesesCumpleanos.length > 0 &&
      `cumpleaños en ${plural(s.mesesCumpleanos.length, 'mes', 'meses')}`,
    edad && `${edad} años`,
    s.generos.length > 0 && s.generos.join(' o '),
    s.registroUltimosDias !== null &&
      `cuenta de los últimos ${plural(s.registroUltimosDias, 'día', 'días')}`,
    s.registroHaceMasDias !== null &&
      `cuenta de hace más de ${plural(s.registroHaceMasDias, 'día', 'días')}`,
    s.conCarrito && 'con productos en el carrito',
  ].filter((parte): parte is string => typeof parte === 'string');
};
