'use client';

import { BadgeDollarSign, Pencil, Plus } from 'lucide-react';
import { useState } from 'react';
import type { FormatoPanel } from '@/compartido/api/respuestas';
import { formatearDia } from '@/compartido/formato/fecha';
import { cn } from '@/compartido/lib/utils';
import { PERMISOS, tienePermiso } from '@/compartido/sesion/roles';
import { useSesion } from '@/compartido/sesion/sesion';
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
import { clavePreciosProducto, usePreciosFormatos } from './consultasPrecios';
import { useFormatos } from './consultasProductos';
import { EstadoProducto } from './etiquetasProducto';
import {
  PanelFotos,
  ResumenFotosTabla,
  ResumenFotosTarjeta,
} from './fotosFormato';
import { PanelFormato, type FormatoEnEdicion } from './formularioFormato';
import { PanelPrecios, type ArticuloConPrecios } from './formularioPrecios';
import { Tarjeta } from './formularioProducto';
import {
  CeldaPrecio,
  textoPrecio,
  type ConsultaPrecios,
} from './preciosFormato';

/** El formato cuyos precios se fijan; su exclusividad es la de su producto. */
const articuloConPrecios = (
  formato: FormatoPanel | undefined,
): ArticuloConPrecios | null =>
  formato
    ? { id: formato.id, nombre: formato.nombreFormato, tipo: 'producto' }
    : null;

/**
 * «Formatos» del producto (Figma P3 2029:770 y 2024:558, E3-H2), con las fotos de cada formato
 * (E3-H3) y sus precios (E3-H5), que solo ve quien tiene el permiso `precios.gestionar`.
 */
export function FormatosProducto({ productoId }: { productoId: number }) {
  const formatos = useFormatos(productoId);
  const [edicion, setEdicion] = useState<FormatoEnEdicion | null>(null);
  const [fotosDe, setFotosDe] = useState<number | null>(null);
  const [preciosDe, setPreciosDe] = useState<number | null>(null);
  const lista = formatos.data ?? [];
  const { usuario } = useSesion();
  // Comodidad: el backend responde 403 a quien no tiene el permiso
  const gestionaPrecios = tienePermiso(
    usuario?.rol,
    PERMISOS.PRECIOS_GESTIONAR,
  );
  const consultasPrecios = usePreciosFormatos(
    productoId,
    lista.map((formato) => formato.id),
    gestionaPrecios,
  );
  const acciones = {
    precios: gestionaPrecios ? consultasPrecios : undefined,
    alEditar: (formato: FormatoPanel) => setEdicion({ formato }),
    alGestionarFotos: (formato: FormatoPanel) => setFotosDe(formato.id),
    alGestionarPrecios: (formato: FormatoPanel) => setPreciosDe(formato.id),
  };

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
          {/* Con los precios, la tabla cabe desde xl (1280 px); antes, las tarjetas */}
          <div className="max-xl:hidden">
            <TablaFormatos formatos={lista} {...acciones} />
          </div>
          <ListaFormatosCelular formatos={lista} {...acciones} />
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
      {gestionaPrecios && (
        <PanelPrecios
          clave={clavePreciosProducto(productoId)}
          articulo={articuloConPrecios(
            lista.find((formato) => formato.id === preciosDe),
          )}
          alCerrar={() => setPreciosDe(null)}
        />
      )}
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
  /** Los precios de cada formato, en el mismo orden; sin el permiso, no se muestran. */
  precios: ConsultaPrecios[] | undefined;
  alEditar: (formato: FormatoPanel) => void;
  alGestionarFotos: (formato: FormatoPanel) => void;
  alGestionarPrecios: (formato: FormatoPanel) => void;
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
    // 40 px para tocarlo en celular y tableta
    className="max-xl:size-10"
    aria-label={`Editar ${formato.nombreFormato}`}
    onClick={() => alEditar(formato)}
  >
    <Pencil aria-hidden />
  </Button>
);

const BotonPrecios = ({
  formato,
  alGestionarPrecios,
}: {
  formato: FormatoPanel;
  alGestionarPrecios: (formato: FormatoPanel) => void;
}) => (
  <Button
    variant="ghost"
    size="icono-chico"
    aria-label={`Precios de ${formato.nombreFormato}`}
    onClick={() => alGestionarPrecios(formato)}
  >
    <BadgeDollarSign aria-hidden />
  </Button>
);

const ENCABEZADO = 'h-auto px-2 py-2 texto-leyenda text-texto-secundario';

/**
 * Escritorio (Figma P3 2029:777): formato con su SKU, fotos, precios netos, stock mínimo,
 * vencimiento y las acciones.
 */
const TablaFormatos = ({
  formatos,
  precios,
  alEditar,
  alGestionarFotos,
  alGestionarPrecios,
}: ListaFormatosProps) => (
  <Table className="table-fixed">
    <TableHeader>
      <TableRow className="hover:bg-transparent">
        <TableHead className={ENCABEZADO}>Formato / SKU</TableHead>
        <TableHead className={cn(ENCABEZADO, 'w-36')}>Fotos</TableHead>
        {precios && (
          <>
            <TableHead className={cn(ENCABEZADO, 'w-36')}>
              Minorista neto
            </TableHead>
            <TableHead className={cn(ENCABEZADO, 'w-36')}>
              Mayorista neto
            </TableHead>
          </>
        )}
        <TableHead className={cn(ENCABEZADO, 'w-16')}>Mín.</TableHead>
        <TableHead className={cn(ENCABEZADO, 'w-32')}>Vence</TableHead>
        <TableHead className={cn(ENCABEZADO, precios ? 'w-24' : 'w-12')}>
          <span className="sr-only">Acciones</span>
        </TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {formatos.map((formato, indice) => (
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
          {precios && (
            <>
              <TableCell className="px-2 py-3 whitespace-normal">
                <CeldaPrecio consulta={precios[indice]} tipo="minorista" />
              </TableCell>
              <TableCell className="px-2 py-3 whitespace-normal">
                <CeldaPrecio consulta={precios[indice]} tipo="mayorista" />
              </TableCell>
            </>
          )}
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
          <TableCell className="px-2 py-3">
            <div className="flex justify-end gap-1">
              {precios && (
                <BotonPrecios
                  formato={formato}
                  alGestionarPrecios={alGestionarPrecios}
                />
              )}
              <BotonEditar formato={formato} alEditar={alEditar} />
            </div>
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
  precios,
  alEditar,
  alGestionarFotos,
  alGestionarPrecios,
}: ListaFormatosProps) => (
  <ul className="flex flex-col gap-3 xl:hidden">
    {formatos.map((formato, indice) => (
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
          {precios && (
            <>
              <Dato
                etiqueta="Precio minorista neto"
                valor={textoPrecio(precios[indice], 'minorista')}
              />
              <Dato
                etiqueta="Precio mayorista neto"
                valor={textoPrecio(precios[indice], 'mayorista')}
              />
            </>
          )}
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
        {precios && (
          <Button
            variant="link"
            className="min-h-10 self-end px-0 texto-etiqueta"
            onClick={() => alGestionarPrecios(formato)}
          >
            Gestionar precios
            {/* El espacio va fuera del span: dentro se pierde en el nombre accesible */}{' '}
            <span className="sr-only">de {formato.nombreFormato}</span>
          </Button>
        )}
      </li>
    ))}
  </ul>
);

/** Encabezado y dos filas en escritorio, dos tarjetas en celular, para que nada salte (RNF-17). */
const EsqueletoFormatos = () => (
  <div aria-hidden>
    <div className="flex flex-col gap-3 max-xl:hidden">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-14 w-full" />
    </div>
    <div className="flex flex-col gap-3 xl:hidden">
      <Skeleton className="h-28 w-full rounded-md" />
      <Skeleton className="h-28 w-full rounded-md" />
    </div>
  </div>
);
