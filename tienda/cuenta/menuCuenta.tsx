'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/compartido/lib/utils';
import { ROLES } from '@/compartido/sesion/roles';
import { useSesion } from '@/compartido/sesion/sesion';
import { RUTAS } from '@/tienda/diseno/enlaces';
import { useCerrarSesion } from './useCerrarSesion';

const ENLACES: { texto: string; href: Route; soloProfesional?: true }[] = [
  { texto: 'Mis pedidos', href: RUTAS.misPedidos },
  { texto: 'Mis datos', href: RUTAS.misDatos },
  { texto: 'Direcciones', href: RUTAS.direcciones },
  { texto: 'Datos de facturación', href: RUTAS.facturacion },
  { texto: 'Verificación profesional', href: RUTAS.verificacion },
  // E10-H5: solo con la verificación aprobada
  {
    texto: 'Perfil profesional',
    href: RUTAS.perfilProfesional,
    soloProfesional: true,
  },
  { texto: 'Ofertas por correo', href: RUTAS.ofertas },
];

const CLASE_FILA =
  'flex min-h-11 w-full items-center rounded-md px-4 text-left texto-cuerpo text-texto-principal hover:underline';

/**
 * Menú lateral de «Mi cuenta» en escritorio (Figma 2034:2324). En celular la cuenta se recorre
 * desde el menú del header, que también tiene «Cerrar sesión».
 */
export function MenuCuenta({ className }: { className?: string }) {
  const { usuario } = useSesion();
  const ruta = usePathname();
  const { cerrar, cerrando, error } = useCerrarSesion();
  const esProfesional = usuario?.rol === ROLES.PROFESIONAL;
  const enlaces = ENLACES.filter(
    (enlace) => !enlace.soloProfesional || esProfesional,
  );

  return (
    <nav aria-label="Mi cuenta" className={cn('flex-col gap-1', className)}>
      {usuario && (
        <p className="mb-4 titulo-h3 text-texto-principal">
          Hola, {usuario.nombre}
        </p>
      )}
      <ul className="flex flex-col gap-1">
        {enlaces.map((enlace) => {
          // El detalle de un pedido sigue en «Mis pedidos»
          const actual =
            ruta === enlace.href || ruta.startsWith(`${enlace.href}/`);
          return (
            <li key={enlace.texto}>
              <Link
                href={enlace.href}
                aria-current={actual ? 'page' : undefined}
                className={cn(
                  CLASE_FILA,
                  actual &&
                    'bg-marca-acento-suave texto-cuerpo-fuerte text-marca-profundo',
                )}
              >
                {enlace.texto}
              </Link>
            </li>
          );
        })}
        <li>
          <button
            type="button"
            onClick={cerrar}
            disabled={cerrando}
            className={cn(
              CLASE_FILA,
              'cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-profundo disabled:opacity-50',
            )}
          >
            Cerrar sesión
          </button>
          {error && (
            <p role="alert" className="px-4 texto-leyenda text-estado-error">
              {error}
            </p>
          )}
        </li>
      </ul>
    </nav>
  );
}
