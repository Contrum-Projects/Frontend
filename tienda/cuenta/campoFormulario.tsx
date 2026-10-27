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
  <div className={cn('flex min-w-0 flex-col gap-1.5', className)}>
    <Label htmlFor={id} className="gap-1">
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
