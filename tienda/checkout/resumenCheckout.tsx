'use client';

import { ArrowRight, Clock } from 'lucide-react';
import Image from 'next/image';
import { useId } from 'react';
import type { CarritoCuenta, LineaCarrito } from '@/compartido/api/respuestas';
import { formatearPesos } from '@/compartido/formato/moneda';
import { Button } from '@/compartido/ui/button';
import { Separator } from '@/compartido/ui/separator';
import { Spinner } from '@/compartido/ui/spinner';
import { textoUnidades } from '@/tienda/carrito/textos';

interface ResumenCheckoutProps {
  carrito: CarritoCuenta;
  unidades: number;
  /** Mientras se crea el pedido y se va a Mercado Pago: el botón queda deshabilitado. */
  enviando: boolean;
  onPagar: () => void;
}

/**
 * E5-H3, criterio 1 · «Tu pedido» (Figma › 05 Checkout 2010:1139; celular 2010:2211, sin las
 * líneas). Montos con IVA que entrega el backend: el frontend no los calcula (RNF-03). Con
 * retiro en tienda no hay envío que sumar (SCRUM-122 agrega el despacho).
 */
export function ResumenCheckout({
  carrito,
  unidades,
  enviando,
  onPagar,
}: ResumenCheckoutProps) {
  const idTitulo = useId();
  return (
    <section
      aria-labelledby={idTitulo}
      className="flex flex-col gap-3 rounded-xl border bg-fondo-superficie p-4 md:gap-4 md:p-8"
    >
      <h2
        id={idTitulo}
        className="sr-only md:not-sr-only md:titulo-h2 md:text-texto-principal"
      >
        Tu pedido
      </h2>
      <ul
        aria-label="Productos del pedido"
        className="hidden flex-col gap-4 md:flex"
      >
        {carrito.items.map((linea) => (
          <LineaResumen key={linea.articuloId} linea={linea} />
        ))}
      </ul>
      <Separator className="hidden md:block" />
      <dl className="flex flex-col gap-3 texto-pequeno md:gap-4">
        <div className="flex justify-between gap-4">
          <dt className="text-texto-secundario">Productos ({unidades})</dt>
          <dd className="text-texto-principal tabular-nums">
            {formatearPesos(carrito.total)}
          </dd>
        </div>
        <Separator className="hidden md:block" />
        <div className="flex items-baseline justify-between gap-4">
          <dt className="texto-cuerpo-fuerte text-texto-principal">Total</dt>
          <dd className="texto-precio text-marca-profundo md:texto-precio-ficha-celular">
            {formatearPesos(carrito.total)}
          </dd>
        </div>
      </dl>
      <p className="texto-leyenda text-texto-secundario">IVA incluido</p>
      <p className="flex items-start gap-2 rounded-md bg-marca-acento-suave p-3 texto-pequeno text-marca-profundo">
        <Clock className="size-5 shrink-0" strokeWidth={1.75} aria-hidden />
        Al continuar reservamos tus productos por 15 minutos para que completes
        el pago.
      </p>
      <Button
        type="button"
        size="grande"
        className="mt-1 w-full"
        disabled={enviando}
        aria-busy={enviando}
        onClick={onPagar}
      >
        Pagar con Mercado Pago
        {enviando ? (
          <Spinner aria-label="Preparando el pago" />
        ) : (
          <ArrowRight aria-hidden />
        )}
      </Button>
    </section>
  );
}

/** Foto de 56 px, nombre, formato y unidades, y el subtotal con IVA. */
const LineaResumen = ({ linea }: { linea: LineaCarrito }) => {
  const idNombre = useId();
  return (
    <li aria-labelledby={idNombre} className="flex items-center gap-3">
      <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-marca-acento-suave">
        {linea.imagen && (
          <Image
            src={linea.imagen}
            alt=""
            fill
            sizes="56px"
            className="object-cover"
          />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p id={idNombre} className="texto-etiqueta text-texto-principal">
          {linea.nombre}
        </p>
        <p className="texto-leyenda text-texto-secundario">
          {[linea.nombreFormato, textoUnidades(linea.cantidad)]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </div>
      {linea.subtotal !== null && (
        <p className="texto-etiqueta text-texto-principal tabular-nums">
          {formatearPesos(linea.subtotal)}
        </p>
      )}
    </li>
  );
};
