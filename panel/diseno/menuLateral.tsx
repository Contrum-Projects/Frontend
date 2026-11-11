'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/compartido/marca/logo';
import { cn } from '@/compartido/lib/utils';
import { useSesion } from '@/compartido/sesion/sesion';
import { useCerrarSesion } from '@/tienda/cuenta/useCerrarSesion';
import { IconoCerrarSesion } from '@/tienda/diseno/iconoCerrarSesion';
import { agruparSecciones, seccionDeRuta, seccionesDelRol } from './secciones';
import { AvatarPanel, nombreCompleto } from './usuarioPanel';

const FOCO_SOBRE_OSCURO =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-logo';

/**
 * Menú lateral del panel en escritorio (Figma › Panel/Menú lateral 2027:781): logo, las
 * secciones que el rol puede usar, agrupadas por área (SCRUM-157), y abajo la persona con
 * «Cerrar sesión».
 */
export function MenuLateral({ className }: { className?: string }) {
  const { usuario } = useSesion();
  const ruta = usePathname();
  const { cerrar, cerrando, error } = useCerrarSesion();
  const actual = seccionDeRuta(ruta);

  if (!usuario) return null;

  return (
    <div
      className={cn(
        'sticky top-0 h-dvh w-62 flex-col overflow-y-auto bg-marca-profundo px-4 pt-6 pb-6',
        className,
      )}
    >
      <Link
        href="/panel"
        className={cn(
          'mb-6 ml-2 self-start rounded-md text-marca-logo',
          FOCO_SOBRE_OSCURO,
        )}
      >
        <Logo titulo="Cabello Perfecto · Panel" className="h-auto w-24" />
      </Link>

      <nav aria-label="Panel" className="flex flex-col gap-5">
        {agruparSecciones(seccionesDelRol(usuario.rol)).map((bloque) => {
          const idGrupo = bloque.grupo ? `menu-${bloque.grupo}` : undefined;
          return (
            <div key={bloque.grupo ?? 'inicio'} className="flex flex-col gap-1">
              {bloque.grupo && (
                <p
                  id={idGrupo}
                  className="px-3 texto-leyenda text-texto-sobre-oscuro/70"
                >
                  {bloque.grupo}
                </p>
              )}
              <ul aria-labelledby={idGrupo} className="flex flex-col gap-1">
                {bloque.secciones.map((seccion) => {
                  const activa = seccion === actual;
                  const Icono = seccion.icono;
                  return (
                    <li key={seccion.href}>
                      <Link
                        href={seccion.href}
                        aria-current={activa ? 'page' : undefined}
                        className={cn(
                          'flex min-h-11 items-center gap-3 rounded-md px-3 transition-colors',
                          FOCO_SOBRE_OSCURO,
                          activa
                            ? 'bg-texto-sobre-oscuro/10 texto-cuerpo-fuerte text-marca-logo'
                            : 'texto-pequeno text-texto-sobre-oscuro/85 hover:bg-texto-sobre-oscuro/5 hover:text-texto-sobre-oscuro',
                        )}
                      >
                        <Icono
                          className="size-5 shrink-0"
                          strokeWidth={1.75}
                          aria-hidden
                        />
                        {seccion.texto}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-2 border-t border-texto-sobre-oscuro/15 px-2 pt-4">
        <div className="flex items-center gap-3">
          <AvatarPanel persona={usuario} />
          <div className="flex min-w-0 flex-1 flex-col text-texto-sobre-oscuro">
            <span className="truncate texto-etiqueta">
              {nombreCompleto(usuario)}
            </span>
            <span className="texto-leyenda opacity-70">Rol: {usuario.rol}</span>
          </div>
          <button
            type="button"
            onClick={cerrar}
            disabled={cerrando}
            aria-label="Cerrar sesión"
            className={cn(
              'flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-md text-texto-sobre-oscuro hover:bg-texto-sobre-oscuro/10 disabled:opacity-50',
              FOCO_SOBRE_OSCURO,
            )}
          >
            <IconoCerrarSesion className="size-5" />
          </button>
        </div>
        {error && (
          <p role="alert" className="texto-leyenda text-texto-sobre-oscuro">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
