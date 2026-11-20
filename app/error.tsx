'use client';

import { AvisoDeError } from '@/compartido/errores/avisoDeError';

/** Error inesperado al mostrar una página: se registra (SCRUM-168) y se ofrece reintentar. */
export default function ErrorDePagina({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return <AvisoDeError error={error} retry={retry} />;
}
