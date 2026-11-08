'use client';

import { useState } from 'react';
import type { BodegaPanel, UbicacionPanel } from '@/compartido/api/respuestas';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Button } from '@/compartido/ui/button';
import { Skeleton } from '@/compartido/ui/skeleton';
import { PestanasInventario } from '../pestanasInventario';
import { useBodegas } from './consultasBodegas';
import { FormularioBodega } from './formularioBodega';
import { FormularioUbicacion } from './formularioUbicacion';
import { TarjetaBodega } from './tarjetaBodega';

type Edicion =
  | { tipo: 'bodega'; bodega: BodegaPanel | null }
  | {
      tipo: 'ubicacion';
      bodega: BodegaPanel;
      ubicacion: UbicacionPanel | null;
    }
  | null;

/**
 * «Inventario · Bodegas» (SCRUM-151; sin Figma, sigue Proveedores): las bodegas con sus
 * ubicaciones y lo que guardan. Solo el administrador: crea, edita y desactiva (sin stock).
 */
export function PantallaBodegas() {
  const consulta = useBodegas();
  const [edicion, setEdicion] = useState<Edicion>(null);
  const cerrar = (abierto: boolean) => !abierto && setEdicion(null);
  const nueva = () => setEdicion({ tipo: 'bodega', bodega: null });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="titulo-h2 text-texto-principal">Inventario</h1>
        <Button onClick={nueva} className="max-lg:hidden">
          Nueva bodega
        </Button>
      </div>
      <PestanasInventario />
      <Button onClick={nueva} className="w-full max-lg:min-h-10 lg:hidden">
        Nueva bodega
      </Button>

      {consulta.isPending ? (
        <div aria-hidden className="flex flex-col gap-4">
          <Skeleton className="h-48 rounded-lg" />
          <Skeleton className="h-48 rounded-lg" />
        </div>
      ) : consulta.isError ? (
        <Alert variant="destructive">
          <AlertDescription>{consulta.error.message}</AlertDescription>
        </Alert>
      ) : consulta.data.length === 0 ? (
        <p className="rounded-lg border bg-card p-6 texto-pequeno text-texto-secundario">
          Aún no hay bodegas. Crea la primera para poder recibir stock.
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
          {consulta.data.map((bodega) => (
            <TarjetaBodega
              key={bodega.id}
              bodega={bodega}
              alEditar={() => setEdicion({ tipo: 'bodega', bodega })}
              alAgregarUbicacion={() =>
                setEdicion({ tipo: 'ubicacion', bodega, ubicacion: null })
              }
              alEditarUbicacion={(ubicacion) =>
                setEdicion({ tipo: 'ubicacion', bodega, ubicacion })
              }
            />
          ))}
        </div>
      )}

      <FormularioBodega
        bodega={edicion?.tipo === 'bodega' ? edicion.bodega : null}
        abierto={edicion?.tipo === 'bodega'}
        alCambiarAbierto={cerrar}
      />
      {edicion?.tipo === 'ubicacion' && (
        <FormularioUbicacion
          bodega={edicion.bodega}
          ubicacion={edicion.ubicacion}
          abierto
          alCambiarAbierto={cerrar}
        />
      )}
    </div>
  );
}
