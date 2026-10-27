import { BadgeCheck, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { Logo } from '@/compartido/marca/logo';
import { Skeleton } from '@/compartido/ui/skeleton';
import { Buscador } from './buscador';
import { CuentaHeader } from './cuentaHeader';
import { RUTAS } from './enlaces';
import { MenuCelularCargado, MenuCelularEsqueleto } from './menuCelularCargado';
import { NavegacionCategorias } from './navegacionCategorias';

/**
 * Header de la tienda (Figma › Componentes › Header 6:32 y 6:76). Escritorio: logo, buscador,
 * cuenta, carrito y fila de categorías con «Precio profesional». Celular: menú, logo, cuenta,
 * carrito y buscador. Las categorías vienen de la API, dentro de <Suspense>.
 */
export function Header() {
  return (
    <header className="border-b bg-fondo-hueso">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 pt-3 pb-2 md:gap-8 md:px-16 md:pt-4 md:pb-3">
        <div className="w-24 md:hidden">
          <Suspense fallback={<MenuCelularEsqueleto />}>
            <MenuCelularCargado />
          </Suspense>
        </div>
        <Link
          href={RUTAS.inicio}
          className="shrink-0 rounded-md text-marca-logo"
        >
          <Logo className="h-auto w-[92px] md:w-[118px]" />
        </Link>
        <Buscador
          id="buscar-escritorio"
          placeholder="Busca por producto, marca o categoría"
          className="hidden flex-1 md:flex"
        />
        <div className="flex w-24 items-center justify-end gap-2 md:w-auto md:gap-4">
          <CuentaHeader />
          <Link
            href={RUTAS.carrito}
            aria-label="Carrito"
            className="inline-flex size-10 items-center justify-center rounded-md text-texto-principal"
          >
            <ShoppingCart className="size-6" strokeWidth={1.75} />
          </Link>
        </div>
      </div>
      <div className="px-4 pb-3 md:hidden">
        <Buscador id="buscar-celular" placeholder="Buscar productos o marcas" />
      </div>
      <nav
        aria-label="Categorías"
        className="mx-auto hidden max-w-[1440px] items-center gap-8 px-16 pt-1 pb-3 md:flex"
      >
        <Suspense fallback={<FilaCategoriasEsqueleto />}>
          <NavegacionCategorias />
        </Suspense>
        <Link
          href={RUTAS.precioProfesional}
          className="ml-auto flex shrink-0 items-center gap-2 rounded-md texto-etiqueta text-marca-profundo hover:underline"
        >
          <BadgeCheck className="size-4" strokeWidth={1.75} aria-hidden />
          Precio profesional
        </Link>
      </nav>
    </header>
  );
}

const FilaCategoriasEsqueleto = () => (
  <div className="flex flex-1 gap-8" aria-hidden>
    {Array.from({ length: 6 }, (_, i) => (
      <Skeleton key={i} className="h-4 w-20" />
    ))}
  </div>
);
