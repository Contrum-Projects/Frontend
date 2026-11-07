'use client';

import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Skeleton } from '@/compartido/ui/skeleton';
import { useObjetivosDelPeriodo } from './consultasReportes';
import type { RangoDelPeriodo } from './periodos';
import { TarjetaObjetivo } from './tarjetaObjetivo';

/** Celular: una tarjeta con tres filas (Figma 2042:1043). Escritorio: tres tarjetas (2041:1309). */
const LISTA =
  'flex flex-col gap-3 max-lg:rounded-lg max-lg:border max-lg:bg-card max-lg:p-4 lg:grid lg:grid-cols-3 lg:gap-4';

/**
 * Objetivos OE1 a OE3 del período (E14-H1). Valor, meta y estado los entrega el backend; sin
 * registros, el estado es «sin-datos» y se dice en vez del valor (criterio 3).
 */
export const ObjetivosDelPeriodo = ({ rango }: { rango: RangoDelPeriodo }) => {
  const consulta = useObjetivosDelPeriodo(rango);

  return (
    <section aria-labelledby="titulo-objetivos">
      <h2 id="titulo-objetivos" className="sr-only">
        Objetivos
      </h2>
      {consulta.isError ? (
        <Alert variant="destructive">
          <AlertDescription>{consulta.error.message}</AlertDescription>
        </Alert>
      ) : !consulta.data ? (
        <EsqueletoObjetivos />
      ) : (
        <ul className={LISTA}>
          {consulta.data.indicadores.map((objetivo) => (
            <TarjetaObjetivo key={objetivo.codigo} objetivo={objetivo} />
          ))}
        </ul>
      )}
    </section>
  );
};

/** Misma caja que las tarjetas, para que nada salte al cargar (RNF-17). */
const EsqueletoObjetivos = () => (
  <div aria-hidden className={LISTA}>
    {[0, 1, 2].map((indice) => (
      <div
        key={indice}
        className="flex flex-col gap-2 max-lg:border-t max-lg:pt-3 max-lg:first:border-t-0 max-lg:first:pt-0 lg:rounded-lg lg:border lg:bg-card lg:p-6"
      >
        <div className="flex justify-between gap-2 lg:flex-col">
          <Skeleton className="h-5 w-48 max-w-full" />
          <Skeleton className="h-6 w-24 lg:h-11.5 lg:w-36" />
        </div>
        <Skeleton className="my-1 h-1.5 w-full lg:h-2" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-12 w-full max-lg:hidden" />
      </div>
    ))}
  </div>
);
