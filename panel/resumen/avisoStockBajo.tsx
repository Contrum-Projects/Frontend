'use client';

import { TriangleAlert } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import type { FormatoBajoMinimo } from '@/compartido/api/respuestas';
import { useSesion } from '@/compartido/sesion/sesion';
import { PERMISOS, tienePermiso } from '@/compartido/sesion/roles';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Skeleton } from '@/compartido/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/compartido/ui/table';
import { useStockBajoMinimo } from '@/panel/inventario/consultasStock';
import { CifraStock } from '@/panel/inventario/listaStock';
import { nombreFormato } from '@/panel/inventario/tiposMovimiento';

const RUTA_INVENTARIO: Route = '/panel/inventario';

/** El resumen muestra los que más faltan; el indicador dice cuántos son en total. */
const MAXIMO_FILAS = 5;

const TITULO = 'Stock bajo el mínimo';
const CONTENEDOR = 'flex flex-col gap-4 lg:gap-6';
const GRILLA_INDICADORES = 'grid grid-cols-2 gap-4 lg:grid-cols-4';
const TARJETA =
  'flex flex-col gap-3 rounded-lg border bg-card p-4 lg:max-w-md lg:p-6';
const CABECERA = 'h-auto px-3 py-2 texto-leyenda text-texto-secundario';
const CELDA = 'px-3 py-3 align-middle whitespace-normal';

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

/** «2 / mín. 5» en una píldora de aviso (Figma P1 celular). */
const PildoraAviso = ({ children }: { children: ReactNode }) => (
  <span className="inline-flex min-w-7 justify-center rounded-full bg-estado-aviso-fondo px-2 py-0.5 texto-leyenda font-medium whitespace-nowrap text-estado-aviso-texto tabular-nums">
    {children}
  </span>
);

/** Escritorio (Figma P1 2028:682): formato, stock y mínimo. */
const TablaStockBajo = ({ filas }: { filas: FormatoBajoMinimo[] }) => (
  <Table aria-label={TITULO} className="max-lg:hidden">
    <TableHeader className="[&_tr]:border-0">
      <TableRow className="bg-marca-acento-suave hover:bg-marca-acento-suave">
        <TableHead className={`rounded-l-lg ${CABECERA}`}>Formato</TableHead>
        <TableHead className={`w-16 text-right ${CABECERA}`}>Stock</TableHead>
        <TableHead className={`w-16 rounded-r-lg text-right ${CABECERA}`}>
          Mínimo
        </TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {filas.map((fila) => (
        <TableRow
          key={fila.formatoId}
          className="border-t border-b-0 hover:bg-transparent"
        >
          <TableCell
            className={`texto-etiqueta break-words text-texto-principal ${CELDA}`}
          >
            {nombreFormato(fila)}
          </TableCell>
          <TableCell className={`text-right ${CELDA}`}>
            <CifraStock stock={fila.stockTotal} bajoMinimo />
          </TableCell>
          <TableCell
            className={`text-right texto-pequeno text-texto-principal tabular-nums ${CELDA}`}
          >
            {fila.stockMinimo}
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

/** Celular (Figma P1 2023:206): producto, formato y «2 / mín. 5». */
const ListaStockBajo = ({ filas }: { filas: FormatoBajoMinimo[] }) => (
  <ul aria-label={TITULO} className="flex flex-col gap-3 lg:hidden">
    {filas.map((fila) => (
      <li key={fila.formatoId} className="flex items-center gap-3">
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="texto-cuerpo-fuerte break-words text-texto-principal">
            {fila.producto}
          </span>
          <span className="texto-leyenda break-words text-texto-secundario">
            {fila.nombreFormato}
          </span>
        </span>
        <PildoraAviso>
          {fila.stockTotal} / mín. {fila.stockMinimo}
        </PildoraAviso>
      </li>
    ))}
  </ul>
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
        <TablaStockBajo filas={filas} />
        <ListaStockBajo filas={filas} />
      </section>
    </div>
  );
};
