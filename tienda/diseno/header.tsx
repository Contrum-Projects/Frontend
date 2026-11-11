import { Suspense } from 'react';
import { Skeleton } from '@/compartido/ui/skeleton';
import { CarritoHeader } from './carritoHeader';
import { CuentaHeader } from './cuentaHeader';
import { FilaHeader } from './filaHeader';
import { MenuCelularCargado, MenuCelularEsqueleto } from './menuCelularCargado';
import { NavegacionCategorias } from './navegacionCategorias';

/**
 * Header de la tienda en una sola fila: logo, categorías, buscar, cuenta y carrito. Bajo `lg`
 * las categorías van en el menú lateral. «Precio profesional» queda en el footer y en ese menú.
 * Las categorías vienen de la API, dentro de <Suspense>.
 */
export function Header() {
  return (
    <header className="border-b bg-fondo-hueso">
      <FilaHeader
        menuCelular={
          <Suspense fallback={<MenuCelularEsqueleto />}>
            <MenuCelularCargado />
          </Suspense>
        }
        categorias={
          <Suspense fallback={<CategoriasEsqueleto />}>
            <NavegacionCategorias />
          </Suspense>
        }
        acciones={
          <>
            <CuentaHeader />
            <CarritoHeader />
          </>
        }
      />
    </header>
  );
}

const CategoriasEsqueleto = () => (
  <div className="flex flex-1 gap-6 px-3" aria-hidden>
    {Array.from({ length: 5 }, (_, i) => (
      <Skeleton key={i} className="h-4 w-20" />
    ))}
  </div>
);
