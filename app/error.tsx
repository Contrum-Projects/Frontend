'use client';

import { Button } from '@/compartido/ui/button';

/** Error inesperado al mostrar una página. Nunca muestra el detalle técnico a la persona. */
export default function ErrorDePagina({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="titulo-h2 md:titulo-h1">Algo salió mal</h1>
      <p className="text-muted-foreground">
        No pudimos mostrar esta página. Intenta de nuevo en unos segundos.
      </p>
      <Button size="grande" onClick={() => retry()}>
        Reintentar
      </Button>
    </main>
  );
}
