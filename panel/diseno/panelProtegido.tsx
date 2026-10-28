'use client';

import type { Route } from 'next';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, type ReactNode } from 'react';
import { esPersonal } from '@/compartido/sesion/roles';
import { useSesion } from '@/compartido/sesion/sesion';
import { RUTAS } from '@/tienda/diseno/enlaces';

/**
 * El panel solo con una cuenta del personal (E13-H2).
 *
 * - Cliente o profesional: a la tienda.
 * - Sin sesión o con la sesión rechazada: a iniciar sesión y, después, de vuelta a esta página.
 * - Si la persona cerró sesión aquí: a la tienda; si la cerró en todos sus dispositivos: a
 *   iniciar sesión (igual que en «Mi cuenta»).
 *
 * Es comodidad: cada endpoint del panel lo autoriza el backend.
 */
export function PanelProtegido({
  children,
  esqueleto,
}: {
  children: ReactNode;
  esqueleto: ReactNode;
}) {
  const { estado, usuario, cierre } = useSesion();
  const router = useRouter();
  const ruta = usePathname();
  const estabaActiva = useRef(false);
  const delPersonal = esPersonal(usuario?.rol);

  useEffect(() => {
    if (estado === 'activa') {
      estabaActiva.current = true;
      if (!delPersonal) router.replace(RUTAS.inicio);
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
  }, [estado, delPersonal, cierre, ruta, router]);

  if (estado !== 'activa' || !delPersonal) return esqueleto;
  return children;
}
