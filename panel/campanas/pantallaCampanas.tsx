'use client';

import { Plus } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import { cn } from '@/compartido/lib/utils';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Button } from '@/compartido/ui/button';
import { Skeleton } from '@/compartido/ui/skeleton';
import { useCampanas } from './consultasCampanas';
import {
  ContadoresContactos,
  ListaCampanasCelular,
  TablaCampanas,
} from './listaCampanas';
import { TarjetaCumpleanos } from './tarjetaCumpleanos';

export const RUTA_CAMPANAS: Route = '/panel/campanas';
export const RUTA_CAMPANA_NUEVA: Route = '/panel/campanas/nueva';

/**
 * «Campañas» (Figma P7 2045:1569 y 2047:1225, E12-H3): contactos con consentimiento y campañas
 * con su segmento, destinatarios, estado y apertura; y el saludo de cumpleaños (E12-H5), a la
 * derecha de la lista en escritorio y sobre ella en celular.
 */
export function PantallaCampanas() {
  return (
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-6">
      <div className="col-span-full flex items-center justify-between gap-3">
        <h1 className="titulo-h2 text-texto-principal">Campañas</h1>
        <Button asChild>
          <Link href={RUTA_CAMPANA_NUEVA}>
            <Plus aria-hidden className="lg:hidden" />
            Nueva<span className="max-lg:sr-only"> campaña</span>
          </Link>
        </Button>
      </div>
      <ContenidoCampanas />
    </div>
  );
}

/** Celular: contadores, saludo y lista. Escritorio: la lista y el saludo, uno al lado del otro. */
const CLASE_LISTA = 'lg:col-start-1 lg:row-start-3';
const CLASE_SALUDO = 'lg:col-start-2 lg:row-start-3';

const ContenidoCampanas = () => {
  const consulta = useCampanas();
  // El saludo tiene su propia consulta: se ve aunque la lista falle o siga cargando
  const saludo = (
    <div key="saludo" className={CLASE_SALUDO}>
      <TarjetaCumpleanos />
    </div>
  );

  if (consulta.isPending) {
    return (
      <>
        <EsqueletoContadores />
        {saludo}
        <EsqueletoLista />
      </>
    );
  }
  if (consulta.isError) {
    return (
      <>
        <Alert variant="destructive" className="col-span-full">
          <AlertDescription>{consulta.error.message}</AlertDescription>
        </Alert>
        {saludo}
      </>
    );
  }
  const { contactos, campanas } = consulta.data;
  return (
    <>
      <div className="col-span-full">
        <ContadoresContactos contactos={contactos} />
      </div>
      {saludo}
      <section
        aria-labelledby="titulo-lista-campanas"
        className={cn(
          'flex flex-col gap-3 rounded-lg border bg-card px-4 py-1 lg:p-6',
          CLASE_LISTA,
        )}
      >
        <h2
          id="titulo-lista-campanas"
          className="texto-cuerpo-fuerte text-texto-principal max-lg:sr-only"
        >
          Campañas
        </h2>
        {campanas.length === 0 ? (
          <p className="py-3 texto-pequeno text-texto-secundario">
            Aún no hay campañas. Crea la primera con «Nueva campaña».
          </p>
        ) : (
          <>
            <div className="max-lg:hidden">
              <TablaCampanas campanas={campanas} />
            </div>
            <div className="lg:hidden">
              <ListaCampanasCelular campanas={campanas} />
            </div>
          </>
        )}
      </section>
    </>
  );
};

const FILAS_ESQUELETO = [0, 1, 2];

/** Con la estructura de los contadores y de la lista, para que nada salte al cargar (RNF-17). */
const EsqueletoContadores = () => (
  <div aria-hidden className="col-span-full">
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      {[0, 1, 2, 3].map((contador) => (
        // Misma caja que cada contador: número (titulo-h3) y texto en una o dos líneas
        <div
          key={contador}
          className="flex flex-col gap-1 rounded-lg border bg-card p-4"
        >
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3 lg:hidden" />
        </div>
      ))}
    </div>
  </div>
);

const EsqueletoLista = () => (
  <div aria-hidden className={CLASE_LISTA}>
    <div className="flex flex-col rounded-lg border bg-card px-4 py-1 lg:p-6">
      {/* Título de la tarjeta y cabecera de la tabla */}
      <div className="h-16 max-lg:hidden" />
      {FILAS_ESQUELETO.map((fila) => (
        <div
          key={fila}
          className="flex items-center gap-3 border-t py-3 first:border-t-0 lg:first:border-t"
        >
          <div className="flex flex-1 flex-col gap-1">
            <Skeleton className="h-4 w-48 max-w-full" />
            <Skeleton className="h-3 w-32 max-w-full" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  </div>
);
