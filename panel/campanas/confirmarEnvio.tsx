'use client';

import { Mail, TriangleAlert } from 'lucide-react';
import { formatearNumero } from '@/compartido/formato/numero';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/compartido/ui/alert-dialog';
import { Button } from '@/compartido/ui/button';
import { Spinner } from '@/compartido/ui/spinner';

export interface EnvioPorConfirmar {
  asunto: string;
  segmento: string;
  destinatarios: number;
}

interface ConfirmarEnvioProps {
  /** `null`: la ventana está cerrada. */
  envio: EnvioPorConfirmar | null;
  enviando: boolean;
  /** Mensaje del backend si rechazó el envío. */
  aviso: string | null;
  alConfirmar: () => void;
  alCerrar: () => void;
}

/**
 * E12-H3, criterio 3 · «¿Enviar la campaña?» (P7b 2046:1920): a cuántos destinatarios sale y el
 * aviso de que se envía una sola vez. El número es el que contó el backend para el segmento.
 */
export const ConfirmarEnvio = ({
  envio,
  enviando,
  aviso,
  alConfirmar,
  alCerrar,
}: ConfirmarEnvioProps) => {
  const sinDestinatarios = envio?.destinatarios === 0;

  return (
    <AlertDialog
      open={envio !== null}
      onOpenChange={(abierto) => {
        // Mientras responde el backend, la ventana sigue abierta
        if (!abierto && !enviando) alCerrar();
      }}
    >
      <AlertDialogContent>
        {envio && (
          <>
            <AlertDialogHeader className="gap-3">
              <Mail
                aria-hidden
                strokeWidth={1.75}
                className="size-7 text-marca-profundo"
              />
              <AlertDialogTitle className="titulo-h3 text-texto-principal">
                ¿Enviar la campaña?
              </AlertDialogTitle>
              <AlertDialogDescription className="texto-pequeno wrap-break-word text-texto-principal">
                «{envio.asunto}» se enviará ahora a{' '}
                {formatearNumero(envio.destinatarios)} destinatarios con
                consentimiento ({envio.segmento}).
              </AlertDialogDescription>
            </AlertDialogHeader>
            <p className="flex items-center gap-2 rounded-lg bg-estado-aviso-fondo px-3 py-3 texto-pequeno text-estado-aviso-texto">
              <TriangleAlert
                aria-hidden
                strokeWidth={1.75}
                className="size-4.5 shrink-0"
              />
              Una campaña se envía una sola vez y no se puede deshacer.
            </p>
            {sinDestinatarios && (
              <p className="texto-pequeno text-texto-secundario">
                Este segmento no tiene destinatarios con consentimiento. Elige
                otro para enviarla.
              </p>
            )}
            {aviso && (
              <Alert variant="destructive">
                <AlertDescription>{aviso}</AlertDescription>
              </Alert>
            )}
            <AlertDialogFooter>
              <AlertDialogCancel
                size="grande"
                className="flex-1"
                disabled={enviando}
              >
                Volver
              </AlertDialogCancel>
              <Button
                size="grande"
                className="flex-1"
                onClick={alConfirmar}
                disabled={enviando || sinDestinatarios}
              >
                {enviando && <Spinner aria-hidden />}
                Enviar a {formatearNumero(envio.destinatarios)}
              </Button>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
};
