'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { flushSync } from 'react-dom';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import { api } from '@/compartido/api/cliente';
import { ErrorDeApi, errorDeApi, exigir } from '@/compartido/api/errores';
import type { MensajeApi } from '@/compartido/api/respuestas';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Button } from '@/compartido/ui/button';
import { Checkbox } from '@/compartido/ui/checkbox';
import { Input } from '@/compartido/ui/input';
import { Spinner } from '@/compartido/ui/spinner';
import { RUTAS } from '@/tienda/diseno/enlaces';
import { CampoFormulario } from './campoFormulario';
import { DatosOpcionales } from './datosOpcionales';
import { repartirErrores } from './erroresRegistro';
import {
  CAMPOS_OPCIONALES,
  cuerpoRegistro,
  esquemaRegistro,
  REGISTRO_VACIO,
  type CampoRegistro,
  type DatosRegistro,
} from './esquemaRegistro';

type SalidaRegistro = z.output<typeof esquemaRegistro>;

interface Aviso {
  variante: 'destructive' | 'aviso';
  mensajes: string[];
}

/**
 * Campos de «Crear cuenta» (E1-H1); el título y la tarjeta están en <Registro>. Los errores
 * del backend se muestran junto a su campo (los que no son de un campo, como aviso general)
 * y lo escrito se conserva. Con la cuenta creada, avisa con el correo escrito.
 */
export function FormularioRegistro({
  alRegistrar,
}: {
  alRegistrar: (email: string) => void;
}) {
  const [opcionalesAbiertos, setOpcionalesAbiertos] = useState(false);
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const registro = useMutation({
    // Las variables llevan la contraseña: que no queden en la caché de mutaciones
    gcTime: 0,
    mutationFn: async (datos: SalidaRegistro) =>
      exigir<MensajeApi>(
        await api.POST('/api/cuentas/registro', {
          body: cuerpoRegistro(datos),
        }),
      ),
  });
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<DatosRegistro, unknown, SalidaRegistro>({
    resolver: zodResolver(esquemaRegistro),
    defaultValues: REGISTRO_VACIO,
  });

  const mostrarErroresDeCampo = (mensajes: string[]) => {
    const { campos, generales } = repartirErrores(mensajes);
    const conError = Object.entries(campos) as [CampoRegistro, string][];
    // Abre «Datos opcionales» antes de enfocar un campo que está ahí
    if (conError.some(([campo]) => CAMPOS_OPCIONALES.includes(campo))) {
      flushSync(() => setOpcionalesAbiertos(true));
    }
    conError.forEach(([campo, mensaje], i) =>
      setError(
        campo,
        { type: 'server', message: mensaje },
        { shouldFocus: i === 0 },
      ),
    );
    if (generales.length > 0) {
      setAviso({ variante: 'destructive', mensajes: generales });
    }
  };

  const enviar = async (datos: SalidaRegistro) => {
    setAviso(null);
    try {
      await registro.mutateAsync(datos);
      // El formulario queda montado (oculto): se conserva lo escrito salvo las contraseñas
      setValue('contrasena', '');
      setValue('confirmacionContrasena', '');
      alRegistrar(datos.email);
    } catch (error) {
      // Sin conexión, fetch lanza TypeError: se muestra el mensaje genérico
      const fallo = error instanceof ErrorDeApi ? error : errorDeApi(undefined);
      if (fallo.estado === 400 || fallo.estado === 409) {
        mostrarErroresDeCampo(fallo.mensajes);
        return;
      }
      setAviso({
        variante: fallo.estado === 429 ? 'aviso' : 'destructive',
        mensajes: [fallo.message],
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(enviar)}
      noValidate
      aria-labelledby="titulo-registro"
      className="flex flex-col gap-4"
    >
      <div className="grid grid-cols-2 gap-3">
        <CampoFormulario
          id="registro-nombre"
          etiqueta="Nombre"
          error={errors.nombre?.message}
        >
          {(control) => (
            <Input
              {...control}
              autoComplete="given-name"
              {...register('nombre')}
            />
          )}
        </CampoFormulario>
        <CampoFormulario
          id="registro-apellido"
          etiqueta="Apellido"
          error={errors.apellido?.message}
        >
          {(control) => (
            <Input
              {...control}
              autoComplete="family-name"
              {...register('apellido')}
            />
          )}
        </CampoFormulario>
      </div>

      <CampoFormulario
        id="registro-email"
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

      <CampoFormulario
        id="registro-contrasena"
        etiqueta="Contraseña"
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
        id="registro-confirmacion"
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

      <DatosOpcionales
        register={register}
        errors={errors}
        abierto={opcionalesAbiertos}
        alAlternar={() => setOpcionalesAbiertos((abierto) => !abierto)}
      />

      {/* TODO(backend SCRUM-19): el DTO del registro aún no recibe el consentimiento; no se envía */}
      <div className="flex min-h-10 items-center gap-2">
        <Checkbox id="registro-ofertas" />
        {/* Texto pequeño, no etiqueta: <Label> trae texto-etiqueta de base */}
        <label
          htmlFor="registro-ofertas"
          className="flex min-h-10 flex-1 cursor-pointer items-center texto-pequeno text-texto-principal"
        >
          Quiero recibir ofertas por correo
        </label>
      </div>

      {aviso && (
        <Alert variant={aviso.variante}>
          <AlertDescription className="texto-pequeno">
            {aviso.mensajes.map((mensaje) => (
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
        Crear cuenta
      </Button>

      <p className="texto-leyenda text-texto-secundario">
        Te enviaremos un correo para confirmar tu cuenta.
      </p>

      <p className="flex flex-wrap items-center gap-1 texto-pequeno text-texto-secundario">
        ¿Ya tienes cuenta?
        <Link
          href={RUTAS.ingresar}
          className="inline-flex min-h-10 items-center texto-etiqueta text-marca-profundo hover:underline"
        >
          Ingresar
        </Link>
      </p>
    </form>
  );
}
