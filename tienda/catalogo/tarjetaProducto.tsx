import { BadgeCheck } from 'lucide-react';
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
import { BotonAgregarTarjeta } from './botonAgregarTarjeta';

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
 * 11-11-2026): la foto vertical sin caja, con esquinas amplias, y encima un panel de vidrio
 * esmerilado con la marca, el nombre y el precio con IVA. Toda la tarjeta lleva a la ficha; el
 * botón del panel agrega al carrito (o lleva a elegir formato si hay varios). Si el backend
 * entrega el mayorista (sesión profesional, SCRUM-109), muestra ese precio y marca los exclusivos.
 */
export const TarjetaProducto = ({
  producto,
  tamanos,
  prioridad = false,
}: TarjetaProductoProps) => {
  const profesional = 'precioMayorista' in producto ? producto : null;
  return (
    <article className="group relative">
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-marca-acento-suave">
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
        <div className="absolute inset-x-2 bottom-2 flex items-end justify-between gap-2 rounded-lg border border-fondo-superficie/60 bg-fondo-superficie/85 p-3 backdrop-blur-md md:inset-x-3 md:bottom-3 md:gap-3 md:px-4">
          <div className="flex min-w-0 flex-col">
            {producto.marca && (
              <p className="truncate texto-leyenda text-texto-secundario">
                {producto.marca.nombre}
              </p>
            )}
            <h3 className="line-clamp-2 texto-cuerpo-fuerte text-texto-principal">
              <Link
                href={urlProducto(producto.id)}
                className="outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-marca-profundo"
              >
                {producto.nombre}
              </Link>
            </h3>
            {'precioMayorista' in producto ? (
              <PrecioProfesional precio={producto.precioMayorista} />
            ) : (
              <p className="mt-0.5 texto-cuerpo-fuerte text-marca-profundo tabular-nums">
                {formatearPesos(producto.precio)}
              </p>
            )}
          </div>
          <BotonAgregarTarjeta
            productoId={producto.id}
            nombre={producto.nombre}
            formatoId={producto.formatoId}
            formatos={producto.formatos}
          />
        </div>
      </div>
    </article>
  );
};

/**
 * Precio mayorista con IVA (Figma 5:127): en celular dice solo «Profesional». Sin mínimo de
 * unidades (SCRUM-146).
 */
const PrecioProfesional = ({ precio }: { precio: number }) => (
  <div className="mt-0.5 flex min-w-0 flex-col">
    <p className="flex items-center gap-1 texto-leyenda text-marca-profundo">
      <BadgeCheck
        aria-hidden
        strokeWidth={1.75}
        className="size-3.5 shrink-0"
      />
      <span className="md:hidden">Profesional</span>
      <span className="hidden md:inline">Precio profesional</span>
    </p>
    <p className="texto-cuerpo-fuerte text-marca-profundo tabular-nums">
      {formatearPesos(precio)}
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
    className="relative aspect-[4/5] overflow-hidden rounded-xl bg-fondo-hueso-oscuro/60"
  >
    <div className="absolute inset-x-2 bottom-2 flex items-end justify-between gap-2 rounded-lg bg-fondo-superficie/85 p-3 md:inset-x-3 md:bottom-3 md:px-4">
      <div className="flex flex-1 flex-col gap-1">
        <Skeleton className="h-3 w-14" />
        <Skeleton className="h-5 w-3/4" />
        {profesional && <Skeleton className="h-3 w-20" />}
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="size-10 rounded-full" />
    </div>
  </div>
);
