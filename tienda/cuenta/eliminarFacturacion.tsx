'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '@/compartido/api/cliente';
import { ErrorDeApi, errorDeApi, exigir } from '@/compartido/api/errores';
import type { DatosFacturacionCuenta } from '@/compartido/api/respuestas';
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
import { cn } from '@/compartido/lib/utils';
import { Button } from '@/compartido/ui/button';
import { CLAVES_CUENTA } from './consultasCuenta';

/**
 * Botón con forma de enlace (texto etiqueta), sin el relleno del botón mediano, como en
 * direcciones. Lo usan también «Agregar datos» y «Editar» de la lista.
 */
export const CLASE_ENLACE = 'h-auto min-h-10 px-0 texto-etiqueta';

/**
 * «Eliminar» de una tarjeta, con confirmación (E9-H2). El backend lo desactiva: deja de
 * aparecer en la lista y los pedidos que lo usaron no cambian.
 */
export const EliminarFacturacion = ({
  registro,
  idTitulo,
  alEliminar,
}: {
  registro: DatosFacturacionCuenta;
  /** Título de la tarjeta, para que el lector de pantalla sepa cuál se elimina. */
  idTitulo: string;
  alEliminar: () => void;
}) => {
  const clienteConsultas = useQueryClient();
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const eliminar = async () => {
    setEliminando(true);
    setError(null);
    try {
      exigir(
        await api.DELETE('/api/cuentas/yo/facturacion/{id}', {
          params: { path: { id: registro.id } },
        }),
      );
      alEliminar();
      await clienteConsultas.invalidateQueries({
        queryKey: CLAVES_CUENTA.facturacion,
      });
    } catch (fallo) {
      const deApi = fallo instanceof ErrorDeApi ? fallo : errorDeApi(undefined);
      // 404: ya no está (se eliminó en otra pestaña); la lista se vuelve a pedir
      if (deApi.estado === 404) {
        void clienteConsultas.invalidateQueries({
          queryKey: CLAVES_CUENTA.facturacion,
        });
      }
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
          aria-describedby={idTitulo}
          className={cn(CLASE_ENLACE, 'text-texto-secundario')}
        >
          Eliminar
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="titulo-h3 text-texto-principal">
            ¿Eliminar estos datos de facturación?
          </AlertDialogTitle>
          <AlertDialogDescription className="texto-pequeno text-texto-secundario">
            {registro.razonSocial}. Las facturas ya emitidas no cambian.
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
