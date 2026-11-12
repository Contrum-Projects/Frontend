'use client';

import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/compartido/ui/alert-dialog';
import { Button } from '@/compartido/ui/button';
import { Spinner } from '@/compartido/ui/spinner';
import { useBorrarDelCatalogo } from './consultasCatalogo';

const TEXTOS = {
  marca: {
    articulo: 'la marca',
    usos: 'ningún producto, cupón ni imagen de la portada la usa',
  },
  categoria: {
    articulo: 'la categoría',
    usos: 'no tiene productos, subcategorías, cupones ni imágenes de la portada',
  },
} as const;

/**
 * Borrar una marca o una categoría que ya no se usa (SCRUM-158), después de confirmar. Si se
 * usa, el backend responde dónde y cuántos, y el mensaje queda en la misma ventana, sin cerrarla.
 */
export function BotonBorrar({
  que,
  id,
  nombre,
}: {
  que: 'marca' | 'categoria';
  id: number;
  nombre: string;
}) {
  const [abierto, setAbierto] = useState(false);
  const borrar = useBorrarDelCatalogo(que);
  const textos = TEXTOS[que];

  return (
    <AlertDialog
      open={abierto}
      onOpenChange={(siguiente) => {
        setAbierto(siguiente);
        if (!siguiente) borrar.reset();
      }}
    >
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icono-chico"
          aria-label={`Borrar ${nombre}`}
          className="text-texto-secundario hover:text-estado-error max-lg:size-10"
        >
          <Trash2 aria-hidden />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Borrar {textos.articulo} «{nombre}»?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Solo se puede borrar si {textos.usos}. No se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {borrar.isError && (
          <Alert variant="destructive">
            <AlertDescription>{borrar.error.message}</AlertDescription>
          </Alert>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={borrar.isPending}>
            {borrar.isError ? 'Cerrar' : 'Cancelar'}
          </AlertDialogCancel>
          {!borrar.isError && (
            // No es AlertDialogAction: esa cierra la ventana antes de saber si se pudo borrar
            <Button
              variant="destructive"
              disabled={borrar.isPending}
              onClick={() =>
                borrar.mutate(id, { onSuccess: () => setAbierto(false) })
              }
            >
              {borrar.isPending && <Spinner aria-hidden />}
              Borrar
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
