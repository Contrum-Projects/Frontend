'use client';

import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { contarUnidades, useCarrito } from '@/tienda/carrito/consultasCarrito';
import { textoUnidades } from '@/tienda/carrito/textos';
import { RUTAS } from './enlaces';

/**
 * Carrito del header (Figma › Componentes › Header 6:107) con el contador de unidades del
 * carrito de la cuenta (SCRUM-116, decisión del 01-11-2026). Sin sesión, sin artículos o con
 * una cuenta del personal, solo el ícono.
 */
export const CarritoHeader = () => {
  const { data } = useCarrito();
  const unidades = data ? contarUnidades(data) : 0;
  return (
    <Link
      href={RUTAS.carrito}
      aria-label={
        unidades > 0 ? `Carrito, ${textoUnidades(unidades)}` : 'Carrito'
      }
      className="inline-flex h-10 min-w-10 items-center justify-center gap-1.5 rounded-md text-texto-principal"
    >
      <ShoppingCart className="size-6" strokeWidth={1.75} aria-hidden />
      {unidades > 0 && (
        <span
          aria-hidden
          className="rounded-full bg-marca-acento px-1.5 py-0.5 texto-leyenda text-marca-profundo tabular-nums"
        >
          {unidades > 99 ? '99+' : unidades}
        </span>
      )}
    </Link>
  );
};
