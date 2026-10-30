'use client';

import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import type { Disponibilidad } from '@/compartido/api/respuestas';
import { Button } from '@/compartido/ui/button';
import { Cantidad } from '@/compartido/ui/cantidad';

interface CompraProps {
  disponibilidad: Disponibilidad;
  /** Lo que se agrega («Shampoo reparador 300 ml»), para la etiqueta de la cantidad. */
  articulo: string;
}

/**
 * Cantidad y «Agregar al carrito» (Figma › 03 Ficha 2007:754). Agotado: sin cantidad y el botón
 * deshabilitado (criterio 2). El backend vuelve a comprobar el stock al agregar.
 */
export const Compra = ({ disponibilidad, articulo }: CompraProps) => {
  const [cantidad, setCantidad] = useState(1);

  if (disponibilidad === 'agotado') {
    return (
      <Button type="button" size="grande" disabled className="w-full">
        Agotado
      </Button>
    );
  }

  return (
    // Celular: la cantidad arriba y el botón a todo el ancho (Figma 2007:1779), así cabe en 360 px
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Cantidad
        valor={cantidad}
        onCambiar={setCantidad}
        etiqueta={`Cantidad de ${articulo}`}
        className="h-14 self-start"
      />
      {/* TODO(SCRUM-116): agregar `cantidad` al carrito */}
      <Button
        type="button"
        size="grande"
        className="w-full sm:w-auto sm:flex-1"
      >
        Agregar al carrito
        <ArrowRight aria-hidden />
      </Button>
    </div>
  );
};
