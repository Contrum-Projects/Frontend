import type { Route } from 'next';
import Link from 'next/link';
import type { PedidoGestion } from '@/compartido/api/respuestas';
import { formatearPesos } from '@/compartido/formato/moneda';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/compartido/ui/table';
import { Entrega, rutaPedido } from '@/panel/pedidos/listaPedidos';
import { EstadoPedido } from '@/tienda/pedidos/estadoPedido';
import { ENLACE_TARJETA, TARJETA } from './estilosResumen';

const RUTA_PEDIDOS: Route = '/panel/pedidos';
const TITULO = 'Pedidos recientes';

/** Figma P1: 5 en la tabla de escritorio y 3 en la lista del celular. */
const EN_TABLA = 5;
const EN_LISTA = 3;

const CABECERA =
  'h-auto bg-marca-acento-suave px-3 py-2 texto-leyenda text-texto-secundario first:rounded-l-md last:rounded-r-md';
const CELDA = 'px-3 py-3 align-middle texto-pequeno text-texto-principal';
const ENLACE_FILA =
  'texto-etiqueta after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:rounded-md focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-marca-profundo';

/**
 * «Pedidos recientes» del Resumen (Figma P1 2028:470 y celular 2023:206): los últimos pedidos,
 * del más reciente al más antiguo (orden del backend). Cada fila abre el pedido.
 */
export const PedidosRecientes = ({ pedidos }: { pedidos: PedidoGestion[] }) => (
  <section aria-labelledby="titulo-pedidos-recientes" className={TARJETA}>
    <div className="flex items-center justify-between gap-3">
      <h2
        id="titulo-pedidos-recientes"
        className="texto-cuerpo-fuerte text-texto-principal"
      >
        {TITULO}
      </h2>
      <Link href={RUTA_PEDIDOS} className={ENLACE_TARJETA}>
        <span className="max-lg:hidden">Ver todos</span>
        <span className="lg:hidden">Ver todo</span>
      </Link>
    </div>
    {pedidos.length === 0 ? (
      <p className="texto-pequeno text-texto-secundario">Aún no hay pedidos.</p>
    ) : (
      <>
        <Table aria-label={TITULO} className="max-lg:hidden">
          <TableHeader>
            <TableRow className="border-0 hover:bg-transparent">
              <TableHead className={CABECERA}>Pedido</TableHead>
              <TableHead className={CABECERA}>Cliente</TableHead>
              <TableHead className={CABECERA}>Entrega</TableHead>
              <TableHead className={CABECERA}>Estado</TableHead>
              <TableHead className={`text-right ${CABECERA}`}>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pedidos.slice(0, EN_TABLA).map((pedido) => (
              <TableRow
                key={pedido.codigoPublico}
                className="relative hover:bg-fondo-hueso"
              >
                <TableCell className={CELDA}>
                  <Link
                    href={rutaPedido(pedido.codigoPublico)}
                    className={ENLACE_FILA}
                  >
                    {pedido.codigoPublico}
                  </Link>
                </TableCell>
                <TableCell className={`w-full max-w-0 truncate ${CELDA}`}>
                  {pedido.cliente}
                </TableCell>
                <TableCell className={`whitespace-nowrap ${CELDA}`}>
                  <Entrega tipo={pedido.tipoEntrega} />
                </TableCell>
                <TableCell className={CELDA}>
                  <EstadoPedido estado={pedido.estado} />
                </TableCell>
                <TableCell className={`text-right tabular-nums ${CELDA}`}>
                  {formatearPesos(pedido.total)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <ul aria-label={TITULO} className="flex flex-col gap-3 lg:hidden">
          {pedidos.slice(0, EN_LISTA).map((pedido) => (
            <li
              key={pedido.codigoPublico}
              className="relative flex items-center justify-between gap-3"
            >
              <div className="flex min-w-0 flex-col">
                <Link
                  href={rutaPedido(pedido.codigoPublico)}
                  className={ENLACE_FILA}
                >
                  {pedido.codigoPublico}
                </Link>
                <span className="truncate texto-pequeno text-texto-secundario">
                  {pedido.cliente} · {formatearPesos(pedido.total)}
                </span>
              </div>
              <EstadoPedido estado={pedido.estado} />
            </li>
          ))}
        </ul>
      </>
    )}
  </section>
);
