import { Suspense } from 'react';
import { PanelCarrito } from '@/tienda/carrito/panelCarrito';
import { UnionCarrito } from '@/tienda/carrito/unionCarrito';
import { Footer } from '@/tienda/diseno/footer';
import { Header } from '@/tienda/diseno/header';

export default function LayoutTienda({ children }: LayoutProps<'/'>) {
  return (
    <div className="flex min-h-dvh flex-col">
      <UnionCarrito />
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
      {/* Lee la ruta para cerrarse al navegar: con Cache Components va dentro de Suspense. Cerrado no ocupa lugar */}
      <Suspense fallback={null}>
        <PanelCarrito />
      </Suspense>
    </div>
  );
}
