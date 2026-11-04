import { DisenoPedidos } from '@/panel/pedidos/disenoPedidos';

export default function LayoutPedidos({
  children,
}: LayoutProps<'/panel/pedidos'>) {
  return <DisenoPedidos>{children}</DisenoPedidos>;
}
