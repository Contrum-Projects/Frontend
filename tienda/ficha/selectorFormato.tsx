'use client';

import { RadioGroup as RadioGroupPrimitive } from 'radix-ui';
import type { FormatoDetalle } from '@/compartido/api/respuestas';
import { formatearPesos } from '@/compartido/formato/moneda';
import { RadioGroup } from '@/compartido/ui/radio-group';

interface SelectorFormatoProps {
  formatos: FormatoDetalle[];
  elegido: number;
  onElegir: (id: number) => void;
}

/**
 * Opciones de formato (Figma › 03 Ficha 2007:741, agotado 2058:3096): nombre y precio con IVA,
 * o «Agotado» si no hay stock. El agotado se puede elegir igual para ver sus fotos (criterio 2).
 * Radio de Radix: flechas para moverse, como cualquier grupo de opciones.
 */
export const SelectorFormato = ({
  formatos,
  elegido,
  onElegir,
}: SelectorFormatoProps) => (
  <div className="flex flex-col gap-3">
    <p id="etiqueta-formato" className="texto-etiqueta text-texto-principal">
      Formato
    </p>
    <RadioGroup
      aria-labelledby="etiqueta-formato"
      value={String(elegido)}
      onValueChange={(valor) => onElegir(Number(valor))}
      className="flex flex-wrap gap-3"
    >
      {formatos.map((formato) => (
        <RadioGroupPrimitive.Item
          key={formato.id}
          value={String(formato.id)}
          aria-label={`${formato.nombre}, ${
            formato.disponibilidad === 'agotado'
              ? 'agotado'
              : formatearPesos(formato.precio)
          }`}
          className="flex min-w-24 flex-1 cursor-pointer flex-col items-center gap-1 rounded-lg border-2 border-fondo-hueso-oscuro bg-fondo-superficie px-4 py-3 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/60 data-[state=checked]:border-marca-profundo data-[state=checked]:bg-marca-acento-suave md:flex-none"
        >
          <span className="texto-cuerpo-fuerte text-texto-principal">
            {formato.nombre}
          </span>
          <span className="texto-leyenda text-texto-secundario">
            {formato.disponibilidad === 'agotado'
              ? 'Agotado'
              : formatearPesos(formato.precio)}
          </span>
        </RadioGroupPrimitive.Item>
      ))}
    </RadioGroup>
  </div>
);
