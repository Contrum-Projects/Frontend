'use client';

import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Skeleton } from '@/compartido/ui/skeleton';
import { FormatosBajoMinimo } from '@/panel/inventario/formatosBajoMinimo';
import { TARJETA_REPORTE } from './cifra';
import { useReporteStockBajo } from './consultasReportes';

const TITULO = 'Formatos por reponer';
const SIN_FORMATOS = 'No hay formatos por reponer.';

const FILAS_ESQUELETO = [0, 1, 2];

/** Misma caja que la tarjeta, para que nada salte al cargar (RNF-17). */
const EsqueletoFormatos = () => (
  <div aria-hidden className={TARJETA_REPORTE}>
    <Skeleton className="h-6 w-48" />
    {/* Cabecera de la tabla, solo en escritorio */}
    <Skeleton className="h-8 max-lg:hidden" />
    {FILAS_ESQUELETO.map((fila) => (
      <Skeleton key={fila} className="h-10 lg:h-11" />
    ))}
  </div>
);

/**
 * Formatos con stock bajo el mínimo (E14-H4 criterios 1 y 2): todos, con su stock y su mínimo,
 * en el orden del backend (del que más falta al que menos). Sin formatos, lo dice.
 */
export const FormatosPorReponer = () => {
  const consulta = useReporteStockBajo();

  if (consulta.isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{consulta.error.message}</AlertDescription>
      </Alert>
    );
  }
  if (!consulta.data) return <EsqueletoFormatos />;

  const formatos = consulta.data;

  return (
    <section aria-labelledby="titulo-por-reponer" className={TARJETA_REPORTE}>
      <h2
        id="titulo-por-reponer"
        className="texto-cuerpo-fuerte text-texto-principal"
      >
        {TITULO}
      </h2>
      {formatos.length === 0 ? (
        <p className="texto-pequeno text-texto-secundario">{SIN_FORMATOS}</p>
      ) : (
        <FormatosBajoMinimo filas={formatos} etiqueta={TITULO} />
      )}
    </section>
  );
};
