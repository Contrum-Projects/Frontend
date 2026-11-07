'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { renovarSesion } from '@/compartido/sesion/almacen';
import { ROLES } from '@/compartido/sesion/roles';
import { useSesion } from '@/compartido/sesion/sesion';
import { Button } from '@/compartido/ui/button';
import { Skeleton } from '@/compartido/ui/skeleton';
import { useMisDatos } from '@/tienda/cuenta/consultasCuenta';
import { RUTAS } from '@/tienda/diseno/enlaces';
import { InvitacionPerfil } from '@/tienda/profesional/invitacionPerfil';
import { useMiSolicitud } from './consultasVerificacion';
import {
  CuentaProfesionalActiva,
  SolicitudEnRevision,
  SolicitudRechazada,
} from './estadosSolicitud';
import { FormularioVerificacion } from './formularioVerificacion';
import { SolicitudSii } from './solicitudSii';

/**
 * 08 Verificación profesional (Figma 2020:1666, 2020:3006, 2038:2518 y 2038:5337; E10-H1).
 * Muestra la solicitud más reciente según su estado. En dos pasos, como el backend (flujo del 2
 * nov 2026): sin solicitud, o al pedir una nueva después de un rechazo, se consulta el SII sin
 * documentos; solo si queda pendiente se piden los documentos.
 */
export function PantallaVerificacion() {
  const { usuario } = useSesion();
  const solicitud = useMiSolicitud();
  const datos = useMisDatos();
  const [reenviando, setReenviando] = useState(false);

  // Lo que se vio al abrir la pantalla: un estado distinto viene de un envío y se enfoca
  const cargado = solicitud.isSuccess && datos.isSuccess;
  // Aprobada o con el rol profesional es la misma vista: que la sesión se renueve sola (E10-H4)
  // no mueve el foco
  const vista = cargado
    ? usuario?.rol === ROLES.PROFESIONAL
      ? 'aprobada'
      : (solicitud.data?.estado ?? 'sin-solicitud')
    : null;
  const [vistaInicial, setVistaInicial] = useState<string | null>(null);
  if (vistaInicial === null && vista !== null) setVistaInicial(vista);
  const cambio = vistaInicial !== null && vista !== vistaInicial;

  // E10-H4: el personal aprobó la solicitud con la sesión abierta y el token aún dice «cliente».
  // Al renovarla llega el rol profesional y la tienda muestra el precio mayorista. Si el backend
  // siguiera respondiendo «cliente», no se vuelve a pedir mientras la pantalla siga abierta.
  const aprobadaSinRol =
    solicitud.data?.estado === 'aprobada' && usuario?.rol === ROLES.CLIENTE;
  const renovada = useRef(false);
  useEffect(() => {
    if (!aprobadaSinRol || renovada.current) return;
    renovada.current = true;
    void renovarSesion();
  }, [aprobadaSinRol]);

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
      return (
        <>
          <CuentaProfesionalActiva enfocar={cambio} />
          <InvitacionPerfil />
        </>
      );
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
    if (actual?.estado === 'pendiente') {
      return <FormularioVerificacion rut={rut} enfocar={cambio} />;
    }
    return <SolicitudSii rut={rut} enfocar={reenviando} />;
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
