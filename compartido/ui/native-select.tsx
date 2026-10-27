import * as React from 'react';
import { cn } from '@/compartido/lib/utils';
import { ChevronDownIcon } from 'lucide-react';

function NativeSelect({
  className,
  contenedorClassName,
  size = 'default',
  ...props
}: Omit<React.ComponentProps<'select'>, 'size'> & {
  size?: 'sm' | 'default';
  /** Clases del contenedor (p. ej. `w-full` para ocupar el ancho del campo). */
  contenedorClassName?: string;
}) {
  return (
    <div
      className={cn(
        'group/native-select relative w-fit has-[select:disabled]:opacity-50',
        contenedorClassName,
      )}
      data-slot="native-select-wrapper"
    >
      <select
        data-slot="native-select"
        data-size={size}
        className={cn(
          // Misma caja que <Input> (Figma › Campo): 51 px, borde de 1,5 px, texto cuerpo (sin zoom en iOS)
          'h-[51px] w-full min-w-0 cursor-pointer appearance-none rounded-md border-[1.5px] border-input bg-fondo-superficie px-4 pr-10 texto-cuerpo text-foreground transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed data-[size=sm]:h-[38px]',
          'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40',
          'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
          className,
        )}
        {...props}
      />
      <ChevronDownIcon
        className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 stroke-[1.75] text-texto-secundario select-none"
        aria-hidden="true"
        data-slot="native-select-icon"
      />
    </div>
  );
}

function NativeSelectOption({
  className,
  ...props
}: React.ComponentProps<'option'>) {
  return (
    <option
      data-slot="native-select-option"
      className={cn('bg-[Canvas] text-[CanvasText]', className)}
      {...props}
    />
  );
}

function NativeSelectOptGroup({
  className,
  ...props
}: React.ComponentProps<'optgroup'>) {
  return (
    <optgroup
      data-slot="native-select-optgroup"
      className={cn('bg-[Canvas] text-[CanvasText]', className)}
      {...props}
    />
  );
}

export { NativeSelect, NativeSelectOptGroup, NativeSelectOption };
