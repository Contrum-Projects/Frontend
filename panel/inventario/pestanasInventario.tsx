'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/compartido/lib/utils';
import { useSesion } from '@/compartido/sesion/sesion';
import { puedeAbrir } from '@/panel/diseno/secciones';

/**
 * Pestañas de Inventario (Figma P5f 2064:3101). Cada una pide el permiso de su ruta, así que el
 * vendedor no ve «Entradas» ni «Proveedores».
 */
const PESTANAS: readonly { texto: string; href: Route }[] = [
  { texto: 'Stock', href: '/panel/inventario' },
  { texto: 'Movimientos', href: '/panel/inventario/movimientos' },
  { texto: 'Entradas', href: '/panel/inventario/entradas' },
  { texto: 'Proveedores', href: '/panel/inventario/proveedores' },
];

export const PestanasInventario = () => {
  const { usuario } = useSesion();
  const ruta = usePathname();
  const visibles = PESTANAS.filter(({ href }) =>
    puedeAbrir(usuario?.rol, href),
  );

  return (
    <nav aria-label="Inventario">
      {/* El borde va en la lista para que el subrayado de la activa quede sobre él sin recortarse */}
      <ul className="flex [scrollbar-width:none] gap-4 border-b max-lg:overflow-x-auto lg:gap-8">
        {visibles.map(({ texto, href }) => {
          const actual = ruta === href;
          return (
            <li key={href} className="shrink-0">
              <Link
                href={href}
                aria-current={actual ? 'page' : undefined}
                className={cn(
                  // Foco por dentro: la lista se desplaza en celular y recortaría el contorno
                  'inline-flex min-h-10 items-end border-b-2 pb-2 focus-visible:outline-offset-[-2px]',
                  actual
                    ? 'border-marca-profundo texto-etiqueta text-texto-principal lg:texto-cuerpo-fuerte'
                    : 'border-transparent texto-pequeno text-texto-secundario',
                )}
              >
                {texto}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
