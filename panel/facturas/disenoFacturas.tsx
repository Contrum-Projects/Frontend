'use client';

import { useSelectedLayoutSegment } from 'next/navigation';
import type { ReactNode } from 'react';
import { cn } from '@/compartido/lib/utils';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Button } from '@/compartido/ui/button';
import { useEsEscritorio } from '@/panel/inventario/consultasStock';
import { PestanasPedidos } from '@/panel/pedidos/pestanasPedidos';
import { useFacturasPanel } from './consultasFacturas';
import {
  EsqueletoFacturas,
  TablaFacturas,
  TarjetasFacturas,
} from './listaFacturas';

/**
 * P2c Facturas por emitir (Figma 2050:2078; celular 2051:1443, E9-H3). Es el layout de
 * `/panel/pedidos/facturas`: la lista queda montada al abrir otro pedido. En escritorio, la
 * tarjeta de la factura (`children`) va al lado; en celular, con un pedido abierto solo se ve
 * la tarjeta.
 */
export function DisenoFacturas({ children }: { children: ReactNode }) {
  const codigo = useSelectedLayoutSegment();
  const esEscritorio = useEsEscritorio();
  // En celular, con un pedido abierto ni la lista ni las pestañas se ven: no se pide
  const verLista = codigo === null || esEscritorio === true;
  const consulta = useFacturasPanel(verLista);

  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      {/* Misma altura que la fila de Pedidos (con su buscador): las pestañas no saltan al cambiar */}
      <div className="flex flex-col lg:min-h-10 lg:justify-center">
        {/* En la tarjeta de celular el título visible es «Registrar factura»: este queda para lectores */}
        <h1
          className={cn(
            'titulo-h2 text-texto-principal',
            codigo && 'max-lg:sr-only',
          )}
        >
          Pedidos
        </h1>
      </div>
      {verLista && <PestanasPedidos actual="facturas" />}
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_25rem] lg:items-start">
        <section
          aria-label="Facturas por emitir"
          aria-busy={consulta.isFetching || undefined}
          className={cn(
            'flex min-w-0 flex-col gap-3 lg:rounded-lg lg:border lg:bg-card lg:p-4',
            codigo && 'max-lg:hidden',
          )}
        >
          <Lista consulta={consulta} elegido={codigo} />
        </section>
        {children}
      </div>
    </div>
  );
}

const Lista = ({
  consulta,
  elegido,
}: {
  consulta: ReturnType<typeof useFacturasPanel>;
  elegido: string | null;
}) => {
  if (consulta.isPending) return <EsqueletoFacturas />;
  if (consulta.isError) {
    return (
      <>
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
      </>
    );
  }

  const { items, total } = consulta.data;
  if (items.length === 0) {
    return (
      <p className="py-3 texto-pequeno text-texto-secundario">
        Aún no hay pedidos con factura.
      </p>
    );
  }
  return (
    <>
      <div className="max-lg:hidden">
        <TablaFacturas facturas={items} elegido={elegido} />
      </div>
      <div className="lg:hidden">
        <TarjetasFacturas facturas={items} elegido={elegido} />
      </div>
      {total > items.length && (
        <p className="texto-leyenda text-texto-secundario">
          Se muestran {items.length} de {total} pedidos.
        </p>
      )}
    </>
  );
};
