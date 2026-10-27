'use client';

import { ChevronDownIcon } from 'lucide-react';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { cn } from '@/compartido/lib/utils';
import { Input } from '@/compartido/ui/input';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/compartido/ui/native-select';
import { CampoFormulario } from './campoFormulario';
import { GENEROS, type DatosRegistro } from './esquemaRegistro';

/**
 * «Datos opcionales» del registro: teléfono, RUT, fecha de nacimiento y género. Se abre y se
 * cierra; cerrado, los campos siguen montados (con `hidden`) para no perder lo escrito.
 */
export const DatosOpcionales = ({
  register,
  errors,
  abierto,
  alAlternar,
}: {
  register: UseFormRegister<DatosRegistro>;
  errors: FieldErrors<DatosRegistro>;
  abierto: boolean;
  alAlternar: () => void;
}) => (
  <div className="flex flex-col gap-3">
    <button
      type="button"
      aria-expanded={abierto}
      aria-controls="registro-opcionales"
      onClick={alAlternar}
      className="flex min-h-10 cursor-pointer items-center justify-between gap-3 border-y py-3 text-left outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-profundo"
    >
      <span className="flex flex-col gap-1">
        <span className="texto-cuerpo-fuerte">Datos opcionales</span>
        <span className="texto-leyenda text-texto-secundario">
          Teléfono, RUT, fecha de nacimiento, género
        </span>
      </span>
      <ChevronDownIcon
        aria-hidden
        className={cn(
          'size-5 shrink-0 stroke-[1.75] transition-transform',
          abierto && 'rotate-180',
        )}
      />
    </button>

    <div
      id="registro-opcionales"
      hidden={!abierto}
      className="flex flex-col gap-3"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <CampoFormulario
          id="registro-telefono"
          etiqueta="Teléfono"
          error={errors.telefono?.message}
        >
          {(control) => (
            <Input
              {...control}
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
          {(control) => (
            <Input
              {...control}
              autoComplete="off"
              placeholder="12.345.678-5"
              {...register('rut')}
            />
          )}
        </CampoFormulario>
        <CampoFormulario
          id="registro-fecha"
          etiqueta="Fecha de nacimiento"
          error={errors.fechaNacimiento?.message}
        >
          {(control) => (
            <Input
              {...control}
              type="date"
              autoComplete="bday"
              // iOS Safari centra y achica la fecha vacía
              className="appearance-none text-left"
              {...register('fechaNacimiento')}
            />
          )}
        </CampoFormulario>
        <CampoFormulario
          id="registro-genero"
          etiqueta="Género"
          error={errors.genero?.message}
        >
          {(control) => (
            <NativeSelect
              {...control}
              contenedorClassName="w-full"
              {...register('genero')}
            >
              <NativeSelectOption value="">Seleccionar</NativeSelectOption>
              {GENEROS.map((genero) => (
                <NativeSelectOption key={genero} value={genero}>
                  {genero}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          )}
        </CampoFormulario>
      </div>
      <p className="texto-leyenda text-texto-secundario">
        El RUT es necesario si luego quieres verificarte como peluquero.
      </p>
    </div>
  </div>
);
