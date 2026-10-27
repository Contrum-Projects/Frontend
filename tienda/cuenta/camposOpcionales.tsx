'use client';

import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from 'react-hook-form';
import { Input } from '@/compartido/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/compartido/ui/select';
import { CampoFormulario } from './campoFormulario';
import { GENEROS, type DatosRegistro } from './esquemaRegistro';
import { SelectorFecha } from './selectorFecha';

/** La fecha más antigua que ofrece el calendario. */
const PRIMER_ANIO = 1920;

/**
 * Teléfono, RUT, fecha de nacimiento y género del registro: van en el formulario, con la
 * etiqueta sola (los obligatorios llevan «*»).
 */
export const CamposOpcionales = ({
  register,
  control,
  errors,
}: {
  register: UseFormRegister<DatosRegistro>;
  control: Control<DatosRegistro>;
  errors: FieldErrors<DatosRegistro>;
}) => (
  <div className="flex flex-col gap-4">
    {/* Una grilla por fila: los campos de cada fila alinean sus controles (subgrid) */}
    <div className="grid gap-x-3 gap-y-4 sm:grid-cols-2">
      <CampoFormulario
        id="registro-telefono"
        etiqueta="Teléfono"
        error={errors.telefono?.message}
      >
        {(props) => (
          <Input
            {...props}
            type="tel"
            autoComplete="tel"
            placeholder="+56 9"
            {...register('telefono')}
          />
        )}
      </CampoFormulario>
      <CampoFormulario
        id="registro-rut"
        etiqueta="RUT"
        error={errors.rut?.message}
      >
        {(props) => (
          <Input
            {...props}
            autoComplete="off"
            placeholder="12.345.678-5"
            {...register('rut')}
          />
        )}
      </CampoFormulario>
    </div>
    <div className="grid gap-x-3 gap-y-4 sm:grid-cols-2">
      <CampoFormulario
        id="registro-fecha"
        etiqueta="Fecha de nacimiento"
        error={errors.fechaNacimiento?.message}
      >
        {(props) => (
          <Controller
            name="fechaNacimiento"
            control={control}
            render={({ field }) => (
              <SelectorFecha
                ref={field.ref}
                valor={field.value}
                alCambiar={field.onChange}
                desde={new Date(PRIMER_ANIO, 0)}
                hasta={new Date()}
                control={props}
              />
            )}
          />
        )}
      </CampoFormulario>
      <CampoFormulario
        id="registro-genero"
        etiqueta="Género"
        error={errors.genero?.message}
      >
        {(props) => (
          <Controller
            name="genero"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger {...props} ref={field.ref} onBlur={field.onBlur}>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {GENEROS.map((genero) => (
                    <SelectItem key={genero} value={genero}>
                      {genero}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        )}
      </CampoFormulario>
    </div>
    <p className="texto-leyenda text-texto-secundario">
      El RUT es necesario si luego quieres verificarte como peluquero.
    </p>
  </div>
);
