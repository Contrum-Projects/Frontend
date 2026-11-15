'use client';

import { LayoutDashboard, UserRound } from 'lucide-react';
import Link from 'next/link';
import { esPersonal } from '@/compartido/sesion/roles';
import { useSesion } from '@/compartido/sesion/sesion';
import { Skeleton } from '@/compartido/ui/skeleton';
import { RUTAS } from './enlaces';
import { CLASE_ENLACE_HEADER, CLASE_ICONO_HEADER } from './estilosHeader';

/**
 * Botón de cuenta del header: solo el ícono. Su nombre accesible es «Ingresar» sin sesión y el
 * nombre de la persona con sesión; con sesión lleva un punto de marca sobre el ícono.
 *
 * El personal no tiene «Mi cuenta» de comprador (el backend le responde 403): en su lugar ve
 * «Panel», que lo lleva al panel sin escribir la URL.
 */
export function CuentaHeader() {
  const { estado, usuario } = useSesion();

  if (estado === 'desconocida') {
    return <Skeleton className="size-10 rounded-full" aria-hidden />;
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

  return (
    <Link
      href={usuario ? RUTAS.misDatos : RUTAS.ingresar}
      title={usuario ? usuario.nombre : 'Ingresar'}
      className={CLASE_ICONO_HEADER}
    >
      <UserRound className="size-6" strokeWidth={1.75} aria-hidden />
      <span className="sr-only">{usuario ? usuario.nombre : 'Ingresar'}</span>
      {usuario && (
        <span
          aria-hidden
          className="absolute top-2 right-2 size-2 rounded-full bg-marca-acento ring-2 ring-fondo-hueso"
        />
      )}
    </Link>
  );
}
