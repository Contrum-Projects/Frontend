'use client';

import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormClearErrors,
  type UseFormRegister,
  type UseFormSetValue,
  useWatch,
} from 'react-hook-form';
import { Input } from '@/compartido/ui/input';
import { CampoFormulario } from '@/tienda/cuenta/campoFormulario';
import type { DatosSalida, FormularioSalida } from './esquemaSalida';
import { SelectorDestino } from './selectorDestino';
import { SelectorUbicacionSalida } from './selectorUbicacionSalida';
import { SentidoAjuste } from './tiposSalida';

/**
 * Los campos que cambian según el tipo de movimiento (E11-H3, E11-H4), después del formato:
 * - Salida: ubicación, cantidad y comentario opcional (Figma P5c).
 * - Ajuste: sumar o descontar, ubicación (también las activas sin stock), cantidad y motivo
 *   obligatorio.
 * - Transferencia: origen, destino, cantidad y comentario opcional.
 * Figma solo dibuja la salida; el ajuste y la transferencia siguen su misma disposición.
 */
export const CamposMovimiento = ({
  control,
  register,
  errors,
  clearErrors,
  setValue,
}: {
  control: Control<FormularioSalida, unknown, DatosSalida>;
  register: UseFormRegister<FormularioSalida>;
  errors: FieldErrors<FormularioSalida>;
  clearErrors: UseFormClearErrors<FormularioSalida>;
  setValue: UseFormSetValue<FormularioSalida>;
}) => {
  const [tipo, formato, origenId, destinoId] = useWatch({
    control,
    name: ['tipo', 'formato', 'ubicacionId', 'destinoId'],
  });
  const ajuste = tipo === 'ajuste';
  const transferencia = tipo === 'transferencia';

  const ubicacion = (
    <CampoFormulario
      id="salida-ubicacion"
      etiqueta={transferencia ? 'Ubicación de origen' : 'Ubicación'}
      error={errors.ubicacionId?.message}
    >
      {(propsControl) => (
        <Controller
          control={control}
          name="ubicacionId"
          render={({ field }) => (
            <SelectorUbicacionSalida
              formatoId={formato?.formatoId}
              conActivas={ajuste}
              propsControl={propsControl}
              ref={field.ref}
              valor={field.value}
              alCambiar={(valor) => {
                field.onChange(valor);
                clearErrors('cantidad');
                // El destino no puede ser el nuevo origen: se vuelve a elegir
                if (valor === destinoId) setValue('destinoId', '');
              }}
              alSalir={field.onBlur}
            />
          )}
        />
      )}
    </CampoFormulario>
  );

  const cantidad = (
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
  );

  // Ajuste y transferencia, uno bajo otro: en el panel lateral (~400 px) dos selectores de
  // ubicación lado a lado recortan el código y el stock, justo lo que los distingue
  return (
    <>
      {ajuste && (
        <>
          {ubicacion}
          {/* «Sumar / Descontar» justo antes de la cantidad que cambia de signo */}
          <Controller
            control={control}
            name="sentido"
            render={({ field }) => (
              <SentidoAjuste
                id="salida-sentido"
                ref={field.ref}
                valor={field.value}
                alCambiar={field.onChange}
                error={errors.sentido?.message}
              />
            )}
          />
          {cantidad}
        </>
      )}
      {transferencia && (
        <>
          {ubicacion}
          <CampoFormulario
            id="salida-destino"
            etiqueta="Ubicación de destino"
            error={errors.destinoId?.message}
          >
            {(propsControl) => (
              <Controller
                control={control}
                name="destinoId"
                render={({ field }) => (
                  <SelectorDestino
                    origenId={origenId}
                    propsControl={propsControl}
                    ref={field.ref}
                    valor={field.value}
                    alCambiar={field.onChange}
                    alSalir={field.onBlur}
                  />
                )}
              />
            )}
          </CampoFormulario>
          {cantidad}
        </>
      )}
      {!ajuste && !transferencia && (
        <div className="grid gap-x-3 gap-y-4 sm:grid-cols-2">
          {ubicacion}
          {cantidad}
        </div>
      )}
      <CampoFormulario
        id="salida-observacion"
        etiqueta={ajuste ? 'Motivo' : 'Comentario (opcional)'}
        error={errors.observacion?.message}
      >
        {(propsControl) => (
          <Input
            {...propsControl}
            // Obligatorio sin asterisco: el formulario marca con «(opcional)» lo que no lo es
            aria-required={ajuste || undefined}
            autoComplete="off"
            {...register('observacion')}
          />
        )}
      </CampoFormulario>
    </>
  );
};
