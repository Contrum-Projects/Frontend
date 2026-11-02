'use client';

import {
  Controller,
  useWatch,
  type Control,
  type FieldErrors,
  type UseFormRegister,
  type UseFormSetValue,
} from 'react-hook-form';
import { Input } from '@/compartido/ui/input';
import { CampoFormulario } from './campoFormulario';
import { SelectorUbicacion } from './camposDireccion';
import { useComunas, useRegiones } from './consultasCuenta';
import type { FormularioFacturacion } from './esquemaFacturacion';

/**
 * Campos de los datos de facturación (Figma 2066:3541): de a dos en escritorio y en una columna
 * en celular. La comuna depende de la región. El correo de facturación es opcional y Figma no lo
 * dibuja: va al final.
 */
export const CamposFacturacion = ({
  register,
  control,
  setValue,
  errors,
}: {
  register: UseFormRegister<FormularioFacturacion>;
  control: Control<FormularioFacturacion>;
  setValue: UseFormSetValue<FormularioFacturacion>;
  errors: FieldErrors<FormularioFacturacion>;
}) => {
  const region = useWatch({ control, name: 'region' });
  const regiones = useRegiones();
  const comunas = useComunas(region);

  return (
    <div className="grid gap-x-3 gap-y-4 sm:grid-cols-2">
      <CampoFormulario
        id="facturacion-rut"
        etiqueta="RUT"
        obligatorio
        error={errors.rut?.message}
      >
        {(props) => <Input {...props} {...register('rut')} />}
      </CampoFormulario>
      <CampoFormulario
        id="facturacion-razon-social"
        etiqueta="Razón social"
        obligatorio
        error={errors.razonSocial?.message}
      >
        {(props) => (
          <Input
            {...props}
            autoComplete="organization"
            {...register('razonSocial')}
          />
        )}
      </CampoFormulario>
      <CampoFormulario
        id="facturacion-giro"
        etiqueta="Giro"
        obligatorio
        error={errors.giro?.message}
      >
        {(props) => <Input {...props} {...register('giro')} />}
      </CampoFormulario>
      <CampoFormulario
        id="facturacion-direccion"
        etiqueta="Dirección"
        obligatorio
        error={errors.direccion?.message}
      >
        {(props) => (
          <Input
            {...props}
            autoComplete="street-address"
            {...register('direccion')}
          />
        )}
      </CampoFormulario>
      <CampoFormulario
        id="facturacion-region"
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
        id="facturacion-comuna"
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
      <CampoFormulario
        id="facturacion-correo"
        etiqueta="Correo para la factura"
        error={errors.correoFacturacion?.message}
      >
        {(props) => (
          <Input
            {...props}
            type="email"
            autoComplete="email"
            {...register('correoFacturacion')}
          />
        )}
      </CampoFormulario>
    </div>
  );
};
