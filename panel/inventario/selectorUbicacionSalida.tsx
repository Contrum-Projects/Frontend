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
import { nombreUbicacion, useUbicaciones } from './consultasEntradas';
import { useStockFormato } from './consultasSalidas';

interface OpcionUbicacion {
  id: number;
  texto: string;
}

/**
 * Ubicación de una salida, del origen de una transferencia o de un ajuste (Figma P5c «B-01 ·
 * stock 3»): las ubicaciones donde el formato tiene unidades, con el stock que informa el
 * backend. También las desactivadas: su stock físico puede salir, ajustarse o vaciarse
 * (salidas, ajustes y transferencias.service.ts). Con `conActivas` (ajuste), además las demás
 * ubicaciones activas con «stock 0»: un conteo puede encontrar unidades donde no había registro.
 */
export const SelectorUbicacionSalida = ({
  formatoId,
  conActivas = false,
  propsControl,
  ref,
  valor,
  alCambiar,
  alSalir,
}: {
  formatoId: number | undefined;
  conActivas?: boolean;
  propsControl: PropsControl;
  ref: Ref<HTMLButtonElement>;
  valor: string;
  alCambiar: (valor: string) => void;
  alSalir: () => void;
}) => {
  const stock = useStockFormato(formatoId);
  const activas = useUbicaciones(conActivas);
  const cargando =
    formatoId !== undefined &&
    (stock.isPending || (conActivas && activas.isPending));

  const conStock: OpcionUbicacion[] = (stock.data?.ubicaciones ?? []).map(
    (ubicacion) => ({
      id: ubicacion.id,
      texto: `${nombreUbicacion(ubicacion)} · stock ${ubicacion.cantidad}${ubicacion.activa ? '' : ' (desactivada)'}`,
    }),
  );
  // Si las activas no cargan, el ajuste sigue con las que tienen stock
  const sinStock: OpcionUbicacion[] = conActivas
    ? (activas.data ?? [])
        .filter(({ id }) => !conStock.some((opcion) => opcion.id === id))
        .map((ubicacion) => ({
          id: ubicacion.id,
          texto: `${nombreUbicacion(ubicacion)} · stock 0`,
        }))
    : [];
  const opciones = [...conStock, ...sinStock];

  const aviso =
    formatoId === undefined
      ? 'Elige primero el formato'
      : cargando
        ? 'Cargando ubicaciones…'
        : (stock.error?.message ??
          (opciones.length === 0
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
        {opciones.map(({ id, texto }) => (
          <SelectItem key={id} value={String(id)}>
            {texto}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
