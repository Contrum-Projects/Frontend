import { ReceiptText } from 'lucide-react';
import Link from 'next/link';
import { buttonVariants } from '@/compartido/ui/button';
import { RUTAS } from '@/tienda/diseno/enlaces';

/** E8-H1, criterio 3 · La cuenta aún no tiene pedidos (Figma 2058:3717). */
export const SinPedidos = () => (
  <section className="flex flex-col items-center gap-3 rounded-lg bg-fondo-superficie px-4 py-12 text-center md:px-12 md:py-16">
    <ReceiptText
      aria-hidden
      className="size-10 text-texto-principal"
      strokeWidth={1.75}
    />
    <h2 className="titulo-h3 text-texto-principal">Aún no tienes pedidos</h2>
    <p className="texto-cuerpo text-texto-secundario">
      Cuando compres, aquí verás el estado de cada pedido y podrás descargar su
      comprobante.
    </p>
    <Link
      href={RUTAS.catalogo}
      className={buttonVariants({ className: 'mt-2' })}
    >
      Ir al catálogo
    </Link>
  </section>
);
