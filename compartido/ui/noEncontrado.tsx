import Link from 'next/link';
import { cn } from '@/compartido/lib/utils';
import { buttonVariants } from '@/compartido/ui/button';

/** Página 404: la general (app/not-found.tsx) y la de las fichas, dentro del diseño de la tienda. */
export const NoEncontrado = ({ className }: { className?: string }) => (
  <main
    className={cn(
      'mx-auto flex max-w-xl flex-col items-center justify-center gap-4 px-4 text-center',
      className,
    )}
  >
    <h1 className="titulo-h2 md:titulo-h1">No encontramos esta página</h1>
    <p className="text-muted-foreground">
      Puede que el enlace esté mal escrito o que la página ya no exista.
    </p>
    <Link href="/" className={buttonVariants({ size: 'grande' })}>
      Ir al inicio
    </Link>
  </main>
);
