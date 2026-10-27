import type { ReactNode } from 'react';
import { cn } from '@/compartido/lib/utils';
import { Label } from '@/compartido/ui/label';

export interface PropsControl {
  id: string;
  'aria-invalid'?: true;
  'aria-describedby'?: string;
  'aria-required'?: true;
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
  obligatorio = false,
  className,
  children,
}: {
  id: string;
  etiqueta: string;
  error?: string;
  /**
   * Marca la etiqueta con «*» (solo visual; el control lleva `aria-required`). El formulario
   * explica el asterisco una vez.
   */
  obligatorio?: boolean;
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
    {/* Abajo de su fila, junto al control */}
    <Label htmlFor={id} className="gap-0.5 self-end">
      {etiqueta}
      {obligatorio && (
        <span aria-hidden className="text-destructive">
          *
        </span>
      )}
    </Label>
    {children({
      id,
      'aria-invalid': error ? true : undefined,
      'aria-describedby': error ? `${id}-error` : undefined,
      'aria-required': obligatorio ? true : undefined,
    })}
    {error && (
      <p id={`${id}-error`} className="texto-pequeno text-destructive">
        {error}
      </p>
    )}
  </div>
);
