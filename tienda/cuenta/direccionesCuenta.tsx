'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus } from 'lucide-react';
import { useState } from 'react';
import { api } from '@/compartido/api/cliente';
import { exigir } from '@/compartido/api/errores';
import type { DireccionCuenta } from '@/compartido/api/respuestas';
import { cn } from '@/compartido/lib/utils';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Button } from '@/compartido/ui/button';
import { Skeleton } from '@/compartido/ui/skeleton';
import {
  CLAVES_CUENTA,
  conErrorDeApi,
  useDirecciones,
} from './consultasCuenta';
import { DialogoDireccion } from './dialogoDireccion';

/** Botón con forma de enlace (Figma: texto etiqueta en profundo), sin el relleno del botón mediano. */
const CLASE_ENLACE = 'h-auto min-h-10 px-0 texto-etiqueta';

/** Qué abre el diálogo: una dirección nueva o una existente. */
type Edicion =
  { tipo: 'nueva' } | { tipo: 'editar'; direccion: DireccionCuenta };

/**
 * Tarjeta «Direcciones» de Mis datos (Figma 2034:2385, E1-H5): la principal primero y
 * destacada, como las entrega el backend.
 */
export function DireccionesCuenta() {
  const consulta = useDirecciones();
  const [edicion, setEdicion] = useState<Edicion>({ tipo: 'nueva' });
  const [abierto, setAbierto] = useState(false);
  const abrir = (nueva: Edicion) => {
    setEdicion(nueva);
    setAbierto(true);
  };

  return (
    <section
      id="direcciones"
      aria-labelledby="titulo-direcciones"
      className="flex scroll-mt-8 flex-col gap-4 rounded-lg border bg-card p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2
          id="titulo-direcciones"
          className="texto-cuerpo-fuerte text-texto-principal"
        >
          Direcciones
        </h2>
        <Button
          variant="link"
          className={CLASE_ENLACE}
          onClick={() => abrir({ tipo: 'nueva' })}
        >
          <Plus aria-hidden />
          Agregar dirección
        </Button>
      </div>
      <ListaDirecciones
        consulta={consulta}
        alEditar={(direccion) => abrir({ tipo: 'editar', direccion })}
      />
      <DialogoDireccion
        direccion={edicion.tipo === 'editar' ? edicion.direccion : undefined}
        abierto={abierto}
        alCambiarAbierto={setAbierto}
      />
    </section>
  );
}

const ListaDirecciones = ({
  consulta,
  alEditar,
}: {
  consulta: ReturnType<typeof useDirecciones>;
  alEditar: (direccion: DireccionCuenta) => void;
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
        Aún no tienes direcciones.
      </p>
    );
  }
  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {consulta.data.map((direccion) => (
        <li key={direccion.id} className="flex">
          <TarjetaDireccion direccion={direccion} alEditar={alEditar} />
        </li>
      ))}
    </ul>
  );
};

const TarjetaDireccion = ({
  direccion,
  alEditar,
}: {
  direccion: DireccionCuenta;
  alEditar: (direccion: DireccionCuenta) => void;
}) => {
  const clienteConsultas = useQueryClient();
  const principal = useMutation({
    mutationFn: () =>
      conErrorDeApi(async () =>
        exigir<DireccionCuenta>(
          await api.PATCH('/api/cuentas/yo/direcciones/{id}/principal', {
            params: { path: { id: direccion.id } },
          }),
        ),
      ),
    onSuccess: () =>
      clienteConsultas.invalidateQueries({
        queryKey: CLAVES_CUENTA.direcciones,
      }),
  });
  const titulo = `${direccion.calle} ${direccion.numero}`;
  const idTitulo = `direccion-${direccion.id}`;

  return (
    <article
      aria-labelledby={idTitulo}
      className={cn(
        'flex w-full flex-col gap-1.5 rounded-lg p-4',
        direccion.esPrincipal
          ? 'border-[1.5px] border-marca-profundo bg-marca-acento-suave'
          : 'bg-fondo-hueso',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h3
          id={idTitulo}
          className="min-w-0 texto-etiqueta break-words text-texto-principal"
        >
          {titulo}
          {direccion.esPrincipal && ' · Principal'}
        </h3>
        {/* 40 px de objetivo táctil; el margen negativo lo deja en la esquina, como en Figma */}
        <Button
          variant="ghost"
          size="icono"
          className="-mt-3 -mr-3 hover:bg-fondo-hueso-oscuro/60 focus-visible:ring-marca-profundo"
          aria-label={`Editar ${titulo}`}
          onClick={() => alEditar(direccion)}
        >
          <Pencil className="size-4.5" aria-hidden />
        </Button>
      </div>
      <p className="texto-pequeno text-texto-secundario">
        {direccion.referencia && (
          <>
            {direccion.referencia}
            <br />
          </>
        )}
        {direccion.comuna.nombre}, {direccion.comuna.region.nombre}
      </p>
      {!direccion.esPrincipal && (
        <Button
          variant="link"
          className={cn(CLASE_ENLACE, 'self-start')}
          disabled={principal.isPending}
          aria-describedby={idTitulo}
          onClick={() => principal.mutate()}
        >
          Marcar como principal
        </Button>
      )}
      {principal.isError && (
        <p role="alert" className="texto-pequeno text-estado-error">
          {principal.error.message}
        </p>
      )}
    </article>
  );
};
