'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { ErrorDeApi, errorDeApi } from '@/compartido/api/errores';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Button } from '@/compartido/ui/button';
import { Spinner } from '@/compartido/ui/spinner';
import { AccionesPanelLateral } from '@/panel/catalogo/panelLateral';
import { CampoFormulario } from '@/tienda/cuenta/campoFormulario';
import { CamposMovimiento } from './camposMovimiento';
import { CLAVE_STOCK } from './consultasSalidas';
import {
  SALIDA_VACIA,
  campoDelError,
  esquemaSalida,
  textoBoton,
  type DatosSalida,
  type FormularioSalida as Formulario,
} from './esquemaSalida';
import { registrarMovimiento } from './registrarMovimiento';
import { SelectorFormatoSalida } from './selectorFormatoSalida';
import { TiposSalida } from './tiposSalida';

/**
 * «Registrar salida» (Figma P5c 2043:1951 y 2044:1209): merma o consumo (E11-H3), ajuste o
 * transferencia (E11-H4) de un formato. Si la cantidad alcanza lo decide el backend y su
 * mensaje queda junto a la cantidad. En el panel lateral lleva «Cancelar»; en la pantalla de
 * celular, solo el botón ancho.
 */
export function FormularioSalida({
  alRegistrar,
  alCancelar,
}: {
  alRegistrar: () => void;
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
  const tipo = useWatch({ control, name: 'tipo' });

  const mostrarError = (fallo: ErrorDeApi) => {
    if (fallo.estado !== 400) {
      setAviso(fallo.message);
      return;
    }
    const generales: string[] = [];
    for (const mensaje of fallo.mensajes) {
      const campo = campoDelError(mensaje, tipo);
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
      const mensaje = await registrarMovimiento(datos);
      await clienteConsultas.invalidateQueries({ queryKey: CLAVE_STOCK });
      toast.success(mensaje);
      alRegistrar();
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
            alCambiar={(valor) => {
              field.onChange(valor);
              // Cada tipo elige sus ubicaciones de otra lista: se vuelven a elegir
              setValue('ubicacionId', '');
              setValue('destinoId', '');
              setValue('sentido', '');
              clearErrors();
            }}
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
                  // Las ubicaciones dependen del formato: se vuelven a elegir, y el error de
                  // stock del backend ya no aplica
                  setValue('ubicacionId', '');
                  clearErrors(['ubicacionId', 'cantidad']);
                }}
                alSalir={field.onBlur}
              />
            )}
          />
        )}
      </CampoFormulario>
      <CamposMovimiento
        control={control}
        register={register}
        errors={errors}
        clearErrors={clearErrors}
        setValue={setValue}
      />
      <p className="texto-leyenda text-texto-secundario">
        Un movimiento nunca puede dejar el stock bajo cero.
      </p>
      {alCancelar ? (
        <AccionesPanelLateral
          texto={textoBoton(tipo)}
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
          {textoBoton(tipo)}
        </Button>
      )}
    </form>
  );
}
