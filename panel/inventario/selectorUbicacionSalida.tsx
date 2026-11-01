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
import { nombreUbicacion } from './consultasEntradas';
import { useStockFormato } from './consultasSalidas';

/**
 * Campo «Ubicación» de la salida (Figma P5c «B-01 · stock 3»): las ubicaciones donde el formato
 * tiene unidades, con el stock que informa el backend. También las desactivadas: su stock
 * físico puede vencer o dañarse (salidas.service.ts).
 */
export const SelectorUbicacionSalida = ({
  formatoId,
  propsControl,
  ref,
  valor,
  alCambiar,
  alSalir,
}: {
  formatoId: number | undefined;
  propsControl: PropsControl;
  ref: Ref<HTMLButtonElement>;
  valor: string;
  alCambiar: (valor: string) => void;
  alSalir: () => void;
}) => {
  const stock = useStockFormato(formatoId);
  const cargando = formatoId !== undefined && stock.isPending;
  const ubicaciones = stock.data?.ubicaciones ?? [];
  const aviso =
    formatoId === undefined
      ? 'Elige primero el formato'
      : cargando
        ? 'Cargando ubicaciones…'
        : (stock.error?.message ??
          (ubicaciones.length === 0
            ? 'Este formato no tiene stock en ninguna ubicación.'
            : null));

  return (
    <Select value={valor} onValueChange={alCambiar}>
      {/* Desactivado, el aviso sigue legible (AA): sin la opacidad ni el gris del placeholder */}
      <SelectTrigger
        {...propsControl}
        ref={ref}
        onBlur={alSalir}
        disabled={aviso !== null}
        aria-busy={cargando || undefined}
        className="whitespace-normal disabled:opacity-100 data-placeholder:disabled:text-texto-secundario"
      >
        <SelectValue placeholder={aviso ?? 'Elige'} />
      </SelectTrigger>
      <SelectContent
        position="popper"
        className="max-w-(--radix-select-trigger-width)"
      >
        {ubicaciones.map((ubicacion) => (
          <SelectItem key={ubicacion.id} value={String(ubicacion.id)}>
            {`${nombreUbicacion(ubicacion)} · stock ${ubicacion.cantidad}`}
            {!ubicacion.activa && ' (desactivada)'}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
