'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import { ErrorDeApi, errorDeApi } from '@/compartido/api/errores';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Button } from '@/compartido/ui/button';
import { Input } from '@/compartido/ui/input';
import { Spinner } from '@/compartido/ui/spinner';
import { CampoFormulario } from './campoFormulario';
import { esquemaSolicitud, type DatosSolicitud } from './esquemaRecuperacion';

type SalidaSolicitud = z.output<typeof esquemaSolicitud>;

/**
 * Campos de «Recuperar contraseña» (E1-H4, Figma 2034:4783); el título está en
 * <SolicitudRecuperacion>. El 400 del correo va junto al campo; el 429 y los demás, como aviso.
 */
export function FormularioSolicitud({
  solicitar,
}: {
  /** Pide el enlace; lanza `ErrorDeApi` si el backend lo rechaza. */
  solicitar: (email: string) => Promise<void>;
}) {
  const [errorServidor, setErrorServidor] = useState<ErrorDeApi | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<DatosSolicitud, unknown, SalidaSolicitud>({
    resolver: zodResolver(esquemaSolicitud),
    defaultValues: { email: '' },
  });

  const enviar = async ({ email }: SalidaSolicitud) => {
    setErrorServidor(null);
    try {
      await solicitar(email);
    } catch (error) {
      // Sin conexión, fetch lanza TypeError: se muestra el mensaje genérico
      const fallo = error instanceof ErrorDeApi ? error : errorDeApi(undefined);
      if (fallo.estado === 400) {
        setError(
          'email',
          { type: 'server', message: fallo.message },
          { shouldFocus: true },
        );
        return;
      }
      setErrorServidor(fallo);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(enviar)}
      noValidate
      aria-labelledby="titulo-recuperacion"
      className="flex flex-col gap-4"
    >
      <CampoFormulario
        id="recuperacion-email"
        etiqueta="Correo electrónico"
        error={errors.email?.message}
      >
        {(control) => (
          <Input
            {...control}
            type="email"
            autoComplete="email"
            placeholder="nombre@correo.cl"
            {...register('email')}
          />
        )}
      </CampoFormulario>

      {errorServidor && (
        <Alert variant={errorServidor.estado === 429 ? 'aviso' : 'destructive'}>
          <AlertDescription className="texto-pequeno">
            {errorServidor.message}
          </AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        size="grande"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting && <Spinner aria-hidden />}
        Enviar enlace
      </Button>
    </form>
  );
}
