'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { errorDeApi } from '@/compartido/api/errores';
import { formatearFecha, formatearFechaHora } from '@/compartido/formato/fecha';
import { formatearRut } from '@/compartido/formato/rut';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Button } from '@/compartido/ui/button';
import { Skeleton } from '@/compartido/ui/skeleton';
import { esCodigoCuenta } from '@/panel/verificaciones/consultasVerificaciones';
import { EstadoSolicitud } from '@/panel/verificaciones/partesRevision';
import { esNoEncontrado } from '@/tienda/pedidos/consultasPedidos';
import {
  textoEspecialidad,
  textoModalidad,
} from '@/tienda/profesional/opcionesPerfil';
import { EstadoCuenta, PasarACliente } from './accionesCliente';
import { type ClienteDetalle, useCliente } from './consultasClientes';
import { AvatarCliente, EstadoCliente } from './listaClientes';
import { nombreCompleto, nombreDelRol, RUTA_CLIENTES } from './textosClientes';

const TARJETA = 'flex flex-col gap-4 rounded-lg border bg-card p-4 lg:p-6';

/**
 * E13-H4 FE, criterio 2 · Detalle de una cuenta de cliente o profesional, con sus acciones
 * (criterios 3 y 4).
 */
export function DetalleCliente({ codigo }: { codigo: string }) {
  const consulta = useCliente(codigo);

  if (!esCodigoCuenta(codigo)) return <SinCuenta />;
  if (consulta.isPending) return <EsqueletoDetalle />;
  if (consulta.isError) {
    if (esNoEncontrado(consulta.error)) return <SinCuenta />;
    return (
      <div className="flex flex-col gap-4">
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
  return <Detalle cuenta={consulta.data} />;
}

const Volver = () => (
  <Link
    href={RUTA_CLIENTES}
    className="flex min-h-10 items-center gap-2 self-start texto-etiqueta text-marca-profundo hover:underline"
  >
    <ArrowLeft className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
    Clientes
  </Link>
);

const SinCuenta = () => (
  <div className="flex flex-col gap-4">
    <Volver />
    <h1 className="titulo-h2 text-texto-principal">
      No encontramos esta cuenta
    </h1>
    <p className="texto-pequeno text-texto-secundario">
      Búscala en la lista de clientes.
    </p>
  </div>
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

const DATOS =
  'flex flex-col gap-2 lg:grid lg:grid-cols-3 lg:gap-x-8 lg:gap-y-4';

const Detalle = ({ cuenta }: { cuenta: ClienteDetalle }) => (
  <div className="flex flex-col gap-4 lg:gap-6">
    <Volver />
    <header className="flex items-center gap-3">
      <AvatarCliente cuenta={cuenta} />
      <h1 className="min-w-0 flex-1 titulo-h2 wrap-anywhere text-texto-principal">
        {nombreCompleto(cuenta)}
      </h1>
      <EstadoCliente activo={cuenta.activo} />
    </header>

    <section aria-labelledby="titulo-cuenta" className={TARJETA}>
      <h2 id="titulo-cuenta" className="titulo-h3 text-texto-principal">
        Cuenta
      </h2>
      <dl className={DATOS}>
        <Dato texto="Rol">{nombreDelRol(cuenta.rol)}</Dato>
        <Dato texto="Correo">
          {cuenta.email}
          {!cuenta.correoConfirmado && ' (sin confirmar)'}
        </Dato>
        <Dato texto="RUT">
          {cuenta.rut ? formatearRut(cuenta.rut) : 'Sin RUT'}
        </Dato>
        <Dato texto="Teléfono">{cuenta.telefono ?? 'Sin teléfono'}</Dato>
        <Dato texto="Registro">{formatearFecha(cuenta.fechaRegistro)}</Dato>
        <Dato texto="Pedidos">{cuenta.pedidos}</Dato>
        <Dato texto="Correos de ofertas">
          {cuenta.aceptaMarketingEmail ? 'Suscrita' : 'No suscrita'}
        </Dato>
      </dl>
      <div className="border-t pt-4">
        <EstadoCuenta cuenta={cuenta} />
      </div>
      <PasarACliente cuenta={cuenta} />
    </section>

    <Profesional cuenta={cuenta} />
    <HistorialRol cuenta={cuenta} />
  </div>
);

/** Perfil profesional y última verificación; si no tiene ninguno, la sección no aparece. */
const Profesional = ({ cuenta }: { cuenta: ClienteDetalle }) => {
  const { perfilProfesional: perfil, verificacion } = cuenta;
  if (!perfil && !verificacion) return null;
  return (
    <section aria-labelledby="titulo-profesional" className={TARJETA}>
      <h2 id="titulo-profesional" className="titulo-h3 text-texto-principal">
        Perfil profesional
      </h2>
      {verificacion && (
        <div className="flex flex-wrap items-center gap-3">
          <span className="texto-pequeno text-texto-secundario">
            Verificación del {formatearFecha(verificacion.fechaSolicitud)}
          </span>
          <EstadoSolicitud estado={verificacion.estado} />
          {verificacion.estado === 'revision_manual' && (
            <Link
              href={`/panel/verificaciones/${cuenta.codigoPublico}`}
              className="texto-etiqueta text-marca-profundo hover:underline"
            >
              Revisar solicitud
            </Link>
          )}
        </div>
      )}
      {perfil ? (
        <dl className={DATOS}>
          <Dato texto="Modalidad">{textoModalidad(perfil.modalidad)}</Dato>
          <Dato texto="Experiencia">
            {perfil.anosExperiencia === 1
              ? '1 año'
              : `${perfil.anosExperiencia} años`}
          </Dato>
          <Dato texto="Comuna">{perfil.comuna ?? 'Sin comuna'}</Dato>
          <Dato texto="Lugar de trabajo">
            {perfil.nombreLugarTrabajo ?? 'Sin indicar'}
          </Dato>
          <Dato texto="Red social">{perfil.redSocial ?? 'Sin indicar'}</Dato>
          <Dato texto="Especialidades">
            {perfil.especialidades.length > 0
              ? perfil.especialidades.map(textoEspecialidad).join(', ')
              : 'Sin indicar'}
          </Dato>
        </dl>
      ) : (
        <p className="texto-pequeno text-texto-secundario">
          Aún no completa su perfil profesional.
        </p>
      )}
    </section>
  );
};

const HistorialRol = ({ cuenta }: { cuenta: ClienteDetalle }) => (
  <section aria-labelledby="titulo-historial" className={TARJETA}>
    <h2 id="titulo-historial" className="titulo-h3 text-texto-principal">
      Historial de rol
    </h2>
    {cuenta.historialRol.length === 0 ? (
      <p className="texto-pequeno text-texto-secundario">
        Su rol no ha cambiado desde que creó la cuenta.
      </p>
    ) : (
      <ol className="flex flex-col">
        {cuenta.historialRol.map((cambio) => (
          <li
            key={`${cambio.fechaCambio}-${cambio.rolNuevo}`}
            className="flex flex-col gap-1 border-t py-3 first:border-t-0 first:pt-0"
          >
            <span className="texto-etiqueta text-texto-principal">
              {nombreDelRol(cambio.rolAnterior)} a{' '}
              {nombreDelRol(cambio.rolNuevo)}
            </span>
            <span className="texto-leyenda text-texto-secundario">
              {formatearFechaHora(cambio.fechaCambio)}, por {cambio.responsable}
            </span>
            {cambio.motivo && (
              <p className="texto-pequeno text-texto-principal">
                {cambio.motivo}
              </p>
            )}
          </li>
        ))}
      </ol>
    )}
  </section>
);

export const EsqueletoDetalle = () => (
  <div aria-hidden className="flex flex-col gap-4 lg:gap-6">
    <Skeleton className="h-6 w-24" />
    <div className="flex items-center gap-3">
      <Skeleton className="size-9 rounded-full" />
      <Skeleton className="h-7 w-56 max-w-full" />
    </div>
    <div className={TARJETA}>
      <Skeleton className="h-5 w-24" />
      <div className={DATOS}>
        {[0, 1, 2, 3, 4, 5].map((fila) => (
          <Skeleton key={fila} className="h-9 w-full" />
        ))}
      </div>
    </div>
  </div>
);
