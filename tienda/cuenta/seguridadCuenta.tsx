'use client';

import { LockKeyhole } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/compartido/ui/alert-dialog';
import { Button } from '@/compartido/ui/button';
import { IconoCerrarSesion } from '@/tienda/diseno/iconoCerrarSesion';
import { RUTAS } from '@/tienda/diseno/enlaces';
import { useCerrarSesion } from './useCerrarSesion';

/**
 * Tarjeta «Seguridad» de Mis datos (Figma 2034:2408).
 *
 * - Contraseña: el backend aún no permite cambiarla con la sesión iniciada; por ahora lleva a
 *   recuperarla por correo (SCRUM-96).
 * - Sesiones: cierra la sesión en todos los dispositivos tras confirmar (E1-H3). Adónde va
 *   después lo decide CuentaProtegida.
 */
export function SeguridadCuenta() {
  return (
    <section
      aria-labelledby="titulo-seguridad"
      className="flex flex-col gap-3 rounded-lg border bg-card p-6"
    >
      <h2
        id="titulo-seguridad"
        className="texto-cuerpo-fuerte text-texto-principal"
      >
        Seguridad
      </h2>
      <FilaSeguridad
        icono={<LockKeyhole className="size-[22px]" strokeWidth={1.75} />}
        titulo="Contraseña"
      >
        <Button variant="contorno" asChild>
          <Link href={RUTAS.recuperarContrasena}>Cambiar contraseña</Link>
        </Button>
      </FilaSeguridad>
      <FilaSeguridad
        icono={<IconoCerrarSesion className="size-[22px]" />}
        titulo="Sesiones"
        detalle="Cierra tu cuenta en todos los dispositivos donde la usaste"
      >
        <CerrarEnTodos />
      </FilaSeguridad>
    </section>
  );
}

const FilaSeguridad = ({
  icono,
  titulo,
  detalle,
  children,
}: {
  icono: ReactNode;
  titulo: string;
  detalle?: string;
  children: ReactNode;
}) => (
  <div className="flex flex-wrap items-center gap-3 py-2 lg:flex-nowrap">
    <span aria-hidden className="text-texto-principal">
      {icono}
    </span>
    <div className="flex min-w-48 flex-1 flex-col">
      <h3 className="texto-etiqueta text-texto-principal">{titulo}</h3>
      {detalle && (
        <p className="texto-leyenda text-texto-secundario">{detalle}</p>
      )}
    </div>
    {children}
  </div>
);

function CerrarEnTodos() {
  const { cerrar, cerrando, error } = useCerrarSesion({ todas: true });

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="contorno">Cerrar sesión en todos</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="titulo-h3 text-texto-principal">
            ¿Cerrar sesión en todos tus dispositivos?
          </AlertDialogTitle>
          <AlertDialogDescription className="texto-pequeno text-texto-secundario">
            También en este. Para volver a usar tu cuenta, tendrás que ingresar
            de nuevo.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <p role="alert" className="texto-pequeno text-estado-error">
            {error}
          </p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={cerrando}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={cerrando}
            onClick={(evento) => {
              // Se mantiene abierto mientras responde el backend
              evento.preventDefault();
              void cerrar();
            }}
          >
            Cerrar sesión en todos
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
