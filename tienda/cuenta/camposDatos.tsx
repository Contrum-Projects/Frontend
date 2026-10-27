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
import type { FormularioDatos } from './esquemaDatos';
import { GENEROS } from './esquemaRegistro';
import { SelectorFecha } from './selectorFecha';

/** La fecha más antigua que ofrece el calendario (igual que el registro). */
const PRIMER_ANIO = 1920;

/** Campos de «Datos personales» (Figma 2034:2343): tres filas, en una columna en celular. */
export const CamposDatos = ({
  email,
  register,
  control,
  errors,
}: {
  email: string;
  register: UseFormRegister<FormularioDatos>;
  control: Control<FormularioDatos>;
  errors: FieldErrors<FormularioDatos>;
}) => (
  <>
    <div className="grid gap-x-3 gap-y-4 sm:grid-cols-2">
      <CampoFormulario
        id="datos-nombre"
        etiqueta="Nombre"
        obligatorio
        error={errors.nombre?.message}
      >
        {(props) => (
          <Input {...props} autoComplete="given-name" {...register('nombre')} />
        )}
      </CampoFormulario>
      <CampoFormulario
        id="datos-apellido"
        etiqueta="Apellido"
        obligatorio
        error={errors.apellido?.message}
      >
        {(props) => (
          <Input
            {...props}
            autoComplete="family-name"
            {...register('apellido')}
          />
        )}
      </CampoFormulario>
    </div>
    <div className="grid gap-x-3 gap-y-4 sm:grid-cols-2">
      <CampoFormulario id="datos-email" etiqueta="Correo electrónico">
        {(props) => (
          <Input
            {...props}
            type="email"
            value={email}
            readOnly
            aria-describedby="datos-email-ayuda"
            className="text-texto-secundario"
          />
        )}
      </CampoFormulario>
      <CampoFormulario
        id="datos-telefono"
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
    </div>
    <div className="grid gap-x-3 gap-y-4 sm:grid-cols-3">
      <CampoFormulario
        id="datos-rut"
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
      <CampoFormulario
        id="datos-fecha"
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
        id="datos-genero"
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
  </>
);
