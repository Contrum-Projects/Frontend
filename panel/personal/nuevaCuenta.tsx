'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Controller, useForm, type Control } from 'react-hook-form';
import { toast } from 'sonner';
import { api } from '@/compartido/api/cliente';
import { ErrorDeApi, errorDeApi, exigir } from '@/compartido/api/errores';
import type { CuentaPersonal } from '@/compartido/api/respuestas';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Button } from '@/compartido/ui/button';
import { Input } from '@/compartido/ui/input';
import { Label } from '@/compartido/ui/label';
import { RadioGroup, RadioGroupItem } from '@/compartido/ui/radio-group';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/compartido/ui/sheet';
import { Spinner } from '@/compartido/ui/spinner';
import { CampoFormulario } from '@/tienda/cuenta/campoFormulario';
import { CLAVE_PERSONAL } from './consultasPersonal';
import { nombreCompleto } from './cuentaPersonal';
import {
  campoDelError,
  cuerpoPersonal,
  esquemaPersonal,
  PERSONAL_VACIO,
  ROLES_ASIGNABLES,
  type FormularioPersonal,
  type SalidaPersonal,
} from './esquemaPersonal';

/** Panel lateral «Nueva cuenta de personal» (Figma P8a 2049:2158, E13-H1 criterio 2). */
export function NuevaCuenta({
  abierto,
  alCambiarAbierto,
}: {
  abierto: boolean;
  alCambiarAbierto: (abierto: boolean) => void;
}) {
  return (
    <Sheet open={abierto} onOpenChange={alCambiarAbierto}>
      <SheetContent
        aria-describedby={undefined}
        className="w-full gap-4 overflow-y-auto bg-fondo-superficie p-6 sm:max-w-md"
      >
        <SheetHeader className="p-0 pr-12">
          <SheetTitle className="titulo-h3 font-normal text-texto-principal">
            Nueva cuenta de personal
          </SheetTitle>
        </SheetHeader>
        {/* Se monta al abrir: cada apertura parte vacía */}
        {abierto && (
          <FormularioNuevaCuenta alTerminar={() => alCambiarAbierto(false)} />
        )}
      </SheetContent>
    </Sheet>
  );
}

function FormularioNuevaCuenta({ alTerminar }: { alTerminar: () => void }) {
  const clienteConsultas = useQueryClient();
  const [aviso, setAviso] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormularioPersonal, unknown, SalidaPersonal>({
    resolver: zodResolver(esquemaPersonal),
    defaultValues: PERSONAL_VACIO,
  });

  const mostrarError = (fallo: ErrorDeApi) => {
    if (fallo.estado !== 400 && fallo.estado !== 409) {
      setAviso(fallo.message);
      return;
    }
    const generales: string[] = [];
    for (const mensaje of fallo.mensajes) {
      const campo = campoDelError(mensaje);
      if (campo) setError(campo, { type: 'server', message: mensaje });
      else generales.push(mensaje);
    }
    if (generales.length > 0) setAviso(generales.join(' '));
  };

  const enviar = async (datos: SalidaPersonal) => {
    setAviso(null);
    try {
      const cuenta = exigir<CuentaPersonal>(
        await api.POST('/api/personal', { body: cuerpoPersonal(datos) }),
      );
      await clienteConsultas.invalidateQueries({ queryKey: CLAVE_PERSONAL });
      toast.success(
        `Creamos la cuenta de ${nombreCompleto(cuenta)}. Le enviamos un correo a ${cuenta.email} para que cree su contraseña.`,
      );
      alTerminar();
    } catch (error) {
      // Sin conexión, fetch lanza TypeError: se muestra el mensaje genérico
      mostrarError(error instanceof ErrorDeApi ? error : errorDeApi(undefined));
    }
  };

  return (
    <form
      onSubmit={handleSubmit(enviar)}
      noValidate
      aria-label="Nueva cuenta de personal"
      className="flex flex-1 flex-col gap-4"
    >
      {aviso && (
        <Alert variant="destructive">
          <AlertDescription>{aviso}</AlertDescription>
        </Alert>
      )}
      <div className="grid grid-cols-2 gap-x-3">
        <CampoFormulario
          id="personal-nombre"
          etiqueta="Nombre"
          error={errors.nombre?.message}
        >
          {(propsControl) => (
            <Input
              {...propsControl}
              autoComplete="off"
              {...register('nombre')}
            />
          )}
        </CampoFormulario>
        <CampoFormulario
          id="personal-apellido"
          etiqueta="Apellido"
          error={errors.apellido?.message}
        >
          {(propsControl) => (
            <Input
              {...propsControl}
              autoComplete="off"
              {...register('apellido')}
            />
          )}
        </CampoFormulario>
      </div>
      <CampoFormulario
        id="personal-email"
        etiqueta="Correo electrónico"
        error={errors.email?.message}
      >
        {(propsControl) => (
          <Input
            {...propsControl}
            type="email"
            autoComplete="off"
            {...register('email')}
          />
        )}
      </CampoFormulario>
      <SelectorRol control={control} error={errors.rol?.message} />

      {/* Abajo del panel, como en Figma */}
      <div className="mt-auto flex gap-3 pt-4">
        <Button
          type="button"
          variant="contorno"
          size="grande"
          className="flex-1"
          onClick={alTerminar}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          size="grande"
          className="flex-1"
          disabled={isSubmitting}
        >
          {isSubmitting && <Spinner aria-hidden />}
          Crear cuenta
        </Button>
      </div>
    </form>
  );
}

/** Rol con tarjetas de opción (Figma 2049:2176): una sola por cuenta. */
const SelectorRol = ({
  control,
  error,
}: {
  control: Control<FormularioPersonal, unknown, SalidaPersonal>;
  error?: string;
}) => (
  <div className="flex flex-col gap-3">
    <span id="personal-rol" className="texto-etiqueta text-texto-principal">
      Rol
    </span>
    <Controller
      control={control}
      name="rol"
      render={({ field }) => (
        <RadioGroup
          ref={field.ref}
          name={field.name}
          value={field.value}
          onValueChange={field.onChange}
          aria-labelledby="personal-rol"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'personal-rol-error' : undefined}
          className="gap-3"
        >
          {ROLES_ASIGNABLES.map(({ rol, nombre, descripcion }) => (
            <Label
              key={rol}
              htmlFor={`personal-rol-${rol}`}
              className="flex cursor-pointer items-center gap-3 rounded-md border-2 border-fondo-hueso-oscuro bg-fondo-hueso px-4 py-3 has-data-[state=checked]:border-marca-profundo has-data-[state=checked]:bg-marca-acento-suave"
            >
              <RadioGroupItem
                id={`personal-rol-${rol}`}
                value={rol}
                aria-describedby={`personal-rol-${rol}-detalle`}
              />
              <span className="flex flex-col">
                <span className="texto-etiqueta text-texto-principal">
                  {nombre}
                </span>
                <span
                  id={`personal-rol-${rol}-detalle`}
                  className="texto-leyenda text-texto-secundario"
                >
                  {descripcion}
                </span>
              </span>
            </Label>
          ))}
        </RadioGroup>
      )}
    />
    {error && (
      <p id="personal-rol-error" className="texto-pequeno text-destructive">
        {error}
      </p>
    )}
  </div>
);
