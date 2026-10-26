'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useSesion } from '@/compartido/sesion/sesion';
import { Skeleton } from '@/compartido/ui/skeleton';
import { destinoTrasIngreso } from './destinoIngreso';
import { FormularioIngreso } from './formularioIngreso';

/**
 * Formulario de «Iniciar sesión» (E1-H2) según la sesión. Con sesión activa (recién iniciada
 * o de antes) lleva a la persona según su rol; mientras se sabe si hay sesión, esqueleto.
 */
export function Ingreso() {
  const { estado, usuario } = useSesion();
  const router = useRouter();
  const volver = useSearchParams().get('volver');

  useEffect(() => {
    if (usuario) router.replace(destinoTrasIngreso(usuario.rol, volver));
  }, [usuario, volver, router]);

  if (estado !== 'anonima') return <IngresoEsqueleto />;
  return <FormularioIngreso />;
}

/** Etiqueta (texto-etiqueta) y caja (alto de <Input>), como cada campo del formulario. */
const CampoEsqueleto = () => (
  <div className="flex flex-col gap-1.5">
    <Skeleton className="h-[18px] w-32" />
    <Skeleton className="h-[51px] w-full" />
  </div>
);

/** Mismo alto que el formulario: correo, contraseña, enlace y botón. */
export const IngresoEsqueleto = () => (
  <div aria-hidden className="flex flex-col gap-4">
    <CampoEsqueleto />
    <CampoEsqueleto />
    <div className="flex min-h-10 items-center">
      <Skeleton className="h-[18px] w-44" />
    </div>
    <Skeleton className="h-14 w-full rounded-full" />
  </div>
);
