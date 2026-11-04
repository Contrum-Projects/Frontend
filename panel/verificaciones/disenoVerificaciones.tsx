'use client';

import { useSelectedLayoutSegment } from 'next/navigation';
import type { ReactNode } from 'react';
import { cn } from '@/compartido/lib/utils';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Button } from '@/compartido/ui/button';
import { useEsEscritorio } from '@/panel/inventario/consultasStock';
import { useSolicitudesEnRevision } from './consultasVerificaciones';
import {
  EsqueletoVerificaciones,
  ListaVerificaciones,
} from './listaVerificaciones';

/**
 * P4 Verificaciones (Figma 2029:872; celular 2025:481, E10-H3). Es el layout de
 * `/panel/verificaciones`: la lista queda montada al abrir otra solicitud. En escritorio la
 * revisión (`children`) va al lado; en celular, con una solicitud abierta solo se ve la revisión.
 */
export function DisenoVerificaciones({ children }: { children: ReactNode }) {
  const elegida = useSelectedLayoutSegment();
  const esEscritorio = useEsEscritorio();
  // En celular, con una solicitud abierta la lista no se ve: no se pide
  const verLista = elegida === null || esEscritorio === true;
  const consulta = useSolicitudesEnRevision(verLista);
  const total = consulta.data?.total;

  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      {/* En celular, con una solicitud abierta el título visible es el nombre: este queda para lectores */}
      <h1
        className={cn(
          'titulo-h2 text-texto-principal',
          elegida && 'max-lg:sr-only',
        )}
      >
        Verificaciones
      </h1>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <section
          aria-labelledby="titulo-pendientes"
          aria-busy={consulta.isFetching || undefined}
          className={cn(
            'flex min-w-0 flex-col gap-2 rounded-lg border bg-card p-3 lg:w-80 lg:shrink-0',
            elegida && 'max-lg:hidden',
          )}
        >
          <h2
            id="titulo-pendientes"
            className="px-2 pt-1 texto-cuerpo-fuerte text-texto-principal"
          >
            Pendientes{total !== undefined && ` · ${total}`}
          </h2>
          <Lista consulta={consulta} elegida={elegida} />
        </section>
        <div className="min-w-0 lg:flex-1">{children}</div>
      </div>
    </div>
  );
}

const Lista = ({
  consulta,
  elegida,
}: {
  consulta: ReturnType<typeof useSolicitudesEnRevision>;
  elegida: string | null;
}) => {
  if (consulta.isPending) return <EsqueletoVerificaciones />;
  if (consulta.isError) {
    return (
      <div className="flex flex-col gap-3 p-2">
        <Alert variant="destructive">
          <AlertDescription>{consulta.error.message}</AlertDescription>
        </Alert>
        <Button
          variant="contorno"
          className="self-start"
          onClick={() => void consulta.refetch()}
        >
          Reintentar
        </Button>
      </div>
    );
  }

  const { items, total } = consulta.data;
  if (items.length === 0) {
    return (
      <p className="px-2 pb-2 texto-pequeno text-texto-secundario">
        No hay solicitudes por revisar.
      </p>
    );
  }
  return (
    <>
      <ListaVerificaciones solicitudes={items} elegida={elegida} />
      {total > items.length && (
        <p className="px-2 texto-leyenda text-texto-secundario">
          Se muestran {items.length} de {total} solicitudes.
        </p>
      )}
    </>
  );
};
