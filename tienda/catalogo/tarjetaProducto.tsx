import { ArrowRight, BadgeCheck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type {
  ProductoTienda,
  ProductoTiendaProfesional,
} from '@/compartido/api/respuestas';
import { formatearPesos } from '@/compartido/formato/moneda';
import { Skeleton } from '@/compartido/ui/skeleton';
import { urlProducto } from '@/tienda/diseno/enlaces';
import { InsigniaExclusivo } from '@/tienda/profesional/insignias';
import { precioNormalTachado } from '@/tienda/profesional/precio';

/** Ancho de la foto según dónde va la tarjeta, para que next/image baje el tamaño justo. */
export const TAMANOS_FOTO = {
  /** Fila de 5 del inicio (carrusel o 2 columnas en celular). */
  inicio: '(min-width: 1440px) 243px, (min-width: 768px) 18vw, 44vw',
  /** Grilla del catálogo: 4, 3 o 2 columnas. */
  // 3 por fila junto a la columna de filtros (lg) y sin ella (md)
  catalogo:
    '(min-width: 1280px) 330px, (min-width: 1024px) 22vw, (min-width: 768px) 30vw, 45vw',
} as const;

/**
 * Marco de las tarjetas de pack (SCRUM-150; las de producto cambiaron con SCRUM-157): en reposo una sombra tenue; al pasar
 * el mouse o con el foco dentro se eleva, sube 2 px y el borde toma el menta. Sin movimiento con
 * `prefers-reduced-motion`.
 */
export const MARCO_TARJETA =
  'group relative flex h-full flex-col rounded-lg border bg-fondo-superficie p-2 pb-4 shadow-tarjeta transition-[box-shadow,transform,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-marca-acento-suave hover:shadow-tarjeta-elevada focus-within:border-marca-acento-suave focus-within:shadow-tarjeta-elevada motion-reduce:transition-none motion-reduce:hover:translate-y-0';

/** El esqueleto con el mismo marco en reposo, para que nada salte al cargar. */
export const MARCO_TARJETA_ESQUELETO =
  'flex h-full flex-col rounded-lg border bg-fondo-superficie p-2 pb-4 shadow-tarjeta';

interface TarjetaProductoProps {
  producto: ProductoTienda | ProductoTiendaProfesional;
  tamanos: string;
  /** Las primeras tarjetas visibles cargan su foto con prioridad (LCP, RNF-17). */
  prioridad?: boolean;
}

/**
 * Tarjeta de producto (SCRUM-157, mezcla de los estilos «Limpia» y «Flotante» elegida el
 * 11-11-2026): la foto vertical arriba y debajo, sobre fondo de superficie, la marca, el nombre,
 * el precio con IVA y «Ver producto»; esquinas amplias y sombra tenue que sube al pasar el mouse.
 * Toda la tarjeta lleva a la ficha. Si el backend entrega el mayorista (sesión profesional,
 * SCRUM-109), muestra ese precio y marca los exclusivos.
 */
export const TarjetaProducto = ({
  producto,
  tamanos,
  prioridad = false,
}: TarjetaProductoProps) => {
  const profesional = 'precioMayorista' in producto ? producto : null;
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl bg-fondo-superficie shadow-tarjeta transition-shadow duration-300 focus-within:shadow-tarjeta-elevada hover:shadow-tarjeta-elevada motion-reduce:transition-none">
      <div className="relative aspect-[4/5] overflow-hidden bg-marca-acento-suave">
        {/* El nombre ya está en el enlace de la tarjeta: la foto no lo repite */}
        <Image
          src={producto.imagen}
          alt=""
          fill
          sizes={tamanos}
          priority={prioridad}
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none"
        />
        {profesional?.exclusivo && <InsigniaExclusivo />}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-3 md:p-4">
        <div className="flex min-w-0 flex-col">
          {producto.marca && (
            <p className="truncate texto-leyenda text-texto-secundario">
              {producto.marca.nombre}
            </p>
          )}
          <h3 className="line-clamp-2 texto-cuerpo-fuerte text-texto-principal">
            <Link
              href={urlProducto(producto.id)}
              className="outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-marca-profundo"
            >
              {producto.nombre}
            </Link>
          </h3>
          {'precioMayorista' in producto ? (
            <PrecioProfesional
              precio={producto.precioMayorista}
              antes={precioNormalTachado(producto)}
            />
          ) : (
            <p className="mt-1 texto-cuerpo-fuerte text-marca-profundo tabular-nums">
              {formatearPesos(producto.precio)}
            </p>
          )}
        </div>
        <div className="mt-auto flex">
          {/* Señal visual del enlace de la tarjeta (el del nombre la cubre entera): un clic aquí
              abre la ficha y el teclado y los lectores usan ese enlace, sin repetirlo */}
          <span
            aria-hidden
            className="inline-flex h-10 min-w-0 flex-1 items-center justify-center gap-1 overflow-hidden rounded-full border-[1.5px] border-fondo-hueso-oscuro px-3 texto-etiqueta whitespace-nowrap text-marca-profundo transition-colors group-hover:border-marca-profundo group-hover:bg-marca-acento-suave motion-reduce:transition-none"
          >
            Ver producto
            <ArrowRight
              className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
              strokeWidth={1.75}
            />
          </span>
        </div>
      </div>
    </article>
  );
};

/**
 * Precio mayorista con IVA (Figma 5:127): en celular dice solo «Profesional». Sin mínimo de
 * unidades (SCRUM-146). Con `antes`, el precio normal va tachado al lado, como una oferta
 * (SCRUM-157); los dos llevan su nombre oculto porque el tachado no se lee en voz alta.
 */
const PrecioProfesional = ({
  precio,
  antes,
}: {
  precio: number;
  antes: number | null;
}) => (
  <div className="mt-1 flex min-w-0 flex-col">
    <p className="flex items-center gap-1 texto-leyenda text-marca-profundo">
      <BadgeCheck
        aria-hidden
        strokeWidth={1.75}
        className="size-3.5 shrink-0"
      />
      <span className="md:hidden">Profesional</span>
      <span className="hidden md:inline">Precio profesional</span>
    </p>
    <p className="flex flex-wrap items-baseline gap-x-2">
      <span className="texto-cuerpo-fuerte text-marca-profundo tabular-nums">
        {antes !== null && (
          <span className="sr-only">Precio profesional: </span>
        )}
        {formatearPesos(precio)}
      </span>
      {antes !== null && (
        <s className="texto-leyenda text-texto-secundario tabular-nums">
          <span className="sr-only">Precio normal: </span>
          {formatearPesos(antes)}
        </s>
      )}
    </p>
  </div>
);

/**
 * Misma forma que la tarjeta, para que no salte al cargar. `profesional`: con las dos líneas del
 * precio profesional.
 */
export const TarjetaProductoEsqueleto = ({
  profesional = false,
}: {
  profesional?: boolean;
}) => (
  <div
    aria-hidden
    className="flex h-full flex-col overflow-hidden rounded-xl bg-fondo-superficie shadow-tarjeta"
  >
    <Skeleton className="aspect-[4/5] rounded-none" />
    <div className="flex p-3 md:p-4">
      <div className="flex flex-1 flex-col gap-1">
        <Skeleton className="h-3 w-14" />
        <Skeleton className="h-5 w-3/4" />
        {profesional && <Skeleton className="h-3 w-20" />}
        <Skeleton className="h-5 w-16" />
        <Skeleton className="mt-2 h-10 rounded-full" />
      </div>
    </div>
  </div>
);
