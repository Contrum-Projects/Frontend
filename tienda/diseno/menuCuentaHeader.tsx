'use client';

import { ChevronDown, UserRound } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import { ROLES, type Rol } from '@/compartido/sesion/roles';
import { cn } from '@/compartido/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/compartido/ui/dropdown-menu';
import { useCerrarSesion } from '@/tienda/cuenta/useCerrarSesion';
import { RUTAS } from './enlaces';
import { CLASE_ENLACE_HEADER } from './estilosHeader';
import { IconoCerrarSesion } from './iconoCerrarSesion';

interface UsuarioMenu {
  nombre: string;
  apellido: string;
  rol: Rol;
}

const ENLACES: { texto: string; href: Route; soloProfesional?: true }[] = [
  { texto: 'Mis pedidos', href: RUTAS.misPedidos },
  { texto: 'Mis datos', href: RUTAS.misDatos },
  {
    texto: 'Perfil profesional',
    href: RUTAS.perfilProfesional,
    soloProfesional: true,
  },
];

/**
 * Cuenta del comprador con sesión: «Hola, <nombre>» en la fila del header (en celular, solo el
 * ícono con el punto de marca) y un desplegable con su nombre completo, los accesos a la cuenta
 * y «Cerrar sesión». Así se ve de un vistazo que la sesión está iniciada y con qué cuenta.
 */
export function MenuCuentaHeader({ usuario }: { usuario: UsuarioMenu }) {
  const { cerrar, cerrando, error } = useCerrarSesion();
  const esProfesional = usuario.rol === ROLES.PROFESIONAL;
  const enlaces = ENLACES.filter(
    (enlace) => !enlace.soloProfesional || esProfesional,
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Tu cuenta: ${usuario.nombre}`}
        className={cn(
          CLASE_ENLACE_HEADER,
          'relative cursor-pointer max-sm:size-10 max-sm:justify-center max-sm:p-0',
        )}
      >
        <UserRound className="size-6 shrink-0" strokeWidth={1.75} aria-hidden />
        <span className="hidden max-w-32 truncate sm:inline">
          Hola, {usuario.nombre}
        </span>
        <ChevronDown
          className="hidden size-4 shrink-0 sm:block"
          strokeWidth={1.75}
          aria-hidden
        />
        {/* En celular no cabe el nombre: el punto avisa que hay sesión */}
        <span
          aria-hidden
          className="absolute top-2 right-2 size-2 rounded-full bg-marca-acento ring-2 ring-fondo-hueso sm:hidden"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-2">
        <DropdownMenuLabel className="flex flex-col gap-1 px-2 py-2">
          <span className="texto-leyenda text-texto-secundario">
            Sesión iniciada como
          </span>
          <span className="texto-cuerpo-fuerte wrap-break-word text-texto-principal">
            {usuario.nombre} {usuario.apellido}
          </span>
          {esProfesional && (
            <span className="w-fit rounded-full bg-marca-acento-suave px-2 py-1 texto-leyenda text-marca-profundo">
              Cuenta profesional
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {enlaces.map((enlace) => (
          <DropdownMenuItem key={enlace.texto} asChild className="min-h-10">
            <Link href={enlace.href}>{enlace.texto}</Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="min-h-10 cursor-pointer"
          disabled={cerrando}
          // El menú queda abierto: si el backend no confirma el cierre, el aviso se ve aquí
          onSelect={(evento) => {
            evento.preventDefault();
            void cerrar();
          }}
        >
          <IconoCerrarSesion className="size-4" />
          Cerrar sesión
        </DropdownMenuItem>
        {error && (
          <p role="alert" className="px-2 pb-1 texto-leyenda text-estado-error">
            {error}
          </p>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
