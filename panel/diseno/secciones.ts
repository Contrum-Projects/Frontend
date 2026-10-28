import {
  BadgeCheck,
  Box,
  ChartNoAxesColumn,
  House,
  Mail,
  ReceiptText,
  Tag,
  UsersRound,
  type LucideIcon,
} from 'lucide-react';
import type { Route } from 'next';
import {
  PERMISOS,
  esPersonal,
  tienePermiso,
  type Permiso,
  type Rol,
} from '@/compartido/sesion/roles';

export interface SeccionPanel {
  texto: string;
  href: Route;
  icono: LucideIcon;
  /** Sin permiso: la ve todo el personal. */
  permiso?: Permiso;
}

/**
 * Secciones del menú del panel en el orden de Figma (Panel/Menú lateral 2027:781). Cada una
 * pide el permiso que el backend exige en sus endpoints (SCRUM-25).
 *
 * Varias rutas todavía no tienen página: llevan `as Route` (ver `tienda/diseno/enlaces.ts`).
 */
export const SECCIONES: readonly SeccionPanel[] = [
  { texto: 'Inicio', href: '/panel', icono: House },
  {
    texto: 'Pedidos',
    // TODO(SCRUM-130): pedidos
    href: '/panel/pedidos' as Route,
    icono: ReceiptText,
    permiso: PERMISOS.PEDIDOS_GESTIONAR,
  },
  {
    texto: 'Productos',
    href: '/panel/productos',
    icono: Tag,
    permiso: PERMISOS.CATALOGO_GESTIONAR,
  },
  {
    texto: 'Inventario',
    // TODO(SCRUM-114): inventario
    href: '/panel/inventario' as Route,
    icono: Box,
    permiso: PERMISOS.INVENTARIO_CONSULTAR,
  },
  {
    texto: 'Verificaciones',
    // TODO(SCRUM-135): verificaciones
    href: '/panel/verificaciones' as Route,
    icono: BadgeCheck,
    permiso: PERMISOS.VERIFICACION_GESTIONAR,
  },
  {
    texto: 'Campañas',
    // TODO(SCRUM-140): campañas
    href: '/panel/campanas' as Route,
    icono: Mail,
    permiso: PERMISOS.CAMPANAS_GESTIONAR,
  },
  {
    texto: 'Reportes',
    // TODO(SCRUM-143): reportes
    href: '/panel/reportes' as Route,
    icono: ChartNoAxesColumn,
    permiso: PERMISOS.REPORTES_VER,
  },
  {
    texto: 'Personal',
    href: '/panel/personal',
    icono: UsersRound,
    permiso: PERMISOS.PERSONAL_GESTIONAR,
  },
];

/**
 * Páginas que piden un permiso distinto al de su sección (docs/pantallas.md). Las del catálogo
 * que no cuelgan de /panel/productos también van aquí.
 */
const PERMISOS_DE_RUTA: readonly { prefijo: string; permiso: Permiso }[] = [
  { prefijo: '/panel/packs', permiso: PERMISOS.CATALOGO_GESTIONAR },
  {
    prefijo: '/panel/marcas-y-categorias',
    permiso: PERMISOS.CATALOGO_GESTIONAR,
  },
  {
    prefijo: '/panel/inventario/proveedores',
    permiso: PERMISOS.PROVEEDORES_GESTIONAR,
  },
  {
    prefijo: '/panel/inventario/entradas',
    permiso: PERMISOS.INVENTARIO_REGISTRAR,
  },
];

const coincide = (ruta: string, prefijo: string) =>
  ruta === prefijo || ruta.startsWith(`${prefijo}/`);

/** Secciones que el rol puede usar, en el orden del menú. */
export const seccionesDelRol = (rol: Rol | undefined): SeccionPanel[] =>
  esPersonal(rol)
    ? SECCIONES.filter(
        (seccion) => !seccion.permiso || tienePermiso(rol, seccion.permiso),
      )
    : [];

/**
 * Páginas que no cuelgan de la ruta de su sección pero el menú las marca dentro de ella: Figma
 * marca «Productos» en Marcas y categorías (P3b 2039:1311), que se abre desde Productos.
 */
const SECCION_DE_PAGINA: readonly { prefijo: string; seccion: Route }[] = [
  { prefijo: '/panel/marcas-y-categorias', seccion: '/panel/productos' },
];

/** La sección a la que pertenece la ruta, para marcarla en el menú. Inicio solo en /panel. */
export const seccionDeRuta = (ruta: string): SeccionPanel | undefined => {
  const propia = SECCION_DE_PAGINA.find(({ prefijo }) =>
    coincide(ruta, prefijo),
  )?.seccion;
  return SECCIONES.find((seccion) => {
    if (propia) return seccion.href === propia;
    return seccion.href === '/panel'
      ? ruta === seccion.href
      : coincide(ruta, seccion.href);
  });
};

/**
 * Si el rol puede abrir la ruta del panel. Manda la regla más específica: primero las páginas
 * con permiso propio, después la sección. Una ruta que no es de ninguna sección la abre todo
 * el personal (la página mostrará su 404). Solo decide qué se muestra: autoriza el backend.
 */
export const puedeAbrir = (rol: Rol | undefined, ruta: string): boolean => {
  if (!esPersonal(rol)) return false;
  const propia = PERMISOS_DE_RUTA.find(({ prefijo }) =>
    coincide(ruta, prefijo),
  );
  const permiso = propia?.permiso ?? seccionDeRuta(ruta)?.permiso;
  return !permiso || tienePermiso(rol, permiso);
};
