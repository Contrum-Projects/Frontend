'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { codigoCorto } from '@/compartido/api/errores';
import { formatearFechaHora } from '@/compartido/formato/fecha';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/compartido/ui/dialog';
import { rutaCliente } from '@/panel/clientes/textosClientes';
import type { RegistroError } from './consultasRegistroErrores';
import { NOMBRE_ORIGEN } from './textosRegistroErrores';

const Dato = ({
  etiqueta,
  children,
}: {
  etiqueta: string;
  children: ReactNode;
}) => (
  <div className="flex flex-col gap-1">
    <dt className="texto-leyenda text-texto-secundario">{etiqueta}</dt>
    <dd className="texto-pequeno break-words text-texto-principal">
      {children}
    </dd>
  </div>
);

/** Todo lo que se sabe de un error: qué pasó, cuándo, dónde y la traza (SCRUM-168). */
export const DetalleError = ({
  error,
  alCerrar,
}: {
  error: RegistroError | null;
  alCerrar: () => void;
}) => (
  <Dialog
    open={error !== null}
    onOpenChange={(abierto) => !abierto && alCerrar()}
  >
    {error && (
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="titulo-h3 text-texto-principal">
            {error.tipoError} en {error.componente}
          </DialogTitle>
          <DialogDescription className="texto-pequeno text-texto-secundario">
            Código {codigoCorto(error.codigoSeguimiento)} ·{' '}
            {formatearFechaHora(error.fechaHora)}
          </DialogDescription>
        </DialogHeader>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Dato etiqueta="Qué pasó">{error.mensaje}</Dato>
          </div>
          <Dato etiqueta="Origen">{NOMBRE_ORIGEN[error.origen]}</Dato>
          <Dato etiqueta="Código completo">
            <span className="font-mono">{error.codigoSeguimiento}</span>
          </Dato>
          {error.ruta && (
            <Dato etiqueta="Ruta">
              <span className="font-mono">
                {error.metodo && `${error.metodo} `}
                {error.ruta}
              </span>
            </Dato>
          )}
          {error.estadoHttp !== null && (
            <Dato etiqueta="Estado HTTP">{error.estadoHttp}</Dato>
          )}
          <Dato etiqueta="Cuenta">
            {error.cuenta ? (
              <Link
                href={rutaCliente(error.cuenta.codigoPublico)}
                className="underline"
              >
                {error.cuenta.nombre} · {error.cuenta.email}
              </Link>
            ) : (
              'Sin sesión'
            )}
          </Dato>
        </dl>
        {error.traza && (
          <div className="flex flex-col gap-1">
            <h3 className="texto-leyenda text-texto-secundario">Traza</h3>
            <pre className="max-h-64 overflow-auto rounded-md bg-fondo-hueso p-3 texto-leyenda whitespace-pre text-texto-principal">
              {error.traza}
            </pre>
          </div>
        )}
      </DialogContent>
    )}
  </Dialog>
);
