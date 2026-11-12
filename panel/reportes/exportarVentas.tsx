'use client';

import { Download } from 'lucide-react';
import { Button } from '@/compartido/ui/button';
import { useExportarVentas } from './consultasReportes';
import type { RangoDelPeriodo } from './periodos';

/**
 * «Exportar CSV» (E14-H5, SCRUM-160): descarga las ventas del mismo período que muestra la
 * pantalla, pedido a pedido. Si el backend responde un error, muestra su mensaje (criterio 3).
 */
export const ExportarVentas = ({ rango }: { rango: RangoDelPeriodo }) => {
  const descarga = useExportarVentas(rango);
  return (
    <div className="flex flex-col gap-2 lg:items-end">
      <Button
        type="button"
        variant="contorno"
        className="gap-2 aria-disabled:opacity-50"
        // aria-disabled y no disabled: el botón conserva el foco y se lee «Exportando…»
        aria-disabled={descarga.isPending}
        onClick={() => {
          if (!descarga.isPending) descarga.mutate();
        }}
      >
        <Download strokeWidth={1.75} aria-hidden />
        {descarga.isPending ? 'Exportando…' : 'Exportar CSV'}
      </Button>
      {descarga.isError && (
        <p role="alert" className="texto-pequeno text-estado-error">
          {descarga.error.message}
        </p>
      )}
    </div>
  );
};
