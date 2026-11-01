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

/**
 * «Ubicación de destino» de la transferencia (E11-H4): las ubicaciones activas de bodegas
 * activas, de la misma bodega o de otra, sin la de origen; se elige después del origen. Si el
 * destino sirve lo decide el backend (transferencias.service.ts). TODO(SCRUM-111): GET
 * /inventario/ubicaciones es simulado.
 */
export const SelectorDestino = ({
  origenId,
  propsControl,
  ref,
  valor,
  alCambiar,
  alSalir,
}: {
  origenId: string;
  propsControl: PropsControl;
  ref: Ref<HTMLButtonElement>;
  valor: string;
  alCambiar: (valor: string) => void;
  alSalir: () => void;
}) => {
  const ubicaciones = useUbicaciones();
  const opciones = (ubicaciones.data ?? []).filter(
    ({ id }) => String(id) !== origenId,
  );
  const aviso = !origenId
    ? 'Elige primero el origen'
    : ubicaciones.isPending
      ? 'Cargando ubicaciones…'
      : (ubicaciones.error?.message ??
        (opciones.length === 0 ? 'No hay otra ubicación activa.' : null));

  return (
    <Select value={valor} onValueChange={alCambiar}>
      <SelectTrigger
        {...propsControl}
        ref={ref}
        onBlur={alSalir}
        disabled={aviso !== null}
        aria-busy={ubicaciones.isPending || undefined}
        className="whitespace-normal disabled:opacity-100 data-placeholder:disabled:text-texto-secundario"
      >
        <SelectValue placeholder={aviso ?? 'Elige'} />
      </SelectTrigger>
      <SelectContent
        position="popper"
        className="max-w-(--radix-select-trigger-width)"
      >
        {opciones.map((ubicacion) => (
          <SelectItem key={ubicacion.id} value={String(ubicacion.id)}>
            {nombreUbicacion(ubicacion)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
