'use client';

import { File as IconoArchivo } from 'lucide-react';
import type { Ref } from 'react';
import { cn } from '@/compartido/lib/utils';
import type { PropsControl } from '@/tienda/cuenta/campoFormulario';

/**
 * «Archivo de la factura» (Figma 2050:2078; celular 2051:1443): caja punteada que abre el
 * selector de archivos. Con un PDF elegido muestra su nombre y «Cambiar». El archivo queda en el
 * formulario aunque el backend rechace el envío.
 */
export const CampoArchivoFactura = ({
  archivo,
  alCambiar,
  alSalir,
  control,
  ref,
}: {
  archivo: File | null;
  alCambiar: (archivo: File | null) => void;
  alSalir: () => void;
  control: PropsControl;
  /** Para que el formulario enfoque el campo cuando tiene un error. */
  ref?: Ref<HTMLInputElement>;
}) => (
  <label
    className={cn(
      'flex min-h-[51px] cursor-pointer items-center gap-3 rounded-md border-[1.5px] border-dashed border-texto-secundario bg-fondo-superficie px-4 py-3 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-marca-profundo hover:bg-marca-acento-suave',
      control['aria-invalid'] && 'border-destructive',
    )}
  >
    <IconoArchivo
      aria-hidden
      className="size-5 shrink-0 text-texto-principal"
      strokeWidth={1.75}
    />
    <span className="min-w-0 flex-1 texto-pequeno wrap-anywhere text-texto-principal">
      {archivo ? (
        archivo.name
      ) : (
        <>
          Sube el PDF <span className="max-lg:hidden">descargado </span>del SII
        </>
      )}
    </span>
    <span aria-hidden className="shrink-0 texto-etiqueta text-marca-profundo">
      {archivo ? 'Cambiar' : 'Elegir'}
    </span>
    <input
      {...control}
      ref={ref}
      type="file"
      accept="application/pdf,.pdf"
      className="sr-only"
      onBlur={alSalir}
      onChange={(evento) => {
        const elegido = evento.target.files?.[0];
        // Cancelar el selector no borra el archivo que ya estaba elegido
        if (elegido) alCambiar(elegido);
        evento.target.value = '';
      }}
    />
  </label>
);
