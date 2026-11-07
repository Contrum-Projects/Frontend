'use client';

import type { CategoriaTienda } from '@/compartido/api/respuestas';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Chip } from '@/compartido/ui/chip';
import { Skeleton } from '@/compartido/ui/skeleton';
import { useCategorias, useMarcas } from '@/panel/catalogo/consultasCatalogo';
import { Elegidas, type Opcion } from './elegidas';
import { type ErroresFiltros, FiltrosCuenta } from './filtrosCuenta';
import { MensajeError } from './mensajeError';
import type { FormularioCampana } from './esquemaCampana';
import { NOMBRES_TIPO, type TipoDestinatario } from './textoSegmento';

type Segmento = FormularioCampana['segmento'];

/** Errores del backend junto a cada parte del segmento. */
export interface ErroresSegmento {
  tipos?: string;
  categorias?: string;
  marcas?: string;
  filtros?: ErroresFiltros;
}

interface SelectorSegmentoProps {
  valor: Segmento;
  alCambiar: (segmento: Segmento) => void;
  errores: ErroresSegmento;
  /** Para los `aria-describedby` de los errores. */
  id: string;
}

const TIPOS = Object.keys(NOMBRES_TIPO) as TipoDestinatario[];

/** Las categorías con sus subcategorías, en orden y con la ruta en el nombre («Cabello › Tinturas»). */
const opcionesCategorias = (
  categorias: CategoriaTienda[],
  padre = '',
): Opcion[] =>
  categorias.flatMap((categoria) => {
    const nombre = padre ? `${padre} › ${categoria.nombre}` : categoria.nombre;
    return [
      { id: categoria.id, nombre },
      ...opcionesCategorias(categoria.subcategorias, nombre),
    ];
  });

/**
 * «¿A quién le llega?» (P7a 2046:1755): uno o más tipos de destinatario y, si se quiere, solo
 * quienes compraron en ciertas categorías o marcas, con varias opciones en cada una (forma del
 * backend, decisión del 6 nov, SCRUM-150). Las categorías y marcas salen del catálogo.
 */
export const SelectorSegmento = ({
  valor,
  alCambiar,
  errores,
  id,
}: SelectorSegmentoProps) => {
  const categorias = useCategorias();
  const marcas = useMarcas();

  const alternarTipo = (tipo: TipoDestinatario, elegido: boolean) =>
    alCambiar({
      ...valor,
      tipos: elegido
        ? TIPOS.filter((t) => t === tipo || valor.tipos.includes(t))
        : valor.tipos.filter((t) => t !== tipo),
    });

  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="mb-3 texto-etiqueta text-texto-principal lg:texto-cuerpo-fuerte">
        ¿A quién le llega?
      </legend>
      <div
        role="group"
        aria-label="Tipos de destinatario"
        aria-describedby={errores.tipos ? `${id}-tipos-error` : undefined}
        className="flex flex-wrap gap-2"
      >
        {TIPOS.map((tipo) => (
          <Chip
            key={tipo}
            type="checkbox"
            name={`${id}-tipos`}
            value={tipo}
            checked={valor.tipos.includes(tipo)}
            onChange={(evento) => alternarTipo(tipo, evento.target.checked)}
          >
            {NOMBRES_TIPO[tipo]}
          </Chip>
        ))}
      </div>
      <MensajeError id={`${id}-tipos-error`} mensaje={errores.tipos} />

      <div className="flex flex-col gap-2">
        <p className="texto-pequeno text-texto-secundario">
          Solo quienes compraron en (opcional):
        </p>
        {categorias.isPending || marcas.isPending ? (
          <div aria-hidden className="flex gap-2">
            <Skeleton className="h-10 w-28 rounded-full" />
            <Skeleton className="h-10 w-24 rounded-full" />
          </div>
        ) : categorias.isError || marcas.isError ? (
          <Alert variant="destructive">
            <AlertDescription>
              {(categorias.error ?? marcas.error)?.message}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <Elegidas
              titulo="Categoría"
              opciones={opcionesCategorias(categorias.data)}
              elegidas={valor.categorias}
              alCambiar={(ids) => alCambiar({ ...valor, categorias: ids })}
              error={errores.categorias}
              id={`${id}-categorias`}
            />
            <Elegidas
              titulo="Marca"
              opciones={marcas.data.map(({ id: valorId, nombre }) => ({
                id: valorId,
                nombre,
              }))}
              elegidas={valor.marcas}
              alCambiar={(ids) => alCambiar({ ...valor, marcas: ids })}
              error={errores.marcas}
              id={`${id}-marcas`}
            />
          </div>
        )}
        <MensajeError
          id={`${id}-categorias-error`}
          mensaje={errores.categorias}
        />
        <MensajeError id={`${id}-marcas-error`} mensaje={errores.marcas} />
      </div>

      <FiltrosCuenta
        id={id}
        valor={valor}
        alCambiar={alCambiar}
        errores={errores.filtros ?? {}}
      />
    </fieldset>
  );
};
