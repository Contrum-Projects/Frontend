'use client';

import * as React from 'react';
import { cn } from '@/compartido/lib/utils';
import { CheckIcon } from 'lucide-react';
import { Checkbox as CheckboxPrimitive } from 'radix-ui';

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        // Casilla de Figma: 20 px, borde hueso-oscuro de 1,5 px, fondo superficie; foco profundo (3:1)
        'peer size-5 shrink-0 cursor-pointer rounded-sm border-[1.5px] border-input bg-fondo-superficie transition-shadow outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-profundo disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none"
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
