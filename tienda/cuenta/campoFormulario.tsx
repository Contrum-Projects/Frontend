import type { ReactNode } from 'react';
import { cn } from '@/compartido/lib/utils';
import { Label } from '@/compartido/ui/label';

export interface PropsControl {
  id: string;
  'aria-invalid'?: true;
  'aria-describedby'?: string;
}

/**
 * Campo de Figma (Componentes › Campo): etiqueta siempre visible, control y el error debajo.
 * `children` recibe los atributos que conectan el control con su etiqueta y su error.
 *
 * Dentro de una grilla de dos columnas, cada campo toma las filas de la grilla (subgrid): los
 * controles de una misma fila quedan alineados aunque una etiqueta ocupe dos líneas o un campo
 * tenga error. Fuera de una grilla se comporta como una columna.
 */
export const CampoFormulario = ({
  id,
  etiqueta,
  error,
  opcional = false,
  className,
  children,
}: {
  id: string;
  etiqueta: string;
  error?: string;
  /** Agrega «(opcional)» junto a la etiqueta, en texto secundario. */
  opcional?: boolean;
  className?: string;
  children: (control: PropsControl) => ReactNode;
}) => (
  <div
    className={cn(
      'grid min-w-0 grid-rows-subgrid gap-1.5',
      error ? 'row-span-3' : 'row-span-2',
      className,
    )}
  >
    {/* Abajo de su fila, junto al control; «(opcional)» baja de línea si no cabe */}
    <Label
      htmlFor={id}
      className="flex-wrap items-baseline gap-x-1 gap-y-0 self-end"
    >
      {etiqueta}
      {/* El espacio no se ve (flex), pero el lector de pantalla dice «RUT (opcional)» */}
      {opcional && ' '}
      {opcional && (
        <span className="texto-leyenda text-texto-secundario">(opcional)</span>
      )}
    </Label>
    {children({
      id,
      'aria-invalid': error ? true : undefined,
      'aria-describedby': error ? `${id}-error` : undefined,
    })}
    {error && (
      <p id={`${id}-error`} className="texto-pequeno text-destructive">
        {error}
      </p>
    )}
  </div>
);
