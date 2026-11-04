'use client';

import { UsersRound } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from 'react-hook-form';
import type { VistaPreviaCampana } from '@/compartido/api/respuestas';
import { formatearNumero } from '@/compartido/formato/numero';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Input } from '@/compartido/ui/input';
import { Skeleton } from '@/compartido/ui/skeleton';
import { Textarea } from '@/compartido/ui/textarea';
import { CampoFormulario } from '@/tienda/cuenta/campoFormulario';
import { useSegmentosCampana } from './consultasCampanas';
import type { FormularioCampana } from './esquemaCampana';
import { SelectorSegmento } from './selectorSegmento';

const Tarjeta = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-col gap-4 lg:rounded-2xl lg:border lg:bg-card lg:p-6">
    {children}
  </div>
);

/** «Mensaje» (P7a 2046:1734): asunto y cuerpo en texto simple, con `{nombre}`. */
export const TarjetaMensaje = ({
  id,
  register,
  errors,
}: {
  id: string;
  register: UseFormRegister<FormularioCampana>;
  errors: FieldErrors<FormularioCampana>;
}) => (
  <Tarjeta>
    <h2 className="texto-cuerpo-fuerte text-texto-principal max-lg:sr-only">
      Mensaje
    </h2>
    <CampoFormulario
      id={`${id}-asunto`}
      etiqueta="Asunto"
      error={errors.asunto?.message}
    >
      {(propsControl) => (
        <Input {...propsControl} {...register('asunto')} autoComplete="off" />
      )}
    </CampoFormulario>
    <CampoFormulario
      id={`${id}-cuerpo`}
      etiqueta="Cuerpo"
      error={errors.cuerpo?.message}
    >
      {(propsControl) => (
        <Textarea
          {...propsControl}
          {...register('cuerpo')}
          rows={6}
          autoComplete="off"
          placeholder="Hola, {nombre}:"
        />
      )}
    </CampoFormulario>
    <p className="texto-leyenda text-texto-secundario">
      Separa los párrafos con una línea en blanco. {'{nombre}'} se cambia por el
      nombre de cada destinatario.
    </p>
  </Tarjeta>
);

/** «¿A quién le llega?» (P7a 2046:1755) con el conteo de destinatarios del backend. */
export const TarjetaSegmento = ({
  id,
  control,
  vista,
  errorVista,
}: {
  id: string;
  control: Control<FormularioCampana>;
  vista: VistaPreviaCampana | undefined;
  errorVista?: string;
}) => {
  const segmentos = useSegmentosCampana();

  return (
    <Tarjeta>
      {segmentos.isPending ? (
        <div aria-hidden className="flex flex-col gap-3">
          <Skeleton className="h-6 w-40" />
          <div className="flex gap-2">
            {[0, 1, 2].map((chip) => (
              <Skeleton key={chip} className="h-10 w-24 rounded-full" />
            ))}
          </div>
        </div>
      ) : segmentos.isError ? (
        <Alert variant="destructive">
          <AlertDescription>{segmentos.error.message}</AlertDescription>
        </Alert>
      ) : (
        <Controller
          control={control}
          name="segmento"
          render={({ field, fieldState }) => (
            <SelectorSegmento
              id={`${id}-segmento`}
              tipos={segmentos.data.tipos}
              valor={field.value}
              alCambiar={field.onChange}
              error={
                fieldState.error?.message ??
                // El error de un campo hijo (segmento.tipo) también va aquí
                (
                  fieldState.error as
                    { tipo?: { message?: string } } | undefined
                )?.tipo?.message
              }
            />
          )}
        />
      )}
      <p
        role="status"
        className="flex items-center gap-2 rounded-lg bg-marca-acento-suave px-4 py-3 texto-pequeno text-marca-profundo"
      >
        <UsersRound
          aria-hidden
          strokeWidth={1.75}
          className="size-5 shrink-0"
        />
        {vista
          ? `${formatearNumero(vista.destinatarios)} destinatarios con consentimiento.`
          : errorVista
            ? 'No pudimos contar los destinatarios.'
            : 'Contando destinatarios…'}
      </p>
    </Tarjeta>
  );
};
