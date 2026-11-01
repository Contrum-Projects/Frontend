'use client';

import type { Route } from 'next';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormularioSalida } from './formularioSalida';

/** TODO(SCRUM-114): volver a Stock (/panel/inventario) cuando exista. */
const RUTA_INVENTARIO: Route = '/panel/inventario/entradas';

/**
 * «Registrar salida» en celular (Figma P5c 2044:1209, E11-H3). En escritorio se usa el panel
 * lateral de la cabecera de Inventario. Al registrar vuelve a Inventario con el aviso.
 */
export function PantallaSalidaNueva() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <Link
          href={RUTA_INVENTARIO}
          className="inline-flex min-h-10 items-center gap-2 self-start texto-etiqueta text-marca-profundo"
        >
          <ArrowLeft aria-hidden className="size-4" strokeWidth={1.75} />
          Inventario
        </Link>
        <h1 className="titulo-h2 text-texto-principal">Registrar salida</h1>
      </div>
      <div className="lg:max-w-md">
        <FormularioSalida alRegistrar={() => router.push(RUTA_INVENTARIO)} />
      </div>
    </div>
  );
}
