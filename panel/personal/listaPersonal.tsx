'use client';

import type { CuentaPersonal } from '@/compartido/api/respuestas';
import { cn } from '@/compartido/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/compartido/ui/table';
import {
  InterruptorCuenta,
  MenuCuenta,
  ReenviarInvitacion,
} from './accionesCuenta';
import {
  AvatarCuenta,
  EstadoCuenta,
  estadoDeCuenta,
  nombreCompleto,
} from './cuentaPersonal';
import { nombreDelRol } from './esquemaPersonal';

interface ListaProps {
  cuentas: CuentaPersonal[];
  /** `codigoPublico` de quien mira. */
  propia?: string;
}

/**
 * Escritorio (Figma P8 2049:1974): persona, rol, estado y el menú de acciones. Sin «Último
 * acceso» hasta que la API lo entregue.
 */
export const TablaPersonal = ({ cuentas, propia }: ListaProps) => (
  <div className="rounded-lg border bg-card p-4">
    <Table className="table-fixed">
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="px-3 texto-leyenda text-texto-secundario">
            Persona
          </TableHead>
          <TableHead className="w-40 px-3 texto-leyenda text-texto-secundario">
            Rol
          </TableHead>
          <TableHead className="w-48 px-3 texto-leyenda text-texto-secundario">
            Estado
          </TableHead>
          <TableHead className="w-12 px-3">
            <span className="sr-only">Acciones</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {cuentas.map((cuenta) => {
          const atenuada = !cuenta.activo && 'text-texto-secundario';
          return (
            <TableRow
              key={cuenta.codigoPublico}
              className="hover:bg-transparent"
            >
              <TableCell className="px-3 py-3">
                <div className="flex items-center gap-3">
                  <AvatarCuenta cuenta={cuenta} />
                  <div className="flex min-w-0 flex-col">
                    <span
                      className={cn(
                        'texto-etiqueta text-texto-principal',
                        atenuada,
                      )}
                    >
                      {nombreCompleto(cuenta)}
                    </span>
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
                <EstadoCuenta cuenta={cuenta} />
              </TableCell>
              <TableCell className="px-3 py-3 text-right">
                <MenuCuenta
                  cuenta={cuenta}
                  propia={cuenta.codigoPublico === propia}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  </div>
);

/** «Vendedor», «Vendedor · desactivada», «Vendedor · invitación pendiente» (Figma 2051:1436). */
const detalleCelular = (cuenta: CuentaPersonal) => {
  const estado = estadoDeCuenta(cuenta);
  const rol = nombreDelRol(cuenta.rol);
  return estado === 'Activa' ? rol : `${rol} · ${estado.toLowerCase()}`;
};

/** Celular (Figma P8 2051:1406): persona, rol y el interruptor para desactivar. */
export const ListaPersonalCelular = ({ cuentas, propia }: ListaProps) => (
  <ul className="flex flex-col rounded-lg border bg-card px-4 py-1">
    {cuentas.map((cuenta) => (
      <li
        key={cuenta.codigoPublico}
        className="flex items-center gap-3 border-t py-3 first:border-t-0"
      >
        <AvatarCuenta cuenta={cuenta} />
        <div className="flex min-w-0 flex-1 flex-col">
          <span
            className={cn(
              'truncate texto-etiqueta text-texto-principal',
              !cuenta.activo && 'text-texto-secundario',
            )}
          >
            {nombreCompleto(cuenta)}
          </span>
          <span className="texto-leyenda text-texto-secundario">
            {detalleCelular(cuenta)}
          </span>
          <ReenviarInvitacion cuenta={cuenta} />
        </div>
        <InterruptorCuenta
          cuenta={cuenta}
          propia={cuenta.codigoPublico === propia}
        />
      </li>
    ))}
  </ul>
);
