'use client';

import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Button } from '@/compartido/ui/button';

/**
 * Si falla la lectura con la sesión del profesional: el mensaje del backend (un 5xx llega como
 * mensaje genérico, sin detalles técnicos) y «Reintentar».
 */
export const ErrorProfesional = ({
  mensaje,
  onReintentar,
}: {
  mensaje: string;
  onReintentar: () => void;
}) => (
  <Alert variant="aviso" className="flex flex-wrap items-center gap-3">
    <AlertDescription className="flex-1">{mensaje}</AlertDescription>
    <Button
      type="button"
      variant="contorno"
      size="mediano"
      onClick={onReintentar}
    >
      Reintentar
    </Button>
  </Alert>
);
