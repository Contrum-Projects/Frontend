'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useSesion } from '@/compartido/sesion/sesion';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Button } from '@/compartido/ui/button';
import { Skeleton } from '@/compartido/ui/skeleton';
import { usePersonal } from './consultasPersonal';
import { ListaPersonalCelular, TablaPersonal } from './listaPersonal';
import { NuevaCuenta } from './nuevaCuenta';

/**
 * «Personal de tienda» (Figma P8 2049:1896 y 2051:1343, E13-H1): el administrador crea y
 * desactiva cuentas del personal. Escritorio: tabla con menú por fila; celular: lista con
 * interruptor.
 */
export function PantallaPersonal() {
  const [nueva, setNueva] = useState(false);

  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="titulo-h2 text-texto-principal">
          Personal<span className="max-lg:hidden"> de tienda</span>
        </h1>
        <Button onClick={() => setNueva(true)}>
          <Plus aria-hidden className="lg:hidden" />
          Nueva<span className="max-lg:sr-only"> cuenta</span>
        </Button>
      </div>
      <Cuentas />
      <p className="texto-leyenda text-texto-secundario">
        <span className="lg:hidden">
          Desactivar una cuenta le quita el acceso de inmediato.
        </span>
        <span className="max-lg:hidden">
          Los roles y sus permisos están definidos en el sistema y no se editan
          desde el panel. Cada cuenta tiene un solo rol.
        </span>
      </p>
      <NuevaCuenta abierto={nueva} alCambiarAbierto={setNueva} />
    </div>
  );
}

const Cuentas = () => {
  const consulta = usePersonal();
  const { usuario } = useSesion();

  if (consulta.isPending) return <EsqueletoCuentas />;
  if (consulta.isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{consulta.error.message}</AlertDescription>
      </Alert>
    );
  }
  // Nunca vacía en la práctica (quien mira es administrador), pero no se promete nada
  if (consulta.data.length === 0) {
    return (
      <p className="texto-pequeno text-texto-secundario">
        Aún no hay cuentas del personal.
      </p>
    );
  }
  return (
    <>
      <div className="max-lg:hidden">
        <TablaPersonal
          cuentas={consulta.data}
          propia={usuario?.codigoPublico}
        />
      </div>
      <div className="lg:hidden">
        <ListaPersonalCelular
          cuentas={consulta.data}
          propia={usuario?.codigoPublico}
        />
      </div>
    </>
  );
};

const FILAS_ESQUELETO = [0, 1, 2];

/** Avatar y dos líneas (nombre y detalle), como cada fila. */
const PersonaEsqueleto = () => (
  <div className="flex flex-1 items-center gap-3">
    <Skeleton className="size-9 rounded-full" />
    <div className="flex flex-1 flex-col gap-1">
      <Skeleton className="h-4 w-40 max-w-full" />
      <Skeleton className="h-3 w-56 max-w-full" />
    </div>
  </div>
);

/** Con la estructura de la tabla y de la lista, para que nada salte al cargar (RNF-17). */
const EsqueletoCuentas = () => (
  <div aria-hidden>
    <div className="rounded-lg border bg-card p-4 max-lg:hidden">
      <div className="h-10" />
      {FILAS_ESQUELETO.map((fila) => (
        <div key={fila} className="flex items-center border-t px-3 py-3">
          <PersonaEsqueleto />
        </div>
      ))}
    </div>
    <div className="rounded-lg border bg-card px-4 py-1 lg:hidden">
      {FILAS_ESQUELETO.map((fila) => (
        <div
          key={fila}
          className="flex items-center gap-3 border-t py-3 first:border-t-0"
        >
          <PersonaEsqueleto />
          <Skeleton className="h-6 w-10 rounded-full" />
        </div>
      ))}
    </div>
  </div>
);
