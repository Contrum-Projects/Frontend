import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { PackTienda } from '@/compartido/api/respuestas';
import { formatearDiaMes } from '@/compartido/formato/fecha';
import { Button } from '@/compartido/ui/button';
import { urlPack } from '@/tienda/diseno/enlaces';

/**
 * Destellos del banner (Figma › 01 Inicio 2016:1263-1267 y celular 2017:1260-1262). En celular
 * se ven tres, más chicos; en escritorio, los cinco.
 */
const DESTELLOS = [
  {
    src: '/tienda/destello-1.svg',
    lado: 34,
    clase:
      'top-4 right-[136px] size-[22px] md:top-10 md:right-[392px] md:size-[34px]',
  },
  {
    src: '/tienda/destello-2.svg',
    lado: 20,
    clase: 'top-3 right-4 size-[14px] md:top-5 md:right-6 md:size-5',
  },
  {
    src: '/tienda/destello-3.svg',
    lado: 18,
    clase:
      'bottom-7 right-[138px] size-3 md:bottom-16 md:right-[354px] md:size-[18px]',
  },
  {
    src: '/tienda/destello-4.svg',
    lado: 28,
    clase: 'hidden md:block bottom-8 right-11',
  },
  {
    src: '/tienda/destello-5.svg',
    lado: 12,
    clase: 'hidden md:block top-5 right-[170px]',
  },
] as const;

/**
 * Banner principal del inicio (Figma 2016:1238 y 2017:1243) con un pack vigente: nombre, último
 * día de la promoción, enlace a su ficha y su foto en el arco.
 */
export const BannerPack = ({ pack }: { pack: PackTienda }) => (
  <div className="relative flex h-[210px] flex-1 items-center overflow-hidden rounded-xl bg-marca-profundo px-6 md:h-[400px] md:px-14">
    <div className="relative z-10 flex max-w-[55%] flex-col items-start gap-2 md:max-w-[52%] md:gap-3">
      <h2 className="titulo-h2 font-light text-texto-sobre-oscuro md:display-celular">
        {pack.nombre}
      </h2>
      {pack.vigenteHasta && (
        <p className="texto-leyenda text-texto-sobre-oscuro md:texto-pequeno">
          Hasta el {formatearDiaMes(pack.vigenteHasta)}
        </p>
      )}
      <Button variant="acento" asChild className="mt-2 md:h-14 md:px-7">
        <Link href={urlPack(pack.id)}>
          Ver pack
          <ArrowRight aria-hidden />
        </Link>
      </Button>
    </div>
    <div className="absolute right-4 bottom-0 h-[180px] w-[120px] overflow-hidden rounded-t-full bg-fondo-hueso md:right-[180px] md:bottom-12 md:h-[280px] md:w-[170px] md:rounded-b-lg">
      <Image
        src={pack.imagen}
        alt=""
        fill
        priority
        sizes="(min-width: 768px) 170px, 120px"
        className="object-cover"
      />
    </div>
    {DESTELLOS.map((destello) => (
      <Image
        key={destello.src}
        src={destello.src}
        alt=""
        aria-hidden
        unoptimized
        width={destello.lado}
        height={destello.lado}
        className={`pointer-events-none absolute ${destello.clase}`}
      />
    ))}
  </div>
);
