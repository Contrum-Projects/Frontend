import { codigoCorto } from '@/compartido/api/errores';
import { formatearFechaHora } from '@/compartido/formato/fecha';
import { cn } from '@/compartido/lib/utils';
import { Badge } from '@/compartido/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/compartido/ui/table';
import type { RegistroError } from './consultasRegistroErrores';
import { NOMBRE_ORIGEN } from './textosRegistroErrores';

export const OrigenError = ({
  origen,
}: {
  origen: RegistroError['origen'];
}) => (
  <Badge
    className={cn(
      'texto-leyenda',
      origen === 'api'
        ? 'bg-marca-acento-suave text-marca-profundo'
        : 'bg-fondo-hueso-oscuro text-texto-principal',
    )}
  >
    {NOMBRE_ORIGEN[origen]}
  </Badge>
);

const ENCABEZADO = 'px-3 texto-leyenda text-texto-secundario';

interface ListaProps {
  errores: RegistroError[];
  alAbrir: (error: RegistroError) => void;
}

/** Botón que abre el detalle: el componente, que es lo que se busca primero. */
const AbrirDetalle = ({
  error,
  alAbrir,
}: {
  error: RegistroError;
  alAbrir: (error: RegistroError) => void;
}) => (
  <button
    type="button"
    onClick={() => alAbrir(error)}
    className="cursor-pointer truncate text-left texto-etiqueta text-texto-principal outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/60"
  >
    {error.componente}
  </button>
);

/** Escritorio: cuándo, dónde, qué pasó, origen y código. */
export const TablaRegistroErrores = ({ errores, alAbrir }: ListaProps) => (
  <Table className="table-fixed">
    <TableHeader>
      <TableRow className="hover:bg-transparent">
        <TableHead className={cn('w-40', ENCABEZADO)}>Cuándo</TableHead>
        <TableHead className={ENCABEZADO}>Dónde y qué pasó</TableHead>
        <TableHead className={cn('w-44', ENCABEZADO)}>Origen</TableHead>
        <TableHead className={cn('w-28', ENCABEZADO)}>Código</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {errores.map((error) => (
        <TableRow key={`${error.codigoSeguimiento}-${error.fechaHora}`}>
          <TableCell className="px-3 py-3 texto-pequeno text-texto-secundario">
            {formatearFechaHora(error.fechaHora)}
          </TableCell>
          <TableCell className="px-3 py-3">
            <div className="flex min-w-0 flex-col">
              <AbrirDetalle error={error} alAbrir={alAbrir} />
              <span className="truncate texto-leyenda text-texto-secundario">
                {error.tipoError}: {error.mensaje}
              </span>
            </div>
          </TableCell>
          <TableCell className="px-3 py-3">
            <OrigenError origen={error.origen} />
          </TableCell>
          <TableCell className="px-3 py-3 texto-leyenda font-mono text-texto-principal">
            {codigoCorto(error.codigoSeguimiento)}
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

/** Celular: una tarjeta por error, sin columnas. */
export const ListaRegistroErroresCelular = ({
  errores,
  alAbrir,
}: ListaProps) => (
  <ul className="flex flex-col">
    {errores.map((error) => (
      <li
        key={`${error.codigoSeguimiento}-${error.fechaHora}`}
        className="flex flex-col gap-1 border-t py-3 first:border-t-0"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="texto-leyenda text-texto-secundario">
            {formatearFechaHora(error.fechaHora)}
          </span>
          <OrigenError origen={error.origen} />
        </div>
        <AbrirDetalle error={error} alAbrir={alAbrir} />
        <span className="line-clamp-2 texto-leyenda text-texto-secundario">
          {error.tipoError}: {error.mensaje}
        </span>
        <span className="texto-leyenda font-mono text-texto-principal">
          {codigoCorto(error.codigoSeguimiento)}
        </span>
      </li>
    ))}
  </ul>
);
