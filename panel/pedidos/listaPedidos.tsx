import { Store, Truck } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import type { PedidoGestion } from '@/compartido/api/respuestas';
import { formatearDiaHora } from '@/compartido/formato/fecha';
import { formatearPesos } from '@/compartido/formato/moneda';
import { cn } from '@/compartido/lib/utils';
import { Skeleton } from '@/compartido/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/compartido/ui/table';
import { EstadoPedido } from '@/tienda/pedidos/estadoPedido';

interface ListaProps {
  pedidos: PedidoGestion[];
  /** El pedido abierto, marcado en la lista. */
  elegido: string | null;
}

const ETIQUETA = 'Pedidos';
const CABECERA = 'h-auto px-2 py-2 texto-leyenda text-texto-secundario';
const CELDA = 'px-2 py-3 align-middle texto-pequeno text-texto-principal';

export const rutaPedido = (codigo: string) =>
  `/panel/pedidos/${encodeURIComponent(codigo)}` as Route;

const Entrega = ({ tipo }: { tipo: PedidoGestion['tipoEntrega'] }) => {
  const Icono = tipo === 'retiro' ? Store : Truck;
  return (
    <span className="flex items-center gap-2">
      <Icono className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
      {tipo === 'retiro' ? 'Retiro' : 'Despacho'}
    </span>
  );
};

/**
 * Escritorio (Figma 2028:817). Toda la fila abre el pedido: el enlace del código la cubre, así
 * el teclado pasa por un solo enlace por pedido.
 */
export const TablaPedidos = ({ pedidos, elegido }: ListaProps) => (
  <Table aria-label={ETIQUETA}>
    <TableHeader>
      <TableRow className="border-0 hover:bg-transparent">
        <TableHead className={CABECERA}>Pedido</TableHead>
        <TableHead className={`max-xl:hidden ${CABECERA}`}>Fecha</TableHead>
        <TableHead className={CABECERA}>Cliente</TableHead>
        <TableHead className={`max-xl:hidden ${CABECERA}`}>Entrega</TableHead>
        <TableHead className={CABECERA}>Estado</TableHead>
        <TableHead className={`text-right ${CABECERA}`}>Total</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {pedidos.map((pedido) => {
        const activo = pedido.codigoPublico === elegido;
        return (
          <TableRow
            key={pedido.codigoPublico}
            className={cn(
              'relative hover:bg-fondo-hueso',
              activo && 'bg-marca-acento-suave hover:bg-marca-acento-suave',
            )}
          >
            <TableCell className={CELDA}>
              <Link
                href={rutaPedido(pedido.codigoPublico)}
                aria-current={activo ? 'page' : undefined}
                className="texto-etiqueta after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:rounded-md focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-marca-profundo"
              >
                {pedido.codigoPublico}
              </Link>
            </TableCell>
            <TableCell className={`whitespace-nowrap max-xl:hidden ${CELDA}`}>
              <time dateTime={pedido.fechaPedido}>
                {formatearDiaHora(pedido.fechaPedido)}
              </time>
            </TableCell>
            <TableCell className={`w-full max-w-0 truncate ${CELDA}`}>
              {pedido.cliente}
            </TableCell>
            <TableCell className={`max-xl:hidden ${CELDA}`}>
              <Entrega tipo={pedido.tipoEntrega} />
            </TableCell>
            <TableCell className={CELDA}>
              <EstadoPedido estado={pedido.estado} />
            </TableCell>
            <TableCell className={`text-right tabular-nums ${CELDA}`}>
              {formatearPesos(pedido.total)}
            </TableCell>
          </TableRow>
        );
      })}
    </TableBody>
  </Table>
);

const textoUnidades = (unidades: number) =>
  unidades === 1 ? '1 unidad' : `${unidades} unidades`;

/** Celular (Figma 2023:336): una tarjeta por pedido que abre su detalle. */
export const TarjetasPedidos = ({ pedidos, elegido }: ListaProps) => (
  <ul aria-label={ETIQUETA} className="flex flex-col gap-3">
    {pedidos.map((pedido) => (
      <li key={pedido.codigoPublico}>
        <Link
          href={rutaPedido(pedido.codigoPublico)}
          aria-current={pedido.codigoPublico === elegido ? 'page' : undefined}
          className="flex flex-col gap-1 rounded-lg border bg-card p-4"
        >
          <span className="flex items-center justify-between gap-3">
            <span className="texto-cuerpo-fuerte wrap-break-word text-texto-principal">
              {pedido.codigoPublico}
            </span>
            <EstadoPedido estado={pedido.estado} />
          </span>
          <span className="flex items-baseline justify-between gap-3">
            <span className="min-w-0 texto-pequeno wrap-break-word text-texto-principal">
              {pedido.cliente}
            </span>
            <span className="shrink-0 texto-cuerpo-fuerte text-texto-principal tabular-nums">
              {formatearPesos(pedido.total)}
            </span>
          </span>
          <span className="flex flex-wrap items-center gap-x-1 texto-leyenda text-texto-secundario">
            <Entrega tipo={pedido.tipoEntrega} />
            <span aria-hidden>·</span>
            <time dateTime={pedido.fechaPedido}>
              {formatearDiaHora(pedido.fechaPedido)}
            </time>
            <span aria-hidden>·</span>
            {textoUnidades(pedido.unidades)}
          </span>
        </Link>
      </li>
    ))}
  </ul>
);

const FILAS_ESQUELETO = [0, 1, 2, 3];

/** Con la estructura de la tabla y de las tarjetas, para que nada salte al cargar (RNF-17). */
export const EsqueletoPedidos = () => (
  <div aria-hidden>
    <div className="flex flex-col max-lg:hidden">
      <div className="h-8" />
      {FILAS_ESQUELETO.map((fila) => (
        <div key={fila} className="flex items-center gap-4 border-t px-3 py-3">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-5 w-24 max-xl:hidden" />
          <Skeleton className="h-5 flex-1" />
          <Skeleton className="h-5 w-20 max-xl:hidden" />
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-5 w-16" />
        </div>
      ))}
    </div>
    <div className="flex flex-col gap-3 lg:hidden">
      {FILAS_ESQUELETO.map((fila) => (
        <Skeleton key={fila} className="h-28 w-full rounded-lg" />
      ))}
    </div>
  </div>
);
