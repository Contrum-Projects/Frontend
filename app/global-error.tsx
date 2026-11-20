'use client';

import { AvisoDeError } from '@/compartido/errores/avisoDeError';
import { dmSans, fraunces } from '@/compartido/fuentes';
import './globals.css';

/**
 * Error en el layout raíz (SCRUM-168): reemplaza todo el documento, así que trae su propio
 * `<html>`, fuentes y estilos. Se registra igual que `error.tsx`.
 */
export default function ErrorGlobal({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return (
    <html lang="es-CL" className={`${fraunces.variable} ${dmSans.variable}`}>
      <body className="min-h-dvh">
        <title>Algo salió mal · Cabello Perfecto</title>
        <AvisoDeError error={error} retry={retry} />
      </body>
    </html>
  );
}
