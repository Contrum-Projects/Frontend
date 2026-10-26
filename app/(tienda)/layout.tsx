import { Footer } from '@/tienda/diseno/footer';
import { Header } from '@/tienda/diseno/header';

export default function LayoutTienda({ children }: LayoutProps<'/'>) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
