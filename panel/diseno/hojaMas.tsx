'use client';

import { X } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Button } from '@/compartido/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/compartido/ui/sheet';
import { cn } from '@/compartido/lib/utils';
import { useSesion } from '@/compartido/sesion/sesion';
import { useCerrarSesion } from '@/tienda/cuenta/useCerrarSesion';
import { IconoCerrarSesion } from '@/tienda/diseno/iconoCerrarSesion';
import type { SeccionPanel } from './secciones';
import { AvatarPanel, nombreCompleto } from './usuarioPanel';

const CLASE_FILA =
  'flex min-h-11 w-full items-center gap-3 rounded-md px-3 texto-cuerpo text-texto-principal hover:bg-fondo-hueso focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-profundo';

interface HojaMasProps {
  /** Las secciones del rol que no caben en la barra. */
  secciones: readonly SeccionPanel[];
  actual: SeccionPanel | undefined;
  abierta: boolean;
  alCambiar: (abierta: boolean) => void;
  /** El botón «Más» de la barra. */
  children: ReactNode;
}

/**
 * «Más» de la navegación inferior: hoja desde abajo con las demás secciones del rol, la
 * persona y «Cerrar sesión». Figma no tiene la hoja abierta: sigue el estilo de la barra.
 */
export function HojaMas({
  secciones,
  actual,
  abierta,
  alCambiar,
  children,
}: HojaMasProps) {
  const { usuario } = useSesion();
  const { cerrar, cerrando, error } = useCerrarSesion();
  const cerrarHoja = () => alCambiar(false);

  return (
    <Sheet open={abierta} onOpenChange={alCambiar}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        aria-describedby={undefined}
        className="gap-0 rounded-t-lg border-t-0 bg-fondo-superficie px-4 pt-2 pb-[max(--spacing(6),env(safe-area-inset-bottom))]"
      >
        <div className="flex items-center justify-between pl-3">
          <SheetTitle className="titulo-h3 text-texto-principal">
            Más
          </SheetTitle>
          <SheetClose asChild>
            <Button variant="ghost" size="icono" aria-label="Cerrar">
              <X className="size-6" />
            </Button>
          </SheetClose>
        </div>

        {secciones.length > 0 && (
          <ul className="flex flex-col gap-1 pb-4">
            {secciones.map((seccion) => {
              const activa = seccion === actual;
              const Icono = seccion.icono;
              return (
                <li key={seccion.href}>
                  <Link
                    href={seccion.href}
                    onClick={cerrarHoja}
                    aria-current={activa ? 'page' : undefined}
                    className={cn(
                      CLASE_FILA,
                      activa &&
                        'bg-marca-acento-suave texto-cuerpo-fuerte text-marca-profundo',
                    )}
                  >
                    <Icono
                      className="size-5 shrink-0"
                      strokeWidth={1.75}
                      aria-hidden
                    />
                    {seccion.texto}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {usuario && (
          <div className="flex flex-col gap-2 border-t border-fondo-hueso-oscuro pt-4">
            <div className="flex items-center gap-3 px-3">
              <AvatarPanel persona={usuario} />
              <div className="flex min-w-0 flex-col">
                <span className="truncate texto-etiqueta text-texto-principal">
                  {nombreCompleto(usuario)}
                </span>
                <span className="texto-leyenda text-texto-secundario">
                  Rol: {usuario.rol}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={cerrar}
              disabled={cerrando}
              className={cn(CLASE_FILA, 'cursor-pointer disabled:opacity-50')}
            >
              <IconoCerrarSesion className="size-5" />
              Cerrar sesión
            </button>
            {error && (
              <p role="alert" className="px-3 texto-leyenda text-estado-error">
                {error}
              </p>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
