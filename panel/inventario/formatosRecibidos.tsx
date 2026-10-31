'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useRef, useState, type ReactNode } from 'react';
import {
  useFieldArray,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from 'react-hook-form';
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
import {
  BuscadorFormatos,
  nombreDelFormato,
} from '@/panel/packs/buscadorFormatos';
import { Tarjeta } from '@/panel/productos/formularioProducto';
import type {
  FormatoRecibido,
  FormularioEntrada,
  SalidaEntrada,
} from './esquemaEntrada';

const ENCABEZADO = 'h-auto px-2 py-2 texto-leyenda text-texto-secundario';

type ErroresDetalles = FieldErrors<FormularioEntrada>['detalles'];

/**
 * «Formatos recibidos» (Figma P5 2029:4319 y 2025:603, E11-H2 criterios 2 y 3): cada formato una
 * vez, con su cantidad y su costo unitario neto. Una sola tabla: en celular cada fila se vuelve
 * una tarjeta. Los subtotales los entrega el backend al registrar (no se calculan aquí).
 */
export function FormatosRecibidos({
  control,
  register,
  errors,
}: {
  control: Control<FormularioEntrada, unknown, SalidaEntrada>;
  register: UseFormRegister<FormularioEntrada>;
  errors: ErroresDetalles;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'detalles',
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
          ?.querySelectorAll<HTMLButtonElement>('[data-quitar-formato]') ?? [];
      (
        botones[Math.min(indice, botones.length - 1)] ?? botonAgregar.current
      )?.focus();
    });
  };
  // El mensaje de la lista: de zod (en `root`) o del backend (en el campo)
  const errorLista = errors?.root?.message ?? errors?.message;

  return (
    <Tarjeta
      titulo="Formatos recibidos"
      extra={
        <Button
          type="button"
          variant="link"
          className="min-h-10 gap-1"
          ref={botonAgregar}
          onClick={() => setBuscando(true)}
        >
          <Plus aria-hidden />
          Agregar formato
        </Button>
      }
    >
      {fields.length === 0 ? (
        <p className="texto-pequeno text-texto-secundario">
          Agrega los formatos que llegaron en esta recepción.
        </p>
      ) : (
        <Table
          aria-label="Formatos recibidos"
          className="max-lg:block lg:table-fixed"
        >
          <TableHeader className="max-lg:sr-only">
            <TableRow className="hover:bg-transparent">
              <TableHead className={ENCABEZADO}>Formato</TableHead>
              <TableHead className={cn(ENCABEZADO, 'w-36')}>SKU</TableHead>
              <TableHead className={cn(ENCABEZADO, 'w-32')}>Cantidad</TableHead>
              <TableHead className={cn(ENCABEZADO, 'w-44')}>
                Costo unitario neto
              </TableHead>
              <TableHead className={cn(ENCABEZADO, 'w-12')}>
                <span className="sr-only">Quitar</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="max-lg:flex max-lg:flex-col max-lg:gap-3">
            {fields.map((campo, indice) => (
              <FilaFormato
                key={campo.id}
                formato={campo.formato}
                indice={indice}
                register={register}
                errores={errors?.[indice]}
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
      <BuscadorFormatos
        abierto={buscando}
        alCambiarAbierto={setBuscando}
        agregados={fields.map((campo) => campo.formato.formatoId)}
        destino="la entrada"
        aviso={null}
        alAgregar={({ canalVenta: _canal, ...formato }) =>
          append(
            { formato, cantidad: '', costoUnitarioNeto: '' },
            { shouldFocus: false },
          )
        }
      />
    </Tarjeta>
  );
}

type ErroresFila = NonNullable<ErroresDetalles>[number];

const FilaFormato = ({
  formato,
  indice,
  register,
  errores,
  alQuitar,
}: {
  formato: FormatoRecibido;
  indice: number;
  register: UseFormRegister<FormularioEntrada>;
  errores?: ErroresFila;
  alQuitar: () => void;
}) => {
  const nombre = nombreDelFormato(formato);
  const id = `entrada-formato-${formato.formatoId}`;
  // Errores del backend sobre la línea entera (formato repetido, inexistente…)
  const errorFila = errores?.formato?.message;
  return (
    <TableRow
      aria-invalid={errorFila ? true : undefined}
      className={cn(
        'hover:bg-transparent max-lg:grid max-lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] max-lg:gap-x-3 max-lg:gap-y-2 max-lg:rounded-md max-lg:border-0 max-lg:bg-fondo-hueso max-lg:p-3',
        errorFila && 'bg-estado-error/5 max-lg:bg-estado-error/5',
      )}
    >
      <TableCell className="px-2 py-3 whitespace-normal max-lg:col-span-2 max-lg:p-0">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="texto-pequeno break-words text-texto-principal lg:texto-etiqueta">
            {nombre}
          </span>
          <span className="texto-leyenda text-texto-secundario lg:hidden">
            {formato.sku}
          </span>
          {errorFila && (
            <p id={`${id}-error`} className="texto-leyenda text-destructive">
              {errorFila}
            </p>
          )}
        </div>
      </TableCell>
      <TableCell className="px-2 py-3 texto-pequeno break-words whitespace-normal text-texto-principal max-lg:hidden">
        {formato.sku}
      </TableCell>
      <TableCell className="px-2 py-3 align-top max-lg:p-0">
        <CampoFila
          id={`${id}-cantidad`}
          etiqueta="Cantidad"
          nombre={nombre}
          error={errores?.cantidad?.message}
          errorFila={errorFila ? `${id}-error` : undefined}
        >
          {(props) => (
            <Input
              {...props}
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              className="text-right tabular-nums lg:h-10"
              {...register(`detalles.${indice}.cantidad`)}
            />
          )}
        </CampoFila>
      </TableCell>
      <TableCell className="px-2 py-3 align-top max-lg:col-span-2 max-lg:p-0">
        <CampoFila
          id={`${id}-costo`}
          etiqueta="Costo unitario neto"
          nombre={nombre}
          error={errores?.costoUnitarioNeto?.message}
          errorFila={errorFila ? `${id}-error` : undefined}
        >
          {(props) => (
            <div className="relative">
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 left-4 flex items-center texto-cuerpo text-texto-secundario lg:texto-pequeno"
              >
                $
              </span>
              <Input
                {...props}
                inputMode="decimal"
                autoComplete="off"
                className="pl-8 text-right tabular-nums lg:h-10"
                {...register(`detalles.${indice}.costoUnitarioNeto`)}
              />
            </div>
          )}
        </CampoFila>
      </TableCell>
      <TableCell className="px-2 py-3 max-lg:col-start-3 max-lg:row-start-1 max-lg:p-0">
        <BotonQuitar nombre={nombre} alQuitar={alQuitar} />
      </TableCell>
    </TableRow>
  );
};

/** Cantidad o costo de una línea: etiqueta visible en celular, solo para lectores en escritorio. */
const CampoFila = ({
  id,
  etiqueta,
  nombre,
  error,
  errorFila,
  children,
}: {
  id: string;
  etiqueta: string;
  nombre: string;
  error?: string;
  /** Id del error de la línea, si lo hay. */
  errorFila?: string;
  children: (props: {
    id: string;
    'aria-label': string;
    'aria-invalid'?: true;
    'aria-describedby'?: string;
  }) => ReactNode;
}) => {
  const describe = [error && `${id}-error`, errorFila].filter(Boolean);
  return (
    <div className="flex flex-col gap-1">
      <span
        aria-hidden
        className="texto-etiqueta text-texto-principal lg:hidden"
      >
        {etiqueta}
      </span>
      {children({
        id,
        'aria-label': `${etiqueta} de ${nombre}`,
        'aria-invalid': error || errorFila ? true : undefined,
        'aria-describedby':
          describe.length > 0 ? describe.join(' ') : undefined,
      })}
      {error && (
        <p
          id={`${id}-error`}
          className="texto-leyenda whitespace-normal text-destructive"
        >
          {error}
        </p>
      )}
    </div>
  );
};

const BotonQuitar = ({
  nombre,
  alQuitar,
}: {
  nombre: string;
  alQuitar: () => void;
}) => (
  <Button
    type="button"
    variant="ghost"
    size="icono-chico"
    className="max-lg:size-10"
    data-quitar-formato
    aria-label={`Quitar ${nombre}`}
    onClick={alQuitar}
  >
    <Trash2 aria-hidden />
  </Button>
);
