'use client';

import { TriangleAlert } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import { useSesion } from '@/compartido/sesion/sesion';
import { PERMISOS, tienePermiso } from '@/compartido/sesion/roles';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Skeleton } from '@/compartido/ui/skeleton';
import { useStockBajoMinimo } from '@/panel/inventario/consultasStock';
import { FormatosBajoMinimo } from '@/panel/inventario/formatosBajoMinimo';

const RUTA_INVENTARIO: Route = '/panel/inventario';

/** El resumen muestra los que más faltan; el indicador dice cuántos son en total. */
const MAXIMO_FILAS = 5;

const TITULO = 'Stock bajo el mínimo';
const CONTENEDOR = 'flex flex-col gap-4 lg:gap-6';
const GRILLA_INDICADORES = 'grid grid-cols-2 gap-4 lg:grid-cols-4';
const TARJETA =
  'flex flex-col gap-3 rounded-lg border bg-card p-4 lg:max-w-md lg:p-6';

/** «4 · Formatos con stock bajo» en color de aviso (Figma P1 2028:571 y celular). */
const IndicadorStockBajo = ({ total }: { total: number }) => (
  <div className="flex flex-col items-start gap-3 rounded-lg bg-estado-aviso-fondo p-4 text-estado-aviso-texto lg:flex-row lg:items-center lg:gap-4 lg:p-6">
    <TriangleAlert aria-hidden className="size-6 shrink-0" strokeWidth={1.75} />
    <p className="flex flex-col">
      <span className="titulo-h2 tabular-nums">{total}</span>
      <span className="texto-leyenda">Formatos con stock bajo</span>
    </p>
  </div>
);

const FILAS_ESQUELETO = [0, 1, 2, 3, 4];

/** Con la estructura del indicador y de la tarjeta, para que nada salte al cargar (RNF-17). */
const EsqueletoStockBajo = () => (
  <div aria-hidden className={CONTENEDOR}>
    <div className={GRILLA_INDICADORES}>
      <Skeleton className="h-28 rounded-lg lg:h-24" />
    </div>
    <div className={TARJETA}>
      <Skeleton className="h-10 w-48 max-w-full" />
      {FILAS_ESQUELETO.map((fila) => (
        <Skeleton key={fila} className="h-11" />
      ))}
    </div>
  </div>
);

/**
 * Aviso de stock bajo del Resumen (E11-H6 criterios 1 y 3): el indicador con el total y la
 * tarjeta con los formatos que más faltan. Sin formatos bajo el mínimo no se muestra nada.
 * Solo para bodega y administración (decisión del backend del 28-10-2026); al resto no se le
 * pide nada.
 */
export const AvisoStockBajo = () => {
  const { estado, usuario } = useSesion();
  const permitido = tienePermiso(usuario?.rol, PERMISOS.INVENTARIO_REGISTRAR);
  const consulta = useStockBajoMinimo(permitido);

  if (estado === 'desconocida') return <EsqueletoStockBajo />;
  if (!permitido) return null;
  if (consulta.isPending) return <EsqueletoStockBajo />;
  if (consulta.isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{consulta.error.message}</AlertDescription>
      </Alert>
    );
  }

  const formatos = consulta.data;
  if (formatos.length === 0) return null;
  const filas = formatos.slice(0, MAXIMO_FILAS);

  return (
    <div className={CONTENEDOR}>
      <div className={GRILLA_INDICADORES}>
        <IndicadorStockBajo total={formatos.length} />
      </div>
      <section aria-labelledby="titulo-stock-bajo" className={TARJETA}>
        <div className="flex items-center justify-between gap-3">
          <h2
            id="titulo-stock-bajo"
            className="texto-cuerpo-fuerte text-texto-principal"
          >
            {TITULO}
          </h2>
          <Link
            href={RUTA_INVENTARIO}
            className="inline-flex min-h-10 items-center texto-etiqueta whitespace-nowrap text-marca-profundo underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-profundo"
          >
            <span className="max-lg:hidden">Ver inventario</span>
            <span className="lg:hidden">Ver todo</span>
          </Link>
        </div>
        <FormatosBajoMinimo filas={filas} etiqueta={TITULO} />
      </section>
    </div>
  );
};
