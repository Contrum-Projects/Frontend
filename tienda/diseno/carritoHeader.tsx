'use client';

import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useSesion } from '@/compartido/sesion/sesion';
import { useCarritoNavegador } from '@/tienda/carrito/carritoNavegador';
import { abrirPanelCarrito } from '@/tienda/carrito/estadoPanelCarrito';
import { contarUnidades, useCarrito } from '@/tienda/carrito/consultasCarrito';
import { textoUnidades } from '@/tienda/carrito/textos';
import { RUTAS } from './enlaces';
import { CLASE_ICONO_HEADER } from './estilosHeader';

/**
 * Carrito del header (Figma › Componentes › Header 6:107) con el contador de unidades del
 * carrito de la cuenta (SCRUM-116, decisión del 01-11-2026) o, sin sesión, del carrito del
 * navegador (SCRUM-117), sin pedir nada a la API. Sin artículos o con una cuenta del personal,
 * solo el ícono. La píldora va sobre el ícono para que el enlace siga
 * midiendo 40 px y quepa en el header del celular (360 px). Abre el panel lateral del carrito;
 * sigue siendo un enlace a /carrito, así funciona sin JavaScript y con clic secundario.
 */
export const CarritoHeader = () => {
  const { estado } = useSesion();
  const { data } = useCarrito();
  const navegador = useCarritoNavegador();
  const unidades =
    estado === 'anonima'
      ? navegador.reduce((suma, a) => suma + a.cantidad, 0)
      : data
        ? contarUnidades(data)
        : 0;
  return (
    <Link
      href={RUTAS.carrito}
      onClick={(evento) => {
        // Con Ctrl, Cmd o la rueda se abre en otra pestaña, como cualquier enlace
        if (
          evento.metaKey ||
          evento.ctrlKey ||
          evento.shiftKey ||
          evento.button !== 0
        )
          return;
        evento.preventDefault();
        abrirPanelCarrito();
      }}
      aria-haspopup="dialog"
      aria-label={
        unidades > 0 ? `Carrito, ${textoUnidades(unidades)}` : 'Carrito'
      }
      className={CLASE_ICONO_HEADER}
    >
      <ShoppingCart className="size-6" strokeWidth={1.75} aria-hidden />
      {unidades > 0 && (
        <span
          aria-hidden
          className="absolute -top-1 -right-1 min-w-5 rounded-full bg-marca-acento px-1 text-center texto-leyenda text-marca-profundo tabular-nums"
        >
          {unidades > 99 ? '99+' : unidades}
        </span>
      )}
    </Link>
  );
};
