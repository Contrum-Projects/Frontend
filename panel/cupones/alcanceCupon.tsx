'use client';

import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import { Controller, useWatch } from 'react-hook-form';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Chip } from '@/compartido/ui/chip';
import { Skeleton } from '@/compartido/ui/skeleton';
import { useCategorias, useMarcas } from '@/panel/catalogo/consultasCatalogo';
import { Elegidas } from '@/panel/campanas/elegidas';
import { MensajeError } from '@/panel/campanas/mensajeError';
import { opcionesCategorias } from '@/panel/campanas/selectorSegmento';
import {
  BuscadorFormatos,
  nombreDelFormato,
} from '@/panel/packs/buscadorFormatos';
import { Tarjeta } from './camposCupon';
import { usePacksParaCupon } from './consultasCupones';
import {
  ALCANCES,
  type FormularioCupon,
  NOMBRES_ALCANCE,
} from './esquemaCupon';
import type { PropsTarjeta } from './tarjetasCupon';

type Articulo = FormularioCupon['articulos'][number];

/**
 * A qué se aplica el cupón (decisión del 7 nov, SCRUM-150): todo el pedido, ciertos formatos o
 * packs, o los productos de ciertas categorías o marcas. Un pack entra por categoría o marca solo
 * si todos sus productos calzan: eso lo decide el backend.
 */
export const TarjetaAlcance = ({ id, control, errors }: PropsTarjeta) => {
  const alcance = useWatch({ control, name: 'alcance' });
  return (
    <Tarjeta titulo="¿A qué se aplica?">
      <Controller
        control={control}
        name="alcance"
        render={({ field }) => (
          <fieldset className="flex flex-col gap-2">
            <legend className="sr-only">Alcance del cupón</legend>
            <div className="flex flex-wrap gap-2">
              {ALCANCES.map((opcion) => (
                <Chip
                  key={opcion}
                  type="radio"
                  name={`${id}-alcance`}
                  checked={field.value === opcion}
                  onChange={() => field.onChange(opcion)}
                >
                  {NOMBRES_ALCANCE[opcion]}
                </Chip>
              ))}
            </div>
            <MensajeError
              id={`${id}-alcance-error`}
              mensaje={errors.alcance?.message}
            />
          </fieldset>
        )}
      />
      {alcance === 'pedido' && (
        <p className="texto-pequeno text-texto-secundario">
          Descuenta sobre todos los productos del pedido, sin el despacho.
        </p>
      )}
      {alcance === 'articulos' && (
        <Controller
          control={control}
          name="articulos"
          render={({ field }) => (
            <ElegirArticulos
              id={id}
              valor={field.value}
              alCambiar={field.onChange}
              error={errors.articulos?.message}
            />
          )}
        />
      )}
      {alcance === 'categorias_marcas' && (
        <CategoriasYMarcas id={id} control={control} errors={errors} />
      )}
    </Tarjeta>
  );
};

const Pildora = ({
  nombre,
  alQuitar,
}: {
  nombre: string;
  alQuitar: () => void;
}) => (
  <span className="inline-flex min-h-10 items-center gap-1 rounded-full bg-marca-profundo py-2 pr-2 pl-4 texto-etiqueta text-texto-sobre-oscuro">
    {nombre}
    <button
      type="button"
      onClick={alQuitar}
      aria-label={`Quitar ${nombre}`}
      className="-my-2 -mr-2 inline-flex size-10 cursor-pointer items-center justify-center rounded-full hover:bg-marca-acento-suave/20 focus-visible:outline-2 focus-visible:outline-marca-logo"
    >
      <X aria-hidden strokeWidth={1.75} className="size-3.5" />
    </button>
  </span>
);

/** Formatos con el buscador del catálogo y packs de la lista del panel. */
const ElegirArticulos = ({
  id,
  valor,
  alCambiar,
  error,
}: {
  id: string;
  valor: Articulo[];
  alCambiar: (articulos: Articulo[]) => void;
  error?: string;
}) => {
  const [buscando, setBuscando] = useState(false);
  const packs = usePacksParaCupon();
  const opcionesPacks = (packs.data?.items ?? []).map((pack) => ({
    id: pack.id,
    nombre: pack.nombre,
  }));
  const idsPacks = new Set(opcionesPacks.map((p) => p.id));
  const agregar = (articulo: Articulo) =>
    valor.some((a) => a.id === articulo.id)
      ? undefined
      : alCambiar([...valor, articulo]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {valor
          .filter((articulo) => !idsPacks.has(articulo.id))
          .map((articulo) => (
            <Pildora
              key={articulo.id}
              nombre={articulo.nombre}
              alQuitar={() =>
                alCambiar(valor.filter((a) => a.id !== articulo.id))
              }
            />
          ))}
        <button
          type="button"
          onClick={() => setBuscando(true)}
          aria-describedby={error ? `${id}-articulos-error` : undefined}
          className="inline-flex min-h-10 cursor-pointer items-center gap-1 rounded-full px-2 texto-etiqueta text-marca-profundo hover:bg-marca-acento-suave focus-visible:outline-2 focus-visible:outline-marca-profundo"
        >
          <Plus aria-hidden strokeWidth={1.75} className="size-3.5" />
          Formato
        </button>
        {packs.isPending ? (
          <Skeleton aria-hidden className="h-10 w-20 rounded-full" />
        ) : (
          <Elegidas
            titulo="Pack"
            opciones={opcionesPacks}
            elegidas={valor.filter((a) => idsPacks.has(a.id)).map((a) => a.id)}
            alCambiar={(ids) =>
              alCambiar([
                ...valor.filter((a) => !idsPacks.has(a.id)),
                ...opcionesPacks.filter((p) => ids.includes(p.id)),
              ])
            }
            error={error}
            id={`${id}-packs`}
          />
        )}
      </div>
      {packs.isError && (
        <Alert variant="destructive">
          <AlertDescription>{packs.error.message}</AlertDescription>
        </Alert>
      )}
      <MensajeError id={`${id}-articulos-error`} mensaje={error} />
      <BuscadorFormatos
        abierto={buscando}
        alCambiarAbierto={setBuscando}
        agregados={valor.map((a) => a.id)}
        destino="el cupón"
        aviso={null}
        alAgregar={(formato) =>
          agregar({ id: formato.formatoId, nombre: nombreDelFormato(formato) })
        }
      />
    </div>
  );
};

const CategoriasYMarcas = ({
  id,
  control,
  errors,
}: Pick<PropsTarjeta, 'id' | 'control' | 'errors'>) => {
  const categorias = useCategorias();
  const marcas = useMarcas();
  if (categorias.isPending || marcas.isPending) {
    return (
      <div aria-hidden className="flex gap-2">
        <Skeleton className="h-10 w-28 rounded-full" />
        <Skeleton className="h-10 w-24 rounded-full" />
      </div>
    );
  }
  if (categorias.isError || marcas.isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {(categorias.error ?? marcas.error)?.message}
        </AlertDescription>
      </Alert>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      <p className="texto-pequeno text-texto-secundario">
        Productos de alguna de estas categorías (con sus subcategorías) o
        marcas:
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Controller
          control={control}
          name="categorias"
          render={({ field }) => (
            <Elegidas
              titulo="Categoría"
              opciones={opcionesCategorias(categorias.data)}
              elegidas={field.value}
              alCambiar={field.onChange}
              error={errors.categorias?.message}
              id={`${id}-categorias`}
            />
          )}
        />
        <Controller
          control={control}
          name="marcas"
          render={({ field }) => (
            <Elegidas
              titulo="Marca"
              opciones={marcas.data.map(({ id: marcaId, nombre }) => ({
                id: marcaId,
                nombre,
              }))}
              elegidas={field.value}
              alCambiar={field.onChange}
              error={errors.marcas?.message}
              id={`${id}-marcas`}
            />
          )}
        />
      </div>
      <MensajeError
        id={`${id}-categorias-error`}
        mensaje={errors.categorias?.message}
      />
      <MensajeError
        id={`${id}-marcas-error`}
        mensaje={errors.marcas?.message}
      />
    </div>
  );
};
