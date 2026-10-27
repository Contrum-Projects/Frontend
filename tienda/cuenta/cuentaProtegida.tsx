'use client';

import type { Route } from 'next';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, type ReactNode } from 'react';
import { useSesion } from '@/compartido/sesion/sesion';
import { Skeleton } from '@/compartido/ui/skeleton';
import { RUTAS } from '@/tienda/diseno/enlaces';

/**
 * Páginas de «Mi cuenta»: solo con sesión iniciada (E1-H3).
 *
 * - Sin sesión o con la sesión rechazada por el servidor (cerrada en otro dispositivo, vencida):
 *   lleva a iniciar sesión y, después, de vuelta a esta página.
 * - Si la persona cerró sesión aquí: al inicio, ya como visitante. Si la cerró en todos sus
 *   dispositivos: a iniciar sesión de nuevo.
 *
 * Es comodidad para la persona: los datos de la cuenta los protege el backend.
 */
export function CuentaProtegida({ children }: { children: ReactNode }) {
  const { estado, cierre } = useSesion();
  const router = useRouter();
  const ruta = usePathname();
  // El cierre solo cuenta si la sesión estaba activa en esta página; quien llega después sin
  // sesión va a iniciar sesión.
  const estabaActiva = useRef(false);

  useEffect(() => {
    if (estado === 'activa') {
      estabaActiva.current = true;
      return;
    }
    if (estado !== 'anonima') return;

    const motivo = estabaActiva.current ? cierre : undefined;
    if (motivo === 'este') {
      router.replace(RUTAS.inicio);
    } else if (motivo === 'todos') {
      router.replace(RUTAS.ingresar);
    } else {
      router.replace(
        `${RUTAS.ingresar}?volver=${encodeURIComponent(ruta)}` as Route,
      );
    }
  }, [estado, cierre, ruta, router]);

  if (estado !== 'activa') return <EsqueletoCuenta />;
  return children;
}

const EsqueletoCuenta = () => (
  <div aria-hidden className="grid gap-4 md:grid-cols-[240px_1fr] md:gap-12">
    <Skeleton className="hidden h-96 md:block" />
    <div className="flex flex-col gap-6">
      <Skeleton className="h-12 w-48" />
      <Skeleton className="h-52 w-full rounded-lg" />
    </div>
  </div>
);
