'use client';

import { Plus } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Button } from '@/compartido/ui/button';
import { Skeleton } from '@/compartido/ui/skeleton';
import { useCampanas } from './consultasCampanas';
import {
  ContadoresContactos,
  ListaCampanasCelular,
  TablaCampanas,
} from './listaCampanas';

export const RUTA_CAMPANAS: Route = '/panel/campanas';
export const RUTA_CAMPANA_NUEVA: Route = '/panel/campanas/nueva';

/**
 * «Campañas» (Figma P7 2045:1569 y 2047:1225, E12-H3): contactos con consentimiento y campañas
 * con su segmento, destinatarios, estado y apertura. La tarjeta del saludo de cumpleaños llega
 * con SCRUM-141.
 */
export function PantallaCampanas() {
  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      <div className="flex items-center justify-between gap-3">
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

const ContenidoCampanas = () => {
  const consulta = useCampanas();

  if (consulta.isPending) return <EsqueletoCampanas />;
  if (consulta.isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{consulta.error.message}</AlertDescription>
      </Alert>
    );
  }
  const { contactos, campanas } = consulta.data;
  return (
    <>
      <ContadoresContactos contactos={contactos} />
      <section
        aria-labelledby="titulo-lista-campanas"
        className="flex flex-col gap-3 rounded-2xl border bg-card px-4 py-1 lg:p-6"
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
const EsqueletoCampanas = () => (
  <div aria-hidden className="flex flex-col gap-4 lg:gap-6">
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      {[0, 1, 2, 3].map((contador) => (
        <Skeleton key={contador} className="h-20 rounded-2xl" />
      ))}
    </div>
    <div className="flex flex-col rounded-2xl border bg-card px-4 py-1 lg:p-6">
      <div className="h-12 max-lg:hidden" />
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
