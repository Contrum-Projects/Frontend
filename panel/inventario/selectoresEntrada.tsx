'use client';

import type { Ref } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/compartido/ui/select';
import { Skeleton } from '@/compartido/ui/skeleton';
import type { PropsControl } from '@/tienda/cuenta/campoFormulario';
import { nombreUbicacion, useUbicaciones } from './consultasEntradas';
import { useProveedores } from './consultasProveedores';

interface Opcion {
  valor: string;
  texto: string;
}

/**
 * Un selector de la recepción con las opciones que entrega la API. Si no cargan o no hay
 * ninguna, lo dice en el mismo selector, desactivado (no se puede registrar sin ellas).
 */
const SelectorConOpciones = ({
  propsControl,
  ref,
  valor,
  alCambiar,
  alSalir,
  cargando,
  error,
  opciones,
  sinOpciones,
}: {
  propsControl: PropsControl;
  ref: Ref<HTMLButtonElement>;
  valor: string;
  alCambiar: (valor: string) => void;
  alSalir: () => void;
  cargando: boolean;
  error?: string;
  opciones: Opcion[];
  sinOpciones: string;
}) => {
  if (cargando) return <Skeleton className="h-[51px] rounded-md" />;
  const aviso = error ?? (opciones.length === 0 ? sinOpciones : null);
  return (
    <Select value={valor} onValueChange={alCambiar}>
      <SelectTrigger
        {...propsControl}
        ref={ref}
        onBlur={alSalir}
        disabled={aviso !== null}
        className="whitespace-normal"
      >
        <SelectValue placeholder={aviso ?? 'Elige'} />
      </SelectTrigger>
      {/* El menú no pasa del ancho del campo: los nombres largos saltan de línea a 360 px */}
      <SelectContent
        position="popper"
        className="max-w-(--radix-select-trigger-width)"
      >
        {opciones.map(({ valor, texto }) => (
          <SelectItem key={valor} value={valor}>
            {texto}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

type PropsSelector = {
  propsControl: PropsControl;
  ref: Ref<HTMLButtonElement>;
  valor: string;
  alCambiar: (valor: string) => void;
  alSalir: () => void;
};

/** Proveedores activos (el backend no lista los desactivados sin `?todos`). */
export const SelectorProveedor = (props: PropsSelector) => {
  const proveedores = useProveedores();
  return (
    <SelectorConOpciones
      {...props}
      cargando={proveedores.isPending}
      error={proveedores.error?.message}
      opciones={(proveedores.data ?? []).map((proveedor) => ({
        valor: String(proveedor.id),
        texto: proveedor.razonSocial,
      }))}
      sinOpciones="Aún no hay proveedores: regístralo en Proveedores."
    />
  );
};

/** «Bodega principal · A-01» */
export const SelectorUbicacion = (props: PropsSelector) => {
  const ubicaciones = useUbicaciones();
  return (
    <SelectorConOpciones
      {...props}
      cargando={ubicaciones.isPending}
      error={ubicaciones.error?.message}
      opciones={(ubicaciones.data ?? []).map((ubicacion) => ({
        valor: String(ubicacion.id),
        texto: nombreUbicacion(ubicacion),
      }))}
      sinOpciones="No hay ubicaciones activas donde recibir mercadería."
    />
  );
};
