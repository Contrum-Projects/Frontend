'use client';

import { useState } from 'react';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Button } from '@/compartido/ui/button';
import { Skeleton } from '@/compartido/ui/skeleton';
import {
  BuscadorProveedores,
  coincideConBusqueda,
} from './buscadorProveedores';
import { useProveedores } from './consultasProveedores';
import { ListaProveedoresCelular, TablaProveedores } from './listaProveedores';
import { NuevoProveedor } from './nuevoProveedor';
import { PestanasInventario } from './pestanasInventario';

/**
 * «Inventario · Proveedores» (Figma P5f 2064:3094 y 2069:1819, E11-H1): a quién se le compra.
 * Escritorio: tabla con el buscador dentro de la tarjeta; celular: botón ancho, buscador y lista.
 */
export function PantallaProveedores() {
  const [nuevo, setNuevo] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="titulo-h2 text-texto-principal">Inventario</h1>
        <Button onClick={() => setNuevo(true)} className="max-lg:hidden">
          Nuevo proveedor
        </Button>
      </div>
      <PestanasInventario />
      <Button
        onClick={() => setNuevo(true)}
        className="w-full max-lg:min-h-10 lg:hidden"
      >
        Nuevo proveedor
      </Button>
      <Proveedores busqueda={busqueda} alBuscar={setBusqueda} />
      <NuevoProveedor abierto={nuevo} alCambiarAbierto={setNuevo} />
    </div>
  );
}

const Proveedores = ({
  busqueda,
  alBuscar,
}: {
  busqueda: string;
  alBuscar: (texto: string) => void;
}) => {
  const consulta = useProveedores();

  if (consulta.isPending) return <EsqueletoProveedores />;
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
        Aún no hay proveedores.
      </p>
    );
  }

  const encontrados = consulta.data.filter((proveedor) =>
    coincideConBusqueda(proveedor, busqueda),
  );
  const resultado =
    encontrados.length === 0 ? (
      <p className="py-3 texto-pequeno break-words text-texto-secundario">
        Ningún proveedor coincide con «{busqueda.trim()}».
      </p>
    ) : null;

  return (
    <>
      {/* Anuncia el resultado del filtro a los lectores de pantalla */}
      <p aria-live="polite" className="sr-only">
        {busqueda.trim() &&
          (encontrados.length === 1
            ? '1 proveedor encontrado.'
            : `${encontrados.length} proveedores encontrados.`)}
      </p>
      <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 max-lg:hidden">
        <BuscadorProveedores
          id="buscar-proveedores"
          valor={busqueda}
          alCambiar={alBuscar}
          className="w-80 bg-fondo-hueso"
        />
        {resultado ?? <TablaProveedores proveedores={encontrados} />}
      </div>
      <div className="flex flex-col gap-4 lg:hidden">
        <BuscadorProveedores
          id="buscar-proveedores-celular"
          valor={busqueda}
          alCambiar={alBuscar}
          className="bg-fondo-superficie"
        />
        <div className="rounded-lg border bg-card px-4 py-1">
          {resultado ?? <ListaProveedoresCelular proveedores={encontrados} />}
        </div>
      </div>
    </>
  );
};

const FILAS_ESQUELETO = [0, 1, 2];

/** Con la estructura de la tabla y de la lista, para que nada salte al cargar (RNF-17). */
const EsqueletoProveedores = () => (
  <div aria-hidden>
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 max-lg:hidden">
      <Skeleton className="h-12 w-80 rounded-full" />
      <div className="h-10" />
      {FILAS_ESQUELETO.map((fila) => (
        <div key={fila} className="flex gap-4 border-t px-3 py-3">
          <Skeleton className="h-5 flex-1" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-40" />
        </div>
      ))}
    </div>
    <div className="flex flex-col gap-4 lg:hidden">
      <Skeleton className="h-12 rounded-full" />
      <div className="rounded-lg border bg-card px-4 py-1">
        {FILAS_ESQUELETO.map((fila) => (
          <div
            key={fila}
            className="flex flex-col gap-1 border-t py-3 first:border-t-0"
          >
            <Skeleton className="h-4 w-48 max-w-full" />
            <Skeleton className="h-4 w-40 max-w-full" />
            <Skeleton className="h-4 w-56 max-w-full" />
          </div>
        ))}
      </div>
    </div>
  </div>
);
