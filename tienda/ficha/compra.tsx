'use client';

import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import type { Disponibilidad } from '@/compartido/api/respuestas';
import { esperarRenovacion, leerEstado } from '@/compartido/sesion/almacen';
import { Button } from '@/compartido/ui/button';
import { Cantidad } from '@/compartido/ui/cantidad';
import { agregarAlCarritoNavegador } from '@/tienda/carrito/carritoNavegador';
import { useAgregarAlCarrito } from '@/tienda/carrito/consultasCarrito';
import { RUTAS } from '@/tienda/diseno/enlaces';

interface CompraProps {
  /** Id del formato elegido o del pack: es el artículo que se agrega al carrito. */
  articuloId: number;
  disponibilidad: Disponibilidad;
  /** Lo que se agrega («Shampoo reparador 300 ml»), para la etiqueta de la cantidad. */
  articulo: string;
}

/**
 * Cantidad y «Agregar al carrito» (Figma › 03 Ficha 2007:754), desde 1 unidad para todos: el
 * peluquero no tiene mínimo (SCRUM-146). Agotado: sin cantidad y el botón deshabilitado. Al
 * agregar (SCRUM-116), el backend vuelve a comprobar el stock; si lo rechaza, su mensaje queda bajo el botón. Sin sesión, se guarda en
 * el carrito del navegador sin revisar el stock (SCRUM-117): el carrito lo marca al cotizar.
 */
export const Compra = ({
  articuloId,
  disponibilidad,
  articulo,
}: CompraProps) => {
  const [cantidad, setCantidad] = useState(1);
  // Cubre también la espera de la sesión, antes de que empiece la mutación (sin doble clic)
  const [esperando, setEsperando] = useState(false);
  const [errorNavegador, setErrorNavegador] = useState<string | null>(null);
  const router = useRouter();
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
    setEsperando(true);
    await esperarRenovacion();
    setEsperando(false);
    setErrorNavegador(null);
    if (leerEstado().tipo !== 'activa') {
      const error = agregarAlCarritoNavegador({ articuloId, cantidad });
      if (error) setErrorNavegador(error);
      else avisarAgregado();
      return;
    }
    agregarAlCarrito.mutate(
      { articuloId, cantidad },
      { onSuccess: avisarAgregado },
    );
  };

  const avisarAgregado = () =>
    toast.success('Agregado al carrito', {
      action: {
        label: 'Ver carrito',
        onClick: () => router.push(RUTAS.carrito),
      },
    });

  const selector = (
    <Cantidad
      valor={cantidad}
      onCambiar={setCantidad}
      etiqueta={`Cantidad de ${articulo}`}
      className="h-14 self-start"
    />
  );
  const boton = (
    <Button
      type="button"
      size="grande"
      className="w-full sm:w-auto sm:flex-1"
      disabled={esperando || agregarAlCarrito.isPending}
      onClick={() => void agregar()}
    >
      Agregar al carrito
      <ArrowRight aria-hidden />
    </Button>
  );
  const mensajeError = errorNavegador ?? agregarAlCarrito.error?.message;
  const error = mensajeError && (
    <p role="alert" className="texto-pequeno text-estado-error">
      {mensajeError}
    </p>
  );

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
