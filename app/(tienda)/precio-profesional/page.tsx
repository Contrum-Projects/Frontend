import type { Metadata } from 'next';
import { PRECIO_PROFESIONAL } from '@/tienda/informacion/contenidos';
import { PaginaInformativa } from '@/tienda/informacion/paginaInformativa';
import { RUTAS } from '@/tienda/diseno/enlaces';

export const metadata: Metadata = {
  title: 'Precio profesional',
  description:
    'Cómo verificar tu cuenta de peluquería y comprar a precio profesional.',
};

/** Página estática: el contenido sale de las reglas del backend (ver contenidos.tsx). */
export default function PaginaPrecioProfesional() {
  return (
    <PaginaInformativa
      {...PRECIO_PROFESIONAL}
      migas={[
        { texto: 'Inicio', href: '/' },
        { texto: 'Precio profesional', href: RUTAS.precioProfesional },
      ]}
    />
  );
}
