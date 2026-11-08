import {
  BadgeCheck,
  Box,
  Contact,
  ChartNoAxesColumn,
  GalleryHorizontalEnd,
  Gift,
  House,
  Mail,
  ReceiptText,
  Tag,
  Tags,
  TicketPercent,
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

/** Grupos del menú del panel, en su orden (SCRUM-157, decisión del 11-11-2026). */
export const GRUPOS_PANEL = [
  'Ventas',
  'Catálogo',
  'Marketing',
  'Administración',
] as const;
export type GrupoPanel = (typeof GRUPOS_PANEL)[number];

export interface SeccionPanel {
  texto: string;
  href: Route;
  icono: LucideIcon;
  /** Sin grupo: va arriba, suelta (Inicio). */
  grupo?: GrupoPanel;
  /** Sin permiso: la ve todo el personal. */
  permiso?: Permiso;
  /** `false`: no entra en la navegación inferior de celular (Figma no la dibuja ahí), va en «Más». */
  enLaBarra?: false;
}

/**
 * Secciones del menú del panel, agrupadas por área (SCRUM-157): Ventas, Catálogo, Marketing y
 * Administración; Inicio va arriba, sin grupo. Cada una pide el permiso que el backend exige en
 * sus endpoints (SCRUM-25). La barra del celular sigue con Inicio, Pedidos, Productos e
 * Inventario (Figma), por eso las demás llevan `enLaBarra: false`.
 *
 * Varias rutas todavía no tienen página: llevan `as Route` (ver `tienda/diseno/enlaces.ts`).
 */
export const SECCIONES: readonly SeccionPanel[] = [
  { texto: 'Inicio', href: '/panel', icono: House },
  {
    texto: 'Pedidos',
    href: '/panel/pedidos',
    icono: ReceiptText,
    grupo: 'Ventas',
    permiso: PERMISOS.PEDIDOS_GESTIONAR,
  },
  {
    // Se agregó con SCRUM-155. Clientes y profesionales los gestiona solo el administrador, con
    // el permiso del personal (SCRUM-154)
    texto: 'Clientes',
    href: '/panel/clientes',
    icono: Contact,
    grupo: 'Ventas',
    permiso: PERMISOS.PERSONAL_GESTIONAR,
    enLaBarra: false,
  },
  {
    texto: 'Verificaciones',
    href: '/panel/verificaciones',
    icono: BadgeCheck,
    grupo: 'Ventas',
    permiso: PERMISOS.VERIFICACION_GESTIONAR,
    enLaBarra: false,
  },
  {
    texto: 'Productos',
    href: '/panel/productos',
    icono: Tag,
    grupo: 'Catálogo',
    permiso: PERMISOS.CATALOGO_GESTIONAR,
  },
  {
    // Se agregó con SCRUM-105 para gestionar los packs aparte
    texto: 'Packs',
    href: '/panel/packs',
    icono: Gift,
    grupo: 'Catálogo',
    permiso: PERMISOS.CATALOGO_GESTIONAR,
    enLaBarra: false,
  },
  {
    // Antes solo se abría desde Productos (Figma P3b 2039:1311); con los grupos tiene su lugar
    texto: 'Marcas y categorías',
    href: '/panel/marcas-y-categorias',
    icono: Tags,
    grupo: 'Catálogo',
    permiso: PERMISOS.CATALOGO_GESTIONAR,
    enLaBarra: false,
  },
  {
    texto: 'Inventario',
    href: '/panel/inventario',
    icono: Box,
    grupo: 'Catálogo',
    permiso: PERMISOS.INVENTARIO_CONSULTAR,
  },
  {
    texto: 'Campañas',
    href: '/panel/campanas',
    icono: Mail,
    grupo: 'Marketing',
    permiso: PERMISOS.CAMPANAS_GESTIONAR,
    enLaBarra: false,
  },
  {
    // Se agregó con SCRUM-150, con el permiso de las campañas
    texto: 'Cupones',
    href: '/panel/cupones' as Route,
    icono: TicketPercent,
    grupo: 'Marketing',
    permiso: PERMISOS.CAMPANAS_GESTIONAR,
    enLaBarra: false,
  },
  {
    // SCRUM-157: las imágenes de la portada del inicio, con el permiso de las campañas
    texto: 'Portada',
    href: '/panel/portada',
    icono: GalleryHorizontalEnd,
    grupo: 'Marketing',
    permiso: PERMISOS.CAMPANAS_GESTIONAR,
    enLaBarra: false,
  },
  {
    texto: 'Reportes',
    href: '/panel/reportes',
    icono: ChartNoAxesColumn,
    grupo: 'Administración',
    permiso: PERMISOS.REPORTES_VER,
    enLaBarra: false,
  },
  {
    texto: 'Personal',
    href: '/panel/personal',
    icono: UsersRound,
    grupo: 'Administración',
    permiso: PERMISOS.PERSONAL_GESTIONAR,
    enLaBarra: false,
  },
];

/** Un grupo del menú con sus secciones; `grupo: null` son las sueltas de arriba (Inicio). */
export interface BloqueMenu {
  grupo: GrupoPanel | null;
  secciones: SeccionPanel[];
}

/** Reparte las secciones en bloques por grupo, en el orden de GRUPOS_PANEL; sin vacíos. */
export const agruparSecciones = (
  secciones: readonly SeccionPanel[],
): BloqueMenu[] =>
  [null, ...GRUPOS_PANEL]
    .map((grupo) => ({
      grupo,
      secciones: secciones.filter(
        (seccion) => (seccion.grupo ?? null) === grupo,
      ),
    }))
    .filter((bloque) => bloque.secciones.length > 0);

/**
 * Páginas que piden un permiso distinto al de su sección (docs/pantallas.md).
 */
const PERMISOS_DE_RUTA: readonly { prefijo: string; permiso: Permiso }[] = [
  {
    prefijo: '/panel/inventario/bodegas',
    permiso: PERMISOS.BODEGAS_GESTIONAR,
  },
  {
    prefijo: '/panel/inventario/proveedores',
    permiso: PERMISOS.PROVEEDORES_GESTIONAR,
  },
  {
    prefijo: '/panel/inventario/entradas',
    permiso: PERMISOS.INVENTARIO_REGISTRAR,
  },
  {
    prefijo: '/panel/inventario/salidas',
    permiso: PERMISOS.INVENTARIO_REGISTRAR,
  },
  {
    prefijo: '/panel/pedidos/facturas',
    permiso: PERMISOS.FACTURACION_GESTIONAR,
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
 * Páginas que no cuelgan de la ruta de su sección pero el menú las marca dentro de ella. Hoy
 * ninguna: «Marcas y categorías» tiene su propia sección desde SCRUM-157.
 */
const SECCION_DE_PAGINA: readonly { prefijo: string; seccion: Route }[] = [];

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
