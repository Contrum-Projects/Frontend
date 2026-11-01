'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { api } from '@/compartido/api/cliente';
import { ErrorDeApi, errorDeApi, exigir } from '@/compartido/api/errores';
import type { SalidaRegistrada } from '@/compartido/api/respuestas';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Button } from '@/compartido/ui/button';
import { Input } from '@/compartido/ui/input';
import { Spinner } from '@/compartido/ui/spinner';
import { AccionesPanelLateral } from '@/panel/catalogo/panelLateral';
import { CampoFormulario } from '@/tienda/cuenta/campoFormulario';
import { nombreUbicacion } from './consultasEntradas';
import { CLAVE_STOCK } from './consultasSalidas';
import {
  SALIDA_VACIA,
  campoDelError,
  cuerpoSalida,
  esquemaSalida,
  type DatosSalida,
  type FormularioSalida as Formulario,
} from './esquemaSalida';
import { SelectorFormatoSalida } from './selectorFormatoSalida';
import { SelectorUbicacionSalida } from './selectorUbicacionSalida';
import { TiposSalida } from './tiposSalida';

/**
 * «Registrar salida» (Figma P5c 2043:1951 y 2044:1209, E11-H3): merma o consumo de un formato en
 * una ubicación. Si la cantidad no alcanza lo decide el backend y su mensaje queda junto a la
 * cantidad (criterio 2). En el panel lateral lleva «Cancelar»; en la pantalla de celular, solo
 * el botón ancho.
 */
export function FormularioSalida({
  alRegistrar,
  alCancelar,
}: {
  alRegistrar: (salida: SalidaRegistrada) => void;
  /** Con él, las acciones son las del panel lateral. */
  alCancelar?: () => void;
}) {
  const clienteConsultas = useQueryClient();
  const [aviso, setAviso] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    setError,
    setValue,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<Formulario, unknown, DatosSalida>({
    resolver: zodResolver(esquemaSalida),
    defaultValues: SALIDA_VACIA,
  });
  const formatoId = useWatch({ control, name: 'formato' })?.formatoId;

  const mostrarError = (fallo: ErrorDeApi) => {
    if (fallo.estado !== 400) {
      setAviso(fallo.message);
      return;
    }
    const generales: string[] = [];
    for (const mensaje of fallo.mensajes) {
      const campo = campoDelError(mensaje);
      if (campo) {
        setError(
          campo,
          { type: 'server', message: mensaje },
          { shouldFocus: true },
        );
      } else {
        generales.push(mensaje);
      }
    }
    if (generales.length > 0) setAviso(generales.join(' '));
  };

  const enviar = async (datos: DatosSalida) => {
    setAviso(null);
    try {
      const salida = exigir<SalidaRegistrada>(
        await api.POST('/api/inventario/salidas', {
          body: cuerpoSalida(datos),
        }),
      );
      await clienteConsultas.invalidateQueries({ queryKey: CLAVE_STOCK });
      toast.success(
        `Salida registrada. Quedan ${salida.stockRestante} en ${nombreUbicacion(salida.ubicacion)}.`,
      );
      alRegistrar(salida);
    } catch (error) {
      // Sin conexión, fetch lanza TypeError: se muestra el mensaje genérico
      mostrarError(error instanceof ErrorDeApi ? error : errorDeApi(undefined));
    }
  };

  return (
    <form
      onSubmit={handleSubmit(enviar)}
      noValidate
      aria-label="Registrar salida"
      className="flex flex-1 flex-col gap-4"
    >
      {aviso && (
        <Alert variant="destructive">
          <AlertDescription>{aviso}</AlertDescription>
        </Alert>
      )}
      <Controller
        control={control}
        name="tipo"
        render={({ field }) => (
          <TiposSalida
            id="salida-tipo"
            ref={field.ref}
            valor={field.value}
            alCambiar={field.onChange}
            error={errors.tipo?.message}
          />
        )}
      />
      <CampoFormulario
        id="salida-formato"
        etiqueta="Formato"
        error={errors.formato?.message}
      >
        {(propsControl) => (
          <Controller
            control={control}
            name="formato"
            render={({ field }) => (
              <SelectorFormatoSalida
                propsControl={propsControl}
                ref={field.ref}
                valor={field.value}
                alCambiar={(formato) => {
                  field.onChange(formato);
                  // La ubicación depende del formato: se vuelve a elegir, y el error de stock
                  // del backend ya no aplica
                  setValue('ubicacionId', '');
                  clearErrors(['ubicacionId', 'cantidad']);
                }}
                alSalir={field.onBlur}
              />
            )}
          />
        )}
      </CampoFormulario>
      <div className="grid gap-x-3 gap-y-4 sm:grid-cols-2">
        <CampoFormulario
          id="salida-ubicacion"
          etiqueta="Ubicación"
          error={errors.ubicacionId?.message}
        >
          {(propsControl) => (
            <Controller
              control={control}
              name="ubicacionId"
              render={({ field }) => (
                <SelectorUbicacionSalida
                  formatoId={formatoId}
                  propsControl={propsControl}
                  ref={field.ref}
                  valor={field.value}
                  alCambiar={(ubicacion) => {
                    field.onChange(ubicacion);
                    clearErrors('cantidad');
                  }}
                  alSalir={field.onBlur}
                />
              )}
            />
          )}
        </CampoFormulario>
        <CampoFormulario
          id="salida-cantidad"
          etiqueta="Cantidad"
          error={errors.cantidad?.message}
        >
          {(propsControl) => (
            <Input
              {...propsControl}
              inputMode="numeric"
              autoComplete="off"
              {...register('cantidad')}
            />
          )}
        </CampoFormulario>
      </div>
      <CampoFormulario
        id="salida-observacion"
        etiqueta="Comentario (opcional)"
        error={errors.observacion?.message}
      >
        {(propsControl) => (
          <Input
            {...propsControl}
            autoComplete="off"
            {...register('observacion')}
          />
        )}
      </CampoFormulario>
      <p className="texto-leyenda text-texto-secundario">
        Una salida nunca puede dejar el stock bajo cero.
      </p>
      {alCancelar ? (
        <AccionesPanelLateral
          texto="Registrar salida"
          enviando={isSubmitting}
          alCancelar={alCancelar}
        />
      ) : (
        <Button
          type="submit"
          size="grande"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting && <Spinner aria-hidden />}
          Registrar salida
        </Button>
      )}
    </form>
  );
}
