'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { cn } from '@/compartido/lib/utils';
import { PERMISOS, tienePermiso } from '@/compartido/sesion/roles';
import { useSesion } from '@/compartido/sesion/sesion';
import { useFacturasPanel } from '@/panel/facturas/consultasFacturas';

type Pestana = 'todos' | 'facturas';

const PESTANA =
  '-mb-px flex min-h-10 items-center border-b-2 texto-pequeno focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-profundo';

/**
 * «Todos los pedidos | Facturas por emitir · N» (Figma 2050:2078, E9-H3). Navega entre las dos
 * rutas. Solo la ve quien puede gestionar la facturación (vendedor y administrador): para el
 * resto, Pedidos no tiene pestañas. El conteo lo da el backend.
 */
export const PestanasPedidos = ({ actual }: { actual: Pestana }) => {
  const { usuario } = useSesion();
  const factura = tienePermiso(usuario?.rol, PERMISOS.FACTURACION_GESTIONAR);
  const { data } = useFacturasPanel(factura);
  if (!factura) return null;

  const enlace = (pestana: Pestana, href: Route, texto: string) => {
    const activa = pestana === actual;
    return (
      <li>
        <Link
          href={href}
          aria-current={activa ? 'page' : undefined}
          className={cn(
            PESTANA,
            activa
              ? 'border-marca-profundo texto-etiqueta text-texto-principal'
              : 'border-transparent text-texto-secundario hover:text-texto-principal',
          )}
        >
          {texto}
        </Link>
      </li>
    );
  };

  return (
    <nav aria-label="Secciones de pedidos" className="border-b">
      <ul className="flex flex-wrap gap-x-6">
        {enlace('todos', '/panel/pedidos', 'Todos los pedidos')}
        {enlace(
          'facturas',
          '/panel/pedidos/facturas',
          data
            ? `Facturas por emitir · ${data.porEmitir}`
            : 'Facturas por emitir',
        )}
      </ul>
    </nav>
  );
};
