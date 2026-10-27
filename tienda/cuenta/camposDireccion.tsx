'use client';

import type { Ref } from 'react';
import {
  Controller,
  useWatch,
  type Control,
  type FieldErrors,
  type UseFormRegister,
  type UseFormSetValue,
} from 'react-hook-form';
import type { UbicacionOficial } from '@/compartido/api/respuestas';
import { Checkbox } from '@/compartido/ui/checkbox';
import { Input } from '@/compartido/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/compartido/ui/select';
import { CampoFormulario, type PropsControl } from './campoFormulario';
import { useComunas, useRegiones } from './consultasCuenta';
import type { FormularioDireccion } from './esquemaDireccion';

/**
 * Campos del diálogo de dirección: región y comuna de la lista oficial (la comuna depende de
 * la región), calle, número y referencia. «Dejarla como principal» solo al agregar: al editar,
 * la principal se cambia desde la tarjeta.
 */
export const CamposDireccion = ({
  nueva,
  register,
  control,
  setValue,
  errors,
}: {
  nueva: boolean;
  register: UseFormRegister<FormularioDireccion>;
  control: Control<FormularioDireccion>;
  setValue: UseFormSetValue<FormularioDireccion>;
  errors: FieldErrors<FormularioDireccion>;
}) => {
  const region = useWatch({ control, name: 'region' });
  const regiones = useRegiones();
  const comunas = useComunas(region);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-x-3 gap-y-4 sm:grid-cols-2">
        <CampoFormulario
          id="direccion-region"
          etiqueta="Región"
          obligatorio
          error={errors.region?.message ?? regiones.error?.message}
        >
          {(props) => (
            <Controller
              name="region"
              control={control}
              render={({ field }) => (
                <SelectorUbicacion
                  control={props}
                  ref={field.ref}
                  valor={field.value}
                  alSalir={field.onBlur}
                  alCambiar={(valor) => {
                    field.onChange(valor);
                    setValue('comuna', '');
                  }}
                  opciones={regiones.data}
                />
              )}
            />
          )}
        </CampoFormulario>
        <CampoFormulario
          id="direccion-comuna"
          etiqueta="Comuna"
          obligatorio
          error={errors.comuna?.message ?? comunas.error?.message}
        >
          {(props) => (
            <Controller
              name="comuna"
              control={control}
              render={({ field }) => (
                <SelectorUbicacion
                  control={props}
                  ref={field.ref}
                  valor={field.value}
                  alSalir={field.onBlur}
                  alCambiar={field.onChange}
                  opciones={comunas.data}
                />
              )}
            />
          )}
        </CampoFormulario>
      </div>
      <div className="grid gap-x-3 gap-y-4 sm:grid-cols-[2fr_1fr]">
        <CampoFormulario
          id="direccion-calle"
          etiqueta="Calle"
          obligatorio
          error={errors.calle?.message}
        >
          {(props) => (
            <Input
              {...props}
              autoComplete="address-line1"
              {...register('calle')}
            />
          )}
        </CampoFormulario>
        <CampoFormulario
          id="direccion-numero"
          etiqueta="Número"
          obligatorio
          error={errors.numero?.message}
        >
          {(props) => <Input {...props} {...register('numero')} />}
        </CampoFormulario>
      </div>
      <CampoFormulario
        id="direccion-referencia"
        etiqueta="Referencia"
        error={errors.referencia?.message}
      >
        {(props) => (
          <Input
            {...props}
            autoComplete="address-line2"
            placeholder="Depto., oficina, block"
            {...register('referencia')}
          />
        )}
      </CampoFormulario>
      {nueva && (
        <div className="flex items-center gap-3">
          <Controller
            name="esPrincipal"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="direccion-principal"
                ref={field.ref}
                checked={field.value}
                onCheckedChange={(marcada) => field.onChange(marcada === true)}
              />
            )}
          />
          <label
            htmlFor="direccion-principal"
            className="flex min-h-10 flex-1 cursor-pointer items-center texto-pequeno text-texto-principal"
          >
            Dejarla como principal
          </label>
        </div>
      )}
    </div>
  );
};

/**
 * Región o comuna con el Select de shadcn, como el de Género. Queda deshabilitado mientras no
 * hay opciones (cargando, o la comuna antes de elegir región).
 */
const SelectorUbicacion = ({
  control,
  ref,
  valor,
  alCambiar,
  alSalir,
  opciones,
}: {
  control: PropsControl;
  ref: Ref<HTMLButtonElement>;
  valor: string;
  alCambiar: (valor: string) => void;
  alSalir: () => void;
  opciones: UbicacionOficial[] | undefined;
}) => (
  <Select value={valor} onValueChange={alCambiar} disabled={!opciones}>
    <SelectTrigger {...control} ref={ref} onBlur={alSalir} className="w-full">
      <SelectValue placeholder="Seleccionar" />
    </SelectTrigger>
    <SelectContent position="popper">
      {opciones?.map((opcion) => (
        <SelectItem key={opcion.codigoCut} value={opcion.codigoCut}>
          {opcion.nombre}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);
