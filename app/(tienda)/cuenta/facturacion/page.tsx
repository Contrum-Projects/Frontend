import type { Metadata } from 'next';
import { PantallaFacturacion } from '@/tienda/cuenta/pantallaFacturacion';

export const metadata: Metadata = {
  title: 'Datos de facturación',
  robots: { index: false },
};

export default function PaginaFacturacion() {
  return <PantallaFacturacion />;
}
