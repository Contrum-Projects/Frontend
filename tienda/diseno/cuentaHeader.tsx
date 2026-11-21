'use client';

import { LayoutDashboard, UserRound } from 'lucide-react';
import Link from 'next/link';
import { esPersonal } from '@/compartido/sesion/roles';
import { useSesion } from '@/compartido/sesion/sesion';
import { Skeleton } from '@/compartido/ui/skeleton';
import { RUTAS } from './enlaces';
import { CLASE_ENLACE_HEADER, CLASE_ICONO_HEADER } from './estilosHeader';
import { MenuCuentaHeader } from './menuCuentaHeader';

/**
 * Cuenta en el header. Sin sesión, el ícono lleva a «Ingresar». Con sesión, el comprador ve
 * «Hola, <nombre>» y un desplegable con su cuenta y «Cerrar sesión» (MenuCuentaHeader).
 *
 * El personal no tiene «Mi cuenta» de comprador (el backend le responde 403): en su lugar ve
 * «Panel», que lo lleva al panel sin escribir la URL.
 */
export function CuentaHeader() {
  const { estado, usuario } = useSesion();

  if (estado === 'desconocida') {
    return <Skeleton className="size-10 rounded-full sm:w-32" aria-hidden />;
  }

  if (esPersonal(usuario?.rol)) {
    return (
      <Link
        href={RUTAS.panel}
        title="Ir al panel"
        className={CLASE_ENLACE_HEADER}
      >
        <LayoutDashboard className="size-5" strokeWidth={1.75} aria-hidden />
        <span className="sr-only sm:not-sr-only">Panel</span>
      </Link>
    );
  }

  if (usuario) return <MenuCuentaHeader usuario={usuario} />;

  return (
    <Link href={RUTAS.ingresar} title="Ingresar" className={CLASE_ICONO_HEADER}>
      <UserRound className="size-6" strokeWidth={1.75} aria-hidden />
      <span className="sr-only">Ingresar</span>
    </Link>
  );
}
