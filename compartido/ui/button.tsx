import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import { cn } from '@/compartido/lib/utils';

/**
 * Botón de Figma (Componentes › Botón): píldora, ícono de 20 px (grande) o 16 px (mediano).
 * - primario: marca/profundo con texto sobre-oscuro. La acción principal de la pantalla.
 * - acento: marca/acento con texto profundo. Solo sobre fondos oscuros (banner, footer, panel).
 * - contorno: borde profundo de 1,5 px. Acciones secundarias.
 * Las variantes `ghost`, `link` y `destructive` vienen de shadcn para menús, enlaces y borrar.
 */
const buttonVariants = cva(
  'inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full whitespace-nowrap transition-[color,background-color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/60 disabled:pointer-events-none disabled:opacity-50 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:stroke-[1.75]',
  {
    variants: {
      variant: {
        primario: 'bg-primary text-primary-foreground hover:bg-primary/90',
        acento: 'bg-marca-acento text-marca-profundo hover:bg-marca-acento/90',
        contorno:
          'border-[1.5px] border-marca-profundo bg-transparent text-marca-profundo hover:bg-marca-acento-suave',
        ghost: 'text-foreground hover:bg-accent hover:text-accent-foreground',
        link: 'h-auto px-0 text-marca-profundo underline-offset-4 hover:underline',
        destructive:
          'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/30',
      },
      size: {
        grande:
          "h-14 px-7 texto-cuerpo-fuerte [&_svg:not([class*='size-'])]:size-5",
        mediano:
          "h-[38px] px-[18px] texto-etiqueta [&_svg:not([class*='size-'])]:size-4",
        icono: "size-10 [&_svg:not([class*='size-'])]:size-5",
        'icono-chico': "size-8 [&_svg:not([class*='size-'])]:size-4",
      },
    },
    defaultVariants: {
      variant: 'primario',
      size: 'mediano',
    },
  },
);

function Button({
  className,
  variant = 'primario',
  size = 'mediano',
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : 'button';

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
