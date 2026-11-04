import { BadgeCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import type {
  DetalleVerificacion,
  EstadoSolicitudVerificacion,
  SolicitudResuelta,
} from '@/compartido/api/respuestas';
import { formatearDiaHora } from '@/compartido/formato/fecha';
import { formatearRut } from '@/compartido/formato/rut';
import { cn } from '@/compartido/lib/utils';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Badge } from '@/compartido/ui/badge';
import { Skeleton } from '@/compartido/ui/skeleton';
import { nombreCompleto } from './listaVerificaciones';
import { TEXTO_ESTADO } from './textosVerificacion';

/** En escritorio, la tarjeta al lado de la lista; en celular, su propia pantalla (Figma 2025:481). */
export const TARJETA =
  'flex flex-col gap-4 lg:rounded-lg lg:border lg:bg-card lg:p-6';

const COLOR_ESTADO: Record<EstadoSolicitudVerificacion, string> = {
  pendiente: 'bg-fondo-hueso text-texto-secundario',
  revision_manual: 'bg-estado-aviso-fondo text-estado-aviso-texto',
  aprobada: 'bg-marca-acento-suave text-marca-profundo',
  rechazada: 'bg-fondo-hueso-oscuro text-texto-principal',
};

export const EstadoSolicitud = ({
  estado,
}: {
  estado: EstadoSolicitudVerificacion;
}) => (
  <Badge className={cn('px-2.5 py-1 texto-leyenda', COLOR_ESTADO[estado])}>
    {TEXTO_ESTADO[estado]}
  </Badge>
);

const Dato = ({ texto, children }: { texto: string; children: ReactNode }) => (
  <div className="flex justify-between gap-4 lg:flex-col lg:justify-start lg:gap-1">
    <dt className="texto-pequeno text-texto-secundario lg:texto-leyenda">
      {texto}
    </dt>
    <dd className="text-right texto-pequeno wrap-anywhere text-texto-principal lg:text-left">
      {children}
    </dd>
  </div>
);

/** RUT, correo y fecha de la solicitud: tarjeta en celular, una fila en escritorio (Figma 2029:964). */
export const DatosCuenta = ({ detalle }: { detalle: DetalleVerificacion }) => (
  <dl className="flex flex-col gap-2 rounded-lg border bg-card p-4 lg:flex-row lg:flex-wrap lg:gap-x-8 lg:gap-y-3 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0">
    <Dato texto="RUT">
      {detalle.cliente.rut ? formatearRut(detalle.cliente.rut) : 'Sin RUT'}
    </Dato>
    <Dato texto="Correo">{detalle.cliente.email}</Dato>
    <Dato texto="Recibida">
      {formatearDiaHora(detalle.solicitud.fechaSolicitud)}
    </Dato>
  </dl>
);

/** E10-H3, criterio 3 · Lo que acaba de resolver esta persona (decisión del 4-11-2026). */
export const Confirmacion = ({
  resuelta,
  nombre,
}: {
  resuelta: SolicitudResuelta;
  nombre: string;
}) => (
  <Alert variant="info" role="status">
    <BadgeCheck strokeWidth={1.75} aria-hidden />
    <AlertDescription className="text-marca-profundo">
      {resuelta.estado === 'aprobada'
        ? `Aprobaste la solicitud de ${nombre}. Ya tiene la cuenta profesional.`
        : `Rechazaste la solicitud de ${nombre}. Verá tu motivo en su cuenta.`}
    </AlertDescription>
  </Alert>
);

/** Abierta ya resuelta (por otra persona o por el SII) o sin documentos: no se puede resolver. */
export const Resolucion = ({
  solicitud,
}: {
  solicitud: DetalleVerificacion['solicitud'];
}) => {
  if (solicitud.estado === 'pendiente') {
    return (
      <p className="texto-pequeno text-texto-secundario">
        Podrás resolverla cuando adjunte sus documentos.
      </p>
    );
  }
  const quien = solicitud.resolutor
    ? ` por ${nombreCompleto(solicitud.resolutor)}`
    : ' por la consulta al SII';
  const cuando = solicitud.fechaResolucion
    ? ` el ${formatearDiaHora(solicitud.fechaResolucion)}`
    : '';
  return (
    <div className="flex flex-col gap-1 rounded-md bg-fondo-hueso p-3">
      <p className="texto-pequeno text-texto-principal">
        {TEXTO_ESTADO[solicitud.estado]}
        {cuando}
        {quien}.
      </p>
      {solicitud.motivoRechazo && (
        <p className="texto-pequeno wrap-break-word text-texto-secundario">
          Motivo: {solicitud.motivoRechazo}
        </p>
      )}
    </div>
  );
};

/** Escritorio, sin solicitud elegida: el lugar de la revisión con la indicación. */
export const SinSolicitudElegida = () => (
  <div className="hidden rounded-lg border bg-card p-6 lg:block">
    <p className="texto-pequeno text-texto-secundario">
      Elige una solicitud para revisarla.
    </p>
  </div>
);

/** Con la estructura de la revisión, para que nada salte al cargar (RNF-17). */
export const EsqueletoRevision = () => (
  <div aria-hidden className={TARJETA}>
    <Skeleton className="h-10 w-48 lg:hidden" />
    <div className="flex items-center justify-between">
      <Skeleton className="h-9 w-48 lg:h-7" />
      <Skeleton className="h-6 w-28 rounded-full" />
    </div>
    <Skeleton className="h-28 w-full rounded-lg lg:h-10" />
    <Skeleton className="h-12 w-full rounded-md" />
    {/* Consulta al SII */}
    <Skeleton className="h-28 w-full rounded-lg lg:h-24" />
    {/* Documentos: en celular, dentro de su tarjeta con título */}
    <div className="grid gap-3 max-lg:rounded-lg max-lg:border max-lg:p-4 lg:grid-cols-2 lg:gap-4">
      <Skeleton className="h-6 w-28 lg:hidden" />
      <Skeleton className="h-16 w-full rounded-md" />
      <Skeleton className="h-16 w-full rounded-md" />
    </div>
    {/* Motivo y botones */}
    <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:gap-3">
      <div className="flex flex-col gap-2 lg:flex-1">
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-13 w-full rounded-md" />
      </div>
      <div className="grid grid-cols-2 gap-3 max-lg:mt-2 lg:flex">
        <Skeleton className="h-14 rounded-full lg:w-32" />
        <Skeleton className="h-14 rounded-full lg:w-32" />
      </div>
    </div>
  </div>
);
