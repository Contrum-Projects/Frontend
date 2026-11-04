import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { ResumenPedido } from '@/compartido/api/respuestas';
import { formatearFecha } from '@/compartido/formato/fecha';
import { formatearPesos } from '@/compartido/formato/moneda';
import { urlPedido } from '@/tienda/diseno/enlaces';
import { EstadoPedido } from './estadoPedido';

/**
 * E8-H1, criterio 1 · Un pedido de la lista (Figma 2019:1469): código, fecha, estado y total
 * con IVA, todo como lo entrega el backend. Lleva al detalle por el código público.
 *
 * Sin miniaturas de los productos: el listado de la API no las trae (pedido a SCRUM-57).
 */
export const TarjetaPedido = ({ pedido }: { pedido: ResumenPedido }) => (
  <li>
    <Link
      href={urlPedido(pedido.codigoPublico)}
      className="flex items-center gap-4 rounded-lg border bg-fondo-superficie px-4 py-4 hover:border-marca-profundo focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-profundo md:gap-6 md:px-6"
    >
      <div className="flex min-w-0 flex-1 flex-col items-start gap-2 md:flex-row md:items-center md:gap-6">
        <div className="flex min-w-0 flex-col gap-1">
          <p className="texto-cuerpo-fuerte wrap-break-word text-texto-principal">
            Pedido {pedido.codigoPublico}
          </p>
          <p className="texto-pequeno text-texto-secundario">
            <time dateTime={pedido.fechaPedido}>
              {formatearFecha(pedido.fechaPedido)}
            </time>
          </p>
        </div>
        <EstadoPedido estado={pedido.estado} className="md:ml-auto" />
      </div>
      <p className="text-right texto-cuerpo-fuerte text-texto-principal tabular-nums md:min-w-24">
        {formatearPesos(pedido.total)}
      </p>
      <ArrowRight
        aria-hidden
        className="size-5 shrink-0 text-texto-principal"
        strokeWidth={1.75}
      />
    </Link>
  </li>
);
