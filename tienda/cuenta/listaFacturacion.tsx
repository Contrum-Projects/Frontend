'use client';

import { Plus } from 'lucide-react';
import type { Ref } from 'react';
import type { DatosFacturacionCuenta } from '@/compartido/api/respuestas';
import { formatearRut } from '@/compartido/formato/rut';
import { cn } from '@/compartido/lib/utils';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Button } from '@/compartido/ui/button';
import { Skeleton } from '@/compartido/ui/skeleton';
import { useDatosFacturacion } from './consultasCuenta';
import { CLASE_ENLACE, EliminarFacturacion } from './eliminarFacturacion';

interface ListaFacturacionProps {
  /** Título de la lista: recibe el foco al guardar o cancelar. */
  refTitulo: Ref<HTMLHeadingElement>;
  alAgregar: () => void;
  alEditar: (registro: DatosFacturacionCuenta) => void;
  alEliminar: (registro: DatosFacturacionCuenta) => void;
}

/**
 * «Tus datos de facturación» (Figma 2066:3558 y 2070:2681, E9-H2): en escritorio, una tarjeta
 * con los registros de a dos; en celular, una tarjeta por registro. El orden es el del backend.
 */
export function ListaFacturacion({
  refTitulo,
  alAgregar,
  alEditar,
  alEliminar,
}: ListaFacturacionProps) {
  const consulta = useDatosFacturacion();

  return (
    <section
      aria-labelledby="titulo-lista-facturacion"
      className="flex flex-col gap-4 md:rounded-lg md:border md:bg-card md:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Figma no lo muestra en celular: queda para el lector de pantalla */}
        <h2
          ref={refTitulo}
          id="titulo-lista-facturacion"
          tabIndex={-1}
          className="sr-only texto-cuerpo-fuerte text-texto-principal outline-none md:not-sr-only"
        >
          Tus datos de facturación
        </h2>
        <Button
          variant="link"
          className={cn(CLASE_ENLACE, 'hidden md:inline-flex')}
          onClick={alAgregar}
        >
          <Plus aria-hidden />
          Agregar datos
        </Button>
      </div>
      <Contenido
        consulta={consulta}
        alEditar={alEditar}
        alEliminar={alEliminar}
      />
    </section>
  );
}

const Contenido = ({
  consulta,
  alEditar,
  alEliminar,
}: {
  consulta: ReturnType<typeof useDatosFacturacion>;
  alEditar: (registro: DatosFacturacionCuenta) => void;
  alEliminar: (registro: DatosFacturacionCuenta) => void;
}) => {
  if (consulta.isPending) {
    return (
      <div aria-hidden className="grid gap-3 md:grid-cols-2">
        <Skeleton className="h-36 rounded-lg" />
        <Skeleton className="h-36 rounded-lg" />
      </div>
    );
  }
  if (consulta.isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{consulta.error.message}</AlertDescription>
      </Alert>
    );
  }
  if (consulta.data.length === 0) {
    return (
      <p className="texto-pequeno text-texto-secundario">
        Aún no tienes datos de facturación.
      </p>
    );
  }
  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {consulta.data.map((registro) => (
        <li key={registro.id} className="flex">
          <TarjetaFacturacion
            registro={registro}
            alEditar={alEditar}
            alEliminar={alEliminar}
          />
        </li>
      ))}
    </ul>
  );
};

const TarjetaFacturacion = ({
  registro,
  alEditar,
  alEliminar,
}: {
  registro: DatosFacturacionCuenta;
  alEditar: (registro: DatosFacturacionCuenta) => void;
  alEliminar: (registro: DatosFacturacionCuenta) => void;
}) => {
  const idTitulo = `facturacion-${registro.id}`;
  const rut = `RUT ${formatearRut(registro.rut)}`;
  const giro = `Giro: ${registro.giro}`;

  return (
    <article
      aria-labelledby={idTitulo}
      className="flex w-full min-w-0 flex-col gap-1.5 rounded-lg border bg-card p-4 md:border-0 md:bg-fondo-hueso"
    >
      <h3
        id={idTitulo}
        className="texto-cuerpo-fuerte break-words text-texto-principal"
      >
        {registro.razonSocial}
      </h3>
      <div className="texto-pequeno break-words text-texto-secundario">
        {/* En celular RUT y giro van en una línea (Figma 2070:2683) */}
        <p className="md:hidden">
          {rut} · {giro}
        </p>
        <p className="hidden md:block">{rut}</p>
        <p className="hidden md:block">{giro}</p>
        <p>
          {registro.direccion}, {registro.comuna.nombre},{' '}
          {registro.comuna.region.nombre}
        </p>
        {registro.correoFacturacion && <p>{registro.correoFacturacion}</p>}
      </div>
      <div className="flex gap-4">
        <Button
          variant="link"
          aria-describedby={idTitulo}
          className={CLASE_ENLACE}
          onClick={() => alEditar(registro)}
        >
          Editar
        </Button>
        <EliminarFacturacion
          registro={registro}
          idTitulo={idTitulo}
          alEliminar={() => alEliminar(registro)}
        />
      </div>
    </article>
  );
};
