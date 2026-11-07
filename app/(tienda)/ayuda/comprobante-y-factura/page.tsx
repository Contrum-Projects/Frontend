import type { Metadata } from 'next';
import { COMPROBANTE_Y_FACTURA } from '@/tienda/informacion/contenidos';
import { PaginaInformativa } from '@/tienda/informacion/paginaInformativa';
import { RUTAS } from '@/tienda/diseno/enlaces';

export const metadata: Metadata = {
  title: 'Comprobante y factura',
  description: 'Boleta y factura de tus compras en Cabello Perfecto.',
};

/** Página estática: el contenido sale de las reglas del backend (ver contenidos.tsx). */
export default function PaginaComprobanteYFactura() {
  return (
    <PaginaInformativa
      {...COMPROBANTE_Y_FACTURA}
      migas={[
        { texto: 'Inicio', href: '/' },
        { texto: 'Comprobante y factura', href: RUTAS.comprobantes },
      ]}
    />
  );
}
