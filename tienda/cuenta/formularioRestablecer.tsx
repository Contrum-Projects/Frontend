'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import { api } from '@/compartido/api/cliente';
import { ErrorDeApi, errorDeApi, exigir } from '@/compartido/api/errores';
import type { MensajeApi } from '@/compartido/api/respuestas';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Button } from '@/compartido/ui/button';
import { Input } from '@/compartido/ui/input';
import { Spinner } from '@/compartido/ui/spinner';
import { CampoFormulario } from './campoFormulario';
import {
  campoDelError,
  esErrorDelEnlace,
  esquemaRestablecer,
  type DatosRestablecer,
} from './esquemaRecuperacion';

type SalidaRestablecer = z.output<typeof esquemaRestablecer>;

/**
 * Campos de «Nueva contraseña» (E1-H4); el título está en <RestablecerContrasena>. Los
 * errores de la contraseña van junto a su campo sin perder lo escrito; si el backend rechaza
 * el enlace, avisa con `alRechazarEnlace`.
 *
 * Con `enlace="invitacion"` define la primera contraseña del personal (E13-H1): el backend
 * pide los mismos datos y responde los mismos errores.
 */
export function FormularioRestablecer({
  token,
  enlace = 'recuperacion',
  alRestablecer,
  alRechazarEnlace,
}: {
  token: string;
  enlace?: 'recuperacion' | 'invitacion';
  alRestablecer: (mensaje: string) => void;
  alRechazarEnlace: (mensaje: string) => void;
}) {
  const [errorServidor, setErrorServidor] = useState<ErrorDeApi | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<DatosRestablecer, unknown, SalidaRestablecer>({
    resolver: zodResolver(esquemaRestablecer),
    defaultValues: { contrasena: '', confirmacionContrasena: '' },
  });

  const mostrarErrores = (mensajes: string[]) => {
    const generales: string[] = [];
    let primero = true;
    for (const mensaje of mensajes) {
      const campo = campoDelError(mensaje);
      if (!campo) {
        generales.push(mensaje);
        continue;
      }
      setError(
        campo,
        { type: 'server', message: mensaje },
        { shouldFocus: primero },
      );
      primero = false;
    }
    if (generales.length > 0) setErrorServidor(new ErrorDeApi(400, generales));
  };

  const enviar = async (datos: SalidaRestablecer) => {
    setErrorServidor(null);
    try {
      // Sin useMutation: las variables llevan la contraseña y no deben quedar en caché
      const body = { token, ...datos };
      const { mensaje } = exigir<MensajeApi>(
        enlace === 'invitacion'
          ? await api.POST('/api/personal/invitacion/aceptar', { body })
          : await api.POST('/api/cuentas/restablecer-contrasena', { body }),
      );
      alRestablecer(mensaje);
    } catch (error) {
      // Sin conexión, fetch lanza TypeError: se muestra el mensaje genérico
      const fallo = error instanceof ErrorDeApi ? error : errorDeApi(undefined);
      if (fallo.estado !== 400) {
        setErrorServidor(fallo);
        return;
      }
      const delEnlace = fallo.mensajes.find(esErrorDelEnlace);
      if (delEnlace) {
        alRechazarEnlace(delEnlace);
        return;
      }
      mostrarErrores(fallo.mensajes);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(enviar)}
      noValidate
      aria-labelledby="titulo-restablecer"
      className="flex flex-col gap-4"
    >
      <CampoFormulario
        id="restablecer-contrasena"
        etiqueta="Nueva contraseña"
        error={errors.contrasena?.message}
      >
        {(control) => (
          <Input
            {...control}
            type="password"
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            {...register('contrasena')}
          />
        )}
      </CampoFormulario>

      <CampoFormulario
        id="restablecer-confirmacion"
        etiqueta="Repite tu contraseña"
        error={errors.confirmacionContrasena?.message}
      >
        {(control) => (
          <Input
            {...control}
            type="password"
            autoComplete="new-password"
            {...register('confirmacionContrasena')}
          />
        )}
      </CampoFormulario>

      {errorServidor && (
        <Alert variant={errorServidor.estado === 429 ? 'aviso' : 'destructive'}>
          <AlertDescription className="texto-pequeno">
            {errorServidor.mensajes.map((mensaje) => (
              <p key={mensaje}>{mensaje}</p>
            ))}
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
        Guardar contraseña
      </Button>
    </form>
  );
}
