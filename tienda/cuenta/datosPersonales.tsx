'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Check } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { api } from '@/compartido/api/cliente';
import { ErrorDeApi, errorDeApi, exigir } from '@/compartido/api/errores';
import type { DatosPersonales as Datos } from '@/compartido/api/respuestas';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Button } from '@/compartido/ui/button';
import { Skeleton } from '@/compartido/ui/skeleton';
import { Spinner } from '@/compartido/ui/spinner';
import { CamposDatos } from './camposDatos';
import { CLAVES_CUENTA, useMisDatos } from './consultasCuenta';
import { repartirErrores } from './erroresRegistro';
import {
  cuerpoDatos,
  datosAFormulario,
  esquemaDatos,
  type CampoDatos,
  type FormularioDatos,
  type SalidaDatos,
} from './esquemaDatos';

const CAMPOS: readonly CampoDatos[] = [
  'nombre',
  'apellido',
  'telefono',
  'rut',
  'fechaNacimiento',
  'genero',
];

const CLASE_TARJETA = 'flex flex-col gap-4 rounded-lg border bg-card p-6';

/** Tarjeta «Datos personales» de Mis datos (Figma 2034:2343, E1-H5). */
export function DatosPersonales() {
  const consulta = useMisDatos();

  if (consulta.isPending) return <EsqueletoDatos />;
  if (consulta.isError) {
    return (
      <section aria-labelledby="titulo-datos" className={CLASE_TARJETA}>
        <h2 id="titulo-datos" className="texto-cuerpo-fuerte">
          Datos personales
        </h2>
        <Alert variant="destructive">
          <AlertDescription>{consulta.error.message}</AlertDescription>
        </Alert>
      </section>
    );
  }
  return <FormularioDatosPersonales datos={consulta.data} />;
}

function FormularioDatosPersonales({ datos }: { datos: Datos }) {
  const clienteConsultas = useQueryClient();
  const [aviso, setAviso] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);
  const guardar = useMutation({
    mutationFn: async (cuerpo: ReturnType<typeof cuerpoDatos>) =>
      exigir<Datos>(await api.PATCH('/api/cuentas/yo', { body: cuerpo })),
  });
  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty, isSubmitting, dirtyFields },
  } = useForm<FormularioDatos, unknown, SalidaDatos>({
    resolver: zodResolver(esquemaDatos),
    defaultValues: datosAFormulario(datos),
  });

  const mostrarError = (fallo: ErrorDeApi) => {
    // 409: RUT en otra cuenta; 403: RUT de un profesional o con una verificación en curso
    if (
      fallo.estado === 409 ||
      (fallo.estado === 403 && /RUT/.test(fallo.message))
    ) {
      setError(
        'rut',
        { type: 'server', message: fallo.message },
        { shouldFocus: true },
      );
      return;
    }
    if (fallo.estado !== 400) {
      setAviso(fallo.message);
      return;
    }
    const { campos, generales } = repartirErrores(fallo.mensajes);
    const conError = CAMPOS.filter((campo) => campos[campo]);
    conError.forEach((campo, i) =>
      setError(
        campo,
        { type: 'server', message: campos[campo] },
        { shouldFocus: i === 0 },
      ),
    );
    if (generales.length > 0) setAviso(generales.join(' '));
  };

  const enviar = async (valores: SalidaDatos) => {
    setAviso(null);
    setGuardado(false);
    try {
      const actualizados = await guardar.mutateAsync(
        cuerpoDatos(valores, dirtyFields),
      );
      clienteConsultas.setQueryData(CLAVES_CUENTA.datos, actualizados);
      reset(datosAFormulario(actualizados));
      setGuardado(true);
    } catch (error) {
      // Sin conexión, fetch lanza TypeError: se muestra el mensaje genérico
      mostrarError(error instanceof ErrorDeApi ? error : errorDeApi(undefined));
    }
  };

  return (
    <form
      onSubmit={handleSubmit(enviar)}
      noValidate
      aria-labelledby="titulo-datos"
      className={CLASE_TARJETA}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2
          id="titulo-datos"
          className="texto-cuerpo-fuerte text-texto-principal"
        >
          Datos personales
        </h2>
        <Button type="submit" disabled={!isDirty || isSubmitting}>
          {isSubmitting && <Spinner />}
          Guardar cambios
        </Button>
      </div>
      {/* Solo visual: el lector de pantalla oye «obligatorio» en cada campo (aria-required) */}
      <p aria-hidden className="texto-leyenda text-texto-secundario">
        Los campos con <span className="text-destructive">*</span> son
        obligatorios.
      </p>
      {aviso && (
        <Alert variant="destructive">
          <AlertDescription>{aviso}</AlertDescription>
        </Alert>
      )}
      <CamposDatos
        email={datos.email}
        register={register}
        control={control}
        errors={errors}
      />
      <p
        id="datos-email-ayuda"
        className="flex items-center gap-1.5 texto-leyenda text-texto-secundario"
      >
        <Check
          className="size-4 text-marca-profundo"
          strokeWidth={1.75}
          aria-hidden
        />
        Correo confirmado
      </p>
      <p
        role="status"
        className="texto-pequeno text-texto-secundario empty:hidden"
      >
        {guardado && !isDirty ? 'Guardamos tus cambios.' : ''}
      </p>
    </form>
  );
}

/** Misma forma que la tarjeta: tres filas de campos (en una columna en celular). */
const EsqueletoDatos = () => (
  <div aria-hidden className={CLASE_TARJETA}>
    <div className="flex items-center justify-between">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-[38px] w-36 rounded-full" />
    </div>
    {[2, 2, 3].map((columnas, fila) => (
      <div
        key={fila}
        className={
          columnas === 2
            ? 'grid gap-4 sm:grid-cols-2'
            : 'grid gap-4 sm:grid-cols-3'
        }
      >
        {Array.from({ length: columnas }, (_, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-[51px] w-full rounded-md" />
          </div>
        ))}
      </div>
    ))}
  </div>
);
