import { DisenoFacturas } from '@/panel/facturas/disenoFacturas';

export default function LayoutFacturas({
  children,
}: LayoutProps<'/panel/pedidos/facturas'>) {
  return <DisenoFacturas>{children}</DisenoFacturas>;
}
