'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { TriangleAlert } from 'lucide-react';
import { useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { ErrorDeApi, errorDeApi } from '@/compartido/api/errores';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/compartido/ui/alert-dialog';
import { Button } from '@/compartido/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/compartido/ui/dialog';
import { Spinner } from '@/compartido/ui/spinner';
import { Switch } from '@/compartido/ui/switch';
import { Textarea } from '@/compartido/ui/textarea';
import { CampoFormulario } from '@/tienda/cuenta/campoFormulario';
import {
  type ClienteDetalle,
  useCambiarEstadoCliente,
  usePasarACliente,
} from './consultasClientes';
import {
  esquemaPasarACliente,
  type FormularioPasarACliente,
  MAXIMO_MOTIVO_ROL,
  nombreCompleto,
} from './textosClientes';

/** Sin conexión, fetch lanza TypeError: se muestra el mensaje genérico. */
const comoErrorDeApi = (error: unknown) =>
  error instanceof ErrorDeApi ? error : errorDeApi(undefined);

/**
 * E13-H4 FE, criterio 4 · Interruptor del estado. Desactivar y reactivar piden confirmación; un
 * error del backend queda en el diálogo y la cuenta conserva su estado.
 */
export const EstadoCuenta = ({ cuenta }: { cuenta: ClienteDetalle }) => {
  const [confirmar, setConfirmar] = useState(false);
  const cambiar = useCambiarEstadoCliente(cuenta.codigoPublico);
  const nombre = nombreCompleto(cuenta);
  const reactivar = !cuenta.activo;

  const cambiarAbierto = (abrir: boolean) => {
    if (cambiar.isPending) return;
    if (!abrir) cambiar.reset();
    setConfirmar(abrir);
  };

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-col gap-1">
        <span
          id="estado-cuenta"
          className="texto-etiqueta text-texto-principal"
        >
          Cuenta activa
        </span>
        <span className="texto-leyenda text-texto-secundario">
          {cuenta.activo
            ? 'Puede iniciar sesión y comprar.'
            : 'No puede iniciar sesión. Sus pedidos se mantienen.'}
        </span>
      </div>
      <Switch
        checked={cuenta.activo}
        aria-labelledby="estado-cuenta"
        onCheckedChange={() => setConfirmar(true)}
      />
      <AlertDialog open={confirmar} onOpenChange={cambiarAbierto}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="titulo-h3 text-texto-principal">
              {reactivar
                ? `¿Reactivar la cuenta de ${nombre}?`
                : `¿Desactivar la cuenta de ${nombre}?`}
            </AlertDialogTitle>
            <AlertDialogDescription className="texto-pequeno text-texto-secundario">
              {reactivar
                ? 'Podrá volver a iniciar sesión con su contraseña de siempre.'
                : 'Se cerrarán sus sesiones y no podrá iniciar sesión. La cuenta no se borra y sus pedidos siguen su curso.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {cambiar.isError && (
            <p role="alert" className="texto-pequeno text-estado-error">
              {cambiar.error.message}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cambiar.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              variant={reactivar ? 'primario' : 'destructive'}
              disabled={cambiar.isPending}
              onClick={(evento) => {
                // Se mantiene abierto mientras responde el backend
                evento.preventDefault();
                cambiar.mutate(reactivar, {
                  onSuccess: () => {
                    setConfirmar(false);
                    toast.success(
                      reactivar
                        ? `Reactivaste la cuenta de ${nombre}.`
                        : `Desactivaste la cuenta de ${nombre}.`,
                    );
                  },
                });
              }}
            >
              {reactivar ? 'Reactivar' : 'Desactivar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

/**
 * E13-H4 FE, criterio 3 · «Pasar a cliente» quita el rol profesional (E13-H3). Pide el motivo,
 * que recibe por correo, y avisa que rige de inmediato. Un error del motivo queda junto al campo
 * sin perder lo escrito; otro error (403, 409) queda en el diálogo.
 */
export const PasarACliente = ({ cuenta }: { cuenta: ClienteDetalle }) => {
  const id = useId();
  const [abierto, setAbierto] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const pasar = usePasarACliente(cuenta.codigoPublico);
  const nombre = nombreCompleto(cuenta);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormularioPasarACliente>({
    resolver: zodResolver(esquemaPasarACliente),
    defaultValues: { motivo: '' },
  });

  // El backend no deja cambiar el rol de una cuenta desactivada (409)
  if (cuenta.rol !== 'profesional' || !cuenta.activo) return null;

  const cambiarAbierto = (abrir: boolean) => {
    if (pasar.isPending) return;
    if (!abrir) {
      reset();
      setAviso(null);
    }
    setAbierto(abrir);
  };

  const enviar = handleSubmit(async ({ motivo }) => {
    setAviso(null);
    try {
      await pasar.mutateAsync(motivo.trim());
      setAbierto(false);
      reset();
      toast.success(`${nombre} ahora tiene una cuenta de cliente.`);
    } catch (error) {
      const fallo = comoErrorDeApi(error);
      if (fallo.estado === 400) {
        setError(
          'motivo',
          { type: 'server', message: fallo.message },
          { shouldFocus: true },
        );
        return;
      }
      setAviso(fallo.message);
    }
  });

  return (
    <>
      <Button
        variant="contorno"
        className="self-start"
        onClick={() => setAbierto(true)}
      >
        Pasar a cliente
      </Button>
      <Dialog open={abierto} onOpenChange={cambiarAbierto}>
        <DialogContent>
          <form noValidate onSubmit={enviar} className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle className="titulo-h3 text-texto-principal">
                ¿Pasar a {nombre} a cliente?
              </DialogTitle>
              <DialogDescription className="texto-pequeno text-texto-secundario">
                Rige de inmediato: se cierran sus sesiones, deja de ver el
                precio profesional y se quitan de su carrito los productos
                exclusivos. Sus pedidos no cambian.
              </DialogDescription>
            </DialogHeader>
            {aviso && (
              <Alert variant="destructive">
                <TriangleAlert strokeWidth={1.75} aria-hidden />
                <AlertDescription>{aviso}</AlertDescription>
              </Alert>
            )}
            <CampoFormulario
              id={`${id}-motivo`}
              etiqueta="Motivo (se le envía por correo)"
              error={errors.motivo?.message}
              obligatorio
            >
              {(propsControl) => (
                <Textarea
                  {...propsControl}
                  {...register('motivo')}
                  rows={4}
                  maxLength={MAXIMO_MOTIVO_ROL}
                  autoComplete="off"
                />
              )}
            </CampoFormulario>
            <DialogFooter>
              <Button
                type="button"
                variant="contorno"
                disabled={pasar.isPending}
                onClick={() => cambiarAbierto(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={pasar.isPending}
              >
                {pasar.isPending && <Spinner aria-hidden />}
                Pasar a cliente
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
