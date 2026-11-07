'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { api } from '@/compartido/api/cliente';
import {
  ErrorDeApi,
  errorDeApi,
  exigir,
  repartirErrores,
} from '@/compartido/api/errores';
import type { DatosFacturacionCuenta } from '@/compartido/api/respuestas';
import { cn } from '@/compartido/lib/utils';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Button } from '@/compartido/ui/button';
import { Spinner } from '@/compartido/ui/spinner';
import { CamposFacturacion } from './camposFacturacion';
import { CLAVES_CUENTA } from './consultasCuenta';
import {
  CAMPOS_FACTURACION,
  cuerpoEdicionFacturacion,
  cuerpoNuevaFacturacion,
  FACTURACION_VACIA,
  facturacionAFormulario,
  esquemaFacturacion,
  type FormularioFacturacion as ValoresFacturacion,
  type SalidaFacturacion,
} from './esquemaFacturacion';

interface FormularioFacturacionProps {
  /** El registro que se edita; sin él, se agregan datos nuevos. */
  registro?: DatosFacturacionCuenta;
  /** Cada vez que aumenta (y al montarse, si es mayor que 0) lleva el foco al RUT. */
  enfoque: number;
  alCancelar: () => void;
  alGuardar: () => void;
}

/**
 * Tarjeta «Agregar datos de facturación» (Figma 2066:3541, E9-H2). Al editar, la misma tarjeta
 * carga el registro. En escritorio «Guardar» va junto al título, como en Figma; en celular, al
 * final. Un 400 del backend se muestra junto a su campo sin perder lo escrito.
 */
export function FormularioFacturacion({
  registro,
  enfoque,
  alCancelar,
  alGuardar,
}: FormularioFacturacionProps) {
  const clienteConsultas = useQueryClient();
  const [aviso, setAviso] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    setValue,
    setError,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<ValoresFacturacion, unknown, SalidaFacturacion>({
    resolver: zodResolver(esquemaFacturacion),
    defaultValues: registro
      ? facturacionAFormulario(registro)
      : FACTURACION_VACIA,
  });

  useEffect(() => {
    if (enfoque > 0) setFocus('rut');
  }, [enfoque, setFocus]);

  const mostrarError = (fallo: ErrorDeApi) => {
    if (fallo.estado !== 400) {
      setAviso(fallo.message);
      return;
    }
    const { porCampo, generales } = repartirErrores(fallo, CAMPOS_FACTURACION);
    for (const [campo, mensaje] of porCampo) {
      setError(campo, { type: 'server', message: mensaje });
    }
    if (generales.length > 0) setAviso(generales.join(' '));
  };

  const enviar = async (datos: SalidaFacturacion) => {
    setAviso(null);
    try {
      exigir<DatosFacturacionCuenta>(
        registro
          ? await api.PATCH('/api/cuentas/yo/facturacion/{id}', {
              params: { path: { id: registro.id } },
              body: cuerpoEdicionFacturacion(datos),
            })
          : await api.POST('/api/cuentas/yo/facturacion', {
              body: cuerpoNuevaFacturacion(datos),
            }),
      );
      await clienteConsultas.invalidateQueries({
        queryKey: CLAVES_CUENTA.facturacion,
      });
      alGuardar();
    } catch (error) {
      // Sin conexión, fetch lanza TypeError: se muestra el mensaje genérico
      mostrarError(error instanceof ErrorDeApi ? error : errorDeApi(undefined));
    }
  };

  const titulo = registro
    ? 'Editar datos de facturación'
    : 'Agregar datos de facturación';

  return (
    <div className="rounded-lg border bg-card p-6">
      <form
        onSubmit={handleSubmit(enviar)}
        noValidate
        aria-labelledby="titulo-formulario-facturacion"
        className="flex flex-col gap-4 md:grid md:grid-cols-[1fr_auto] md:items-start"
      >
        <h2
          id="titulo-formulario-facturacion"
          className="texto-cuerpo-fuerte text-texto-principal md:self-center"
        >
          {titulo}
        </h2>
        <div className="flex flex-col gap-4 md:col-span-2">
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
          <CamposFacturacion
            register={register}
            control={control}
            setValue={setValue}
            errors={errors}
          />
        </div>
        {/* Al final del formulario (orden del teclado); en escritorio sube junto al título */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end md:col-start-2 md:row-start-1">
          {/* Al agregar, «Cancelar» solo en celular: en escritorio la tarjeta siempre está */}
          <Button
            type="button"
            variant="contorno"
            className={cn('min-h-10', !registro && 'md:hidden')}
            onClick={alCancelar}
          >
            Cancelar
          </Button>
          <Button type="submit" className="min-h-10" disabled={isSubmitting}>
            {isSubmitting && <Spinner />}
            Guardar
          </Button>
        </div>
      </form>
    </div>
  );
}
