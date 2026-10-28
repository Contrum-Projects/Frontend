'use client';

import type { ReactNode } from 'react';
import { Button } from '@/compartido/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/compartido/ui/sheet';
import { Spinner } from '@/compartido/ui/spinner';

/** Panel lateral de los formularios del catálogo, como «Nueva cuenta de personal» (P8a). */
export const PanelLateral = ({
  titulo,
  abierto,
  alCambiarAbierto,
  children,
}: {
  titulo: string;
  abierto: boolean;
  alCambiarAbierto: (abierto: boolean) => void;
  children: ReactNode;
}) => (
  <Sheet open={abierto} onOpenChange={alCambiarAbierto}>
    <SheetContent
      aria-describedby={undefined}
      className="w-full gap-4 overflow-y-auto bg-fondo-superficie p-6 sm:max-w-md"
    >
      <SheetHeader className="p-0 pr-12">
        <SheetTitle className="titulo-h3 font-normal text-texto-principal">
          {titulo}
        </SheetTitle>
      </SheetHeader>
      {children}
    </SheetContent>
  </Sheet>
);

/** Cancelar y guardar, abajo del panel. */
export const AccionesPanelLateral = ({
  texto,
  enviando,
  alCancelar,
}: {
  texto: string;
  enviando: boolean;
  alCancelar: () => void;
}) => (
  <div className="mt-auto flex gap-3 pt-4">
    <Button
      type="button"
      variant="contorno"
      size="grande"
      className="flex-1"
      onClick={alCancelar}
    >
      Cancelar
    </Button>
    <Button type="submit" size="grande" className="flex-1" disabled={enviando}>
      {enviando && <Spinner aria-hidden />}
      {texto}
    </Button>
  </div>
);
