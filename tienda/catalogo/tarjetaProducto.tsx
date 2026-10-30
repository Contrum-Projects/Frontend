import { BadgeCheck, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type {
  ProductoTienda,
  ProductoTiendaProfesional,
} from '@/compartido/api/respuestas';
import { formatearPesos } from '@/compartido/formato/moneda';
import { Button } from '@/compartido/ui/button';
import { Skeleton } from '@/compartido/ui/skeleton';
import { urlProducto } from '@/tienda/diseno/enlaces';
import { InsigniaExclusivo } from '@/tienda/profesional/insignias';
import { MINIMO_PROFESIONAL } from '@/tienda/profesional/precio';

/** Ancho de la foto según dónde va la tarjeta, para que next/image baje el tamaño justo. */
export const TAMANOS_FOTO = {
  /** Fila de 5 del inicio (carrusel o 2 columnas en celular). */
  inicio: '(min-width: 1440px) 243px, (min-width: 768px) 18vw, 44vw',
  /** Grilla del catálogo: 4, 3 o 2 columnas. */
  // 3 por fila junto a la columna de filtros (lg) y sin ella (md)
  catalogo:
    '(min-width: 1280px) 330px, (min-width: 1024px) 22vw, (min-width: 768px) 30vw, 45vw',
} as const;

interface TarjetaProductoProps {
  producto: ProductoTienda | ProductoTiendaProfesional;
  tamanos: string;
  /** Las primeras tarjetas visibles cargan su foto con prioridad (LCP, RNF-17). */
  prioridad?: boolean;
}

/**
 * Tarjeta de producto (Figma › Componentes › Tarjeta de producto, minorista 5:80 y profesional
 * 5:107): foto principal del formato que elige el backend sobre fondo menta, marca, nombre,
 * precio con IVA y botón del carrito. Si el backend entrega el mayorista (sesión profesional,
 * SCRUM-109), muestra ese precio con «Mín. 3 unidades» y marca los exclusivos. La línea de
 * formatos («2 formatos · desde 300 ml») espera que la API la entregue.
 */
export const TarjetaProducto = ({
  producto,
  tamanos,
  prioridad = false,
}: TarjetaProductoProps) => {
  const profesional = 'precioMayorista' in producto ? producto : null;
  return (
    <article className="group relative flex h-full flex-col rounded-lg border bg-fondo-superficie p-2 pb-4">
      {/* 264 × 240 en Figma (11:10). Las fotos van en esa proporción; el menta se ve mientras cargan */}
      <div className="relative aspect-[11/10] overflow-hidden rounded-md bg-marca-acento-suave">
        {/* El nombre ya está en el enlace de la tarjeta: la foto no lo repite */}
        <Image
          src={producto.imagen}
          alt=""
          fill
          sizes={tamanos}
          priority={prioridad}
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none"
        />
        {profesional?.exclusivo && <InsigniaExclusivo />}
      </div>
      <div className="flex flex-1 flex-col gap-1 px-2 pt-3">
        {producto.marca && (
          <p className="texto-sobretitulo text-texto-secundario">
            {producto.marca.nombre}
          </p>
        )}
        <h3 className="titulo-h3 text-texto-principal">
          <Link
            href={urlProducto(producto.id)}
            className="rounded-md outline-none after:absolute after:inset-0 after:rounded-lg focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-marca-profundo"
          >
            {producto.nombre}
          </Link>
        </h3>
      </div>
      <div className="flex items-end justify-between gap-2 px-2 pt-3">
        {'precioMayorista' in producto ? (
          <PrecioProfesional precio={producto.precioMayorista} />
        ) : (
          <p className="texto-precio text-marca-profundo">
            {formatearPesos(producto.precio)}
          </p>
        )}
        {/* TODO(SCRUM-116): agregar al carrito. Deshabilitado, el clic pasa al enlace de la tarjeta */}
        <Button
          type="button"
          size="icono"
          className="size-11"
          disabled
          aria-label={`Agregar ${producto.nombre} al carrito`}
        >
          <ShoppingCart aria-hidden />
        </Button>
      </div>
    </article>
  );
};

/**
 * Precio mayorista con IVA (Figma 5:127; en celular, la tarjeta compacta 9:776 dice solo
 * «Profesional»). Puede encogerse: a 360 px la columna mide unos 70 px. El mínimo lo exige el
 * backend al comprar.
 */
const PrecioProfesional = ({ precio }: { precio: number }) => (
  <div className="flex min-w-0 flex-1 flex-col">
    <p className="flex items-center gap-1 texto-leyenda text-marca-profundo">
      <BadgeCheck
        aria-hidden
        strokeWidth={1.75}
        className="size-3.5 shrink-0"
      />
      <span className="md:hidden">Profesional</span>
      <span className="hidden md:inline">Precio profesional</span>
    </p>
    <p className="texto-precio text-marca-profundo">{formatearPesos(precio)}</p>
    <p className="texto-leyenda text-texto-secundario">
      Mín. {MINIMO_PROFESIONAL} unidades
    </p>
  </div>
);

/**
 * Misma estructura y altura que la tarjeta, para que no salte al cargar. `profesional`: con las
 * tres líneas del precio profesional.
 */
export const TarjetaProductoEsqueleto = ({
  profesional = false,
}: {
  profesional?: boolean;
}) => (
  <div
    aria-hidden
    className="flex h-full flex-col rounded-lg border bg-fondo-superficie p-2 pb-4"
  >
    <Skeleton className="aspect-[11/10] rounded-md" />
    <div className="flex flex-col gap-1 px-2 pt-3">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-6 w-3/4" />
    </div>
    <div className="flex items-end justify-between px-2 pt-3">
      {profesional ? (
        <div className="flex flex-col gap-1">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      ) : (
        <Skeleton className="h-6 w-20" />
      )}
      <Skeleton className="size-11 rounded-full" />
    </div>
  </div>
);
