'use client';

import { useState } from 'react';
import { api } from '@/compartido/api/cliente';
import { ErrorDeApi, errorDeApi, exigir } from '@/compartido/api/errores';
import type { DireccionCuenta } from '@/compartido/api/respuestas';
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

/**
 * «Eliminar dirección», con confirmación (E1-H5). Si era la principal, el backend deja como
 * principal la más reciente de las que quedan.
 */
export const EliminarDireccion = ({
  direccion,
  alEliminar,
}: {
  direccion: DireccionCuenta;
  alEliminar: () => Promise<void>;
}) => {
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const eliminar = async () => {
    setEliminando(true);
    setError(null);
    try {
      exigir(
        await api.DELETE('/api/cuentas/yo/direcciones/{id}', {
          params: { path: { id: direccion.id } },
        }),
      );
      await alEliminar();
    } catch (fallo) {
      const deApi = fallo instanceof ErrorDeApi ? fallo : errorDeApi(undefined);
      setError(deApi.message);
      setEliminando(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="link"
          className="h-auto min-h-10 px-0 text-destructive sm:mr-auto"
        >
          Eliminar dirección
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="titulo-h3 text-texto-principal">
            ¿Eliminar esta dirección?
          </AlertDialogTitle>
          <AlertDialogDescription className="texto-pequeno text-texto-secundario">
            {direccion.calle} {direccion.numero}, {direccion.comuna.nombre}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <p role="alert" className="texto-pequeno text-estado-error">
            {error}
          </p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={eliminando}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={eliminando}
            onClick={(evento) => {
              // Se mantiene abierto mientras responde el backend
              evento.preventDefault();
              void eliminar();
            }}
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
