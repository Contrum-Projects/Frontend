import type { Route } from 'next';
import Link from 'next/link';
import type {
  EstadoFacturaGestion,
  FacturaGestion,
} from '@/compartido/api/respuestas';
import { formatearPesos } from '@/compartido/formato/moneda';
import { formatearRut } from '@/compartido/formato/rut';
import { cn } from '@/compartido/lib/utils';
import { Badge } from '@/compartido/ui/badge';
import { Skeleton } from '@/compartido/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/compartido/ui/table';

interface ListaProps {
  facturas: FacturaGestion[];
  /** El pedido abierto, marcado en la lista. */
  elegido: string | null;
}

const ETIQUETA = 'Facturas';
const CABECERA = 'h-auto px-2 py-2 texto-leyenda text-texto-secundario';
const CELDA = 'px-2 py-3 align-middle texto-pequeno text-texto-principal';

export const rutaFactura = (codigo: string) =>
  `/panel/pedidos/facturas/${encodeURIComponent(codigo)}` as Route;

/** «Por emitir» en amarillo; con folio, en verde agua (Figma 2050:2078). */
export const EstadoFactura = ({
  estado,
  folio,
}: {
  estado: EstadoFacturaGestion;
  folio: number | null;
}) => {
  const emitida = estado === 'emitida';
  return (
    <Badge
      className={cn(
        'px-2.5 py-1 texto-leyenda',
        emitida
          ? 'bg-marca-acento-suave text-marca-profundo'
          : 'bg-estado-aviso-fondo text-estado-aviso-texto',
      )}
    >
      {emitida ? (folio ? `Folio ${folio}` : 'Emitida') : 'Por emitir'}
    </Badge>
  );
};

/**
 * Escritorio (Figma 2050:2078). Toda la fila abre el pedido: el enlace del código la cubre, así
 * el teclado pasa por un solo enlace por pedido.
 */
export const TablaFacturas = ({ facturas, elegido }: ListaProps) => (
  <Table aria-label={ETIQUETA}>
    <TableHeader>
      <TableRow className="border-0 hover:bg-transparent">
        <TableHead className={CABECERA}>Pedido</TableHead>
        <TableHead className={CABECERA}>Razón social</TableHead>
        <TableHead className={`max-xl:hidden ${CABECERA}`}>RUT</TableHead>
        <TableHead className={`text-right ${CABECERA}`}>Total</TableHead>
        <TableHead className={CABECERA}>Factura</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {facturas.map((factura) => {
        const activo = factura.codigoPedido === elegido;
        return (
          <TableRow
            key={factura.codigoPedido}
            className={cn(
              'relative hover:bg-fondo-hueso',
              activo && 'bg-marca-acento-suave hover:bg-marca-acento-suave',
            )}
          >
            <TableCell className={CELDA}>
              <Link
                href={rutaFactura(factura.codigoPedido)}
                aria-current={activo ? 'page' : undefined}
                className="texto-etiqueta after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:rounded-md focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-marca-profundo"
              >
                {factura.codigoPedido}
              </Link>
            </TableCell>
            <TableCell className={`w-full max-w-0 truncate ${CELDA}`}>
              {factura.razonSocial}
            </TableCell>
            <TableCell className={`whitespace-nowrap max-xl:hidden ${CELDA}`}>
              {formatearRut(factura.rut)}
            </TableCell>
            <TableCell className={`text-right tabular-nums ${CELDA}`}>
              {formatearPesos(factura.total)}
            </TableCell>
            <TableCell className={CELDA}>
              <EstadoFactura estado={factura.estado} folio={factura.folio} />
            </TableCell>
          </TableRow>
        );
      })}
    </TableBody>
  </Table>
);

/** Celular: una tarjeta por pedido, como la lista de pedidos (decisión del 4-11-2026). */
export const TarjetasFacturas = ({ facturas, elegido }: ListaProps) => (
  <ul aria-label={ETIQUETA} className="flex flex-col gap-3">
    {facturas.map((factura) => (
      <li key={factura.codigoPedido}>
        <Link
          href={rutaFactura(factura.codigoPedido)}
          aria-current={factura.codigoPedido === elegido ? 'page' : undefined}
          className="flex flex-col gap-1 rounded-lg border bg-card p-4"
        >
          <span className="flex items-center justify-between gap-3">
            <span className="texto-cuerpo-fuerte wrap-break-word text-texto-principal">
              {factura.codigoPedido}
            </span>
            <EstadoFactura estado={factura.estado} folio={factura.folio} />
          </span>
          <span className="flex items-baseline justify-between gap-3">
            <span className="min-w-0 texto-pequeno wrap-break-word text-texto-principal">
              {factura.razonSocial}
            </span>
            <span className="shrink-0 texto-cuerpo-fuerte text-texto-principal tabular-nums">
              {formatearPesos(factura.total)}
            </span>
          </span>
          <span className="texto-leyenda text-texto-secundario">
            RUT {formatearRut(factura.rut)}
          </span>
        </Link>
      </li>
    ))}
  </ul>
);

const FILAS_ESQUELETO = [0, 1, 2];

/** Con la estructura de la tabla y de las tarjetas, para que nada salte al cargar (RNF-17). */
export const EsqueletoFacturas = () => (
  <div aria-hidden>
    <div className="flex flex-col max-lg:hidden">
      <div className="h-8" />
      {FILAS_ESQUELETO.map((fila) => (
        <div key={fila} className="flex items-center gap-4 border-t px-3 py-3">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-5 flex-1" />
          <Skeleton className="h-5 w-24 max-xl:hidden" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-6 w-20 rounded-full" />
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
