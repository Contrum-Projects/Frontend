'use client';

import { RadioGroup as RadioGroupPrimitive } from 'radix-ui';
import type { Ref } from 'react';
import { RadioGroup } from '@/compartido/ui/radio-group';
import { TIPOS_SALIDA } from './esquemaSalida';

/**
 * «Tipo de movimiento» (Figma P5c 2043:1956): chips de opción única. Radio de Radix: flechas
 * para moverse, como cualquier grupo de opciones. Ajuste y transferencia llegan con SCRUM-113.
 */
export const TiposSalida = ({
  id,
  ref,
  valor,
  alCambiar,
  error,
}: {
  id: string;
  ref: Ref<HTMLDivElement>;
  valor: string;
  alCambiar: (valor: string) => void;
  error?: string;
}) => (
  <div className="flex flex-col gap-2">
    <p id={`${id}-etiqueta`} className="texto-etiqueta text-texto-principal">
      Tipo de movimiento
    </p>
    <RadioGroup
      ref={ref}
      aria-labelledby={`${id}-etiqueta`}
      aria-describedby={error ? `${id}-error` : undefined}
      aria-invalid={error ? true : undefined}
      value={valor}
      onValueChange={alCambiar}
      className="flex flex-wrap gap-2"
    >
      {TIPOS_SALIDA.map(({ valor: tipo, texto }) => (
        <RadioGroupPrimitive.Item
          key={tipo}
          value={tipo}
          className="inline-flex min-h-10 cursor-pointer items-center rounded-full border-[1.5px] bg-fondo-superficie px-3 texto-etiqueta whitespace-nowrap text-texto-principal transition-colors outline-none hover:border-marca-profundo focus-visible:ring-[3px] focus-visible:ring-ring/60 data-[state=checked]:border-marca-profundo data-[state=checked]:bg-marca-profundo data-[state=checked]:text-texto-sobre-oscuro lg:min-h-8"
        >
          {texto}
        </RadioGroupPrimitive.Item>
      ))}
    </RadioGroup>
    {error && (
      <p id={`${id}-error`} className="texto-pequeno text-destructive">
        {error}
      </p>
    )}
  </div>
);
