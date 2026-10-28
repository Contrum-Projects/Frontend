'use client';

import { Pencil, Plus } from 'lucide-react';
import { useState } from 'react';
import type { FormatoPanel } from '@/compartido/api/respuestas';
import { formatearDia } from '@/compartido/formato/fecha';
import { cn } from '@/compartido/lib/utils';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Badge } from '@/compartido/ui/badge';
import { Button } from '@/compartido/ui/button';
import { Skeleton } from '@/compartido/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/compartido/ui/table';
import { useFormatos } from './consultasProductos';
import { EstadoProducto } from './etiquetasProducto';
import {
  PanelFotos,
  ResumenFotosTabla,
  ResumenFotosTarjeta,
} from './fotosFormato';
import { PanelFormato, type FormatoEnEdicion } from './formularioFormato';
import { Tarjeta } from './formularioProducto';

/**
 * «Formatos» del producto (Figma P3 2029:770 y 2024:558, E3-H2), con las fotos de cada formato
 * (E3-H3). Los precios llegan con SCRUM-104.
 */
export function FormatosProducto({ productoId }: { productoId: number }) {
  const formatos = useFormatos(productoId);
  const [edicion, setEdicion] = useState<FormatoEnEdicion | null>(null);
  const [fotosDe, setFotosDe] = useState<number | null>(null);
  const lista = formatos.data ?? [];

  return (
    <Tarjeta
      titulo="Formatos"
      extra={
        formatos.isSuccess && (
          <Button
            variant="link"
            className="min-h-10 gap-1"
            aria-label="Agregar formato"
            onClick={() => setEdicion({ nuevo: true })}
          >
            <Plus aria-hidden />
            {/* «Agregar» en celular, como Figma (2024:561) */}
            <span aria-hidden className="lg:hidden">
              Agregar
            </span>
            <span aria-hidden className="max-lg:hidden">
              Agregar formato
            </span>
          </Button>
        )
      }
    >
      {formatos.isPending && <EsqueletoFormatos />}
      {formatos.isError && (
        <Alert variant="destructive">
          <AlertDescription>{formatos.error.message}</AlertDescription>
        </Alert>
      )}
      {formatos.isSuccess && lista.length === 0 && (
        <p className="texto-pequeno text-texto-secundario">
          Este producto aún no tiene formatos. El primero que agregues queda
          como predeterminado.
        </p>
      )}
      {lista.length > 0 && (
        <>
          <div className="max-lg:hidden">
            <TablaFormatos
              formatos={lista}
              alEditar={(formato) => setEdicion({ formato })}
              alGestionarFotos={(formato) => setFotosDe(formato.id)}
            />
          </div>
          <ListaFormatosCelular
            formatos={lista}
            alEditar={(formato) => setEdicion({ formato })}
            alGestionarFotos={(formato) => setFotosDe(formato.id)}
          />
        </>
      )}
      <PanelFormato
        productoId={productoId}
        edicion={edicion}
        esPrimero={lista.length === 0}
        alCerrar={() => setEdicion(null)}
      />
      <PanelFotos
        productoId={productoId}
        formatoId={fotosDe}
        alCerrar={() => setFotosDe(null)}
      />
    </Tarjeta>
  );
}

/** En «Producto nuevo» aún no hay producto al que agregarle formatos. */
export const FormatosProductoNuevo = () => (
  <Tarjeta titulo="Formatos">
    <p className="texto-pequeno text-texto-secundario">
      Guarda el producto para agregar sus formatos.
    </p>
  </Tarjeta>
);

interface ListaFormatosProps {
  formatos: FormatoPanel[];
  alEditar: (formato: FormatoPanel) => void;
  alGestionarFotos: (formato: FormatoPanel) => void;
}

/** «Predeterminado»: uno solo por producto (E3-H2 criterio 3). */
const MarcaPredeterminado = () => (
  <Badge className="bg-marca-acento-suave texto-leyenda text-marca-profundo">
    Predeterminado
  </Badge>
);

/** Nombre del formato con sus marcas: predeterminado e inactivo. */
const NombreFormato = ({
  formato,
  className,
}: {
  formato: FormatoPanel;
  className?: string;
}) => (
  <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
    <span className={cn('min-w-0 break-words text-texto-principal', className)}>
      {formato.nombreFormato}
    </span>
    {formato.esPredeterminado && <MarcaPredeterminado />}
    {!formato.activo && <EstadoProducto activo={false} />}
  </span>
);

const BotonEditar = ({
  formato,
  alEditar,
}: {
  formato: FormatoPanel;
  alEditar: (formato: FormatoPanel) => void;
}) => (
  <Button
    variant="ghost"
    size="icono-chico"
    // 40 px para tocarlo en celular
    className="max-lg:size-10"
    aria-label={`Editar ${formato.nombreFormato}`}
    onClick={() => alEditar(formato)}
  >
    <Pencil aria-hidden />
  </Button>
);

const ENCABEZADO = 'h-auto px-2 py-2 texto-leyenda text-texto-secundario';

/** Escritorio (Figma P3 2029:777): formato con su SKU, fotos, stock mínimo, vencimiento y el lápiz. */
const TablaFormatos = ({
  formatos,
  alEditar,
  alGestionarFotos,
}: ListaFormatosProps) => (
  <Table className="table-fixed">
    <TableHeader>
      <TableRow className="hover:bg-transparent">
        <TableHead className={ENCABEZADO}>Formato / SKU</TableHead>
        <TableHead className={cn(ENCABEZADO, 'w-36')}>Fotos</TableHead>
        <TableHead className={cn(ENCABEZADO, 'w-20')}>Mín.</TableHead>
        <TableHead className={cn(ENCABEZADO, 'w-32')}>Vence</TableHead>
        <TableHead className={cn(ENCABEZADO, 'w-12')}>
          <span className="sr-only">Acciones</span>
        </TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {formatos.map((formato) => (
        <TableRow key={formato.id} className="hover:bg-transparent">
          <TableCell className="px-2 py-3 whitespace-normal">
            <div className="flex min-w-0 flex-col">
              <NombreFormato formato={formato} className="texto-pequeno" />
              <span className="truncate texto-leyenda text-texto-secundario">
                {formato.sku}
              </span>
            </div>
          </TableCell>
          <TableCell className="px-2 py-3">
            <ResumenFotosTabla
              formato={formato}
              alGestionar={() => alGestionarFotos(formato)}
            />
          </TableCell>
          <TableCell className="px-2 py-3 texto-pequeno text-texto-principal tabular-nums">
            {formato.stockMinimo}
          </TableCell>
          <TableCell className="px-2 py-3 texto-pequeno text-texto-principal">
            {formato.fechaVencimiento ? (
              formatearDia(formato.fechaVencimiento)
            ) : (
              <>
                <span aria-hidden>—</span>
                <span className="sr-only">Sin fecha</span>
              </>
            )}
          </TableCell>
          <TableCell className="px-2 py-3 text-right">
            <BotonEditar formato={formato} alEditar={alEditar} />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

/** Un dato de la tarjeta de celular: etiqueta a la izquierda y valor a la derecha. */
const Dato = ({ etiqueta, valor }: { etiqueta: string; valor: string }) => (
  <div className="flex justify-between gap-3 texto-leyenda">
    <dt className="text-texto-secundario">{etiqueta}</dt>
    <dd className="text-right text-texto-principal tabular-nums">{valor}</dd>
  </div>
);

/** Celular (Figma P3 2024:565): una tarjeta por formato. */
const ListaFormatosCelular = ({
  formatos,
  alEditar,
  alGestionarFotos,
}: ListaFormatosProps) => (
  <ul className="flex flex-col gap-3 lg:hidden">
    {formatos.map((formato) => (
      <li
        key={formato.id}
        className="flex flex-col gap-2 rounded-md bg-fondo-hueso p-3"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <NombreFormato formato={formato} className="texto-etiqueta" />
            <span className="texto-leyenda break-all text-texto-secundario">
              SKU {formato.sku}
            </span>
          </div>
          <BotonEditar formato={formato} alEditar={alEditar} />
        </div>
        <ResumenFotosTarjeta
          formato={formato}
          alGestionar={() => alGestionarFotos(formato)}
        />
        <dl className="flex flex-col gap-1">
          <Dato etiqueta="Stock mínimo" valor={String(formato.stockMinimo)} />
          <Dato
            etiqueta="Vencimiento (opcional)"
            valor={
              formato.fechaVencimiento
                ? formatearDia(formato.fechaVencimiento)
                : 'Sin fecha'
            }
          />
        </dl>
      </li>
    ))}
  </ul>
);

/** Encabezado y dos filas en escritorio, dos tarjetas en celular, para que nada salte (RNF-17). */
const EsqueletoFormatos = () => (
  <div aria-hidden>
    <div className="flex flex-col gap-3 max-lg:hidden">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-14 w-full" />
    </div>
    <div className="flex flex-col gap-3 lg:hidden">
      <Skeleton className="h-28 w-full rounded-md" />
      <Skeleton className="h-28 w-full rounded-md" />
    </div>
  </div>
);
