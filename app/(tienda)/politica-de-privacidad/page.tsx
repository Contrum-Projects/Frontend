import type { Metadata } from 'next';
import {
  AVISO_BORRADOR,
  POLITICA_DE_PRIVACIDAD,
} from '@/tienda/informacion/legales';
import { PaginaInformativa } from '@/tienda/informacion/paginaInformativa';
import { RUTAS } from '@/tienda/diseno/enlaces';

export const metadata: Metadata = {
  title: 'Política de privacidad',
  description:
    'Qué datos personales usa Cabello Perfecto, para qué y cómo ejercer tus derechos.',
};

/** Página estática: borrador para la clienta (ver tienda/informacion/legales.tsx). */
export default function PaginaPrivacidad() {
  return (
    <PaginaInformativa
      {...POLITICA_DE_PRIVACIDAD}
      aviso={AVISO_BORRADOR}
      migas={[
        { texto: 'Inicio', href: '/' },
        { texto: 'Política de privacidad', href: RUTAS.privacidad },
      ]}
    />
  );
}
