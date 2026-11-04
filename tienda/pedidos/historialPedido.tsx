import { Check } from 'lucide-react';
import { useId } from 'react';
import type { DetallePedidoCuenta } from '@/compartido/api/respuestas';
import { formatearDiaHora } from '@/compartido/formato/fecha';
import { cn } from '@/compartido/lib/utils';
import { etiquetaEstado } from './estadoPedido';

/**
 * E8-H1, criterio 2 · Los cambios de estado con su fecha, del primero al último (Figma 2019:1704;
 * celular 2019:2970): en fila en escritorio y en columna en celular.
 *
 * Solo muestra lo que ya pasó, tal como lo entrega el backend: no deduce los pasos que faltan,
 * porque la secuencia de estados es una regla del backend (decisión del 4-11-2026).
 */
export const HistorialPedido = ({
  historial,
}: {
  historial: DetallePedidoCuenta['historial'];
}) => {
  const idTitulo = useId();
  if (historial.length === 0) return null;

  return (
    <section
      aria-labelledby={idTitulo}
      className="rounded-xl border bg-fondo-superficie px-4 py-6 md:px-8"
    >
      <h2 id={idTitulo} className="sr-only">
        Historial del pedido
      </h2>
      <ol className="flex flex-col md:flex-row">
        {historial.map((cambio, i) => {
          const ultimo = i === historial.length - 1;
          return (
            <li
              key={`${cambio.estado}-${cambio.fecha}`}
              className={cn(
                'relative flex gap-3 md:flex-1 md:flex-col md:gap-2',
                !ultimo && 'pb-4 md:pb-0',
              )}
            >
              {!ultimo && (
                <span
                  aria-hidden
                  className="absolute top-7 bottom-0 left-3.5 w-0.5 -translate-x-1/2 bg-marca-profundo md:top-3.5 md:right-0 md:bottom-auto md:left-7 md:h-0.5 md:w-auto md:translate-x-0 md:-translate-y-1/2"
                />
              )}
              <span
                aria-hidden
                className="flex size-7 shrink-0 items-center justify-center rounded-full bg-marca-profundo text-texto-sobre-oscuro"
              >
                <Check className="size-4" strokeWidth={1.75} />
              </span>
              <div className="flex flex-col gap-1 pt-0.5 md:pt-0 md:pr-4">
                <p className="texto-cuerpo-fuerte text-texto-principal">
                  {etiquetaEstado(cambio.estado)}
                </p>
                <p className="texto-leyenda text-texto-secundario">
                  <time dateTime={cambio.fecha}>
                    {formatearDiaHora(cambio.fecha)}
                  </time>
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
};
