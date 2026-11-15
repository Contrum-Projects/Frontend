import type { Metadata } from 'next';
import {
  AVISO_BORRADOR,
  TERMINOS_Y_CONDICIONES,
} from '@/tienda/informacion/legales';
import { PaginaInformativa } from '@/tienda/informacion/paginaInformativa';
import { RUTAS } from '@/tienda/diseno/enlaces';

export const metadata: Metadata = {
  title: 'Términos y condiciones',
  description:
    'Condiciones de compra, pago, despacho, retracto y garantía de Cabello Perfecto.',
};

/** Página estática: borrador para la clienta (ver tienda/informacion/legales.tsx). */
export default function PaginaTerminos() {
  return (
    <PaginaInformativa
      {...TERMINOS_Y_CONDICIONES}
      aviso={AVISO_BORRADOR}
      migas={[
        { texto: 'Inicio', href: '/' },
        { texto: 'Términos y condiciones', href: RUTAS.terminos },
      ]}
    />
  );
}
