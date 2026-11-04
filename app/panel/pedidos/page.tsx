import type { Metadata } from 'next';
import { SinPedidoElegido } from '@/panel/pedidos/detallePedido';

export const metadata: Metadata = { title: 'Pedidos' };

export default function PaginaPedidos() {
  return <SinPedidoElegido />;
}
