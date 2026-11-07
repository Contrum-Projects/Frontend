import Image from 'next/image';
import Link from 'next/link';
import { connection } from 'next/server';
import { apiServidor } from '@/compartido/api/servidor';
import { ErrorDeApi, exigir } from '@/compartido/api/errores';
import type {
  ListadoPacksTienda,
  PackTienda,
} from '@/compartido/api/respuestas';
import { formatearDiaMes } from '@/compartido/formato/fecha';
import { formatearPesos } from '@/compartido/formato/moneda';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Button } from '@/compartido/ui/button';
import { Skeleton } from '@/compartido/ui/skeleton';
import { BotonCargarMas } from '@/tienda/catalogo/botonCargarMas';
import { type Miga, Migas } from '@/tienda/catalogo/migas';
import {
  MAXIMO_PAGINAS,
  POR_PAGINA,
} from '@/tienda/catalogo/parametrosCatalogo';
import {
  MARCO_TARJETA,
  MARCO_TARJETA_ESQUELETO,
  TAMANOS_FOTO,
} from '@/tienda/catalogo/tarjetaProducto';
import { RUTAS, urlCatalogo, urlPack } from '@/tienda/diseno/enlaces';

/** 4 por fila en escritorio (sin columna de filtros), 3 en tableta y 2 en celular. */
const CLASE_GRILLA =
  'grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4';

const MIGAS: Miga[] = [
  { texto: 'Inicio', href: '/' },
  { texto: 'Packs', href: RUTAS.packs },
];

/** `?pagina=N` muestra las páginas 1 a N, como el catálogo; lo inválido es la primera. */
export const leerPaginas = (valor: string | string[] | undefined) => {
  const pagina = Number(Array.isArray(valor) ? valor[0] : valor);
  return Number.isInteger(pagina)
    ? Math.min(Math.max(pagina, 1), MAXIMO_PAGINAS)
    : 1;
};

/** Las páginas 1 a `paginas` del listado de packs vigentes, juntas. */
async function leerPaginasPacks(paginas: number): Promise<ListadoPacksTienda> {
  await connection();
  const listados = await Promise.all(
    Array.from({ length: paginas }, async (_, indice) =>
      exigir<ListadoPacksTienda>(
        await apiServidor().GET('/api/tienda/packs', {
          params: { query: { pagina: indice + 1, limite: POR_PAGINA } },
        }),
      ),
    ),
  );
  return {
    ...listados[0],
    items: listados.flatMap((listado) => listado.items),
  };
}

/**
 * Packs de la tienda (`/packs`). Figma no dibuja esta página: sigue el catálogo (migas, título
 * con el total, grilla y «Cargar más») con una tarjeta propia del pack. El backend decide cuáles
 * entran (vigentes y a la venta) y su precio con IVA; es el precio de visitante, como el banner
 * del inicio: el profesional ve su precio y los packs exclusivos en la ficha.
 */
export async function ListaPacks({ paginas }: { paginas: number }) {
  let listado: ListadoPacksTienda;
  try {
    listado = await leerPaginasPacks(paginas);
  } catch (error) {
    return (
      <Marco>
        <Alert variant="aviso">
          <AlertDescription>
            {error instanceof ErrorDeApi && error.estado < 500
              ? error.message
              : 'No pudimos cargar los packs. Intenta de nuevo en unos minutos.'}
          </AlertDescription>
        </Alert>
      </Marco>
    );
  }

  return (
    <Marco total={listado.total}>
      {listado.items.length === 0 ? (
        <SinPacks />
      ) : (
        <div>
          <ul className={CLASE_GRILLA}>
            {listado.items.map((pack, i) => (
              <li key={pack.id}>
                <TarjetaPack pack={pack} prioridad={i < 4} />
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-col items-center gap-3 md:mt-12">
            <p className="texto-pequeno text-texto-secundario">
              Mostrando {listado.items.length} de {listado.total} packs
            </p>
            {listado.items.length < listado.total &&
              paginas < MAXIMO_PAGINAS && (
                <BotonCargarMas
                  href={`${RUTAS.packs}?pagina=${paginas + 1}`}
                  texto="Cargar más packs"
                />
              )}
          </div>
        </div>
      )}
    </Marco>
  );
}

const Marco = ({
  total,
  children,
}: {
  total?: number;
  children: React.ReactNode;
}) => (
  <main className="mx-auto max-w-[1440px] px-4 pt-4 pb-12 md:px-16 md:pt-8 md:pb-16">
    <Migas migas={MIGAS} />
    <div className="mt-2 mb-6 flex flex-wrap items-baseline gap-x-4 gap-y-1 md:mb-8">
      <h1 className="titulo-h2 text-texto-principal md:titulo-h1">Packs</h1>
      {total !== undefined && total > 0 && (
        <p className="texto-pequeno text-texto-secundario">
          {total === 1 ? '1 pack' : `${total} packs`}
        </p>
      )}
    </div>
    {children}
  </main>
);

/** «Shampoo 300 ml + Acondicionador 300 ml», con «2 ×» cuando lleva más de uno. */
const textoComponentes = (pack: PackTienda) =>
  pack.componentes
    .map(
      ({ producto, formato, cantidad }) =>
        `${cantidad > 1 ? `${cantidad} × ` : ''}${producto} ${formato}`,
    )
    .join(' + ');

/**
 * Tarjeta de pack: la misma caja que la tarjeta de producto (foto sobre menta, nombre y precio)
 * con lo que trae el pack y su último día. Toda la tarjeta lleva a la ficha, donde se agrega al
 * carrito.
 */
const TarjetaPack = ({
  pack,
  prioridad,
}: {
  pack: PackTienda;
  prioridad: boolean;
}) => (
  <article className={MARCO_TARJETA}>
    <div className="relative aspect-[11/10] overflow-hidden rounded-md bg-marca-acento-suave">
      <Image
        src={pack.imagen}
        alt=""
        fill
        sizes={TAMANOS_FOTO.catalogo}
        priority={prioridad}
        className="object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none"
      />
    </div>
    <div className="flex flex-1 flex-col gap-1 px-2 pt-3">
      {pack.vigenteHasta && (
        <p className="texto-sobretitulo text-texto-secundario">
          Hasta el {formatearDiaMes(pack.vigenteHasta)}
        </p>
      )}
      <h2 className="titulo-h3 text-texto-principal">
        <Link
          href={urlPack(pack.id)}
          className="rounded-md outline-none after:absolute after:inset-0 after:rounded-lg focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-marca-profundo"
        >
          {pack.nombre}
        </Link>
      </h2>
      {pack.componentes.length > 0 && (
        <p className="line-clamp-2 texto-pequeno text-texto-secundario">
          {textoComponentes(pack)}
        </p>
      )}
    </div>
    <p className="px-2 pt-3 texto-precio text-marca-profundo">
      {formatearPesos(pack.precio)}
    </p>
  </article>
);

/** Sin packs vigentes: se dice y se ofrece el catálogo, sin prometer cuándo habrá. */
const SinPacks = () => (
  <div className="flex flex-col items-start gap-4 rounded-xl bg-fondo-hueso-oscuro p-6 md:p-8">
    <p className="texto-cuerpo text-texto-principal">
      No hay packs a la venta en este momento.
    </p>
    <Button variant="contorno" asChild>
      <Link href={urlCatalogo({})}>Ver el catálogo</Link>
    </Button>
  </div>
);

/** Misma caja que la página, para que nada salte al cargar (RNF-17). */
export const ListaPacksEsqueleto = () => (
  <main className="mx-auto max-w-[1440px] px-4 pt-4 pb-12 md:px-16 md:pt-8 md:pb-16">
    <Migas migas={MIGAS} />
    <div className="mt-2 mb-6 md:mb-8">
      <h1 className="titulo-h2 text-texto-principal md:titulo-h1">Packs</h1>
    </div>
    <ul aria-hidden className={CLASE_GRILLA}>
      {Array.from({ length: 8 }, (_, i) => (
        <li key={i}>
          <div className={MARCO_TARJETA_ESQUELETO}>
            <Skeleton className="aspect-[11/10] rounded-md" />
            <div className="flex flex-col gap-1 px-2 pt-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </div>
            <Skeleton className="mx-2 mt-3 h-6 w-20" />
          </div>
        </li>
      ))}
    </ul>
  </main>
);
