'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { useState } from 'react';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Button } from '@/compartido/ui/button';
import { Skeleton } from '@/compartido/ui/skeleton';
import {
  FILTROS_VACIOS,
  useEntradas,
  type FiltrosEntradas as Filtros,
} from './consultasEntradas';
import { FiltrosEntradas } from './filtrosEntradas';
import { ListaEntradasCelular, TablaEntradas } from './listaEntradas';
import { PestanasInventario } from './pestanasInventario';

export const RUTA_ENTRADA_NUEVA: Route = '/panel/inventario/entradas/nueva';

/**
 * «Inventario · Entradas» (Figma P5e 2064:2663 y 2069:1703, E11-H2 criterio 1): lo recibido de
 * los proveedores. Escritorio: tabla con los filtros dentro de la tarjeta; celular: botón
 * ancho, filtros y lista.
 */
export function PantallaEntradas() {
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_VACIOS);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="titulo-h2 text-texto-principal">Inventario</h1>
        <Button asChild className="max-lg:hidden">
          <Link href={RUTA_ENTRADA_NUEVA}>Nueva entrada</Link>
        </Button>
      </div>
      <PestanasInventario />
      <Button asChild className="w-full max-lg:min-h-10 lg:hidden">
        <Link href={RUTA_ENTRADA_NUEVA}>Nueva entrada</Link>
      </Button>
      <div className="flex flex-col gap-4 lg:gap-3 lg:rounded-lg lg:border lg:bg-card lg:p-4">
        <FiltrosEntradas filtros={filtros} alCambiar={setFiltros} />
        <Entradas filtros={filtros} />
      </div>
    </div>
  );
}

const hayFiltros = (filtros: Filtros) =>
  Object.values(filtros).some((valor) => valor !== '');

const Entradas = ({ filtros }: { filtros: Filtros }) => {
  const consulta = useEntradas(filtros);

  if (consulta.isPending) return <EsqueletoEntradas />;
  if (consulta.isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{consulta.error.message}</AlertDescription>
      </Alert>
    );
  }

  const { items, total } = consulta.data;
  const anuncio =
    total === 1 ? '1 entrada encontrada.' : `${total} entradas encontradas.`;

  return (
    <>
      {/* Anuncia el resultado de los filtros a los lectores de pantalla */}
      <p aria-live="polite" className="sr-only">
        {hayFiltros(filtros) && anuncio}
      </p>
      {items.length === 0 ? (
        <p className="py-3 texto-pequeno text-texto-secundario">
          {hayFiltros(filtros)
            ? 'Ninguna entrada coincide con los filtros.'
            : 'Aún no hay entradas registradas.'}
        </p>
      ) : (
        <>
          <div className="max-lg:hidden">
            <TablaEntradas entradas={items} />
          </div>
          <div className="rounded-lg border bg-card px-4 py-1 lg:hidden">
            <ListaEntradasCelular entradas={items} />
          </div>
        </>
      )}
      {total > items.length && (
        <p className="texto-leyenda text-texto-secundario">
          Se muestran las {items.length} más recientes de {total}: usa los
          filtros para encontrar otras.
        </p>
      )}
    </>
  );
};

const FILAS_ESQUELETO = [0, 1, 2];

/** Con la estructura de la tabla y de la lista, para que nada salte al cargar (RNF-17). */
const EsqueletoEntradas = () => (
  <div aria-hidden>
    <div className="flex flex-col max-lg:hidden">
      <div className="h-10" />
      {FILAS_ESQUELETO.map((fila) => (
        <div key={fila} className="flex gap-4 border-t px-3 py-3">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-5 flex-1" />
          {/* Ubicación: código y bodega */}
          <div className="flex w-24 flex-col gap-1">
            <Skeleton className="h-5" />
            <Skeleton className="h-4" />
          </div>
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-24" />
        </div>
      ))}
    </div>
    <div className="rounded-lg border bg-card px-4 py-1 lg:hidden">
      {FILAS_ESQUELETO.map((fila) => (
        <div
          key={fila}
          className="flex flex-col gap-1 border-t py-3 first:border-t-0"
        >
          <Skeleton className="h-4 w-48 max-w-full" />
          <Skeleton className="h-4 w-56 max-w-full" />
          <Skeleton className="h-4 w-32 max-w-full" />
        </div>
      ))}
    </div>
  </div>
);
