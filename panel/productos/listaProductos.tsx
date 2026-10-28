'use client';

import { Pencil } from 'lucide-react';
import Link from 'next/link';
import type { ProductoListadoPanel } from '@/compartido/api/respuestas';
import { formatearPesos } from '@/compartido/formato/moneda';
import { cn } from '@/compartido/lib/utils';
import { Button } from '@/compartido/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/compartido/ui/table';
import {
  EstadoProducto,
  FotoProducto,
  OrigenDescripcionProducto,
  StockProducto,
} from './etiquetasProducto';

interface ListaProps {
  productos: ProductoListadoPanel[];
  /** Ruta de cada categoría desde la raíz («Shampoo › Reparación»), por id. */
  rutas: Map<number, string>;
}

export const urlProducto = (id: number) => `/panel/productos/${id}` as const;

const rutaDe = (producto: ProductoListadoPanel, rutas: Map<number, string>) =>
  rutas.get(producto.categoria.id) ?? producto.categoria.nombre;

const precioDesde = (producto: ProductoListadoPanel) =>
  producto.precioDesde === null ? '—' : formatearPesos(producto.precioDesde);

/** «Marca A», «Marca D · Exclusivo profesional» (Figma 2039:1249). */
const detalleEscritorio = (producto: ProductoListadoPanel) =>
  [
    producto.marca?.nombre,
    producto.canalVenta === 'profesional' && 'Exclusivo profesional',
  ]
    .filter(Boolean)
    .join(' · ');

const ENCABEZADO = 'h-auto px-3 py-2 texto-leyenda text-texto-secundario';

/**
 * Escritorio (Figma P3a 2039:1077): foto, producto con su marca, categoría, formatos, precio
 * desde, stock, origen de la descripción, estado y el lápiz para editar.
 */
export const TablaProductos = ({ productos, rutas }: ListaProps) => (
  <Table className="table-fixed">
    <TableHeader>
      <TableRow className="hover:bg-transparent">
        <TableHead className={cn(ENCABEZADO, 'w-16')}>
          <span className="sr-only">Foto</span>
        </TableHead>
        <TableHead className={ENCABEZADO}>Producto</TableHead>
        <TableHead className={cn(ENCABEZADO, 'w-44')}>Categoría</TableHead>
        <TableHead className={cn(ENCABEZADO, 'w-24')}>Formatos</TableHead>
        <TableHead className={cn(ENCABEZADO, 'w-32 text-right')}>
          Precio desde
        </TableHead>
        <TableHead className={cn(ENCABEZADO, 'w-20 text-right')}>
          Stock
        </TableHead>
        <TableHead className={cn(ENCABEZADO, 'w-32')}>Descripción</TableHead>
        <TableHead className={cn(ENCABEZADO, 'w-24')}>Estado</TableHead>
        <TableHead className={cn(ENCABEZADO, 'w-12')}>
          <span className="sr-only">Acciones</span>
        </TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {productos.map((producto) => (
        <TableRow key={producto.id} className="hover:bg-transparent">
          <TableCell className="p-3">
            <FotoProducto imagen={producto.imagen} />
          </TableCell>
          <TableCell className="p-3">
            <div className="flex min-w-0 flex-col">
              <span className="truncate texto-etiqueta text-texto-principal">
                {producto.nombre}
              </span>
              <span className="truncate texto-leyenda text-texto-secundario">
                {detalleEscritorio(producto)}
              </span>
            </div>
          </TableCell>
          <TableCell className="truncate p-3 texto-pequeno text-texto-principal">
            {rutaDe(producto, rutas)}
          </TableCell>
          <TableCell className="p-3 texto-pequeno text-texto-principal tabular-nums">
            {producto.formatos}
          </TableCell>
          <TableCell className="p-3 text-right texto-pequeno text-texto-principal tabular-nums">
            {precioDesde(producto)}
          </TableCell>
          <TableCell className="p-3 text-right">
            <StockProducto producto={producto} />
          </TableCell>
          <TableCell className="p-3">
            <OrigenDescripcionProducto origen={producto.origenDescripcion} />
          </TableCell>
          <TableCell className="p-3">
            <EstadoProducto activo={producto.activo} />
          </TableCell>
          <TableCell className="p-3 text-right">
            <Button asChild variant="ghost" size="icono-chico">
              <Link
                href={urlProducto(producto.id)}
                aria-label={`Editar ${producto.nombre}`}
              >
                <Pencil aria-hidden />
              </Link>
            </Button>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

/** «Marca A · 2 formatos», «Marca D · Exclusivo» (Figma 2039:5857). */
const detalleCelular = (producto: ProductoListadoPanel) =>
  [
    producto.marca?.nombre,
    producto.formatos === 1 ? '1 formato' : `${producto.formatos} formatos`,
    producto.canalVenta === 'profesional' && 'Exclusivo',
    !producto.activo && 'Inactivo',
  ]
    .filter(Boolean)
    .join(' · ');

/**
 * Celular (Figma P3a 2039:5857): cada fila abre el producto. Foto, nombre, marca y formatos,
 * origen de la descripción y el stock a la derecha.
 */
export const ListaProductosCelular = ({ productos }: ListaProps) => (
  <ul className="flex flex-col">
    {productos.map((producto) => (
      <li key={producto.id} className="border-t first:border-t-0">
        <Link
          href={urlProducto(producto.id)}
          className="flex items-center gap-3 rounded-md py-3"
        >
          <FotoProducto imagen={producto.imagen} />
          <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
            <span className="w-full truncate texto-etiqueta text-texto-principal">
              {producto.nombre}
            </span>
            <span className="texto-leyenda text-texto-secundario">
              {detalleCelular(producto)}
            </span>
            <OrigenDescripcionProducto origen={producto.origenDescripcion} />
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <StockProducto producto={producto} />
            <span aria-hidden className="texto-leyenda text-texto-secundario">
              stock
            </span>
          </div>
        </Link>
      </li>
    ))}
  </ul>
);
