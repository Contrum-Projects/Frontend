'use client';

import type { Ref } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/compartido/ui/select';
import type { PropsControl } from './campoFormulario';
import { GENEROS } from './esquemaRegistro';

/**
 * Valor de «Sin especificar»: el Select de shadcn no acepta opciones con valor vacío, así que
 * se usa este y se convierte en `''` (sin género) al elegirlo.
 */
const SIN_ESPECIFICAR = 'sin-especificar';

/**
 * Género del registro y de Mis datos. «Sin especificar» deja el campo vacío, así se puede
 * quitar un género ya elegido (Mis datos lo envía como `null`).
 */
export const SelectorGenero = ({
  control,
  ref,
  valor,
  alCambiar,
  alSalir,
}: {
  control: PropsControl;
  ref: Ref<HTMLButtonElement>;
  valor: string;
  alCambiar: (valor: string) => void;
  alSalir: () => void;
}) => (
  <Select
    value={valor}
    onValueChange={(elegido) =>
      alCambiar(elegido === SIN_ESPECIFICAR ? '' : elegido)
    }
  >
    <SelectTrigger {...control} ref={ref} onBlur={alSalir}>
      <SelectValue placeholder="Seleccionar" />
    </SelectTrigger>
    <SelectContent position="popper">
      <SelectItem value={SIN_ESPECIFICAR}>Sin especificar</SelectItem>
      {GENEROS.map((genero) => (
        <SelectItem key={genero} value={genero}>
          {genero}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);
