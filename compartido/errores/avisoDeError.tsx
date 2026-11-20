'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { codigoCorto } from '@/compartido/api/errores';
import { Button } from '@/compartido/ui/button';
import { digestDe } from './datosDelError';
import { reportarError } from './reportarError';

/**
 * Registra el error de la pantalla y devuelve su código de seguimiento (SCRUM-168). Un error del
 * servidor trae su `digest`, que `instrumentation.ts` ya registró: no se reporta dos veces.
 */
const useCodigoDelError = (error: unknown): string | undefined => {
  const ruta = usePathname();
  const digest = digestDe(error);
  const [codigo, setCodigo] = useState<string>();

  useEffect(() => {
    if (digest) return;
    let vigente = true;
    void reportarError({ componente: `pantalla ${ruta}`, error, ruta }).then(
      (registrado) => {
        if (vigente) setCodigo(registrado);
      },
    );
    return () => {
      vigente = false;
    };
  }, [error, digest, ruta]);

  return digest ?? codigo;
};

interface AvisoDeErrorProps {
  error: unknown;
  retry: () => void;
}

/** Contenido de las pantallas de error. Nunca muestra el detalle técnico a la persona. */
export function AvisoDeError({ error, retry }: AvisoDeErrorProps) {
  const codigo = useCodigoDelError(error);

  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="titulo-h2 md:titulo-h1">Algo salió mal</h1>
      <p className="text-muted-foreground">
        No pudimos mostrar esta página. Intenta de nuevo en unos segundos.
      </p>
      <Button size="grande" onClick={() => retry()}>
        Reintentar
      </Button>
      {codigo && (
        <p className="texto-pequeno text-muted-foreground">
          Si el problema sigue, indícanos este código:{' '}
          <span className="font-medium text-foreground">
            {codigoCorto(codigo)}
          </span>
        </p>
      )}
    </main>
  );
}
