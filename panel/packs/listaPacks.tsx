'use client';

import { Pencil } from 'lucide-react';
import Link from 'next/link';
import type { PackPanel } from '@/compartido/api/respuestas';
import { formatearDia } from '@/compartido/formato/fecha';
import { cn } from '@/compartido/lib/utils';
import { Badge } from '@/compartido/ui/badge';
import { Button } from '@/compartido/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/compartido/ui/table';
import { nombreDelFormato } from './buscadorFormatos';
import { urlPack } from './consultasPacks';

/**
 * Listado de packs del panel. Figma no lo dibuja (se agregó con SCRUM-105): sigue la tabla y la
 * lista de Productos (P3a). Todo sale de GET /catalogo/packs; el panel no calcula nada.
 */

/** «Shampoo reparador · 300 ml ×2». */
const textoComponente = (componente: PackPanel['componentes'][number]) =>
  `${nombreDelFormato(componente)} ×${componente.cantidad}`;

const cantidadComponentes = (pack: PackPanel) =>
  pack.componentes.length === 1
    ? '1 formato'
    : `${pack.componentes.length} formatos`;

/** «Sin vigencia», «Desde 1 nov 2026», «Hasta 30 nov 2026» o «1 nov 2026 al 30 nov 2026». */
export const textoVigencia = ({
  fechaInicioVigencia: inicio,
  fechaFinVigencia: fin,
}: Pick<PackPanel, 'fechaInicioVigencia' | 'fechaFinVigencia'>) => {
  if (inicio && fin) return `${formatearDia(inicio)} al ${formatearDia(fin)}`;
  if (inicio) return `Desde ${formatearDia(inicio)}`;
  if (fin) return `Hasta ${formatearDia(fin)}`;
  return 'Sin vigencia';
};

/** Si hoy (hora de Chile) se muestra en la tienda, según el backend (`vigente`). */
const Vigencia = ({ vigente }: { vigente: boolean }) => (
  <Badge
    className={cn(
      'texto-leyenda',
      vigente
        ? 'bg-marca-acento-suave text-marca-profundo'
        : 'bg-fondo-hueso-oscuro text-texto-principal',
    )}
  >
    {vigente ? 'Vigente' : 'Fuera de vigencia'}
  </Badge>
);

/** «Exclusivo» e «Inactivo», solo cuando corresponden. */
const Marcas = ({ pack }: { pack: PackPanel }) => (
  <>
    {pack.canalVenta === 'profesional' && (
      <Badge variant="secondary" className="texto-leyenda">
        Exclusivo
      </Badge>
    )}
    {!pack.activo && (
      <Badge className="bg-fondo-hueso-oscuro texto-leyenda text-texto-principal">
        Inactivo
      </Badge>
    )}
  </>
);

const ENCABEZADO = 'h-auto px-3 py-2 texto-leyenda text-texto-secundario';

/** Escritorio: pack con su SKU, componentes, vigencia, marcas y el lápiz para editar. */
export const TablaPacks = ({ packs }: { packs: PackPanel[] }) => (
  <Table className="table-fixed">
    <TableHeader>
      <TableRow className="hover:bg-transparent">
        <TableHead className={cn(ENCABEZADO, 'w-56')}>Pack</TableHead>
        <TableHead className={ENCABEZADO}>Componentes</TableHead>
        <TableHead className={cn(ENCABEZADO, 'w-56')}>Vigencia</TableHead>
        <TableHead className={cn(ENCABEZADO, 'w-32')}>Estado</TableHead>
        <TableHead className={cn(ENCABEZADO, 'w-12')}>
          <span className="sr-only">Acciones</span>
        </TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {packs.map((pack) => (
        <TableRow key={pack.id} className="hover:bg-transparent">
          <TableCell className="p-3">
            <div className="flex min-w-0 flex-col">
              <span className="truncate texto-etiqueta text-texto-principal">
                {pack.nombre}
              </span>
              <span className="truncate texto-leyenda text-texto-secundario">
                {pack.sku}
              </span>
            </div>
          </TableCell>
          <TableCell className="p-3 whitespace-normal">
            <ul className="flex flex-col texto-pequeno text-texto-principal">
              {pack.componentes.map((componente) => (
                <li key={componente.formatoId} className="break-words">
                  {textoComponente(componente)}
                </li>
              ))}
            </ul>
          </TableCell>
          <TableCell className="p-3 whitespace-normal">
            <div className="flex flex-col items-start gap-1">
              <span className="texto-pequeno text-texto-principal">
                {textoVigencia(pack)}
              </span>
              <Vigencia vigente={pack.vigente} />
            </div>
          </TableCell>
          <TableCell className="p-3 whitespace-normal">
            <div className="flex flex-wrap gap-1">
              <Marcas pack={pack} />
            </div>
          </TableCell>
          <TableCell className="p-3 text-right">
            <Button asChild variant="ghost" size="icono-chico">
              <Link
                href={urlPack(pack.id)}
                aria-label={`Editar ${pack.nombre}`}
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

/** Celular: cada fila abre el pack. Nombre, SKU con sus formatos, vigencia y marcas. */
export const ListaPacksCelular = ({ packs }: { packs: PackPanel[] }) => (
  <ul className="flex flex-col">
    {packs.map((pack) => (
      <li key={pack.id} className="border-t first:border-t-0">
        <Link
          href={urlPack(pack.id)}
          className="flex flex-col items-start gap-1 rounded-md py-3"
        >
          <span className="w-full truncate texto-etiqueta text-texto-principal">
            {pack.nombre}
          </span>
          <span className="texto-leyenda text-texto-secundario">
            {pack.sku} · {cantidadComponentes(pack)} · {textoVigencia(pack)}
          </span>
          <span className="flex flex-wrap gap-1">
            <Vigencia vigente={pack.vigente} />
            <Marcas pack={pack} />
          </span>
        </Link>
      </li>
    ))}
  </ul>
);
