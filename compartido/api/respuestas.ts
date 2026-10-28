/**
 * Respuestas de la API que el Swagger todavía no declara.
 *
 * `compartido/api/esquema.d.ts` tipa las rutas, los parámetros y los cuerpos de entrada (DTOs),
 * pero hoy ningún endpoint declara su respuesta (`@ApiOkResponse({ type })`), así que en el
 * esquema queda sin tipo. Mientras tanto, copia aquí el tipo desde el backend, citando el
 * archivo de origen, y bórralo cuando el endpoint lo declare y corras `pnpm api:tipos`.
 */
import type { Rol } from '@/compartido/sesion/roles';
import type { components } from './esquema';

/** backend: src/modulos/cuentas/sesion.service.ts › SesionIniciada */
export interface SesionIniciada {
  tokenAcceso: string;
  /** Segundos de vigencia del token de acceso. */
  expiraEn: number;
  usuario: {
    codigoPublico: string;
    nombre: string;
    apellido: string;
    rol: Rol;
  };
}

/**
 * backend: src/modulos/cuentas/cuentas.service.ts › Mensaje (registro, confirmación del correo y
 * recuperación de la contraseña)
 */
export interface MensajeApi {
  mensaje: string;
}

/** Cuerpo de error de NestJS. `message` es una lista cuando falla la validación de un DTO. */
export interface CuerpoError {
  statusCode: number;
  message: string | string[];
  error?: string;
}

/** backend: src/modulos/catalogo/tienda.service.ts › ProductoTienda (lo que ve quien no es profesional) */
export interface ProductoTienda {
  id: number;
  nombre: string;
  marca: { id: number; nombre: string } | null;
  categoria: { id: number; nombre: string };
  /** Precio minorista con IVA incluido, en pesos enteros. */
  precio: number;
  /** URL pública de la imagen principal del formato mostrado. */
  imagen: string;
}

/** backend: src/modulos/catalogo/tienda.service.ts › ListadoTienda */
export interface ListadoTienda {
  items: ProductoTienda[];
  total: number;
  pagina: number;
  limite: number;
}

/** backend: src/modulos/catalogo/categorias.service.ts › NodoCategoria */
export interface CategoriaTienda {
  id: number;
  nombre: string;
  descripcion: string | null;
  padreId: number | null;
  subcategorias: CategoriaTienda[];
}

/** backend: src/modulos/catalogo/tienda.service.ts › MarcaTienda */
export interface MarcaTienda {
  id: number;
  nombre: string;
}

/**
 * backend: src/modulos/catalogo/marcas.service.ts › crear y listar (modelo Marca de
 * prisma/schema.prisma). Lo que devuelven POST y GET /api/catalogo/marcas en el panel.
 */
export interface MarcaPanel {
  id: number;
  nombre: string;
  activa: boolean;
}

/** backend: src/modulos/catalogo/tienda-packs.service.ts › PackTienda */
export interface PackTienda {
  id: number;
  nombre: string;
  descripcion: string;
  /** Precio minorista con IVA incluido, en pesos enteros. */
  precio: number;
  /** URL pública de la imagen principal del pack. */
  imagen: string;
  /** Último día de la promoción (AAAA-MM-DD), o `null` si no tiene término. */
  vigenteHasta: string | null;
  componentes: { producto: string; formato: string; cantidad: number }[];
}

/** backend: src/modulos/catalogo/tienda-packs.service.ts › ListadoPacksTienda */
export interface ListadoPacksTienda {
  items: PackTienda[];
  total: number;
  pagina: number;
  limite: number;
}

/** backend: src/modulos/cuentas/mi-cuenta.service.ts › DatosPersonales */
export interface DatosPersonales {
  codigoPublico: string;
  nombre: string;
  apellido: string;
  email: string;
  /** Formato único: 12345678-5. */
  rut: string | null;
  telefono: string | null;
  /** AAAA-MM-DD. */
  fechaNacimiento: string | null;
  genero: string | null;
}

/** Región o comuna de la lista oficial, por su código CUT (GET /api/territorio/…). */
export type UbicacionOficial = components['schemas']['UbicacionOficialDto'];

/** backend: src/modulos/cuentas/direcciones.service.ts › DireccionCuenta */
export interface DireccionCuenta {
  id: number;
  calle: string;
  numero: string;
  referencia: string | null;
  esPrincipal: boolean;
  comuna: UbicacionOficial & { region: UbicacionOficial };
}

/**
 * backend: src/modulos/personal/personal.service.ts › CuentaPersonal (listar y crear, E13-H1).
 * No trae el último acceso: se pidió al backend (ver docs/historias/SCRUM-98.md).
 */
export interface CuentaPersonal {
  codigoPublico: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: Rol;
  activo: boolean;
  /** Aún no define su contraseña con el enlace de la invitación. */
  invitacionPendiente: boolean;
}

/** backend: src/common/dominio/valores.ts › ORIGENES_DESCRIPCION */
export type OrigenDescripcion = 'manual' | 'ia' | 'ia_editada';

/** backend: src/common/dominio/valores.ts › CANALES_VENTA. `profesional`: exclusivo. */
export type CanalVenta = 'general' | 'profesional';

/**
 * backend: src/modulos/catalogo/productos.service.ts › crear, actualizar, desactivar y obtener
 * (modelo Producto de prisma/schema.prisma con `INCLUIR`). Lo que devuelven POST, GET, PATCH y
 * PATCH …/desactivar de /api/catalogo/productos (E3-H1).
 */
export interface ProductoPanel {
  id: number;
  nombre: string;
  descripcion: string;
  origenDescripcion: OrigenDescripcion;
  canalVenta: CanalVenta;
  activo: boolean;
  marca: { id: number; nombre: string } | null;
  categoria: { id: number; nombre: string };
}

/**
 * Fila del listado del panel (E3-H1, Figma P3a). **Simulada** (SCRUM-100): el backend hoy
 * entrega solo los datos de `ProductoPanel`; los demás campos se pidieron a SCRUM-26 (ver
 * docs/historias/SCRUM-100.md). Los decide el backend, el panel solo los muestra.
 */
export interface ProductoListadoPanel extends ProductoPanel {
  /** URL pública de la imagen principal del formato predeterminado, o `null` sin imágenes. */
  imagen: string | null;
  /** Cantidad de formatos activos. */
  formatos: number;
  /**
   * Menor precio con IVA entre sus formatos, del canal del producto (minorista si es general,
   * mayorista si es exclusivo), en pesos enteros. `null` si ningún formato tiene precio.
   */
  precioDesde: number | null;
  /** Unidades en bodegas activas, sumando sus formatos. */
  stockTotal: number;
  /** Algún formato está bajo su stock mínimo. */
  stockBajo: boolean;
}

/** Cuántos productos hay en cada filtro del listado, con la búsqueda aplicada. Simulado (SCRUM-100). */
export interface ConteosProductosPanel {
  todos: number;
  exclusivos: number;
  stockBajo: number;
  inactivos: number;
}

/** GET /api/catalogo/productos (panel). Simulado (SCRUM-100), ver `ProductoListadoPanel`. */
export interface ListadoProductosPanel {
  items: ProductoListadoPanel[];
  total: number;
  pagina: number;
  limite: number;
  conteos: ConteosProductosPanel;
}

/** backend: src/modulos/catalogo/imagenes.service.ts › ImagenPanel */
export interface ImagenPanel {
  id: number;
  url: string;
  orden: number;
  esPrincipal: boolean;
}

/** backend: src/common/dominio/valores.ts › UNIDADES_MEDIDA */
export type UnidadMedida = 'ml' | 'g' | 'unidades';

/**
 * backend: src/modulos/catalogo/formatos.service.ts › FormatoPanel. Lo que devuelven GET y POST
 * /api/catalogo/productos/{id}/formatos y PATCH /api/catalogo/formatos/{id} (E3-H2), con el
 * predeterminado primero en la lista.
 */
export interface FormatoPanel {
  id: number;
  productoId: number;
  sku: string;
  codigoBarras: string | null;
  nombreFormato: string;
  contenido: number | null;
  unidadMedida: UnidadMedida | null;
  /** AAAA-MM-DD. Solo se muestra en el panel. */
  fechaVencimiento: string | null;
  stockMinimo: number;
  pesoGramos: number;
  altoCm: number;
  anchoCm: number;
  largoCm: number;
  esPredeterminado: boolean;
  activo: boolean;
  /** Imágenes del formato en su orden (E3-H3); puede no tener todavía. */
  imagenes: ImagenPanel[];
}

/** backend: src/common/dominio/valores.ts › TIPOS_PRECIO */
export type TipoPrecio = 'minorista' | 'mayorista';

/** backend: src/modulos/catalogo/precios.service.ts › CambioPrecio */
export interface CambioPrecio {
  id: number;
  tipoPrecio: TipoPrecio;
  precioNeto: number;
  /** ISO 8601. */
  fechaInicioVigencia: string;
  /** `null` mientras es el precio vigente. */
  fechaFinVigencia: string | null;
  motivo: string | null;
  fijadoPor: { nombre: string; apellido: string };
}

/**
 * backend: src/modulos/catalogo/precios.service.ts › PreciosArticulo. Lo que devuelven GET y PUT
 * /api/catalogo/articulos/{id}/precios (E3-H5), con el historial del más reciente al más antiguo.
 *
 * `porcentajeIva`, `precioMinoristaConIva` y `precioMayoristaConIva` se pidieron a SCRUM-30 (ver
 * docs/historias/SCRUM-104.md): mientras no lleguen, la pantalla muestra solo los netos.
 */
export interface PreciosArticulo {
  articuloId: number;
  /** El producto o pack es exclusivo para profesionales: solo lleva precio mayorista. */
  exclusivo: boolean;
  precioMinoristaNeto: number | null;
  precioMayoristaNeto: number | null;
  historial: CambioPrecio[];
  /** Tasa de IVA vigente (`IVA_PORCENTAJE`), p. ej. 19. Pedido a SCRUM-30. */
  porcentajeIva?: number;
  /** Precio minorista con IVA en pesos enteros, como en la tienda. Pedido a SCRUM-30. */
  precioMinoristaConIva?: number | null;
  /** Precio mayorista con IVA en pesos enteros. Pedido a SCRUM-30. */
  precioMayoristaConIva?: number | null;
}

/**
 * Formato que se puede agregar a un pack (E3-H6 criterio 2). **Simulado** (SCRUM-105): el backend
 * no tiene una búsqueda de formatos; forma pedida a SCRUM-31 (ver docs/historias/SCRUM-105.md).
 * Solo formatos activos de productos activos, nunca packs.
 */
export interface FormatoParaPack {
  formatoId: number;
  sku: string;
  nombreFormato: string;
  producto: { id: number; nombre: string };
  /** Canal del producto: un pack general no admite formatos exclusivos. */
  canalVenta: CanalVenta;
  /** Unidades en bodegas activas. Opcional mientras se simula: la simulación no lo inventa. */
  stockTotal?: number;
  precioMinoristaNeto?: number | null;
  /** En pesos enteros, como en la tienda. */
  precioMinoristaConIva?: number | null;
}

/** GET /api/catalogo/formatos?buscar= (panel). Simulado (SCRUM-105), ver `FormatoParaPack`. */
export interface ListadoFormatosParaPack {
  items: FormatoParaPack[];
  total: number;
  pagina: number;
  limite: number;
}

/**
 * backend: src/modulos/catalogo/packs.service.ts › ComponentePackPanel. `stockTotal` y los
 * precios se pidieron a SCRUM-31 (ver docs/historias/SCRUM-105.md).
 */
export interface ComponentePackPanel {
  formatoId: number;
  sku: string;
  nombreFormato: string;
  producto: { id: number; nombre: string };
  cantidad: number;
  /** Unidades del formato en bodegas activas. Pedido a SCRUM-31. */
  stockTotal?: number;
  /** Pedido a SCRUM-31. */
  precioMinoristaNeto?: number | null;
  /** En pesos enteros. Pedido a SCRUM-31. */
  precioMinoristaConIva?: number | null;
}

/**
 * backend: src/modulos/catalogo/packs.service.ts › PackPanel. Lo que devuelven GET, POST y PATCH
 * de /api/catalogo/packs (E3-H6). Los precios van aparte (E3-H5). `disponibilidad`,
 * `componenteLimitante` y `precioMinoristaPorSeparadoConIva` se pidieron a SCRUM-31.
 */
export interface PackPanel {
  id: number;
  sku: string;
  nombre: string;
  descripcion: string;
  canalVenta: CanalVenta;
  /** AAAA-MM-DD, hora de Chile; `null` sin inicio. */
  fechaInicioVigencia: string | null;
  /** AAAA-MM-DD, último día incluido; `null` sin término. */
  fechaFinVigencia: string | null;
  /** Hoy (hora de Chile) está dentro de la vigencia. */
  vigente: boolean;
  activo: boolean;
  /** ISO 8601. */
  fechaCreacion: string;
  componentes: ComponentePackPanel[];
  imagenes: ImagenPanel[];
  /**
   * Packs que se pueden vender con el stock de hoy: los del componente más escaso, contando las
   * unidades que lleva el pack (como `disponibilidad` de /tienda/packs/{id}). Pedido a SCRUM-31.
   */
  disponibilidad?: number;
  /** El componente que limita la disponibilidad; `null` sin componentes. Pedido a SCRUM-31. */
  componenteLimitante?: { formatoId: number; stockTotal: number } | null;
  /** Lo que cuestan los componentes por separado, con IVA. Pedido a SCRUM-31. */
  precioMinoristaPorSeparadoConIva?: number | null;
}

/** backend: src/modulos/catalogo/packs.service.ts › ListadoPacks (GET /api/catalogo/packs). */
export interface ListadoPacksPanel {
  items: PackPanel[];
  total: number;
  pagina: number;
  limite: number;
}
