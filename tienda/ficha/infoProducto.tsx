'use client';

import { type ReactNode, useState } from 'react';
import type { ProductoDetalle } from '@/compartido/api/respuestas';
import { Compra } from './compra';
import { EstadoDisponibilidad } from './disponibilidad';
import { Galeria } from './galeria';
import { DisenoFicha, PrecioFicha, TituloFicha } from './partesFicha';
import { SelectorFormato } from './selectorFormato';

interface InfoProductoProps {
  producto: ProductoDetalle;
  migas: ReactNode;
}

/**
 * Ficha de producto en el navegador: el formato elegido cambia la galería, el precio con IVA y
 * la disponibilidad (criterio 1). Empieza en el predeterminado, que el backend envía primero.
 */
export function InfoProducto({ producto, migas }: InfoProductoProps) {
  const [elegidoId, setElegidoId] = useState(producto.formatos[0]?.id);
  const elegido =
    producto.formatos.find((formato) => formato.id === elegidoId) ??
    producto.formatos[0];
  if (!elegido) return null;

  const otrosDisponibles = producto.formatos
    .filter(
      (formato) =>
        formato.id !== elegido.id && formato.disponibilidad === 'disponible',
    )
    .map((formato) => formato.nombre);

  return (
    <DisenoFicha
      migas={migas}
      descripcion={producto.descripcion}
      galeria={
        <Galeria
          key={elegido.id}
          imagenes={elegido.imagenes}
          alt={`${producto.nombre} ${elegido.nombre}`}
        />
      }
    >
      <TituloFicha
        sobretitulo={producto.marca?.nombre}
        nombre={producto.nombre}
      />
      <PrecioFicha precio={elegido.precio} />
      <SelectorFormato
        formatos={producto.formatos}
        elegido={elegido.id}
        onElegir={setElegidoId}
      />
      <EstadoDisponibilidad
        disponibilidad={elegido.disponibilidad}
        otrosDisponibles={otrosDisponibles}
      />
      <Compra
        disponibilidad={elegido.disponibilidad}
        articulo={`${producto.nombre} ${elegido.nombre}`}
      />
    </DisenoFicha>
  );
}
