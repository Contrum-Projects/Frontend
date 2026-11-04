'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { errorDeApi } from '@/compartido/api/errores';
import type { DetallePedidoCuenta } from '@/compartido/api/respuestas';
import { formatearFechaLarga } from '@/compartido/formato/fecha';
import { Skeleton } from '@/compartido/ui/skeleton';
import { RUTAS } from '@/tienda/diseno/enlaces';
import { ErrorProfesional } from '@/tienda/profesional/errorProfesional';
import {
  esCodigoPedido,
  esNoEncontrado,
  useDetallePedido,
} from './consultasPedidos';
import { DatosPedido } from './entregaPedido';
import { EstadoPedido } from './estadoPedido';
import { HistorialPedido } from './historialPedido';
import { PedidoNoEncontrado } from './pedidoNoEncontrado';
import { ProductosPedido } from './productosPedido';

/** 07 Detalle del pedido (Figma 2019:1623; celular 2019:2970, E8-H1). */
export function PantallaDetallePedido({ codigo }: { codigo: string }) {
  const consulta = useDetallePedido(codigo);

  if (!esCodigoPedido(codigo)) return <PedidoNoEncontrado />;
  if (consulta.isPending) return <EsqueletoDetalle />;
  if (consulta.isError) {
    if (esNoEncontrado(consulta.error)) return <PedidoNoEncontrado />;
    return (
      <>
        <VolverAPedidos />
        <h1 className="titulo-h2 text-texto-principal md:titulo-h1">
          Pedido {codigo}
        </h1>
        <ErrorProfesional
          mensaje={consulta.error.message || errorDeApi(undefined).message}
          onReintentar={() => void consulta.refetch()}
        />
      </>
    );
  }
  return <DetallePedido pedido={consulta.data} />;
}

const DetallePedido = ({ pedido }: { pedido: DetallePedidoCuenta }) => (
  <>
    <div className="flex flex-col items-start gap-4">
      <VolverAPedidos />
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <h1 className="titulo-h2 wrap-break-word text-texto-principal md:titulo-h1">
          Pedido {pedido.codigoPublico}
        </h1>
        <EstadoPedido estado={pedido.estado} />
      </div>
      <p className="texto-pequeno text-texto-secundario">
        Comprado el{' '}
        <time dateTime={pedido.fechaPedido}>
          {formatearFechaLarga(pedido.fechaPedido)}
        </time>
      </p>
    </div>
    <HistorialPedido historial={pedido.historial} />
    <DatosPedido pedido={pedido} />
    <ProductosPedido pedido={pedido} />
  </>
);

const VolverAPedidos = () => (
  <Link
    href={RUTAS.misPedidos}
    className="flex min-h-10 items-center gap-1.5 self-start texto-etiqueta text-marca-profundo hover:underline"
  >
    <ArrowLeft className="size-4.5" strokeWidth={1.75} aria-hidden />
    Mis pedidos
  </Link>
);

/** Con la estructura del detalle: título, historial, datos y productos. */
export const EsqueletoDetalle = () => (
  <div aria-hidden className="flex flex-col gap-6">
    <div className="flex flex-col gap-4">
      <Skeleton className="h-10 w-32" />
      <Skeleton className="h-9 w-80 max-w-full md:h-12" />
      <Skeleton className="h-5 w-48" />
    </div>
    <Skeleton className="h-60 w-full rounded-xl md:h-32" />
    <div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
      <Skeleton className="h-28 w-full rounded-lg md:h-32" />
      {/* «Documento» y «Pago» dependen del pedido: en celular no se reservan */}
      <Skeleton className="hidden h-32 w-full rounded-lg md:block" />
      <Skeleton className="hidden h-32 w-full rounded-lg lg:block" />
    </div>
    <Skeleton className="h-64 w-full rounded-lg" />
  </div>
);
