'use client';

import type { ReactNode } from 'react';
import {
  useEsProfesional,
  useProductosProfesional,
} from '@/tienda/profesional/consultasProfesional';
import {
  ItemsFila,
  MarcoFila,
  POR_FILA,
  type FilaProductosProps,
} from './marcoFila';

/**
 * Fila del inicio según quién mira (SCRUM-109 criterio 2): visitantes y clientes ven la del
 * servidor (`children`); el profesional, la misma fila pedida con su token. Como la del servidor,
 * si falla o no trae productos no se muestra.
 */
export function FilaSegunRol({
  children,
  ...fila
}: FilaProductosProps & { children: ReactNode }) {
  const esProfesional = useEsProfesional();
  const { data, isPending } = useProductosProfesional({
    orden: fila.orden,
    limite: POR_FILA,
  });
  if (!esProfesional) return children;
  if (isPending) return <MarcoFila {...fila} profesional />;
  if (!data || data.items.length === 0) return null;
  return (
    <MarcoFila {...fila}>
      <ItemsFila {...fila} productos={data.items} />
    </MarcoFila>
  );
}
