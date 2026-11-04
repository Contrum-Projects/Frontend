'use client';

import { ArrowLeft, TriangleAlert } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';
import { errorDeApi } from '@/compartido/api/errores';
import type {
  DetalleVerificacion,
  SolicitudResuelta,
} from '@/compartido/api/respuestas';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Button } from '@/compartido/ui/button';
import { esNoEncontrado } from '@/tienda/pedidos/consultasPedidos';
import {
  esCodigoCuenta,
  useDetalleVerificacion,
} from './consultasVerificaciones';
import { ConsultaSii, DocumentosVerificacion } from './documentosVerificacion';
import { FormularioResolucion } from './formularioResolucion';
import { nombreCompleto, RUTA_VERIFICACIONES } from './listaVerificaciones';
import {
  Confirmacion,
  DatosCuenta,
  EsqueletoRevision,
  EstadoSolicitud,
  Resolucion,
  TARJETA,
} from './partesRevision';
import { avisoDeMotivo } from './textosVerificacion';

export { EsqueletoRevision, SinSolicitudElegida } from './partesRevision';

/**
 * E10-H3, criterios 2 y 3 · La revisión de una solicitud: datos de la cuenta, por qué va a
 * revisión manual, lo que dijo el SII, los documentos y, si sigue en revisión, la resolución.
 */
export function RevisionVerificacion({ codigo }: { codigo: string }) {
  const consulta = useDetalleVerificacion(codigo);
  // Lo que acaba de resolver esta persona: la confirmación no espera a que vuelva el detalle
  const [resuelta, setResuelta] = useState<SolicitudResuelta | null>(null);

  if (!esCodigoCuenta(codigo)) return <SinSolicitud />;
  if (consulta.isPending) return <EsqueletoRevision />;
  if (consulta.isError) {
    if (esNoEncontrado(consulta.error)) return <SinSolicitud />;
    return (
      <div className={TARJETA}>
        <Volver />
        <Alert variant="destructive">
          <AlertDescription>
            {consulta.error.message || errorDeApi(undefined).message}
          </AlertDescription>
        </Alert>
        <Button
          variant="contorno"
          className="self-start"
          onClick={() => void consulta.refetch()}
        >
          Reintentar
        </Button>
      </div>
    );
  }
  return (
    <Revision
      detalle={consulta.data}
      resuelta={resuelta}
      alResolver={setResuelta}
    />
  );
}

/** Celular: «← Verificaciones pendientes» vuelve a la lista (Figma 2025:481). */
const Volver = () => (
  <Link
    href={RUTA_VERIFICACIONES}
    className="flex min-h-10 items-center gap-2 self-start texto-etiqueta text-marca-profundo hover:underline lg:hidden"
  >
    <ArrowLeft className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
    Verificaciones pendientes
  </Link>
);

const SinSolicitud = () => (
  <div className={TARJETA}>
    <Volver />
    <h2 className="titulo-h3 text-texto-principal">
      No encontramos esta solicitud
    </h2>
    <p className="texto-pequeno text-texto-secundario">
      Elígela en la lista de pendientes.
    </p>
  </div>
);

const Revision = ({
  detalle,
  resuelta,
  alResolver,
}: {
  detalle: DetalleVerificacion;
  resuelta: SolicitudResuelta | null;
  alResolver: (resuelta: SolicitudResuelta) => void;
}) => {
  const idTitulo = useId();
  const titulo = useRef<HTMLHeadingElement>(null);
  const { cliente, solicitud } = detalle;
  const nombre = nombreCompleto(cliente);
  // Mientras vuelve el detalle, la resolución recién hecha manda
  const estado = resuelta?.estado ?? solicitud.estado;
  const enRevision = estado === 'revision_manual';

  // El formulario desaparece al resolver: el foco pasa al título, que anuncia la confirmación
  useEffect(() => {
    if (resuelta) titulo.current?.focus();
  }, [resuelta]);

  return (
    <article aria-labelledby={idTitulo} className={TARJETA}>
      <Volver />
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2
          ref={titulo}
          id={idTitulo}
          tabIndex={-1}
          className="min-w-0 titulo-h2 wrap-anywhere text-texto-principal focus:outline-none lg:titulo-h3"
        >
          {nombre}
        </h2>
        <EstadoSolicitud estado={estado} />
      </header>
      <DatosCuenta detalle={detalle} />
      {(enRevision || estado === 'pendiente') && (
        <Alert variant="aviso">
          <TriangleAlert strokeWidth={1.75} aria-hidden />
          <AlertDescription>
            {avisoDeMotivo(solicitud.motivoRevision)}
          </AlertDescription>
        </Alert>
      )}
      {solicitud.consultaSii && (
        <ConsultaSii consulta={solicitud.consultaSii} />
      )}
      <DocumentosVerificacion
        codigoPublico={cliente.codigoPublico}
        documentos={solicitud.documentos}
      />
      {resuelta ? (
        <Confirmacion resuelta={resuelta} nombre={nombre} />
      ) : enRevision ? (
        <FormularioResolucion
          codigoPublico={cliente.codigoPublico}
          alResolver={alResolver}
        />
      ) : (
        <Resolucion solicitud={solicitud} />
      )}
    </article>
  );
};
