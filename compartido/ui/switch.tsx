'use client';

import * as React from 'react';
import { cn } from '@/compartido/lib/utils';
import { Switch as SwitchPrimitive } from 'radix-ui';

/**
 * Interruptor de Figma (P8 Personal, celular 2051:1413): 40 × 24 px, profundo encendido y
 * hueso oscuro apagado, con el círculo en superficie. El relleno de 3 px y el círculo de 18 px
 * son medidas de Figma; el área táctil crece 8 px por lado sin cambiar lo que se ve.
 */
function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'peer group/switch relative inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full p-0.75 transition-colors outline-none after:absolute after:-inset-2 focus-visible:ring-[3px] focus-visible:ring-ring/60 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-marca-profundo data-[state=unchecked]:bg-fondo-hueso-oscuro',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block size-4.5 rounded-full bg-fondo-superficie shadow-xs transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
