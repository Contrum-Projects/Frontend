'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { ROLES } from '@/compartido/sesion/roles';
import { useSesion } from '@/compartido/sesion/sesion';
import { Button } from '@/compartido/ui/button';
import { Skeleton } from '@/compartido/ui/skeleton';
import { useMisDatos } from '@/tienda/cuenta/consultasCuenta';
import { RUTAS } from '@/tienda/diseno/enlaces';
import { useMiSolicitud } from './consultasVerificacion';
import {
  CuentaProfesionalActiva,
  SolicitudEnRevision,
  SolicitudRechazada,
} from './estadosSolicitud';
import { FormularioVerificacion } from './formularioVerificacion';

/**
 * 08 Verificación profesional (Figma 2020:1666, 2020:3006, 2038:2518 y 2038:5337; E10-H1).
 * Muestra la solicitud más reciente según su estado; sin solicitud, pendiente de documentos o
 * tras pedir una nueva después de un rechazo, el formulario.
 */
export function PantallaVerificacion() {
  const { usuario } = useSesion();
  const solicitud = useMiSolicitud();
  const datos = useMisDatos();
  const [reenviando, setReenviando] = useState(false);

  // Lo que se vio al abrir la pantalla: un estado distinto viene de un envío y se enfoca
  const cargado = solicitud.isSuccess && datos.isSuccess;
  const vista = cargado
    ? (solicitud.data?.estado ?? 'sin-solicitud') +
      (usuario?.rol === ROLES.PROFESIONAL ? '-profesional' : '')
    : null;
  const [vistaInicial, setVistaInicial] = useState<string | null>(null);
  if (vistaInicial === null && vista !== null) setVistaInicial(vista);
  const cambio = vistaInicial !== null && vista !== vistaInicial;

  return (
    <>
      <div className="flex flex-col gap-3">
        <Link
          href={RUTAS.misDatos}
          className="flex min-h-10 items-center gap-1.5 self-start texto-etiqueta text-marca-profundo hover:underline md:hidden"
        >
          <ArrowLeft className="size-4.5 stroke-[1.75]" aria-hidden />
          Mi cuenta
        </Link>
        <h1 className="titulo-h2 text-texto-principal md:titulo-h1">
          Verificación profesional
        </h1>
      </div>
      <div className="flex max-w-[720px] flex-col gap-6">{contenido()}</div>
    </>
  );

  // Una función y no un componente: el formulario no se vuelve a montar (perdería los archivos)
  function contenido() {
    if (solicitud.isPending || datos.isPending)
      return <EsqueletoVerificacion />;
    if (solicitud.isError || datos.isError) {
      return (
        <div className="flex flex-col items-start gap-3">
          <p role="alert" className="texto-cuerpo text-texto-principal">
            {(solicitud.error ?? datos.error)?.message}
          </p>
          <Button
            variant="contorno"
            onClick={() => {
              void solicitud.refetch();
              void datos.refetch();
            }}
          >
            Reintentar
          </Button>
        </div>
      );
    }

    const actual = solicitud.data;
    const rut = datos.data.rut;
    if (usuario?.rol === ROLES.PROFESIONAL || actual?.estado === 'aprobada') {
      return <CuentaProfesionalActiva enfocar={cambio} />;
    }
    if (actual?.estado === 'revision_manual') {
      return (
        <SolicitudEnRevision solicitud={actual} rut={rut} enfocar={cambio} />
      );
    }
    if (actual?.estado === 'rechazada' && !reenviando) {
      return (
        <SolicitudRechazada
          solicitud={actual}
          alReenviar={() => setReenviando(true)}
        />
      );
    }
    return (
      <FormularioVerificacion
        rut={rut}
        soloDocumentos={actual?.estado === 'pendiente'}
        enfocar={reenviando}
      />
    );
  }
}

/** Con las alturas del formulario en celular y escritorio, para que no salte al cargar. */
const EsqueletoVerificacion = () => (
  <div aria-hidden className="flex flex-col gap-6">
    <Skeleton className="h-18 w-full md:h-12" />
    <Skeleton className="h-16 w-full rounded-lg" />
    <Skeleton className="h-48 w-full rounded-lg md:h-56" />
    <Skeleton className="h-8 w-3/4" />
    <Skeleton className="h-14 w-full rounded-full sm:w-48" />
  </div>
);
