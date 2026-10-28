'use client';

import { Plus } from 'lucide-react';
import { useId, useState, type ReactNode } from 'react';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Button } from '@/compartido/ui/button';
import { Skeleton } from '@/compartido/ui/skeleton';
import { ArbolCategorias } from './arbolCategorias';
import { useCategorias, useMarcas } from './consultasCatalogo';
import { PanelCategoria, type EdicionCategoria } from './formularioCategoria';
import { NuevaMarca } from './formularioMarca';

/**
 * «Marcas y categorías» (Figma P3b 2039:1311, E3-H4): el personal ordena el catálogo. En
 * escritorio, las categorías a la izquierda y las marcas en una columna de 420 px; en celular
 * (sin diseño en Figma), una tarjeta debajo de la otra.
 */
export function PantallaMarcasYCategorias() {
  const [nuevaMarca, setNuevaMarca] = useState(false);
  const [edicion, setEdicion] = useState<EdicionCategoria>(null);
  const categorias = useCategorias();

  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      <h1 className="titulo-h2 text-texto-principal">Marcas y categorías</h1>
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-6">
        <Tarjeta
          titulo="Categorías"
          accion="Nueva categoría"
          alAccion={() => setEdicion({})}
        >
          <Categorias
            consulta={categorias}
            alEditar={(categoria) => setEdicion({ categoria })}
          />
          <p className="pt-1 texto-leyenda text-texto-secundario">
            Las subcategorías dependen de una categoría; no se permiten ciclos.
          </p>
        </Tarjeta>
        <Tarjeta
          titulo="Marcas"
          accion="Nueva marca"
          alAccion={() => setNuevaMarca(true)}
        >
          <Marcas />
        </Tarjeta>
      </div>
      <PanelCategoria
        edicion={edicion}
        arbol={categorias.data ?? []}
        alCerrar={() => setEdicion(null)}
      />
      <NuevaMarca abierto={nuevaMarca} alCambiarAbierto={setNuevaMarca} />
    </div>
  );
}

const Tarjeta = ({
  titulo,
  accion,
  alAccion,
  children,
}: {
  titulo: string;
  accion: string;
  alAccion: () => void;
  children: ReactNode;
}) => {
  const idTitulo = useId();
  return (
    <section
      aria-labelledby={idTitulo}
      className="flex min-w-0 flex-col gap-3 rounded-lg border bg-card p-4 lg:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id={idTitulo} className="texto-cuerpo-fuerte text-texto-principal">
          {titulo}
        </h2>
        <Button variant="link" onClick={alAccion} className="min-h-10 gap-1">
          <Plus aria-hidden />
          {accion}
        </Button>
      </div>
      {children}
    </section>
  );
};

const Categorias = ({
  consulta,
  alEditar,
}: {
  consulta: ReturnType<typeof useCategorias>;
  alEditar: Parameters<typeof ArbolCategorias>[0]['alEditar'];
}) => {
  if (consulta.isPending) return <EsqueletoFilas />;
  if (consulta.isError)
    return <ErrorDeCarga mensaje={consulta.error.message} />;
  if (consulta.data.length === 0) {
    return (
      <p className="border-t pt-3 texto-pequeno text-texto-secundario">
        Aún no hay categorías.
      </p>
    );
  }
  return <ArbolCategorias arbol={consulta.data} alEditar={alEditar} />;
};

const Marcas = () => {
  const consulta = useMarcas();

  if (consulta.isPending) return <EsqueletoFilas />;
  if (consulta.isError)
    return <ErrorDeCarga mensaje={consulta.error.message} />;
  if (consulta.data.length === 0) {
    return (
      <p className="border-t pt-3 texto-pequeno text-texto-secundario">
        Aún no hay marcas.
      </p>
    );
  }
  return (
    <ul>
      {consulta.data.map((marca) => (
        <li
          key={marca.id}
          className="flex min-h-12 items-center border-t px-3 py-3 texto-etiqueta break-words text-texto-principal"
        >
          {marca.nombre}
        </li>
      ))}
    </ul>
  );
};

const ErrorDeCarga = ({ mensaje }: { mensaje: string }) => (
  <Alert variant="destructive">
    <AlertDescription>{mensaje}</AlertDescription>
  </Alert>
);

const FILAS_ESQUELETO = [0, 1, 2, 3];

/** Filas con el alto de las de la lista, para que nada salte al cargar (RNF-17). */
const EsqueletoFilas = () => (
  <div role="status">
    <span className="sr-only">Cargando…</span>
    {FILAS_ESQUELETO.map((fila) => (
      <div key={fila} className="flex h-12 items-center border-t px-3">
        <Skeleton aria-hidden className="h-4 w-40 max-w-full" />
      </div>
    ))}
  </div>
);
