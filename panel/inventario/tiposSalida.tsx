'use client';

import { RadioGroup as RadioGroupPrimitive } from 'radix-ui';
import type { Ref } from 'react';
import { RadioGroup } from '@/compartido/ui/radio-group';
import { TIPOS_MOVIMIENTO } from './esquemaSalida';

/** Chip de opción única (Figma P5c 2043:1958); el elegido, relleno; con error, borde rojo. */
const CLASE_CHIP =
  'inline-flex min-h-10 cursor-pointer items-center rounded-full border-[1.5px] bg-fondo-superficie px-3 texto-etiqueta whitespace-nowrap text-texto-principal transition-colors outline-none hover:border-marca-profundo focus-visible:ring-[3px] focus-visible:ring-ring/60 group-aria-invalid:border-destructive data-[state=checked]:border-marca-profundo data-[state=checked]:bg-marca-profundo data-[state=checked]:text-texto-sobre-oscuro lg:min-h-8';

interface PropsGrupoChips {
  id: string;
  ref: Ref<HTMLDivElement>;
  valor: string;
  alCambiar: (valor: string) => void;
  error?: string;
}

/**
 * Grupo de chips de opción única con su etiqueta y su error. Radio de Radix: flechas para
 * moverse, como cualquier grupo de opciones.
 */
const GrupoChips = ({
  id,
  ref,
  etiqueta,
  opciones,
  valor,
  alCambiar,
  error,
}: PropsGrupoChips & {
  etiqueta: string;
  opciones: { valor: string; texto: string }[];
}) => (
  <div className="flex flex-col gap-2">
    <p id={`${id}-etiqueta`} className="texto-etiqueta text-texto-principal">
      {etiqueta}
    </p>
    <RadioGroup
      ref={ref}
      aria-labelledby={`${id}-etiqueta`}
      aria-describedby={error ? `${id}-error` : undefined}
      aria-invalid={error ? true : undefined}
      aria-required
      value={valor}
      onValueChange={alCambiar}
      className="group flex flex-wrap gap-2"
    >
      {opciones.map((opcion) => (
        <RadioGroupPrimitive.Item
          key={opcion.valor}
          value={opcion.valor}
          className={CLASE_CHIP}
        >
          {opcion.texto}
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

/**
 * «Tipo de movimiento» (Figma P5c 2043:1956): las tres salidas (E11-H3), el ajuste y la
 * transferencia (E11-H4).
 */
export const TiposSalida = (props: PropsGrupoChips) => (
  <GrupoChips
    {...props}
    etiqueta="Tipo de movimiento"
    opciones={TIPOS_MOVIMIENTO}
  />
);

const SENTIDOS = [
  { valor: 'sumar', texto: 'Sumar' },
  { valor: 'descontar', texto: 'Descontar' },
];

/**
 * Si el ajuste suma o descuenta (E11-H4). Figma no lo dibuja: chips como los del tipo, para no
 * escribir el signo «−» en el teclado numérico del celular.
 */
export const SentidoAjuste = (props: PropsGrupoChips) => (
  <GrupoChips {...props} etiqueta="Diferencia" opciones={SENTIDOS} />
);
