'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import {
  useFieldArray,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from 'react-hook-form';
import {
  formatearPesos,
  formatearPesosNetos,
} from '@/compartido/formato/moneda';
import { cn } from '@/compartido/lib/utils';
import { Button } from '@/compartido/ui/button';
import { Input } from '@/compartido/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/compartido/ui/table';
import { Tarjeta } from '@/panel/productos/formularioProducto';
import {
  AVISO_SOLO_FORMATOS,
  BuscadorFormatos,
  nombreDelFormato,
} from './buscadorFormatos';
import type { FormatoDelPack, FormularioPack, SalidaPack } from './esquemaPack';

const ENCABEZADO = 'h-auto px-2 py-2 texto-leyenda text-texto-secundario';

/** Un dato que el backend aún no entrega (pedido a SCRUM-31): se dice, no se inventa. */
const SinDato = () => (
  <>
    <span aria-hidden>—</span>
    <span className="sr-only">Sin dato</span>
  </>
);

/**
 * «Componentes» del pack (Figma P3c 2065:2409 y 2065:9091, E3-H6 criterio 1): los formatos con su
 * cantidad, su stock y su precio minorista, que vienen del backend. Una sola tabla: en celular
 * cada fila se vuelve una tarjeta, así cada cantidad tiene un solo campo.
 */
export function ComponentesPack({
  control,
  register,
  errors,
}: {
  control: Control<FormularioPack, unknown, SalidaPack>;
  register: UseFormRegister<FormularioPack>;
  errors: FieldErrors<FormularioPack>['componentes'];
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'componentes',
  });
  const [buscando, setBuscando] = useState(false);
  const botonAgregar = useRef<HTMLButtonElement>(null);
  /** La fila desaparece con su botón: el foco pasa a la siguiente o a «Agregar formato». */
  const quitar = (indice: number) => {
    remove(indice);
    requestAnimationFrame(() => {
      const botones =
        botonAgregar.current
          ?.closest('section')
          ?.querySelectorAll<HTMLButtonElement>('[data-quitar-componente]') ??
        [];
      (
        botones[Math.min(indice, botones.length - 1)] ?? botonAgregar.current
      )?.focus();
    });
  };
  // El mensaje de la lista: de zod (en `root`) o del backend (en el campo)
  const errorLista = errors?.root?.message ?? errors?.message;

  return (
    <Tarjeta
      titulo="Componentes"
      extra={
        <Button
          type="button"
          variant="link"
          className="min-h-10 gap-1"
          ref={botonAgregar}
          aria-label="Agregar formato"
          onClick={() => setBuscando(true)}
        >
          <Plus aria-hidden />
          {/* «Agregar» en celular, como Figma (2065:9091) */}
          <span aria-hidden className="lg:hidden">
            Agregar
          </span>
          <span aria-hidden className="max-lg:hidden">
            Agregar formato
          </span>
        </Button>
      }
    >
      {fields.length === 0 ? (
        <p className="texto-pequeno text-texto-secundario">
          Agrega los formatos que lleva el pack.
        </p>
      ) : (
        <Table
          aria-label="Componentes del pack"
          className="max-xl:block xl:table-fixed"
        >
          <TableHeader className="max-xl:sr-only">
            <TableRow className="hover:bg-transparent">
              <TableHead className={ENCABEZADO}>Formato / SKU</TableHead>
              <TableHead className={cn(ENCABEZADO, 'w-24')}>Cantidad</TableHead>
              <TableHead className={cn(ENCABEZADO, 'w-24')}>
                Stock disponible
              </TableHead>
              <TableHead className={cn(ENCABEZADO, 'w-32')}>
                Minorista neto
              </TableHead>
              <TableHead className={cn(ENCABEZADO, 'w-12')}>
                <span className="sr-only">Quitar</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="max-xl:block">
            {fields.map((campo, indice) => (
              <FilaComponente
                key={campo.id}
                formato={campo.formato}
                indice={indice}
                register={register}
                error={errors?.[indice]?.cantidad?.message}
                alQuitar={() => quitar(indice)}
              />
            ))}
          </TableBody>
        </Table>
      )}
      {errorLista && (
        <p role="alert" className="texto-pequeno text-destructive">
          {errorLista}
        </p>
      )}
      <p className="texto-pequeno text-texto-secundario">
        {AVISO_SOLO_FORMATOS}
      </p>
      <BuscadorFormatos
        abierto={buscando}
        alCambiarAbierto={setBuscando}
        agregados={fields.map((campo) => campo.formato.formatoId)}
        alAgregar={({ canalVenta: _canal, ...formato }) =>
          append({ formato, cantidad: '1' }, { shouldFocus: false })
        }
      />
    </Tarjeta>
  );
}

const FilaComponente = ({
  formato,
  indice,
  register,
  error,
  alQuitar,
}: {
  formato: FormatoDelPack;
  indice: number;
  register: UseFormRegister<FormularioPack>;
  error?: string;
  alQuitar: () => void;
}) => {
  const nombre = nombreDelFormato(formato);
  const idCantidad = `componente-${formato.formatoId}-cantidad`;
  return (
    <TableRow className="hover:bg-transparent max-xl:grid max-xl:grid-cols-[auto_auto_minmax(0,1fr)_auto] max-xl:items-center max-xl:gap-x-3 max-xl:gap-y-2 max-xl:py-3">
      <TableCell className="px-2 py-3 whitespace-normal max-xl:col-span-3 max-xl:p-0">
        <div className="flex min-w-0 flex-col">
          <span className="texto-cuerpo break-words text-texto-principal max-xl:texto-cuerpo-fuerte">
            {nombre}
          </span>
          <span className="truncate texto-leyenda text-texto-secundario">
            {formato.sku}
          </span>
        </div>
      </TableCell>
      <TableCell className="px-2 py-3 align-top max-xl:row-start-2 max-xl:p-0">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span
              aria-hidden
              className="texto-leyenda text-texto-secundario xl:hidden"
            >
              Cantidad
            </span>
            <Input
              id={idCantidad}
              type="number"
              inputMode="numeric"
              min={1}
              max={99}
              aria-label={`Cantidad de ${nombre}`}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `${idCantidad}-error` : undefined}
              className="w-20 tabular-nums"
              {...register(`componentes.${indice}.cantidad`)}
            />
          </div>
          {error && (
            <p
              id={`${idCantidad}-error`}
              className="texto-leyenda whitespace-normal text-destructive"
            >
              {error}
            </p>
          )}
        </div>
      </TableCell>
      <TableCell className="px-2 py-3 texto-pequeno text-texto-principal tabular-nums max-xl:row-start-2 max-xl:p-0 max-xl:texto-leyenda max-xl:text-texto-secundario">
        <span aria-hidden className="xl:hidden">
          Stock{' '}
        </span>
        <span className="sr-only">Stock disponible </span>
        {formato.stockTotal === undefined ? <SinDato /> : formato.stockTotal}
      </TableCell>
      {/* Celular: Figma no muestra el precio de cada componente */}
      <TableCell className="px-2 py-3 whitespace-normal max-xl:hidden">
        <PrecioComponente formato={formato} />
      </TableCell>
      <TableCell className="px-2 py-3 max-xl:col-start-4 max-xl:row-span-2 max-xl:row-start-1 max-xl:p-0">
        <Button
          type="button"
          variant="ghost"
          size="icono-chico"
          className="max-xl:size-10"
          data-quitar-componente
          aria-label={`Quitar ${nombre}`}
          onClick={alQuitar}
        >
          <Trash2 aria-hidden />
        </Button>
      </TableCell>
    </TableRow>
  );
};

/** Neto arriba y «con IVA» abajo, como la tabla de formatos (Figma P3c 2065:2620). */
const PrecioComponente = ({ formato }: { formato: FormatoDelPack }) => {
  if (formato.precioMinoristaNeto === undefined) return <SinDato />;
  if (formato.precioMinoristaNeto === null) {
    return (
      <span className="texto-leyenda text-texto-secundario">Sin precio</span>
    );
  }
  return (
    <div className="flex flex-col">
      <span className="texto-pequeno text-texto-principal tabular-nums">
        {formatearPesosNetos(formato.precioMinoristaNeto)}
      </span>
      {typeof formato.precioMinoristaConIva === 'number' && (
        <span className="texto-leyenda text-texto-secundario tabular-nums">
          con IVA {formatearPesos(formato.precioMinoristaConIva)}
        </span>
      )}
    </div>
  );
};
