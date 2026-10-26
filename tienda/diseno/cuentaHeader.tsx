'use client';

import { UserRound } from 'lucide-react';
import Link from 'next/link';
import { useSesion } from '@/compartido/sesion/sesion';
import { Skeleton } from '@/compartido/ui/skeleton';
import { RUTAS } from './enlaces';

/** Cuenta del header: «Ingresar» sin sesión y el nombre con sesión (en celular, solo el ícono). */
export function CuentaHeader() {
  const { estado, usuario } = useSesion();

  if (estado === 'desconocida') {
    return <Skeleton className="size-10 md:h-5 md:w-24" aria-hidden />;
  }

  const texto = usuario ? usuario.nombre : 'Ingresar';
  return (
    <Link
      href={usuario ? RUTAS.misDatos : RUTAS.ingresar}
      className="inline-flex min-h-10 min-w-10 items-center justify-center gap-2 rounded-md texto-etiqueta text-texto-principal hover:underline md:justify-start"
    >
      <UserRound className="size-6" strokeWidth={1.75} aria-hidden />
      <span className="sr-only md:not-sr-only">{texto}</span>
    </Link>
  );
}
