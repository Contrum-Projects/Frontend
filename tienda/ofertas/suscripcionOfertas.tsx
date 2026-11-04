'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { CircleAlertIcon } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { api } from '@/compartido/api/cliente';
import { ErrorDeApi, errorDeApi, exigir } from '@/compartido/api/errores';
import type { MensajeApi } from '@/compartido/api/respuestas';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Button } from '@/compartido/ui/button';
import { Input } from '@/compartido/ui/input';
import { Spinner } from '@/compartido/ui/spinner';
import {
  esquemaSuscripcion,
  type DatosSuscripcion,
  type SalidaSuscripcion,
} from './esquemaSuscripcion';

const ID_CAMPO = 'suscripcion-email';
const ID_ERROR = `${ID_CAMPO}-error`;

/** POST /api/marketing/suscripciones, con los fallos de red como `ErrorDeApi`. */
const pedirSuscripcion = async (email: string) => {
  try {
    // TODO(SCRUM-68): el Swagger no declara el cuerpo { mensaje } del 202
    return exigir<MensajeApi>(
      await api.POST('/api/marketing/suscripciones', { body: { email } }),
    );
  } catch (error) {
    throw error instanceof ErrorDeApi ? error : errorDeApi(undefined);
  }
};

/**
 * «Newsletter» del footer (E12-H1, Figma 6:153 y 6:204): el visitante deja su correo, sin
 * cuenta. Al enviarlo, el formulario se reemplaza por el mensaje del backend, que es el mismo
 * para todo correo válido (no revela si ya estaba suscrito). El 400 va junto al campo; el 429
 * y los demás, como aviso, sin perder lo escrito.
 */
export function SuscripcionOfertas() {
  const suscripcion = useMutation<MensajeApi, ErrorDeApi, string>({
    mutationFn: pedirSuscripcion,
  });
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<DatosSuscripcion, unknown, SalidaSuscripcion>({
    resolver: zodResolver(esquemaSuscripcion),
    defaultValues: { email: '' },
  });
  // El formulario desaparece con el botón enfocado: el foco pasa al mensaje
  const confirmacion = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (suscripcion.isSuccess) confirmacion.current?.focus();
  }, [suscripcion.isSuccess]);

  const enviar = ({ email }: SalidaSuscripcion) =>
    suscripcion.mutate(email, {
      onError: (fallo) => {
        if (fallo.estado !== 400) return;
        setError(
          'email',
          { type: 'server', message: fallo.message },
          { shouldFocus: true },
        );
      },
    });

  const errorCampo = errors.email?.message;
  const aviso =
    suscripcion.isError && suscripcion.error.estado !== 400
      ? suscripcion.error
      : null;

  return (
    <section
      aria-labelledby="titulo-suscripcion"
      className="flex flex-col gap-3 md:max-w-md md:min-w-64 md:flex-1"
    >
      <h2 id="titulo-suscripcion" className="titulo-h3">
        Newsletter
      </h2>
      <p className="texto-pequeno opacity-85">
        Ofertas y novedades en tu correo. Puedes darte de baja cuando quieras.
      </p>
      {/* Siempre en el árbol, para que se anuncie el mensaje cuando aparece */}
      <div role="status">
        {suscripcion.isSuccess && (
          <p
            ref={confirmacion}
            tabIndex={-1}
            className="rounded-lg bg-texto-sobre-oscuro/8 px-4 py-3 texto-pequeno outline-none"
          >
            {suscripcion.data.mensaje}
          </p>
        )}
      </div>
      {!suscripcion.isSuccess && (
        <form
          onSubmit={handleSubmit(enviar)}
          noValidate
          className="flex flex-col gap-2"
        >
          <div className="flex gap-2">
            <label htmlFor={ID_CAMPO} className="sr-only">
              Correo electrónico
            </label>
            <Input
              id={ID_CAMPO}
              type="email"
              autoComplete="email"
              placeholder="tu@correo.cl"
              aria-invalid={errorCampo ? true : undefined}
              aria-describedby={errorCampo ? ID_ERROR : undefined}
              className="h-11 flex-1 rounded-full border border-texto-sobre-oscuro/25 bg-texto-sobre-oscuro/8 px-4 text-texto-sobre-oscuro placeholder:text-texto-sobre-oscuro/70 focus-visible:border-marca-logo aria-invalid:border-texto-sobre-oscuro"
              {...register('email')}
            />
            <Button
              type="submit"
              variant="acento"
              // El anillo acento se pierde contra el botón: marca/logo, separado del borde
              className="h-11 focus-visible:ring-marca-logo focus-visible:ring-offset-2 focus-visible:ring-offset-marca-profundo"
              disabled={suscripcion.isPending}
            >
              {suscripcion.isPending && <Spinner aria-hidden />}
              Suscribirme
            </Button>
          </div>
          {/* Sobre marca/profundo el rojo de error no tiene contraste: texto claro con ícono */}
          {errorCampo && (
            <p id={ID_ERROR} className="flex items-start gap-2 texto-pequeno">
              <CircleAlertIcon
                aria-hidden
                className="mt-0.5 size-4 shrink-0 stroke-[1.75] text-marca-logo"
              />
              {errorCampo}
            </p>
          )}
          {aviso && (
            <Alert variant={aviso.estado === 429 ? 'aviso' : 'destructive'}>
              <AlertDescription className="texto-pequeno">
                {aviso.message}
              </AlertDescription>
            </Alert>
          )}
        </form>
      )}
    </section>
  );
}
