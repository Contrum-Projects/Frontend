import type { Metadata } from 'next';
import { SinFacturaElegida } from '@/panel/facturas/detalleFactura';

export const metadata: Metadata = { title: 'Facturas por emitir' };

export default function PaginaFacturas() {
  return <SinFacturaElegida />;
}
