'use client';

import { Ellipsis, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/compartido/lib/utils';
import { useSesion } from '@/compartido/sesion/sesion';
import { HojaMas } from './hojaMas';
import { seccionDeRuta, seccionesDelRol } from './secciones';

/** Inicio, Pedidos, Productos e Inventario según el rol; el resto va en «Más». */
const EN_LA_BARRA = 4;

/**
 * Navegación inferior del panel en celular (Figma › Panel/Navegación inferior 2022:355): las
 * primeras secciones que el rol puede usar y «Más», que abre las demás y «Cerrar sesión».
 */
export function NavegacionInferior({ className }: { className?: string }) {
  const { usuario } = useSesion();
  const ruta = usePathname();
  const [masAbierto, setMasAbierto] = useState(false);

  if (!usuario) return null;

  const secciones = seccionesDelRol(usuario.rol);
  const enLaBarra = secciones
    .filter((seccion) => seccion.enLaBarra !== false)
    .slice(0, EN_LA_BARRA);
  const enMas = secciones.filter((seccion) => !enLaBarra.includes(seccion));
  const actual = seccionDeRuta(ruta);
  const masActivo = masAbierto || (!!actual && enMas.includes(actual));

  return (
    <nav
      aria-label="Panel"
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 border-t border-fondo-hueso-oscuro bg-fondo-superficie px-2 pt-2 pb-[max(--spacing(4),env(safe-area-inset-bottom))]',
        className,
      )}
    >
      <ul className="flex">
        {enLaBarra.map((seccion) => (
          <li key={seccion.href} className="flex-1">
            <Link
              href={seccion.href}
              aria-current={seccion === actual ? 'page' : undefined}
              className={CLASE_BOTON}
            >
              <Contenido
                icono={seccion.icono}
                texto={seccion.texto}
                activo={seccion === actual}
              />
            </Link>
          </li>
        ))}
        <li className="flex-1">
          <HojaMas
            secciones={enMas}
            actual={actual}
            abierta={masAbierto}
            alCambiar={setMasAbierto}
          >
            <button type="button" className={cn(CLASE_BOTON, 'cursor-pointer')}>
              <Contenido icono={Ellipsis} texto="Más" activo={masActivo} />
            </button>
          </HojaMas>
        </li>
      </ul>
    </nav>
  );
}

const CLASE_BOTON =
  'flex w-full flex-col items-center gap-1 rounded-md py-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-profundo';

const Contenido = ({
  icono: Icono,
  texto,
  activo,
}: {
  icono: LucideIcon;
  texto: string;
  activo: boolean;
}) => (
  <>
    <span
      className={cn(
        'flex rounded-full px-4 py-1',
        activo && 'bg-marca-acento-suave',
      )}
    >
      <Icono
        className={cn(
          'size-6',
          activo ? 'text-marca-profundo' : 'text-texto-secundario',
        )}
        strokeWidth={1.75}
        aria-hidden
      />
    </span>
    <span
      className={cn(
        'texto-leyenda whitespace-nowrap',
        activo ? 'text-marca-profundo' : 'text-texto-secundario',
      )}
    >
      {texto}
    </span>
  </>
);
