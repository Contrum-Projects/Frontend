'use client';

import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
  isServer,
} from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { toast } from 'sonner';
import { ErrorDeApi } from '@/compartido/api/errores';
import { IniciadorDeSesion } from '@/compartido/sesion/sesion';
import { Toaster } from '@/compartido/ui/sonner';

/**
 * E13-H2, criterio 2: en el panel, un 403 muestra el aviso del backend («No tienes permiso…»)
 * y no toca lo que hay en pantalla (TanStack Query conserva los datos anteriores y nada se
 * invalida). Solo en el panel: en la tienda cada formulario muestra su error junto al campo.
 */
const enElPanel = () =>
  typeof window !== 'undefined' &&
  /^\/panel(\/|$)/.test(window.location.pathname);

export const avisarSinPermiso = (error: Error) => {
  if (error instanceof ErrorDeApi && error.estado === 403 && enElPanel()) {
    toast.error(error.message, { id: 'sin-permiso' });
  }
};

export function crearClienteDeConsultas() {
  return new QueryClient({
    queryCache: new QueryCache({ onError: avisarSinPermiso }),
    mutationCache: new MutationCache({ onError: avisarSinPermiso }),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        // Un 4xx no mejora reintentando (permiso, validación, no encontrado)
        retry: (intentos, error) =>
          !(
            error instanceof ErrorDeApi &&
            error.estado >= 400 &&
            error.estado < 500
          ) && intentos < 2,
      },
    },
  });
}

let clienteDelNavegador: QueryClient | undefined;

function clienteDeConsultas() {
  // En el servidor, uno nuevo por render; en el navegador, siempre el mismo
  if (isServer) return crearClienteDeConsultas();
  clienteDelNavegador ??= crearClienteDeConsultas();
  return clienteDelNavegador;
}

export function Proveedores({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={clienteDeConsultas()}>
      <IniciadorDeSesion />
      {children}
      <Toaster />
    </QueryClientProvider>
  );
}
