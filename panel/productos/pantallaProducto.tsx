'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { ErrorDeApi } from '@/compartido/api/errores';
import type { ProductoPanel } from '@/compartido/api/respuestas';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/compartido/ui/alert-dialog';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Button } from '@/compartido/ui/button';
import { Skeleton } from '@/compartido/ui/skeleton';
import { useDesactivarProducto, useProducto } from './consultasProductos';
import { EstadoProducto } from './etiquetasProducto';
import { FormularioProductoPanel } from './formularioProducto';

/** «← Productos» sobre el título, solo en celular (Figma P3 2024:443). */
const VolverAProductos = () => (
  <Link
    href="/panel/productos"
    className="inline-flex min-h-10 items-center gap-2 self-start texto-etiqueta text-marca-profundo lg:hidden"
  >
    <ArrowLeft aria-hidden className="size-4 stroke-[1.75]" />
    Productos
  </Link>
);

/** «Producto nuevo» (Figma P3 2029:658 y 2024:443, E3-H1 criterio 2). */
export function PantallaProductoNuevo() {
  return (
    <div className="flex flex-col gap-2 lg:max-w-3xl">
      <VolverAProductos />
      <FormularioProductoPanel
        titulo={
          <h1 className="flex-1 titulo-h2 text-texto-principal">
            Producto nuevo
          </h1>
        }
      />
    </div>
  );
}

/**
 * Edición de un producto (E3-H1 criterios 2 y 3): el mismo formulario con sus datos, su
 * estado y la opción de desactivarlo.
 */
export function PantallaEditarProducto({ id }: { id: string }) {
  const numero = Number(id);
  const valido = Number.isInteger(numero) && numero > 0;
  return (
    <div className="flex flex-col gap-2 lg:max-w-3xl">
      <VolverAProductos />
      {valido ? <EditarProducto id={numero} /> : <ProductoNoEncontrado />}
    </div>
  );
}

const ProductoNoEncontrado = () => (
  <div className="flex flex-col items-start gap-3">
    <h1 className="titulo-h2 text-texto-principal">Producto no encontrado</h1>
    <p className="texto-pequeno text-texto-secundario">
      No encontramos este producto.
    </p>
    <Button asChild variant="contorno">
      <Link href="/panel/productos">Ver productos</Link>
    </Button>
  </div>
);

const EditarProducto = ({ id }: { id: number }) => {
  const producto = useProducto(id);

  if (producto.isPending) return <EsqueletoFormulario />;
  if (producto.isError) {
    if (producto.error instanceof ErrorDeApi && producto.error.estado === 404) {
      return <ProductoNoEncontrado />;
    }
    return (
      <div className="flex flex-col gap-4">
        <h1 className="titulo-h2 text-texto-principal">Editar producto</h1>
        <Alert variant="destructive">
          <AlertDescription>{producto.error.message}</AlertDescription>
        </Alert>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      <FormularioProductoPanel
        // Se vuelve a montar si cambia el producto: parte de los datos guardados
        key={producto.data.id}
        producto={producto.data}
        titulo={
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1">
            <h1 className="min-w-0 titulo-h2 break-words text-texto-principal">
              {producto.data.nombre}
            </h1>
            <EstadoProducto activo={producto.data.activo} />
          </div>
        }
      />
      <DesactivarProducto producto={producto.data} />
    </div>
  );
};

/**
 * Desactivar con confirmación (E3-H1 criterio 3). Figma no lo dibuja: va al final de la
 * edición, como una tarjeta más. El producto no se borra.
 */
const DesactivarProducto = ({ producto }: { producto: ProductoPanel }) => {
  const [confirmar, setConfirmar] = useState(false);
  const desactivar = useDesactivarProducto(producto.id);
  const cambiarAbierto = (abrir: boolean) => {
    if (desactivar.isPending) return;
    if (!abrir) desactivar.reset();
    setConfirmar(abrir);
  };

  return (
    <section
      aria-label="Estado del producto"
      className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-center lg:p-6"
    >
      <p className="flex-1 texto-pequeno text-texto-secundario">
        {producto.activo
          ? 'Desactivar el producto lo quita de la tienda. No se borra: queda en el listado como inactivo.'
          : 'Este producto está inactivo: no se muestra en la tienda.'}
      </p>
      {producto.activo && (
        <Button variant="contorno" onClick={() => setConfirmar(true)}>
          Desactivar producto
        </Button>
      )}
      <AlertDialog open={confirmar} onOpenChange={cambiarAbierto}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="titulo-h3 text-texto-principal">
              ¿Desactivar {producto.nombre}?
            </AlertDialogTitle>
            <AlertDialogDescription className="texto-pequeno text-texto-secundario">
              Dejará de mostrarse en la tienda. No se borra: seguirá en el
              listado como inactivo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {desactivar.isError && (
            <p role="alert" className="texto-pequeno text-estado-error">
              {desactivar.error.message}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={desactivar.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={desactivar.isPending}
              onClick={(evento) => {
                // Se mantiene abierto mientras responde el backend
                evento.preventDefault();
                desactivar.mutate(undefined, {
                  onSuccess: (guardado) => {
                    setConfirmar(false);
                    toast.success(`Desactivamos ${guardado.nombre}.`);
                  },
                });
              }}
            >
              Desactivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
};

/** Una etiqueta sobre la caja de un campo (51 px, como Input y Select). */
const CampoEsqueleto = () => (
  <div className="flex flex-col gap-2">
    <Skeleton className="h-4 w-20" />
    <Skeleton className="h-[51px] w-full" />
  </div>
);

/** El título y las dos tarjetas del formulario con sus campos, para que nada salte (RNF-17). */
const EsqueletoFormulario = () => (
  <div aria-hidden className="flex flex-col gap-4 lg:gap-6">
    <Skeleton className="h-9 w-64 max-w-full" />
    <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 lg:p-6">
      <Skeleton className="h-6 w-40" />
      <CampoEsqueleto />
      <div className="grid grid-cols-2 gap-3">
        <CampoEsqueleto />
        <CampoEsqueleto />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-6 w-10 rounded-full" />
        <div className="flex flex-col gap-1">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-56 max-w-full" />
        </div>
      </div>
    </div>
    <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 lg:p-6">
      <Skeleton className="h-6 w-32" />
      <CampoEsqueleto />
    </div>
  </div>
);

/** Mientras se lee el id de la ruta: con el lugar de «← Productos» en celular. */
export const EsqueletoProducto = () => (
  <div className="flex flex-col gap-2 lg:max-w-3xl">
    <div aria-hidden className="h-10 lg:hidden" />
    <EsqueletoFormulario />
  </div>
);
