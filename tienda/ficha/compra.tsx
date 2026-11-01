'use client';

import { ArrowRight } from 'lucide-react';
import type { Route } from 'next';
import { usePathname, useRouter } from 'next/navigation';
import { useId, useState } from 'react';
import { toast } from 'sonner';
import type { Disponibilidad } from '@/compartido/api/respuestas';
import { esperarRenovacion, leerEstado } from '@/compartido/sesion/almacen';
import { Button } from '@/compartido/ui/button';
import { Cantidad } from '@/compartido/ui/cantidad';
import { useAgregarAlCarrito } from '@/tienda/carrito/consultasCarrito';
import { RUTAS } from '@/tienda/diseno/enlaces';

interface CompraProps {
  /** Id del formato elegido o del pack: es el artículo que se agrega al carrito. */
  articuloId: number;
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
 * sin cantidad y el botón deshabilitado. Al agregar (SCRUM-116), el backend vuelve a comprobar
 * el stock y el mínimo; si lo rechaza, su mensaje queda bajo el botón. Sin sesión, lleva a
 * ingresar y de vuelta a la ficha hasta que exista el carrito del visitante (SCRUM-117).
 */
export const Compra = ({
  articuloId,
  disponibilidad,
  articulo,
  minimo,
}: CompraProps) => {
  const [cantidad, setCantidad] = useState(minimo ?? 1);
  const idMinimo = useId();
  const router = useRouter();
  const ruta = usePathname();
  const agregarAlCarrito = useAgregarAlCarrito();

  if (disponibilidad === 'agotado') {
    return (
      <Button type="button" size="grande" disabled className="w-full">
        Agotado
      </Button>
    );
  }

  const agregar = async () => {
    // Recién abierta la página, la sesión puede estar renovándose: se espera para saber quién es
    await esperarRenovacion();
    // TODO(SCRUM-117): el visitante agrega al carrito del navegador
    if (leerEstado().tipo !== 'activa') {
      router.push(
        `${RUTAS.ingresar}?volver=${encodeURIComponent(ruta)}` as Route,
      );
      return;
    }
    agregarAlCarrito.mutate(
      { articuloId, cantidad },
      {
        onSuccess: () =>
          toast.success('Agregado al carrito', {
            action: {
              label: 'Ver carrito',
              onClick: () => router.push(RUTAS.carrito),
            },
          }),
      },
    );
  };

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
  const boton = (
    <Button
      type="button"
      size="grande"
      className="w-full sm:w-auto sm:flex-1"
      disabled={agregarAlCarrito.isPending}
      onClick={() => void agregar()}
    >
      {minimo ? `Agregar ${cantidad} al carrito` : 'Agregar al carrito'}
      <ArrowRight aria-hidden />
    </Button>
  );
  const error = agregarAlCarrito.error && (
    <p role="alert" className="texto-pequeno text-estado-error">
      {agregarAlCarrito.error.message}
    </p>
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
        {boton}
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Celular: la cantidad arriba y el botón a todo el ancho (Figma 2007:1779), así cabe en 360 px */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {selector}
        {boton}
      </div>
      {error}
    </div>
  );
};
