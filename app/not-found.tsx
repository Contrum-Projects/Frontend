import Link from 'next/link';
import { buttonVariants } from '@/compartido/ui/button';

export default function NoEncontrado() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="titulo-h2 md:titulo-h1">No encontramos esta página</h1>
      <p className="text-muted-foreground">
        Puede que el enlace esté mal escrito o que la página ya no exista.
      </p>
      <Link href="/" className={buttonVariants({ size: 'grande' })}>
        Ir al inicio
      </Link>
    </main>
  );
}
