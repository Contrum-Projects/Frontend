'use client';

import {
  QueryClient,
  QueryClientProvider,
  isServer,
} from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { ErrorDeApi } from '@/compartido/api/errores';
import { IniciadorDeSesion } from '@/compartido/sesion/sesion';
import { Toaster } from '@/compartido/ui/sonner';

function crearClienteDeConsultas() {
  return new QueryClient({
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
