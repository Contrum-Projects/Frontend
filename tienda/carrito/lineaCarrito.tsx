'use client';

import { BadgeCheck, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useId } from 'react';
import type { LineaCarrito as Linea } from '@/compartido/api/respuestas';
import { formatearPesos } from '@/compartido/formato/moneda';
import { cn } from '@/compartido/lib/utils';
import { Button } from '@/compartido/ui/button';
import { Cantidad } from '@/compartido/ui/cantidad';
import { MINIMO_PROFESIONAL } from '@/tienda/profesional/precio';
import {
  MAXIMO_UNIDADES_LINEA,
  useCambiarCantidad,
  useQuitarDelCarrito,
} from './consultasCarrito';

interface LineaCarritoProps {
  linea: Linea;
  /** El backend ya entrega el mayorista: solo cambia la etiqueta del precio unitario. */
  profesional: boolean;
}

/**
 * Un artículo del carrito (Figma › 04 Carrito 2008:872; celular 2008:1927). Si el backend lo
 * marca con `impideCrearPedido`, la tarjeta lleva el borde de aviso y el texto que explica qué
 * ajustar (criterio 2). Mientras se guarda un cambio, sus controles esperan; si el backend lo
 * rechaza, su mensaje queda junto a la línea y la cantidad vuelve a la guardada.
 */
export function LineaCarrito({ linea, profesional }: LineaCarritoProps) {
  const cambiar = useCambiarCantidad(linea.articuloId);
  const quitar = useQuitarDelCarrito(linea.articuloId);
  const idAviso = useId();
  const ocupada = cambiar.isPending || quitar.isPending;
  const cantidad = cambiar.isPending ? cambiar.variables : linea.cantidad;
  const aviso = avisoDeLinea(linea);
  const error = cambiar.error ?? quitar.error;
  const titulo = [linea.nombre, linea.nombreFormato].filter(Boolean).join(' ');

  return (
    <li
      className={cn(
        'flex flex-col gap-3 rounded-lg border bg-fondo-superficie p-3 md:gap-4 md:p-4',
        linea.impideCrearPedido &&
          'border-[1.5px] border-estado-aviso-texto md:border-2',
      )}
    >
      {/* Celular: foto, datos y quitar; debajo, cantidad y subtotal. Escritorio: todo en una fila */}
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-3 gap-y-3 md:grid-cols-[auto_minmax(0,1fr)_auto_auto_auto] md:items-center md:gap-x-6">
        <FotoLinea imagen={linea.imagen} />
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="texto-cuerpo-fuerte text-texto-principal md:titulo-h3">
            {linea.nombre}
          </h2>
          {linea.nombreFormato && (
            <p className="texto-pequeno text-texto-secundario">
              {linea.nombreFormato}
            </p>
          )}
          {linea.precioUnitario !== null && (
            <PrecioUnitario
              precio={linea.precioUnitario}
              profesional={profesional}
            />
          )}
        </div>
        <div className="col-span-2 col-start-1 row-start-2 md:col-span-1 md:col-start-3 md:row-start-1">
          <ControlCantidad
            linea={linea}
            cantidad={cantidad}
            titulo={titulo}
            descripcion={aviso ? idAviso : undefined}
            deshabilitada={ocupada}
            onCambiar={(valor) => cambiar.mutate(valor)}
          />
        </div>
        <div className="col-start-3 row-start-2 justify-self-end md:col-start-4 md:row-start-1">
          <Subtotal subtotal={linea.subtotal} />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icono"
          aria-label={`Quitar ${titulo} del carrito`}
          aria-describedby={aviso ? idAviso : undefined}
          disabled={ocupada}
          onClick={() => quitar.mutate()}
          className="col-start-3 row-start-1 -mt-2 -mr-2 justify-self-end md:col-start-5 md:m-0"
        >
          <Trash2 aria-hidden />
        </Button>
      </div>
      {aviso && (
        <p id={idAviso} className="texto-pequeno text-estado-aviso-texto">
          {aviso}
        </p>
      )}
      {error && (
        <p role="alert" className="texto-pequeno text-estado-error">
          {error.message}
        </p>
      )}
    </li>
  );
}

/**
 * Qué ajustar en una línea que impide el pedido (textos decididos el 01-11-2026). El backend no
 * dice cuántas unidades hay. El aviso del mínimo con «Subir a 3» es de SCRUM-119.
 */
const avisoDeLinea = (linea: Linea): string | null => {
  if (!linea.aLaVenta) {
    return 'Este producto ya no está disponible. Quítalo del carrito.';
  }
  if (linea.stockSuficiente === false) {
    return 'No hay stock para esta cantidad. Baja la cantidad o quítalo del carrito.';
  }
  // TODO(SCRUM-119): aviso del mínimo con «Agrega N más» y «Subir a 3»
  if (linea.bajoMinimo) {
    return `Para tu precio profesional, el mínimo es ${MINIMO_PROFESIONAL} unidades de este formato.`;
  }
  return null;
};

/** 72 px en celular y 96 px en escritorio, sobre menta mientras carga o si no tiene foto. */
const FotoLinea = ({ imagen }: { imagen: string | null }) => (
  <div className="relative size-18 shrink-0 overflow-hidden rounded-md bg-marca-acento-suave md:size-24">
    {imagen && (
      <Image
        src={imagen}
        alt=""
        fill
        sizes="(min-width: 768px) 96px, 72px"
        className="object-cover"
      />
    )}
  </div>
);

const PrecioUnitario = ({
  precio,
  profesional,
}: {
  precio: number;
  profesional: boolean;
}) =>
  profesional ? (
    <p className="flex items-center gap-1 texto-leyenda text-marca-profundo">
      <BadgeCheck
        className="size-4 shrink-0 text-marca-acento"
        strokeWidth={1.75}
        aria-hidden
      />
      {formatearPesos(precio)} c/u · precio profesional
    </p>
  ) : (
    <p className="texto-leyenda text-texto-secundario">
      {formatearPesos(precio)} c/u
    </p>
  );

/** Un artículo que ya no se vende no se puede cambiar (el backend lo rechaza): solo quitar. */
const ControlCantidad = ({
  linea,
  cantidad,
  titulo,
  descripcion,
  deshabilitada,
  onCambiar,
}: {
  linea: Linea;
  cantidad: number;
  titulo: string;
  /** Id del aviso de la línea, para que el lector de pantalla lo lea en la cantidad. */
  descripcion?: string;
  deshabilitada: boolean;
  onCambiar: (valor: number) => void;
}) => {
  if (!linea.aLaVenta) return null;
  return (
    <fieldset disabled={deshabilitada} className="contents">
      <Cantidad
        valor={cantidad}
        onCambiar={onCambiar}
        maximo={MAXIMO_UNIDADES_LINEA}
        etiqueta={`Cantidad de ${titulo}`}
        descripcion={descripcion}
        className={cn(linea.impideCrearPedido && 'border-estado-aviso-texto')}
      />
    </fieldset>
  );
};

const Subtotal = ({ subtotal }: { subtotal: number | null }) =>
  subtotal === null ? null : (
    <p className="texto-cuerpo-fuerte whitespace-nowrap text-texto-principal tabular-nums md:min-w-24 md:text-right">
      {formatearPesos(subtotal)}
    </p>
  );
