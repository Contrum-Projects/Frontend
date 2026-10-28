'use client';

import * as React from 'react';
import { cn } from '@/compartido/lib/utils';
import { RadioGroup as RadioGroupPrimitive } from 'radix-ui';

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn('grid gap-3', className)}
      {...props}
    />
  );
}

/**
 * Radio de Figma (P8a Nueva cuenta, 2049:2179): 20 px, superficie con borde hueso oscuro;
 * elegido, borde y punto en profundo.
 */
function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        'flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-full border-[1.5px] border-fondo-hueso-oscuro bg-fondo-superficie transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/60 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive data-[state=checked]:border-marca-profundo',
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="size-2.5 rounded-full bg-marca-profundo"
      />
    </RadioGroupPrimitive.Item>
  );
}

export { RadioGroup, RadioGroupItem };
