'use client';

import {
  type Control,
  Controller,
  type UseFormSetValue,
  useWatch,
} from 'react-hook-form';
import { CampoFormulario } from '@/tienda/cuenta/campoFormulario';
import { SelectorUbicacion } from '@/tienda/cuenta/camposDireccion';
import { useComunas, useRegiones } from '@/tienda/cuenta/consultasCuenta';
import type { FormularioBodegaValores } from './formularioBodega';

/** Región y comuna de la lista oficial, como en las direcciones: la comuna depende de la región. */
export const ComunaBodega = ({
  control,
  setValue,
  errores,
}: {
  control: Control<FormularioBodegaValores>;
  setValue: UseFormSetValue<FormularioBodegaValores>;
  errores: { region?: string; comuna?: string };
}) => {
  const region = useWatch({ control, name: 'region' });
  const regiones = useRegiones();
  const comunas = useComunas(region);
  return (
    <div className="grid gap-x-3 gap-y-4 sm:grid-cols-2">
      <CampoFormulario
        id="bodega-region"
        etiqueta="Región"
        obligatorio
        error={errores.region ?? regiones.error?.message}
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
        id="bodega-comuna"
        etiqueta="Comuna"
        obligatorio
        error={errores.comuna ?? comunas.error?.message}
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
  );
};
