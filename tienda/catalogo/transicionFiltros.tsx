'use client';

import {
  createContext,
  use,
  useTransition,
  type ReactNode,
  type TransitionStartFunction,
} from 'react';
import { cn } from '@/compartido/lib/utils';

interface Transicion {
  pendiente: boolean;
  iniciar: TransitionStartFunction;
}

const ContextoTransicion = createContext<Transicion | null>(null);

/**
 * Comparte la espera de los filtros con los resultados: mientras llegan los nuevos, la lista
 * actual se atenúa (los filtros y la grilla son hermanos en la página).
 */
export function TransicionFiltros({ children }: { children: ReactNode }) {
  const [pendiente, iniciar] = useTransition();
  return (
    <ContextoTransicion value={{ pendiente, iniciar }}>
      {children}
    </ContextoTransicion>
  );
}

/** La transición compartida; fuera de `TransicionFiltros`, una propia. */
export const useTransicionFiltros = (): Transicion => {
  const [pendiente, iniciar] = useTransition();
  return use(ContextoTransicion) ?? { pendiente, iniciar };
};

/** Resultados que se atenúan mientras se aplican los filtros. */
export const ResultadosPendientes = ({ children }: { children: ReactNode }) => {
  const { pendiente } = useTransicionFiltros();
  return (
    <div
      aria-busy={pendiente}
      className={cn(
        'flex min-w-0 flex-col gap-6 transition-opacity',
        pendiente && 'opacity-50',
      )}
    >
      {children}
      <p className="sr-only" aria-live="polite">
        {pendiente ? 'Actualizando resultados' : ''}
      </p>
    </div>
  );
};
