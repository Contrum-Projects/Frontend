'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { ErrorDeApi, errorDeApi } from '@/compartido/api/errores';
import type { SolicitudResuelta } from '@/compartido/api/respuestas';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Button } from '@/compartido/ui/button';
import { Input } from '@/compartido/ui/input';
import { Spinner } from '@/compartido/ui/spinner';
import { CampoFormulario } from '@/tienda/cuenta/campoFormulario';
import { useResolverSolicitud, type Decision } from './consultasVerificaciones';
import {
  MAXIMO_MOTIVO,
  esquemaRechazo,
  type FormularioRechazo,
} from './textosVerificacion';

/**
 * E10-H3, criterio 3 · Motivo, «Rechazar» y «Aprobar» (Figma 2029:1017). El motivo solo se exige
 * para rechazar; aprobar no pide confirmación (decisión del 4-11-2026). Un error del motivo queda
 * junto al campo sin perder lo escrito; un 409 (otra persona ya la resolvió) se avisa con un
 * toast, porque la revisión vuelve resuelta y este formulario desaparece.
 */
export function FormularioResolucion({
  codigoPublico,
  alResolver,
}: {
  codigoPublico: string;
  alResolver: (resuelta: SolicitudResuelta) => void;
}) {
  const id = useId();
  const [aviso, setAviso] = useState<string | null>(null);
  const resolver = useResolverSolicitud(codigoPublico);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormularioRechazo>({
    resolver: zodResolver(esquemaRechazo),
    defaultValues: { motivo: '' },
  });
  const enCurso = resolver.isPending ? resolver.variables.tipo : null;

  const decidir = async (decision: Decision) => {
    if (resolver.isPending) return;
    setAviso(null);
    try {
      alResolver(await resolver.mutateAsync(decision));
    } catch (error) {
      // Sin conexión, fetch lanza TypeError: se muestra el mensaje genérico
      const fallo = error instanceof ErrorDeApi ? error : errorDeApi(undefined);
      if (fallo.estado === 400 && decision.tipo === 'rechazar') {
        setError(
          'motivo',
          { type: 'server', message: fallo.message },
          { shouldFocus: true },
        );
        return;
      }
      if (fallo.estado === 409) toast.error(fallo.message);
      setAviso(fallo.message);
    }
  };

  return (
    <form
      noValidate
      aria-label="Resolver la solicitud"
      onSubmit={handleSubmit(({ motivo }) =>
        decidir({ tipo: 'rechazar', motivo: motivo.trim() }),
      )}
      className="flex flex-col gap-3"
    >
      {aviso && (
        <Alert variant="destructive">
          <AlertDescription>{aviso}</AlertDescription>
        </Alert>
      )}
      {/* Escritorio: el campo toma las filas de la grilla (etiqueta, caja, error) y los botones
          quedan en la fila de la caja, también con un error debajo */}
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-x-3 lg:gap-y-1.5">
        <CampoFormulario
          id={`${id}-motivo`}
          etiqueta="Motivo (obligatorio para rechazar)"
          error={errors.motivo?.message}
        >
          {(propsControl) => (
            <Input
              {...propsControl}
              {...register('motivo')}
              placeholder="Escribe el motivo"
              maxLength={MAXIMO_MOTIVO}
              autoComplete="off"
            />
          )}
        </CampoFormulario>
        <div className="grid grid-cols-2 gap-3 lg:col-start-2 lg:row-start-2 lg:flex">
          <Button
            type="submit"
            variant="contorno"
            size="grande"
            aria-disabled={enCurso !== null || undefined}
            className="aria-disabled:cursor-default aria-disabled:opacity-50"
          >
            {enCurso === 'rechazar' && <Spinner aria-hidden />}
            Rechazar
          </Button>
          <Button
            type="button"
            size="grande"
            aria-disabled={enCurso !== null || undefined}
            className="aria-disabled:cursor-default aria-disabled:opacity-50"
            onClick={() => void decidir({ tipo: 'aprobar' })}
          >
            {enCurso === 'aprobar' && <Spinner aria-hidden />}
            Aprobar
          </Button>
        </div>
      </div>
    </form>
  );
}
