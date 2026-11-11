import Link from 'next/link';
import { formatearFecha } from '@/compartido/formato/fecha';
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
import type { ClienteListado } from './consultasClientes';
import { nombreCompleto, nombreDelRol, rutaCliente } from './textosClientes';

const iniciales = (cuenta: ClienteListado) =>
  `${cuenta.nombre.charAt(0)}${cuenta.apellido.charAt(0)}`.toUpperCase();

/** Círculo con las iniciales, como en Personal: acento suave, o hueso oscuro si está desactivada. */
export const AvatarCliente = ({ cuenta }: { cuenta: ClienteListado }) => (
  <span
    aria-hidden
    className={cn(
      'flex size-9 shrink-0 items-center justify-center rounded-full texto-leyenda',
      cuenta.activo
        ? 'bg-marca-acento-suave text-marca-profundo'
        : 'bg-fondo-hueso-oscuro text-texto-secundario',
    )}
  >
    {iniciales(cuenta)}
  </span>
);

/** «Activa» o «Desactivada», con los colores de Personal. */
export const EstadoCliente = ({ activo }: { activo: boolean }) => (
  <Badge
    className={cn(
      'texto-leyenda',
      activo
        ? 'bg-marca-acento-suave text-marca-profundo'
        : 'bg-fondo-hueso-oscuro text-texto-principal',
    )}
  >
    {activo ? 'Activa' : 'Desactivada'}
  </Badge>
);

const ENCABEZADO = 'px-3 texto-leyenda text-texto-secundario';

/** Escritorio: persona (enlace al detalle), rol, estado y fecha de registro. */
export const TablaClientes = ({ cuentas }: { cuentas: ClienteListado[] }) => (
  <Table className="table-fixed">
    <TableHeader>
      <TableRow className="hover:bg-transparent">
        <TableHead className={ENCABEZADO}>Persona</TableHead>
        <TableHead className={cn('w-36', ENCABEZADO)}>Rol</TableHead>
        <TableHead className={cn('w-36', ENCABEZADO)}>Estado</TableHead>
        <TableHead className={cn('w-36', ENCABEZADO)}>Registro</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {cuentas.map((cuenta) => {
        const atenuada = !cuenta.activo && 'text-texto-secundario';
        return (
          <TableRow key={cuenta.codigoPublico}>
            <TableCell className="px-3 py-3">
              <div className="flex items-center gap-3">
                <AvatarCliente cuenta={cuenta} />
                <div className="flex min-w-0 flex-col">
                  <Link
                    href={rutaCliente(cuenta.codigoPublico)}
                    className={cn(
                      'truncate texto-etiqueta text-texto-principal hover:underline',
                      atenuada,
                    )}
                  >
                    {nombreCompleto(cuenta)}
                  </Link>
                  <span className="truncate texto-leyenda text-texto-secundario">
                    {cuenta.email}
                  </span>
                </div>
              </div>
            </TableCell>
            <TableCell
              className={cn(
                'px-3 py-3 texto-pequeno text-texto-principal',
                atenuada,
              )}
            >
              {nombreDelRol(cuenta.rol)}
            </TableCell>
            <TableCell className="px-3 py-3">
              <EstadoCliente activo={cuenta.activo} />
            </TableCell>
            <TableCell className="px-3 py-3 texto-pequeno text-texto-secundario">
              {formatearFecha(cuenta.fechaRegistro)}
            </TableCell>
          </TableRow>
        );
      })}
    </TableBody>
  </Table>
);

/** Celular: toda la fila lleva al detalle; rol y estado en la segunda línea. */
export const ListaClientesCelular = ({
  cuentas,
}: {
  cuentas: ClienteListado[];
}) => (
  <ul className="flex flex-col">
    {cuentas.map((cuenta) => (
      <li key={cuenta.codigoPublico} className="border-t first:border-t-0">
        <Link
          href={rutaCliente(cuenta.codigoPublico)}
          className="flex min-h-14 items-center gap-3 py-3 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/60"
        >
          <AvatarCliente cuenta={cuenta} />
          <span className="flex min-w-0 flex-1 flex-col">
            <span
              className={cn(
                'truncate texto-etiqueta text-texto-principal',
                !cuenta.activo && 'text-texto-secundario',
              )}
            >
              {nombreCompleto(cuenta)}
            </span>
            <span className="texto-leyenda text-texto-secundario">
              {nombreDelRol(cuenta.rol)}
              {!cuenta.activo && ' · desactivada'}
            </span>
          </span>
        </Link>
      </li>
    ))}
  </ul>
);
