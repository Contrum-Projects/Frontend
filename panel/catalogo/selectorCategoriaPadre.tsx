'use client';

import type { Ref } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/compartido/ui/select';
import type { PropsControl } from '@/tienda/cuenta/campoFormulario';
import { SIN_PADRE, type OpcionCategoria } from './esquemaCatalogo';

/**
 * «Categoría padre»: ninguna (categoría principal) o una del árbol, con su ruta. El menú no
 * pasa del ancho del campo, así las rutas largas hacen salto de línea a 360 px.
 */
export const SelectorCategoriaPadre = ({
  control,
  ref,
  opciones,
  valor,
  alCambiar,
  alSalir,
}: {
  control: PropsControl;
  ref: Ref<HTMLButtonElement>;
  opciones: OpcionCategoria[];
  valor: string;
  alCambiar: (valor: string) => void;
  alSalir: () => void;
}) => (
  <Select value={valor} onValueChange={alCambiar}>
    <SelectTrigger {...control} ref={ref} onBlur={alSalir} className="w-full">
      <SelectValue />
    </SelectTrigger>
    <SelectContent
      position="popper"
      className="max-w-(--radix-select-trigger-width)"
    >
      <SelectItem value={SIN_PADRE}>Ninguna (categoría principal)</SelectItem>
      {opciones.map((opcion) => (
        <SelectItem key={opcion.id} value={String(opcion.id)}>
          {opcion.ruta}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);
