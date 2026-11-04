'use client';

import { File as IconoArchivo } from 'lucide-react';
import type {
  DetalleVerificacion,
  DocumentoSolicitudVerificacion,
  GiroSii,
} from '@/compartido/api/respuestas';
import {
  formatearDia,
  formatearDiaHora,
  formatearFecha,
} from '@/compartido/formato/fecha';
import { textoTipoDocumento } from '@/tienda/verificacion/esquemaVerificacion';
import { useAbrirDocumento } from './consultasVerificaciones';

type Solicitud = DetalleVerificacion['solicitud'];

const BLOQUE =
  'flex flex-col gap-3 max-lg:rounded-lg max-lg:border max-lg:bg-card max-lg:p-4';

/**
 * E10-H3, criterio 2 · Lo que informó el SII: fecha de la consulta y sus giros. Reemplaza el
 * «puntaje de confianza» de Figma: desde el 2 nov no hay puntaje (decisión del 4-11-2026).
 */
export const ConsultaSii = ({
  consulta,
}: {
  consulta: NonNullable<Solicitud['consultaSii']>;
}) => (
  <section aria-labelledby="titulo-sii" className={BLOQUE}>
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <h3
        id="titulo-sii"
        className="texto-etiqueta text-texto-principal max-lg:texto-cuerpo-fuerte"
      >
        Consulta al SII
      </h3>
      <p className="texto-leyenda text-texto-secundario">
        {formatearDiaHora(consulta.fecha)}
      </p>
    </div>
    <Giros giros={consulta.giros} />
  </section>
);

const Giros = ({ giros }: { giros: GiroSii[] | null }) => {
  if (giros === null) {
    return (
      <p className="texto-pequeno text-texto-secundario">
        El SII no respondió a la consulta.
      </p>
    );
  }
  if (giros.length === 0) {
    return (
      <p className="texto-pequeno text-texto-secundario">
        El SII no informó giros para este RUT.
      </p>
    );
  }
  return (
    <ul aria-label="Giros informados" className="flex flex-col gap-2">
      {giros.map((giro) => (
        <li
          key={`${giro.codigo}-${giro.fechaInicio ?? ''}`}
          className="flex flex-col gap-1 rounded-md bg-fondo-hueso px-3 py-2"
        >
          <span className="texto-pequeno wrap-break-word text-texto-principal">
            <span className="texto-etiqueta tabular-nums">{giro.codigo}</span> ·{' '}
            {giro.nombre}
          </span>
          <span className="texto-leyenda text-texto-secundario">
            {giro.fechaInicio
              ? `Desde el ${formatearDia(giro.fechaInicio)}`
              : 'Sin fecha de inicio'}
          </span>
        </li>
      ))}
    </ul>
  );
};

/** E10-H3, criterio 2 · Los documentos adjuntos, cada uno con «Abrir» (Figma 2029:979). */
export const DocumentosVerificacion = ({
  codigoPublico,
  documentos,
}: {
  codigoPublico: string;
  documentos: DocumentoSolicitudVerificacion[];
}) => {
  const abrir = useAbrirDocumento(codigoPublico);
  return (
    <section aria-labelledby="titulo-documentos" className={BLOQUE}>
      <h3
        id="titulo-documentos"
        className="texto-cuerpo-fuerte text-texto-principal lg:sr-only"
      >
        Documentos
      </h3>
      {documentos.length === 0 ? (
        <p className="texto-pequeno text-texto-secundario">
          Aún no adjunta documentos.
        </p>
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2 lg:gap-4">
          {documentos.map((documento) => (
            <Documento
              key={documento.numero}
              documento={documento}
              abriendo={abrir.isPending && abrir.variables === documento.numero}
              alAbrir={() => {
                if (!abrir.isPending) abrir.mutate(documento.numero);
              }}
            />
          ))}
        </ul>
      )}
      {abrir.isError && (
        <p role="alert" className="texto-pequeno text-estado-error">
          {abrir.error.message}
        </p>
      )}
    </section>
  );
};

const Documento = ({
  documento,
  abriendo,
  alAbrir,
}: {
  documento: DocumentoSolicitudVerificacion;
  abriendo: boolean;
  alAbrir: () => void;
}) => (
  <li className="flex flex-col gap-1 rounded-md bg-fondo-hueso p-3">
    <div className="flex items-center gap-2">
      <IconoArchivo
        aria-hidden
        className="size-4.5 shrink-0 text-texto-principal"
        strokeWidth={1.75}
      />
      <span className="min-w-0 flex-1 texto-etiqueta wrap-anywhere text-texto-principal">
        {documento.nombreArchivo}
      </span>
      {documento.fechaEliminacion === null && (
        <button
          type="button"
          onClick={alAbrir}
          aria-label={`${abriendo ? 'Abriendo' : 'Abrir'} ${documento.nombreArchivo}`}
          aria-disabled={abriendo || undefined}
          className="-my-2 min-h-10 shrink-0 rounded-md px-1 texto-etiqueta text-marca-profundo hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-profundo aria-disabled:opacity-50"
        >
          {abriendo ? 'Abriendo…' : 'Abrir'}
        </button>
      )}
    </div>
    <p className="texto-leyenda text-texto-secundario">
      {textoTipoDocumento(documento.tipo)}
      {documento.fechaEliminacion &&
        ` · Se eliminó el ${formatearFecha(documento.fechaEliminacion)}`}
    </p>
  </li>
);
