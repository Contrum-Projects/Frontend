import type { Route } from 'next';
import Link from 'next/link';
import type { SolicitudEnRevision } from '@/compartido/api/respuestas';
import { formatearDiaHora } from '@/compartido/formato/fecha';
import { cn } from '@/compartido/lib/utils';
import { Skeleton } from '@/compartido/ui/skeleton';
import { MOTIVO_CORTO } from './textosVerificacion';

export const RUTA_VERIFICACIONES = '/panel/verificaciones' as Route;

export const rutaVerificacion = (codigoPublico: string) =>
  `/panel/verificaciones/${encodeURIComponent(codigoPublico)}` as Route;

export const nombreCompleto = (persona: { nombre: string; apellido: string }) =>
  `${persona.nombre} ${persona.apellido}`.trim();

/** «12 oct, 08:40 · Sin inicio de actividades» (decisión del 4-11-2026: la lista no trae el conteo). */
const detalleDeFila = (solicitud: SolicitudEnRevision) =>
  [
    formatearDiaHora(solicitud.fechaEnvio),
    solicitud.motivoRevision && MOTIVO_CORTO[solicitud.motivoRevision],
  ]
    .filter(Boolean)
    .join(' · ');

/** E10-H3, criterio 1 · Pendientes (Figma 2029:947): una fila por solicitud, la abierta marcada. */
export const ListaVerificaciones = ({
  solicitudes,
  elegida,
}: {
  solicitudes: SolicitudEnRevision[];
  elegida: string | null;
}) => (
  <ul aria-label="Solicitudes pendientes" className="flex flex-col gap-2">
    {solicitudes.map((solicitud) => {
      const activa = solicitud.codigoPublicoCuenta === elegida;
      return (
        <li key={solicitud.codigoPublicoCuenta}>
          <Link
            href={rutaVerificacion(solicitud.codigoPublicoCuenta)}
            aria-current={activa ? 'page' : undefined}
            className={cn(
              'flex flex-col gap-1 rounded-md p-3 hover:bg-fondo-hueso',
              activa && 'bg-marca-acento-suave hover:bg-marca-acento-suave',
            )}
          >
            <span className="texto-etiqueta wrap-break-word text-texto-principal">
              {nombreCompleto(solicitud)}
            </span>
            <span className="texto-leyenda text-texto-secundario">
              {detalleDeFila(solicitud)}
            </span>
          </Link>
        </li>
      );
    })}
  </ul>
);

const FILAS_ESQUELETO = [0, 1, 2];

/** Con la forma de las filas, para que nada salte al cargar (RNF-17). */
export const EsqueletoVerificaciones = () => (
  <div aria-hidden className="flex flex-col gap-2">
    {FILAS_ESQUELETO.map((fila) => (
      <div key={fila} className="flex flex-col gap-1 p-3">
        <Skeleton className="h-4.5 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
    ))}
  </div>
);
