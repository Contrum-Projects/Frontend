'use client';

import { ArrowRight, Clock } from 'lucide-react';
import { useId } from 'react';
import type { CarritoCuenta } from '@/compartido/api/respuestas';
import { formatearPesos } from '@/compartido/formato/moneda';
import { Button } from '@/compartido/ui/button';
import { Separator } from '@/compartido/ui/separator';
import { Skeleton } from '@/compartido/ui/skeleton';
import { Spinner } from '@/compartido/ui/spinner';
import { LineaResumen } from './lineaResumen';

interface ResumenCheckoutProps {
  carrito: CarritoCuenta;
  unidades: number;
  /**
   * Con despacho, lo que cotizó el backend: costo y total con IVA; `'cotizando'` mientras
   * cotiza y `'sin-cotizar'` si no se pudo. Sin la propiedad, retiro en tienda: no hay envío.
   */
  despacho?: { costo: number; total: number } | 'cotizando' | 'sin-cotizar';
  /** Mientras se crea el pedido y se va a Mercado Pago: el botón queda deshabilitado. */
  enviando: boolean;
  /** Falta algo para pagar (con despacho, la cotización): el botón queda deshabilitado. */
  bloqueado?: boolean;
  onPagar: () => void;
}

/**
 * E5-H3, criterio 1 · «Tu pedido» (Figma › 05 Checkout 2010:1139; celular 2010:2211, sin las
 * líneas). Montos con IVA que entrega el backend: el frontend no los calcula (RNF-03). Con
 * retiro en tienda no hay envío que sumar; con despacho, el costo y el total son los de la
 * cotización (E7-H1).
 */
export function ResumenCheckout({
  carrito,
  unidades,
  despacho,
  enviando,
  bloqueado = false,
  onPagar,
}: ResumenCheckoutProps) {
  const idTitulo = useId();
  const conDespacho = despacho !== undefined;
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
        {conDespacho && (
          <div className="flex justify-between gap-4">
            <dt className="text-texto-secundario">Despacho</dt>
            <dd className="text-texto-principal tabular-nums">
              <MontoDespacho despacho={despacho} monto="costo" />
            </dd>
          </div>
        )}
        <Separator className="hidden md:block" />
        <div className="flex items-baseline justify-between gap-4">
          <dt className="texto-cuerpo-fuerte text-texto-principal">Total</dt>
          <dd className="texto-precio text-marca-profundo md:texto-precio-ficha-celular">
            {conDespacho ? (
              <MontoDespacho despacho={despacho} monto="total" />
            ) : (
              formatearPesos(carrito.total)
            )}
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
        disabled={enviando || bloqueado}
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

/** Un monto que depende de la cotización: esqueleto mientras cotiza, raya si no se pudo. */
const MontoDespacho = ({
  despacho,
  monto,
}: {
  despacho: NonNullable<ResumenCheckoutProps['despacho']>;
  monto: 'costo' | 'total';
}) => {
  if (despacho === 'cotizando') {
    return (
      <>
        <Skeleton
          aria-hidden
          className={monto === 'costo' ? 'h-5 w-14' : 'h-6 w-24 md:h-9 md:w-32'}
        />
        <span className="sr-only">Cotizando el despacho</span>
      </>
    );
  }
  if (despacho === 'sin-cotizar') {
    return (
      <>
        <span aria-hidden>—</span>
        <span className="sr-only">Sin cotizar</span>
      </>
    );
  }
  return formatearPesos(despacho[monto]);
};
