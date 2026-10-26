import Image from 'next/image';
import Link from 'next/link';
import type { ProductoTienda } from '@/compartido/api/respuestas';
import { formatearPesos } from '@/compartido/formato/moneda';
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
 * principal del formato que elige el backend, marca, nombre y precio con IVA. El botón del
 * carrito llega con SCRUM-116 y la variante profesional con SCRUM-109.
 */
export const TarjetaProducto = ({
  producto,
  tamanos,
  prioridad = false,
}: TarjetaProductoProps) => (
  <article className="group relative flex h-full flex-col rounded-lg border bg-fondo-superficie p-2 pb-4">
    <div className="relative aspect-square overflow-hidden rounded-md bg-fondo-hueso">
      {/* El nombre ya está en el enlace de la tarjeta: la foto no lo repite */}
      <Image
        src={producto.imagen}
        alt=""
        fill
        sizes={tamanos}
        priority={prioridad}
        className="object-cover transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transition-none"
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
    <p className="px-2 pt-3 texto-precio text-marca-profundo">
      {formatearPesos(producto.precio)}
    </p>
  </article>
);

/** Misma estructura y altura que la tarjeta, para que no salte al cargar. */
export const TarjetaProductoEsqueleto = () => (
  <div
    aria-hidden
    className="flex h-full flex-col rounded-lg border bg-fondo-superficie p-2 pb-4"
  >
    <Skeleton className="aspect-square rounded-md" />
    <div className="flex flex-col gap-1 px-2 pt-3">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-6 w-3/4" />
    </div>
    <Skeleton className="mx-2 mt-3 h-6 w-20" />
  </div>
);
