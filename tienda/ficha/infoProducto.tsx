'use client';

import { useState } from 'react';
import type {
  ProductoDetalle,
  ProductoDetalleProfesional,
} from '@/compartido/api/respuestas';
import { Migas } from '@/tienda/catalogo/migas';
import { RUTAS, urlCatalogo, urlProducto } from '@/tienda/diseno/enlaces';
import { AvisoPeluquero } from '@/tienda/profesional/avisoPeluquero';
import { InsigniaPrecioProfesional } from '@/tienda/profesional/insignias';
import { MINIMO_PROFESIONAL, precioVisible } from '@/tienda/profesional/precio';
import { Compra } from './compra';
import { EstadoDisponibilidad } from './disponibilidad';
import { Galeria } from './galeria';
import { DisenoFicha, PrecioFicha, TituloFicha } from './partesFicha';
import { SelectorFormato } from './selectorFormato';

interface InfoProductoProps {
  /** Con `exclusivo`, es lo que el backend entrega a una cuenta profesional (SCRUM-109). */
  producto: ProductoDetalle | ProductoDetalleProfesional;
}

/**
 * Ficha de producto en el navegador: el formato elegido cambia la galería, el precio con IVA y
 * la disponibilidad (criterio 1). Empieza en el predeterminado, que el backend envía primero.
 * El profesional ve el mayorista, la cantidad desde 3 y su aviso (Figma 2007:1759); el resto,
 * el minorista y el aviso para verificarse (2007:767).
 */
export function InfoProducto({ producto }: InfoProductoProps) {
  const [elegidoId, setElegidoId] = useState(producto.formatos[0]?.id);
  const elegido =
    producto.formatos.find((formato) => formato.id === elegidoId) ??
    producto.formatos[0];
  if (!elegido) return null;

  const profesional = 'exclusivo' in producto;
  const otrosDisponibles = producto.formatos
    .filter(
      (formato) =>
        formato.id !== elegido.id && formato.disponibilidad === 'disponible',
    )
    .map((formato) => formato.nombre);

  return (
    <DisenoFicha
      migas={
        <Migas
          migas={[
            { texto: 'Inicio', href: RUTAS.inicio },
            {
              texto: producto.categoria.nombre,
              href: urlCatalogo({ categoria: producto.categoria.id }),
            },
            { texto: producto.nombre, href: urlProducto(producto.id) },
          ]}
        />
      }
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
      {profesional ? (
        <div className="flex flex-col items-start gap-4">
          <InsigniaPrecioProfesional />
          <PrecioFicha precio={precioVisible(elegido)} porUnidad />
        </div>
      ) : (
        <PrecioFicha precio={precioVisible(elegido)} />
      )}
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
        key={elegido.id}
        articuloId={elegido.id}
        disponibilidad={elegido.disponibilidad}
        articulo={`${producto.nombre} ${elegido.nombre}`}
        minimo={profesional ? MINIMO_PROFESIONAL : undefined}
      />
      {!profesional && <AvisoPeluquero />}
    </DisenoFicha>
  );
}
