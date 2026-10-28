'use client';

import { Ellipsis } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ErrorDeApi } from '@/compartido/api/errores';
import type { CuentaPersonal } from '@/compartido/api/respuestas';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/compartido/ui/dropdown-menu';
import { Switch } from '@/compartido/ui/switch';
import {
  useDesactivarCuenta,
  useReenviarInvitacion,
} from './consultasPersonal';
import { nombreCompleto } from './cuentaPersonal';

interface AccionesProps {
  cuenta: CuentaPersonal;
  /** La cuenta de quien mira: el backend no deja desactivarla (409). */
  propia: boolean;
}

/** Desactivar con confirmación (E13-H1, criterio 3). La cuenta no se borra. */
const ConfirmarDesactivar = ({
  cuenta,
  abierto,
  alCambiarAbierto,
}: {
  cuenta: CuentaPersonal;
  abierto: boolean;
  alCambiarAbierto: (abierto: boolean) => void;
}) => {
  const desactivar = useDesactivarCuenta(cuenta.codigoPublico);
  const cambiarAbierto = (abrir: boolean) => {
    if (desactivar.isPending) return;
    if (!abrir) desactivar.reset();
    alCambiarAbierto(abrir);
  };

  return (
    <AlertDialog open={abierto} onOpenChange={cambiarAbierto}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="titulo-h3 text-texto-principal">
            ¿Desactivar la cuenta de {nombreCompleto(cuenta)}?
          </AlertDialogTitle>
          <AlertDialogDescription className="texto-pequeno text-texto-secundario">
            Perderá el acceso al panel de inmediato. La cuenta no se borra:
            seguirá en la lista como desactivada.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {desactivar.isError && (
          <p role="alert" className="texto-pequeno text-estado-error">
            {desactivar.error.message}
          </p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={desactivar.isPending}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={desactivar.isPending}
            onClick={(evento) => {
              // Se mantiene abierto mientras responde el backend
              evento.preventDefault();
              desactivar.mutate(undefined, {
                onSuccess: () => alCambiarAbierto(false),
              });
            }}
          >
            Desactivar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const useReenviar = (cuenta: CuentaPersonal) => {
  const reenviar = useReenviarInvitacion(cuenta.codigoPublico);
  return {
    pendiente: reenviar.isPending,
    reenviar: () =>
      reenviar.mutate(undefined, {
        onSuccess: () =>
          toast.success(`Le enviamos una invitación nueva a ${cuenta.email}.`),
        onError: (error) => {
          // El 403 ya lo avisa el panel (compartido/proveedores.tsx)
          if (!(error instanceof ErrorDeApi && error.estado === 403)) {
            toast.error(error.message);
          }
        },
      }),
  };
};

const puedeReenviar = (cuenta: CuentaPersonal) =>
  cuenta.activo && cuenta.invitacionPendiente;

/** Escritorio: el menú «⋯» de la fila (Figma 2049:2002). */
export const MenuCuenta = ({ cuenta, propia }: AccionesProps) => {
  const [confirmar, setConfirmar] = useState(false);
  const { reenviar, pendiente } = useReenviar(cuenta);
  const nombre = nombreCompleto(cuenta);

  // Desactivada o la propia sin invitación pendiente: no hay nada que hacer
  if (!cuenta.activo || (propia && !puedeReenviar(cuenta))) return null;
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icono-chico"
            aria-label={`Acciones de ${nombre}`}
          >
            <Ellipsis aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-48">
          {puedeReenviar(cuenta) && (
            <DropdownMenuItem disabled={pendiente} onSelect={reenviar}>
              Reenviar invitación
            </DropdownMenuItem>
          )}
          {!propia && (
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => setConfirmar(true)}
            >
              Desactivar cuenta
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmarDesactivar
        cuenta={cuenta}
        abierto={confirmar}
        alCambiarAbierto={setConfirmar}
      />
    </>
  );
};

/** Celular: el interruptor de la fila (Figma 2051:1413). Apagarlo pide confirmación. */
export const InterruptorCuenta = ({ cuenta, propia }: AccionesProps) => {
  const [confirmar, setConfirmar] = useState(false);
  const idPropia = `propia-${cuenta.codigoPublico}`;
  return (
    <>
      {propia && (
        <span id={idPropia} className="sr-only">
          No puedes desactivar tu propia cuenta.
        </span>
      )}
      <Switch
        checked={cuenta.activo}
        disabled={!cuenta.activo || propia}
        aria-label={`Cuenta de ${nombreCompleto(cuenta)} activa`}
        aria-describedby={propia ? idPropia : undefined}
        onCheckedChange={(activa) => {
          if (!activa) setConfirmar(true);
        }}
      />
      <ConfirmarDesactivar
        cuenta={cuenta}
        abierto={confirmar}
        alCambiarAbierto={setConfirmar}
      />
    </>
  );
};

/** Celular: «Reenviar invitación» bajo el nombre, solo si la invitación sigue pendiente. */
export const ReenviarInvitacion = ({ cuenta }: { cuenta: CuentaPersonal }) => {
  const { reenviar, pendiente } = useReenviar(cuenta);
  if (!puedeReenviar(cuenta)) return null;
  return (
    <Button
      variant="link"
      className="min-h-10 self-start texto-etiqueta"
      disabled={pendiente}
      onClick={reenviar}
    >
      Reenviar invitación
    </Button>
  );
};
