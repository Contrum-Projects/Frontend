import { ArrowRight, BadgeCheck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { ComponentProps } from 'react';
import type { PackTienda } from '@/compartido/api/respuestas';
import { cn } from '@/compartido/lib/utils';
import { Skeleton } from '@/compartido/ui/skeleton';
import { RUTAS } from '@/tienda/diseno/enlaces';
import { BannerPack } from './bannerPack';
import { leerPacks } from './consultas';

/**
 * Promociones del inicio: el banner destaca el pack vigente que vence antes (los packs son las
 * promociones del backend, E3-H6). Al lado, en escritorio, las tarjetas de packs y de precio
 * profesional. Sin packs no hay banner: en escritorio las tarjetas ocupan la fila y en celular la
 * de packs toma el lugar del banner, con su misma altura, para que la página no salte al cargar.
 */
export async function Promociones() {
  const packs = await leerPacks(10).catch(() => null);
  const destacado = packs ? packDestacado(packs.items) : undefined;

  return (
    <section
      aria-label="Promociones"
      className="mx-auto flex max-w-[1440px] gap-6 px-4 pt-4 md:px-16 md:pt-6"
    >
      {destacado && <BannerPack pack={destacado} />}
      <div
        className={cn(
          'gap-6 md:flex',
          destacado
            ? 'hidden w-[420px] shrink-0 flex-col'
            : 'flex h-[210px] flex-1 md:h-auto md:min-h-48',
        )}
      >
        <TarjetaPacks imagen={packs?.items[0]?.imagen} />
        {/* En celular, el aviso de precio profesional va más abajo (AvisoProfesionalCelular) */}
        <TarjetaProfesional className="hidden md:flex" />
      </div>
    </section>
  );
}

/** El que vence antes; los que no tienen término, al final (el listado viene por nombre). */
const packDestacado = (packs: PackTienda[]) =>
  packs.toSorted((a, b) =>
    (a.vigenteHasta ?? '9999-12-31').localeCompare(
      b.vigenteHasta ?? '9999-12-31',
    ),
  )[0];

const TarjetaPacks = ({ imagen }: { imagen?: string }) => (
  <div className="relative flex flex-1 overflow-hidden rounded-xl bg-fondo-hueso-oscuro p-6 md:p-8">
    <div className="relative z-10 flex max-w-56 flex-col items-start gap-2">
      <h2 className="titulo-h2 text-texto-principal">Packs</h2>
      <p className="texto-pequeno text-texto-secundario">
        Shampoo, acondicionador y mascarilla juntos.
      </p>
      <EnlaceFlecha href={RUTAS.packs}>Ver packs</EnlaceFlecha>
    </div>
    {imagen && (
      <div className="absolute top-3 -right-2 size-32 md:size-[180px]">
        <Image
          src={imagen}
          alt=""
          fill
          sizes="(min-width: 768px) 180px, 128px"
          className="rounded-lg object-cover"
        />
      </div>
    )}
  </div>
);

const TarjetaProfesional = ({ className }: { className?: string }) => (
  <div
    className={cn(
      'flex flex-1 flex-col items-start gap-2 rounded-xl bg-marca-acento-suave p-8',
      className,
    )}
  >
    <BadgeCheck
      className="size-6 text-marca-profundo"
      strokeWidth={1.75}
      aria-hidden
    />
    <h2 className="titulo-h2 text-texto-principal">Precio profesional</h2>
    <p className="max-w-56 texto-pequeno text-texto-secundario">
      Para peluqueros con cuenta verificada.
    </p>
    <EnlaceFlecha href={RUTAS.verificacion}>Verificar mi cuenta</EnlaceFlecha>
  </div>
);

/** Versión del celular: va entre «Más vendidos» y «Novedades» (Figma 2017:1355). */
export const AvisoProfesionalCelular = () => (
  <div className="px-4 pt-6 md:hidden">
    <Link
      href={RUTAS.precioProfesional}
      className="flex items-center gap-3 rounded-lg bg-marca-acento-suave px-4 py-3"
    >
      <BadgeCheck
        className="size-6 shrink-0 text-marca-profundo"
        strokeWidth={1.75}
        aria-hidden
      />
      <span className="flex flex-1 flex-col">
        <span className="texto-cuerpo-fuerte text-marca-profundo">
          Precio profesional
        </span>
        <span className="texto-leyenda text-texto-principal">
          Para peluqueros verificados
        </span>
      </span>
      <ArrowRight
        className="size-5 text-marca-profundo"
        strokeWidth={1.75}
        aria-hidden
      />
    </Link>
  </div>
);

const EnlaceFlecha = ({
  href,
  children,
}: {
  href: ComponentProps<typeof Link>['href'];
  children: string;
}) => (
  <Link
    href={href}
    className="mt-1 flex items-center gap-1 rounded-md texto-etiqueta text-marca-profundo hover:underline"
  >
    {children}
    <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden />
  </Link>
);

export const PromocionesEsqueleto = () => (
  <div
    aria-hidden
    className="mx-auto flex max-w-[1440px] gap-6 px-4 pt-4 md:px-16 md:pt-6"
  >
    <Skeleton className="h-[210px] flex-1 rounded-xl md:h-[400px]" />
    <div className="hidden w-[420px] flex-col gap-6 md:flex">
      <Skeleton className="flex-1 rounded-xl" />
      <Skeleton className="flex-1 rounded-xl" />
    </div>
  </div>
);
