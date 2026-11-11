'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useId } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ErrorDeApi } from '@/compartido/api/errores';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Button } from '@/compartido/ui/button';
import { Input } from '@/compartido/ui/input';
import { Label } from '@/compartido/ui/label';
import { Spinner } from '@/compartido/ui/spinner';
import { useDarDeBajaCorreo } from './consultasCampanas';

/** Repite la regla del DTO del backend (dar-de-baja.dto.ts) solo para avisar antes de enviar. */
const esquemaBaja = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Escribe el correo.')
    .max(254, 'El correo no puede superar los 254 caracteres.')
    .pipe(z.email('Escribe un correo válido.')),
});

type DatosBaja = z.input<typeof esquemaBaja>;
type SalidaBaja = z.output<typeof esquemaBaja>;

/**
 * Tarjeta «Dar de baja un correo» de «Campañas» (E12-H2, SCRUM-19). Sin diseño en Figma: la
 * misma tarjeta que el saludo de cumpleaños. La persona pide la baja escribiendo al correo de
 * contacto y el administrador la registra aquí; el backend dice si había una cuenta, una
 * suscripción o ninguna (404, junto al campo).
 */
export const TarjetaBajaCorreo = () => {
  const id = useId();
  const baja = useDarDeBajaCorreo();
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DatosBaja, unknown, SalidaBaja>({
    resolver: zodResolver(esquemaBaja),
    defaultValues: { email: '' },
  });

  const enviar = async ({ email }: SalidaBaja) => {
    try {
      await baja.mutateAsync(email);
      reset();
    } catch (error) {
      // 400 y 404 son del correo escrito: van junto al campo. Lo demás, como aviso.
      if (
        error instanceof ErrorDeApi &&
        (error.estado === 400 || error.estado === 404)
      ) {
        setError('email', { type: 'server', message: error.message });
      }
    }
  };

  const errorCampo = errors.email?.message;
  const errorGeneral =
    baja.isError &&
    !(
      baja.error instanceof ErrorDeApi &&
      (baja.error.estado === 400 || baja.error.estado === 404)
    )
      ? baja.error.message
      : null;

  return (
    <section
      aria-labelledby={`${id}-titulo`}
      className="flex flex-col gap-3 rounded-lg border bg-card p-4 lg:p-6"
    >
      <h2
        id={`${id}-titulo`}
        className="texto-cuerpo-fuerte text-texto-principal"
      >
        Dar de baja un correo
      </h2>
      <p className="texto-pequeno text-texto-secundario">
        Cuando alguien pida dejar de recibir ofertas, escribe su correo. Deja de
        recibir campañas, recordatorios y saludos.
      </p>

      <form
        onSubmit={handleSubmit(enviar)}
        noValidate
        aria-labelledby={`${id}-titulo`}
        className="flex flex-col gap-3"
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${id}-email`}>Correo</Label>
          <Input
            id={`${id}-email`}
            type="email"
            autoComplete="off"
            placeholder="nombre@correo.cl"
            aria-invalid={errorCampo ? true : undefined}
            aria-describedby={errorCampo ? `${id}-error` : undefined}
            {...register('email', { onChange: () => baja.reset() })}
          />
          {errorCampo && (
            <p id={`${id}-error`} className="texto-pequeno text-destructive">
              {errorCampo}
            </p>
          )}
        </div>
        <Button type="submit" variant="contorno" disabled={isSubmitting}>
          {isSubmitting && <Spinner aria-hidden />}
          Dar de baja
        </Button>
      </form>

      <div aria-live="polite">
        {baja.isSuccess && (
          <Alert>
            <AlertDescription className="texto-pequeno">
              {baja.data.mensaje}
            </AlertDescription>
          </Alert>
        )}
      </div>
      {errorGeneral && (
        <Alert variant="destructive">
          <AlertDescription className="texto-pequeno">
            {errorGeneral}
          </AlertDescription>
        </Alert>
      )}
    </section>
  );
};
