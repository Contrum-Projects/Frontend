'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Button } from '@/compartido/ui/button';
import { Skeleton } from '@/compartido/ui/skeleton';
import { useCategorias } from '@/panel/catalogo/consultasCatalogo';
import { opcionesDeCategoria } from '@/panel/catalogo/esquemaCatalogo';
import {
  useProductos,
  type ConsultaProductos,
  type FiltroProductos,
} from './consultasProductos';
import { BuscadorProductos, FiltrosProductos } from './filtrosProductos';
import { ListaProductosCelular, TablaProductos } from './listaProductos';

/**
 * «Productos» (Figma P3a 2039:980 y 2039:5857, E3-H1 criterio 1): listado del catálogo con
 * búsqueda, filtros y paginación, y el acceso a Marcas y categorías (SCRUM-103) y a Producto
 * nuevo. En celular Figma no dibuja el acceso a Marcas y categorías, pero sin él no hay cómo
 * llegar.
 */
export function PantallaProductos() {
  const [consulta, setConsulta] = useState<ConsultaProductos>({
    filtro: 'todos',
    buscar: '',
    pagina: 1,
  });
  const buscar = useCallback(
    (texto: string) =>
      setConsulta((actual) =>
        actual.buscar === texto
          ? actual
          : { ...actual, buscar: texto, pagina: 1 },
      ),
    [],
  );
  const filtrar = (filtro: FiltroProductos) =>
    setConsulta((actual) => ({ ...actual, filtro, pagina: 1 }));
  const productos = useProductos(consulta);

  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="flex-1 titulo-h2 text-texto-principal">Productos</h1>
        <Button asChild variant="contorno" className="max-lg:order-last">
          <Link href="/panel/marcas-y-categorias">Marcas y categorías</Link>
        </Button>
        <Button asChild>
          <Link href="/panel/productos/nuevo">
            <Plus aria-hidden className="lg:hidden" />
            <span className="lg:hidden">Nuevo</span>
            <span className="max-lg:hidden">Producto nuevo</span>
          </Link>
        </Button>
      </div>
      <div className="flex flex-col gap-3 xl:rounded-lg xl:border xl:bg-card xl:p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <BuscadorProductos alBuscar={buscar} className="xl:w-80" />
          <FiltrosProductos
            filtro={consulta.filtro}
            conteos={productos.data?.conteos}
            alCambiar={filtrar}
          />
        </div>
        <Resultados
          consulta={consulta}
          alCambiarPagina={(pagina) =>
            setConsulta((actual) => ({ ...actual, pagina }))
          }
        />
      </div>
    </div>
  );
}

const Resultados = ({
  consulta,
  alCambiarPagina,
}: {
  consulta: ConsultaProductos;
  alCambiarPagina: (pagina: number) => void;
}) => {
  const productos = useProductos(consulta);
  const categorias = useCategorias();
  // La categoría con su ruta («Shampoo › Reparación»); mientras carga el árbol, solo el nombre
  const rutas = useMemo(
    () =>
      new Map(
        opcionesDeCategoria(categorias.data ?? []).map(({ id, ruta }) => [
          id,
          ruta,
        ]),
      ),
    [categorias.data],
  );

  if (productos.isPending) return <EsqueletoProductos />;
  if (productos.isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{productos.error.message}</AlertDescription>
      </Alert>
    );
  }
  const { items, total, pagina, limite } = productos.data;
  if (items.length === 0) {
    return (
      <p className="py-6 text-center texto-pequeno text-texto-secundario max-xl:rounded-lg max-xl:border max-xl:bg-card">
        {consulta.buscar
          ? `No encontramos productos con «${consulta.buscar}».`
          : consulta.filtro === 'todos'
            ? 'Aún no hay productos.'
            : 'No hay productos en este filtro.'}
      </p>
    );
  }
  const hasta = (pagina - 1) * limite + items.length;
  return (
    <>
      <div className="max-xl:hidden">
        <TablaProductos productos={items} rutas={rutas} />
      </div>
      <div className="rounded-lg border bg-card px-4 py-1 xl:hidden">
        <ListaProductosCelular productos={items} rutas={rutas} />
      </div>
      <nav
        aria-label="Páginas"
        className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 xl:px-3"
      >
        <p className="flex-1 texto-leyenda text-texto-secundario">
          Mostrando {hasta} de {total}
        </p>
        {pagina > 1 && (
          <Button
            variant="link"
            className="min-h-10 texto-etiqueta"
            onClick={() => alCambiarPagina(pagina - 1)}
          >
            ← Anterior
          </Button>
        )}
        {hasta < total && (
          <Button
            variant="link"
            className="min-h-10 texto-etiqueta"
            onClick={() => alCambiarPagina(pagina + 1)}
          >
            Siguiente →
          </Button>
        )}
      </nav>
    </>
  );
};

const FILAS_ESQUELETO = [0, 1, 2, 3];

/** Con la forma de las filas de la tabla y de la lista, para que nada salte al cargar (RNF-17). */
const EsqueletoProductos = () => (
  <div
    aria-hidden
    className="flex flex-col max-xl:rounded-lg max-xl:border max-xl:bg-card max-xl:px-4 max-xl:py-1"
  >
    <div className="h-8 max-xl:hidden" />
    {FILAS_ESQUELETO.map((fila) => (
      <div
        key={fila}
        className="flex items-center gap-3 border-t py-3 max-xl:first:border-t-0 xl:px-3"
      >
        <Skeleton className="size-10 rounded-sm" />
        <div className="flex flex-1 flex-col gap-1">
          <Skeleton className="h-4 w-48 max-w-full" />
          <Skeleton className="h-3 w-24 max-w-full" />
          <Skeleton className="h-5 w-16 rounded-full xl:hidden" />
        </div>
        <Skeleton className="h-5 w-10 rounded-full" />
      </div>
    ))}
  </div>
);
