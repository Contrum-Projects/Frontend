import type { Metadata } from 'next';
import { DESPACHO_Y_RETIRO } from '@/tienda/informacion/contenidos';
import { PaginaInformativa } from '@/tienda/informacion/paginaInformativa';
import { RUTAS } from '@/tienda/diseno/enlaces';

export const metadata: Metadata = {
  title: 'Despacho y retiro',
  description:
    'Despacho a domicilio con Chilexpress, retiro en tienda y seguimiento de tu pedido.',
};

/** Página estática: el contenido sale de las reglas del backend (ver contenidos.tsx). */
export default function PaginaDespachoYRetiro() {
  return (
    <PaginaInformativa
      {...DESPACHO_Y_RETIRO}
      migas={[
        { texto: 'Inicio', href: '/' },
        { texto: 'Despacho y retiro', href: RUTAS.despacho },
      ]}
    />
  );
}
