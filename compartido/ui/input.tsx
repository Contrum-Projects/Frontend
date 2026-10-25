import * as React from 'react';
import { cn } from '@/compartido/lib/utils';

/**
 * Campo de Figma (Componentes › Campo › Caja): fondo superficie, borde hueso-oscuro de 1,5 px,
 * radio/s, relleno 12/16 y texto cuerpo (16 px, así iOS no hace zoom al enfocar).
 * La etiqueta va aparte con <Label> o <Field> (texto-etiqueta, 6 px de separación).
 */
function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'h-[51px] w-full min-w-0 rounded-md border-[1.5px] border-input bg-fondo-superficie px-4 py-3 texto-cuerpo text-foreground transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        'file:inline-flex file:h-7 file:border-0 file:bg-transparent file:texto-etiqueta file:text-foreground',
        'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
