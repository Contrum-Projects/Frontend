'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ErrorDeApi, errorDeApi } from '@/compartido/api/errores';
import { useSesion } from '@/compartido/sesion/sesion';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Button } from '@/compartido/ui/button';
import { Input } from '@/compartido/ui/input';
import { Label } from '@/compartido/ui/label';
import { Spinner } from '@/compartido/ui/spinner';
import { RUTAS } from '@/tienda/diseno/enlaces';

const esquemaIngreso = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Escribe tu correo.')
    .pipe(z.email('Escribe un correo válido.')),
  contrasena: z.string().min(1, 'Escribe tu contraseña.'),
});

type DatosIngreso = z.infer<typeof esquemaIngreso>;

/**
 * Campos de «Iniciar sesión» (E1-H2); el título y la tarjeta están en <PantallaIngreso>. Si el backend rechaza el ingreso muestra su mensaje como
 * error general, sin marcar un campo: no dice si falló el correo o la contraseña.
 * La redirección tras ingresar la hace <Ingreso> al ver la sesión activa.
 */
export function FormularioIngreso() {
  const { iniciarSesion } = useSesion();
  const [errorServidor, setErrorServidor] = useState<ErrorDeApi | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DatosIngreso>({
    resolver: zodResolver(esquemaIngreso),
    defaultValues: { email: '', contrasena: '' },
  });

  const enviar = async (datos: DatosIngreso) => {
    setErrorServidor(null);
    try {
      await iniciarSesion(datos);
    } catch (error) {
      // Sin conexión, fetch lanza TypeError: se muestra el mensaje genérico
      setErrorServidor(
        error instanceof ErrorDeApi ? error : errorDeApi(undefined),
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit(enviar)}
      noValidate
      aria-labelledby="titulo-ingreso"
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ingreso-email">Correo electrónico</Label>
        <Input
          id="ingreso-email"
          type="email"
          autoComplete="email"
          placeholder="nombre@correo.cl"
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? 'ingreso-email-error' : undefined}
          {...register('email')}
        />
        {errors.email && (
          <p
            id="ingreso-email-error"
            className="texto-pequeno text-destructive"
          >
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ingreso-contrasena">Contraseña</Label>
        <Input
          id="ingreso-contrasena"
          type="password"
          autoComplete="current-password"
          aria-invalid={errors.contrasena ? true : undefined}
          aria-describedby={
            errors.contrasena ? 'ingreso-contrasena-error' : undefined
          }
          {...register('contrasena')}
        />
        {errors.contrasena && (
          <p
            id="ingreso-contrasena-error"
            className="texto-pequeno text-destructive"
          >
            {errors.contrasena.message}
          </p>
        )}
      </div>

      <Link
        href={RUTAS.recuperarContrasena}
        className="inline-flex min-h-10 w-fit items-center texto-etiqueta text-marca-profundo hover:underline"
      >
        ¿Olvidaste tu contraseña?
      </Link>

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
        Ingresar
      </Button>
    </form>
  );
}
