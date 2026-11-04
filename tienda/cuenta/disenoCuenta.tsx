import { Suspense, type ReactNode } from 'react';
import { CuentaProtegida, EsqueletoCuenta } from './cuentaProtegida';
import { MenuCuenta } from './menuCuenta';

/**
 * Marco de las páginas de «Mi cuenta» (Figma 2034:2323): menú lateral y contenido.
 *
 * El menú y la protección leen la ruta (`usePathname`): en una página con parámetro dinámico
 * (`/cuenta/pedidos/[codigo]`) esa ruta no se conoce al compilar, así que van dentro de
 * <Suspense> (Cache Components). En las páginas fijas se sigue resolviendo al compilar.
 */
export function DisenoCuenta({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto max-w-[1440px] px-4 pt-6 pb-12 md:px-16 md:pt-8 md:pb-16">
      <Suspense fallback={<EsqueletoCuenta />}>
        <CuentaProtegida>
          <div className="md:grid md:grid-cols-[240px_minmax(0,1024px)] md:gap-12">
            <MenuCuenta className="hidden md:flex" />
            <div className="flex min-w-0 flex-col gap-6">{children}</div>
          </div>
        </CuentaProtegida>
      </Suspense>
    </main>
  );
}
