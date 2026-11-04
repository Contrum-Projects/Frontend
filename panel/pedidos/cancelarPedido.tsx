'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { ErrorDeApi, errorDeApi } from '@/compartido/api/errores';
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
import { Textarea } from '@/compartido/ui/textarea';
import { CampoFormulario } from '@/tienda/cuenta/campoFormulario';
import { useCancelarPedido } from './consultasPedidos';

/** `MAXIMO_COMENTARIO_CANCELACION` de `cancelar-pedido.dto.ts` del backend. */
const MAXIMO_COMENTARIO = 500;

/** Repite la regla del DTO solo para avisar antes de enviar, con el mismo mensaje del backend. */
const esquema = z.object({
  comentario: z
    .string()
    .trim()
    .max(
      MAXIMO_COMENTARIO,
      `El comentario no puede superar los ${MAXIMO_COMENTARIO} caracteres.`,
    ),
});

type Formulario = z.infer<typeof esquema>;

/**
 * E8-H3, criterio 1 · «Cancelar pedido» en el detalle del panel. Pide confirmación con un motivo
 * opcional, que queda en el historial. Solo se muestra si el backend dice que el pedido se puede
 * cancelar (criterio 2); el detalle del cliente no lo tiene (criterio 3).
 */
export function CancelarPedido({
  codigoPedido,
  alTerminar,
}: {
  codigoPedido: string;
  /**
   * Tras cancelar (o si el pedido ya no se puede cancelar) el botón desaparece del detalle: el
   * foco va a donde diga el padre en vez de perderse en la página.
   */
  alTerminar: () => void;
}) {
  const idFormulario = useId();
  const [abierto, setAbierto] = useState(false);
  /** El diálogo se cerró porque el backend respondió que el pedido ya no se cancela. */
  const [terminado, setTerminado] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const cancelar = useCancelarPedido(codigoPedido);
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Formulario>({
    resolver: zodResolver(esquema),
    defaultValues: { comentario: '' },
  });

  /** Al cerrar, el motivo y los errores se borran: la próxima vez parte de cero. */
  const cerrar = () => {
    setAbierto(false);
    reset();
    setAviso(null);
  };

  const cambiarAbierto = (valor: boolean) => {
    // Mientras responde el backend, el diálogo sigue abierto
    if (isSubmitting) return;
    if (valor) setAbierto(true);
    else cerrar();
  };

  const mostrarError = (fallo: ErrorDeApi) => {
    if (fallo.estado === 400) {
      setError(
        'comentario',
        { type: 'server', message: fallo.message },
        { shouldFocus: true },
      );
      return;
    }
    if (fallo.estado === 404 || fallo.estado === 409) {
      // El detalle se vuelve a pedir y ya no ofrece cancelar: el aviso va fuera del diálogo
      toast.error(fallo.message);
      setTerminado(true);
      cerrar();
      return;
    }
    setAviso(fallo.message);
  };

  const enviar = async ({ comentario }: Formulario) => {
    setAviso(null);
    try {
      const resultado = await cancelar.mutateAsync(
        comentario ? { comentario } : {},
      );
      toast.success(`El pedido ${resultado.codigoPublico} quedó cancelado.`);
      setTerminado(true);
      cerrar();
    } catch (error) {
      // Sin conexión, fetch lanza TypeError: se muestra el mensaje genérico
      mostrarError(error instanceof ErrorDeApi ? error : errorDeApi(undefined));
    }
  };

  return (
    <AlertDialog open={abierto} onOpenChange={cambiarAbierto}>
      <AlertDialogTrigger asChild>
        <Button
          variant="contorno"
          size="grande"
          className="w-full border-destructive text-destructive hover:bg-destructive/10"
        >
          Cancelar pedido
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent
        onCloseAutoFocus={(evento) => {
          if (!terminado) return;
          setTerminado(false);
          evento.preventDefault();
          alTerminar();
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="titulo-h3 wrap-anywhere text-texto-principal">
            ¿Cancelar el pedido {codigoPedido}?
          </AlertDialogTitle>
          <AlertDialogDescription className="texto-pequeno text-texto-secundario">
            Su stock vuelve al inventario. Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form
          id={idFormulario}
          onSubmit={handleSubmit(enviar)}
          noValidate
          className="flex flex-col gap-3"
        >
          {aviso && (
            <Alert variant="destructive">
              <AlertDescription>{aviso}</AlertDescription>
            </Alert>
          )}
          <CampoFormulario
            id={`${idFormulario}-comentario`}
            etiqueta="Motivo (opcional)"
            error={errors.comentario?.message}
          >
            {(propsControl) => (
              <Textarea
                {...propsControl}
                {...register('comentario')}
                autoComplete="off"
                className="max-h-40"
              />
            )}
          </CampoFormulario>
        </form>
        <AlertDialogFooter>
          <AlertDialogCancel size="grande" disabled={isSubmitting}>
            Volver
          </AlertDialogCancel>
          <Button
            type="submit"
            size="grande"
            form={idFormulario}
            variant="destructive"
            disabled={isSubmitting}
          >
            {isSubmitting && <Spinner aria-hidden />}
            Cancelar pedido
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
