'use client';

import { Minus, Plus } from 'lucide-react';
import { cn } from '@/compartido/lib/utils';
import { Button } from '@/compartido/ui/button';

interface CantidadProps {
  valor: number;
  onCambiar: (valor: number) => void;
  /** 1 por defecto; para el peluquero verificado es 3 (RF-05.10, lo decide el backend). */
  minimo?: number;
  maximo?: number;
  /** Para lectores de pantalla: qué se está contando («Cantidad de Shampoo reparador»). */
  etiqueta?: string;
  className?: string;
}

/**
 * Selector de cantidad (Figma › Componentes › Cantidad 4:98): píldora con − y + y el número al
 * centro. No calcula precios: solo cuenta unidades.
 */
export const Cantidad = ({
  valor,
  onCambiar,
  minimo = 1,
  maximo,
  etiqueta = 'Cantidad',
  className,
}: CantidadProps) => (
  <div
    role="group"
    aria-label={etiqueta}
    className={cn(
      'inline-flex items-center gap-1 rounded-full border-[1.5px] border-fondo-hueso-oscuro bg-fondo-superficie p-1',
      className,
    )}
  >
    <Button
      type="button"
      variant="ghost"
      size="icono"
      aria-label="Quitar una unidad"
      disabled={valor <= minimo}
      onClick={() => onCambiar(Math.max(minimo, valor - 1))}
    >
      <Minus aria-hidden />
    </Button>
    <output
      aria-live="polite"
      className="w-7 text-center texto-cuerpo-fuerte text-texto-principal tabular-nums"
    >
      {valor}
    </output>
    <Button
      type="button"
      variant="ghost"
      size="icono"
      aria-label="Agregar una unidad"
      disabled={maximo !== undefined && valor >= maximo}
      onClick={() =>
        onCambiar(
          maximo === undefined ? valor + 1 : Math.min(maximo, valor + 1),
        )
      }
    >
      <Plus aria-hidden />
    </Button>
  </div>
);
