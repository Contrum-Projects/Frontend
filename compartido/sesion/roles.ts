/**
 * Roles y permisos fijos. Copia de backend `src/common/dominio/roles.ts` y `permisos.ts`
 * (RF-13.02, RF-13.03): si allá cambian, cámbialos aquí.
 *
 * Solo deciden qué se muestra. Quien autoriza es el backend (RNF-03): ocultar una opción
 * no la protege.
 */
export const ROLES = {
  CLIENTE: 'cliente',
  PROFESIONAL: 'profesional',
  VENDEDOR: 'vendedor',
  BODEGUERO: 'bodeguero',
  ADMINISTRADOR: 'administrador',
} as const;

export type Rol = (typeof ROLES)[keyof typeof ROLES];

/** «Personal de tienda»: los roles que entran al panel. */
export const ROLES_PERSONAL: readonly Rol[] = [
  ROLES.VENDEDOR,
  ROLES.BODEGUERO,
  ROLES.ADMINISTRADOR,
];

export const PERMISOS = {
  PERSONAL_GESTIONAR: 'personal.gestionar',
  PROVEEDORES_GESTIONAR: 'proveedores.gestionar',
  INVENTARIO_REGISTRAR: 'inventario.registrar',
  INVENTARIO_CONSULTAR: 'inventario.consultar',
  CATALOGO_GESTIONAR: 'catalogo.gestionar',
  PRECIOS_GESTIONAR: 'precios.gestionar',
  PEDIDOS_GESTIONAR: 'pedidos.gestionar',
  VERIFICACION_GESTIONAR: 'verificacion.gestionar',
  CAMPANAS_GESTIONAR: 'campanas.gestionar',
  REPORTES_VER: 'reportes.ver',
} as const;

export type Permiso = (typeof PERMISOS)[keyof typeof PERMISOS];

const PERMISOS_POR_ROL: Readonly<Record<Rol, readonly Permiso[]>> = {
  [ROLES.ADMINISTRADOR]: Object.values(PERMISOS),
  [ROLES.BODEGUERO]: [
    PERMISOS.INVENTARIO_CONSULTAR,
    PERMISOS.INVENTARIO_REGISTRAR,
    PERMISOS.PROVEEDORES_GESTIONAR,
    PERMISOS.PEDIDOS_GESTIONAR,
  ],
  [ROLES.VENDEDOR]: [
    PERMISOS.CATALOGO_GESTIONAR,
    PERMISOS.INVENTARIO_CONSULTAR,
    PERMISOS.PEDIDOS_GESTIONAR,
  ],
  [ROLES.CLIENTE]: [],
  [ROLES.PROFESIONAL]: [],
};

export const esPersonal = (rol: Rol | undefined): boolean =>
  rol !== undefined && ROLES_PERSONAL.includes(rol);

export const tienePermiso = (rol: Rol | undefined, permiso: Permiso): boolean =>
  rol !== undefined && (PERMISOS_POR_ROL[rol]?.includes(permiso) ?? false);
