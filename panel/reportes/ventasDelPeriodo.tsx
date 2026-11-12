'use client';

import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Skeleton } from '@/compartido/ui/skeleton';
import { useVentasDelPeriodo, useVentasPorMes } from './consultasReportes';
import { ExportarVentas } from './exportarVentas';
import {
  GraficoVentas,
  LeyendaVentas,
  textoTotales,
  type VentasDelMes,
} from './graficoVentas';
import type { RangoDelPeriodo } from './periodos';
import { ResumenVentas } from './resumenVentas';

const TARJETA = 'flex flex-col gap-4 rounded-lg border bg-card p-4 lg:p-6';

/**
 * Ventas del período (E14-H2): gráfico por mes y tipo de cliente y su resumen. Sin pedidos, el
 * backend entrega todo en cero y así se muestra (criterio 2).
 */
export const VentasDelPeriodo = ({ rango }: { rango: RangoDelPeriodo }) => {
  const resumen = useVentasDelPeriodo(rango);
  const porMes = useVentasPorMes(rango.meses);

  const conError = [resumen, ...porMes].find((consulta) => consulta.isError);
  if (conError?.error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{conError.error.message}</AlertDescription>
      </Alert>
    );
  }

  const meses: VentasDelMes[] = [];
  for (const [indice, consulta] of porMes.entries()) {
    if (!consulta.data) break;
    meses.push({ clave: rango.meses[indice].clave, reporte: consulta.data });
  }
  if (!resumen.data || meses.length < rango.meses.length) {
    return <EsqueletoVentas />;
  }

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <section
        aria-labelledby="titulo-ventas-por-mes"
        className={`${TARJETA} min-w-0 lg:flex-1`}
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <h2
            id="titulo-ventas-por-mes"
            className="texto-cuerpo-fuerte text-texto-principal"
          >
            Ventas por mes
            <span className="max-lg:hidden"> y tipo de cliente</span>
          </h2>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-6">
            <LeyendaVentas />
            <ExportarVentas rango={rango} />
          </div>
        </div>
        <GraficoVentas meses={meses} />
        {/* Celular (Figma 2042:1010): el total bajo el gráfico, sin la tarjeta de resumen */}
        <p className="flex flex-wrap justify-between gap-x-3 gap-y-1 texto-pequeno text-texto-secundario lg:hidden">
          Total del período
          <span className="texto-etiqueta text-texto-principal tabular-nums">
            {textoTotales(resumen.data.total)}
          </span>
        </p>
      </section>
      <ResumenVentas reporte={resumen.data} />
    </div>
  );
};

/** Misma caja que el gráfico y el resumen, para que nada salte al cargar (RNF-17). */
const EsqueletoVentas = () => (
  <div aria-hidden className="flex flex-col gap-4 lg:flex-row">
    <div className={`${TARJETA} lg:flex-1`}>
      {/* Título y leyenda: en el celular, uno bajo el otro */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Skeleton className="h-6 w-56 max-w-full" />
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-6">
          <Skeleton className="h-4 w-40" />
          {/* El botón «Exportar CSV»: mismo alto que el Button mediano */}
          <Skeleton className="h-9.5 w-36" />
        </div>
      </div>
      {/* Mismo alto que el gráfico, con la fila de los meses */}
      <Skeleton className="h-46 w-full lg:h-62" />
      <Skeleton className="h-5 w-full lg:hidden" />
    </div>
    <div className={`${TARJETA} max-lg:hidden lg:w-85 lg:shrink-0`}>
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-40 w-full" />
    </div>
  </div>
);
