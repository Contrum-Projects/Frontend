import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import type {
  ProductoTienda,
  ProductoTiendaProfesional,
} from '@/compartido/api/respuestas';
import { cn } from '@/compartido/lib/utils';
import { urlCatalogo } from '@/tienda/diseno/enlaces';
import type { OrdenTienda } from './consultaFiltros';
import {
  TAMANOS_FOTO,
  TarjetaProducto,
  TarjetaProductoEsqueleto,
} from './tarjetaProducto';

/** Escritorio muestra 5 tarjetas en una fila (Figma › 01 Inicio). */
export const POR_FILA = 5;

export interface FilaProductosProps {
  titulo: string;
  orden: OrdenTienda;
  /** En celular: carrusel horizontal (Más vendidos) o grilla de 2 × 2 (Novedades). */
  celular: 'carrusel' | 'grilla';
  prioridad?: boolean;
}

/** Las tarjetas de la fila (los <li> de MarcoFila). */
export const ItemsFila = ({
  productos,
  celular,
  prioridad = false,
}: Pick<FilaProductosProps, 'celular' | 'prioridad'> & {
  productos: (ProductoTienda | ProductoTiendaProfesional)[];
}) =>
  productos.map((producto, i) => (
    <li key={producto.id} className={claseItem(celular, i)}>
      <TarjetaProducto
        producto={producto}
        tamanos={TAMANOS_FOTO.inicio}
        prioridad={prioridad}
      />
    </li>
  ));

const claseLista = (celular: FilaProductosProps['celular']) =>
  cn(
    'md:grid md:grid-cols-5 md:gap-6',
    celular === 'carrusel'
      ? '-mx-4 flex snap-x scroll-px-4 [scrollbar-width:none] gap-3 overflow-x-auto px-4 pb-1 md:mx-0 md:overflow-visible md:px-0'
      : 'grid grid-cols-2 gap-4',
  );

const claseItem = (celular: FilaProductosProps['celular'], i: number) =>
  cn(
    celular === 'carrusel' && 'w-[44%] shrink-0 snap-start md:w-auto',
    celular === 'grilla' && i >= 4 && 'hidden md:block',
  );

/**
 * Encabezado de la fila con «Ver todo» y la lista (los hijos son sus <li>). Sin hijos, muestra
 * tarjetas de carga con la misma forma, para que no salte al llegar los productos.
 */
export function MarcoFila({
  titulo,
  orden,
  celular,
  children,
  profesional = false,
}: Omit<FilaProductosProps, 'prioridad'> & {
  children?: ReactNode;
  /** Sin hijos: las tarjetas de carga con el precio profesional (SCRUM-109). */
  profesional?: boolean;
}) {
  return (
    <section
      aria-labelledby={`fila-${orden}`}
      className="mx-auto max-w-[1440px] px-4 pt-8 md:px-16 md:pt-12"
    >
      <div className="mb-3 flex items-center justify-between md:mb-6">
        <h2
          id={`fila-${orden}`}
          className="titulo-h3 text-texto-principal md:titulo-h2"
        >
          {titulo}
        </h2>
        <Link
          href={urlCatalogo({ orden })}
          aria-describedby={`fila-${orden}`}
          className="flex min-h-10 items-center gap-1 rounded-md texto-etiqueta text-marca-profundo hover:underline"
        >
          Ver todo
          <ArrowRight
            className="hidden size-4 md:block"
            strokeWidth={1.75}
            aria-hidden
          />
        </Link>
      </div>
      <ul className={claseLista(celular)} aria-hidden={!children || undefined}>
        {children ??
          Array.from({ length: POR_FILA }, (_, i) => (
            <li key={i} className={claseItem(celular, i)}>
              <TarjetaProductoEsqueleto profesional={profesional} />
            </li>
          ))}
      </ul>
    </section>
  );
}
