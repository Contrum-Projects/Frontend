'use client';

import { ArrowRight } from 'lucide-react';
import { useId, useState } from 'react';
import type { Disponibilidad } from '@/compartido/api/respuestas';
import { Button } from '@/compartido/ui/button';
import { Cantidad } from '@/compartido/ui/cantidad';

interface CompraProps {
  disponibilidad: Disponibilidad;
  /** Lo que se agrega («Shampoo reparador 300 ml»), para la etiqueta de la cantidad. */
  articulo: string;
  /**
   * Mínimo de unidades del precio profesional (SCRUM-109): la cantidad empieza y no baja de ahí,
   * y se avisa bajo el selector. Sin él, desde 1.
   */
  minimo?: number;
}

/**
 * Cantidad y «Agregar al carrito» (Figma › 03 Ficha 2007:754; peluquero 2007:1779). Agotado:
 * sin cantidad y el botón deshabilitado (criterio 2). El backend vuelve a comprobar el stock y
 * el mínimo al agregar.
 */
export const Compra = ({ disponibilidad, articulo, minimo }: CompraProps) => {
  const [cantidad, setCantidad] = useState(minimo ?? 1);
  const idMinimo = useId();

  if (disponibilidad === 'agotado') {
    return (
      <Button type="button" size="grande" disabled className="w-full">
        Agotado
      </Button>
    );
  }

  const selector = (
    <Cantidad
      valor={cantidad}
      onCambiar={setCantidad}
      minimo={minimo}
      descripcion={minimo ? idMinimo : undefined}
      etiqueta={`Cantidad de ${articulo}`}
      className="h-14 self-start"
    />
  );
  // TODO(SCRUM-116): agregar `cantidad` al carrito
  const agregar = (
    <Button type="button" size="grande" className="w-full sm:w-auto sm:flex-1">
      {minimo ? `Agregar ${cantidad} al carrito` : 'Agregar al carrito'}
      <ArrowRight aria-hidden />
    </Button>
  );

  if (minimo) {
    // Peluquero (Figma 2007:1779): la cantidad con el aviso del mínimo y el botón debajo
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          {selector}
          <p id={idMinimo} className="texto-pequeno text-texto-secundario">
            Para tu precio profesional, el mínimo es {minimo} unidades de este
            formato.
          </p>
        </div>
        {agregar}
      </div>
    );
  }

  return (
    // Celular: la cantidad arriba y el botón a todo el ancho (Figma 2007:1779), así cabe en 360 px
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {selector}
      {agregar}
    </div>
  );
};
