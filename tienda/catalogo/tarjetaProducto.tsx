import { ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { ProductoTienda } from '@/compartido/api/respuestas';
import { formatearPesos } from '@/compartido/formato/moneda';
import { Button } from '@/compartido/ui/button';
import { Skeleton } from '@/compartido/ui/skeleton';
import { urlProducto } from '@/tienda/diseno/enlaces';

/** Ancho de la foto según dónde va la tarjeta, para que next/image baje el tamaño justo. */
export const TAMANOS_FOTO = {
  /** Fila de 5 del inicio (carrusel o 2 columnas en celular). */
  inicio: '(min-width: 1440px) 243px, (min-width: 768px) 18vw, 44vw',
  /** Grilla del catálogo: 4, 3 o 2 columnas. */
  catalogo: '(min-width: 1280px) 310px, (min-width: 768px) 30vw, 45vw',
} as const;

interface TarjetaProductoProps {
  producto: ProductoTienda;
  tamanos: string;
  /** Las primeras tarjetas visibles cargan su foto con prioridad (LCP, RNF-17). */
  prioridad?: boolean;
}

/**
 * Tarjeta de producto minorista (Figma › Componentes › Tarjeta de producto 5:80): foto
 * principal del formato que elige el backend sobre fondo menta, marca, nombre, precio con IVA
 * y botón del carrito. La línea de formatos («2 formatos · desde 300 ml») espera que la API la
 * entregue, y la variante profesional llega con SCRUM-109.
 */
export const TarjetaProducto = ({
  producto,
  tamanos,
  prioridad = false,
}: TarjetaProductoProps) => (
  <article className="group relative flex h-full flex-col rounded-lg border bg-fondo-superficie p-2 pb-4">
    {/* 264 × 240 en Figma. multiply funde el blanco de la foto con el fondo menta */}
    <div className="relative aspect-[11/10] overflow-hidden rounded-md bg-marca-acento-suave">
      {/* El nombre ya está en el enlace de la tarjeta: la foto no lo repite */}
      <Image
        src={producto.imagen}
        alt=""
        fill
        sizes={tamanos}
        priority={prioridad}
        className="object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none"
      />
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
      <p className="texto-precio text-marca-profundo">
        {formatearPesos(producto.precio)}
      </p>
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

/** Misma estructura y altura que la tarjeta, para que no salte al cargar. */
export const TarjetaProductoEsqueleto = () => (
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
      <Skeleton className="h-6 w-20" />
      <Skeleton className="size-11 rounded-full" />
    </div>
  </div>
);
