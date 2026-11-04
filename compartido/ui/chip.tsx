import { Check } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/compartido/lib/utils';

/**
 * Chip seleccionable de Figma (08c Perfil profesional, 2038:2817 y 2038:2821): píldora con borde
 * hueso oscuro; elegido, fondo profundo con un check. Es un radio o una casilla real (oculta a la
 * vista), así funciona con el teclado, con el lector de pantalla y con `register` de
 * react-hook-form. Agrúpalos en un `<fieldset>` con su `<legend>`.
 */
export const Chip = ({
  type,
  className,
  children,
  ...props
}: Omit<ComponentProps<'input'>, 'type' | 'children'> & {
  type: 'radio' | 'checkbox';
  children: ReactNode;
}) => (
  <label
    className={cn(
      'inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full border-[1.5px] border-fondo-hueso-oscuro bg-fondo-superficie px-4 py-2 texto-etiqueta text-texto-principal transition-colors hover:border-marca-profundo',
      'has-checked:border-marca-profundo has-checked:bg-marca-profundo has-checked:text-texto-sobre-oscuro',
      'has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-marca-profundo',
      'has-disabled:cursor-not-allowed has-disabled:opacity-50',
      className,
    )}
  >
    <input type={type} className="peer sr-only" {...props} />
    <Check
      aria-hidden
      strokeWidth={1.75}
      className="hidden size-3.5 shrink-0 peer-checked:block"
    />
    {children}
  </label>
);
