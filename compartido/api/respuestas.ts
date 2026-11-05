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

/**
 * backend: src/modulos/catalogo/tienda.service.ts › ProductoTiendaProfesional. Lo que recibe el
 * profesional (E2-H4): el mayorista y si es exclusivo. TODO(SCRUM-109): el Swagger no lo
 * declara; pedido a SCRUM-35.
 */
export interface ProductoTiendaProfesional extends Omit<
  ProductoTienda,
  'precio'
> {
  /** Precio minorista con IVA; `null` si el producto es exclusivo para profesionales. */
  precio: number | null;
  /** Precio mayorista con IVA incluido, en pesos enteros. */
  precioMayorista: number;
  exclusivo: boolean;
}

/** backend: src/modulos/catalogo/tienda.service.ts › ListadoTienda */
export interface ListadoTienda<
  T extends ProductoTienda | ProductoTiendaProfesional = ProductoTienda,
> {
  items: T[];
  total: number;
  pagina: number;
  limite: number;
}

/** El listado con la sesión de un profesional. */
export type ListadoTiendaProfesional = ListadoTienda<ProductoTiendaProfesional>;

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
 * Pedido a SCRUM-33 (forma acordada en docs/historias/SCRUM-107.md): `GET /api/tienda/facetas`,
 * con los mismos filtros que `/tienda/productos`. Cuántos productos hay en cada categoría (con sus
 * subcategorías) y en cada marca; solo las que tienen alguno.
 * TODO(SCRUM-107): quitar cuando el Swagger lo declare (hoy lo responde la API simulada).
 */
export interface FacetasTienda {
  categorias: FacetaTienda[];
  marcas: FacetaTienda[];
}

export interface FacetaTienda {
  id: number;
  total: number;
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

/** backend: src/modulos/catalogo/tienda-packs.service.ts › PackTiendaProfesional */
export interface PackTiendaProfesional extends Omit<PackTienda, 'precio'> {
  /** Precio minorista con IVA; `null` si el pack es exclusivo para profesionales. */
  precio: number | null;
  /** Precio mayorista con IVA incluido, en pesos enteros. */
  precioMayorista: number;
  exclusivo: boolean;
}

/** backend: src/modulos/catalogo/tienda-packs.service.ts › ListadoPacksTienda */
export interface ListadoPacksTienda {
  items: PackTienda[];
  total: number;
  pagina: number;
  limite: number;
}

/**
 * backend: src/common/dominio/valores.ts › DISPONIBILIDADES. `disponible` con al menos una
 * unidad en bodegas que abastecen la venta online; el backend no informa cantidades.
 */
export type Disponibilidad = 'disponible' | 'agotado';

/** backend: src/modulos/catalogo/tienda-detalle.service.ts › FormatoDetalle */
export interface FormatoDetalle {
  id: number;
  nombre: string;
  contenido: number | null;
  unidadMedida: UnidadMedida | null;
  esPredeterminado: boolean;
  /** URLs públicas de sus imágenes, la principal primero. */
  imagenes: string[];
  /** Precio minorista con IVA incluido, en pesos enteros. */
  precio: number;
  disponibilidad: Disponibilidad;
}

/** backend: src/modulos/catalogo/tienda-detalle.service.ts › FormatoDetalleProfesional */
export interface FormatoDetalleProfesional extends Omit<
  FormatoDetalle,
  'precio'
> {
  /** Precio minorista con IVA; `null` si el producto es exclusivo para profesionales. */
  precio: number | null;
  /** Precio mayorista con IVA incluido, en pesos enteros. */
  precioMayorista: number;
}

/**
 * backend: src/modulos/catalogo/tienda-detalle.service.ts › ProductoDetalle (lo que ve quien no
 * es profesional). GET /api/tienda/productos/{id}: los formatos a la venta, el predeterminado
 * primero. TODO(SCRUM-108): el Swagger no declara la respuesta; pedido a SCRUM-34.
 */
export interface ProductoDetalle {
  id: number;
  nombre: string;
  descripcion: string;
  marca: { id: number; nombre: string } | null;
  categoria: { id: number; nombre: string };
  formatos: FormatoDetalle[];
}

/**
 * backend: src/modulos/catalogo/tienda-detalle.service.ts › ProductoDetalleProfesional. Lo que
 * recibe el profesional en GET /api/tienda/productos/{id} (E2-H4). TODO(SCRUM-109): el Swagger
 * no lo declara; pedido a SCRUM-35.
 */
export interface ProductoDetalleProfesional extends Omit<
  ProductoDetalle,
  'formatos'
> {
  exclusivo: boolean;
  formatos: FormatoDetalleProfesional[];
}

/**
 * backend: src/modulos/catalogo/tienda-detalle.service.ts › PackDetalle. GET
 * /api/tienda/packs/{id}: el pack del listado con todas sus imágenes y la disponibilidad de su
 * componente más escaso. No trae el precio por separado (ver docs/historias/SCRUM-108.md).
 */
export interface PackDetalle extends PackTienda {
  /** URLs públicas de sus imágenes, la principal primero. */
  imagenes: string[];
  disponibilidad: Disponibilidad;
}

/** backend: src/modulos/catalogo/tienda-detalle.service.ts › PackDetalleProfesional */
export interface PackDetalleProfesional extends PackTiendaProfesional {
  /** URLs públicas de sus imágenes, la principal primero. */
  imagenes: string[];
  disponibilidad: Disponibilidad;
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

/**
 * backend: src/modulos/inventario/proveedores.service.ts › listar y crear (fila de `proveedor`,
 * E11-H1). TODO(SCRUM-110): la cantidad de entradas no llega todavía; pedida a SCRUM-36 como
 * `cantidadEntradas` (ver docs/historias/SCRUM-110.md).
 */
export interface Proveedor {
  id: number;
  /** Formato único: `76086428-5`. */
  rut: string;
  razonSocial: string;
  nombreContacto: string | null;
  telefono: string | null;
  email: string | null;
  activo: boolean;
  cantidadEntradas?: number;
}

/** backend: src/common/dominio/valores.ts › TIPOS_DOCUMENTO_PROVEEDOR */
export type TipoDocumentoProveedor = 'factura' | 'guia_despacho';

/** backend: src/modulos/inventario/comprobaciones.ts › UbicacionResumen */
export interface UbicacionResumen {
  id: number;
  codigo: string;
  /** Nombre de la bodega. */
  bodega: string;
}

/**
 * GET /api/inventario/ubicaciones: ubicaciones activas de bodegas activas, donde se puede
 * guardar stock. TODO(SCRUM-111): no existe en el backend; simulado y pedido a SCRUM-37 (ver
 * docs/historias/SCRUM-111.md).
 */
export interface UbicacionInventario {
  id: number;
  codigo: string;
  bodega: { id: number; nombre: string };
}

/**
 * backend: src/modulos/inventario/entradas.service.ts › EntradaRegistrada (respuesta del POST
 * /api/inventario/entradas, E11-H2; el Swagger no la declara). TODO(SCRUM-111): los subtotales
 * y totales no llegan todavía; pedidos a SCRUM-37 como `subtotalNeto`, `unidades` y
 * `costoNetoTotal` (el frontend no los calcula).
 */
export interface EntradaRegistrada {
  id: number;
  proveedor: { id: number; rut: string; razonSocial: string };
  /** AAAA-MM-DD */
  fechaRecepcion: string;
  tipoDocumento: TipoDocumentoProveedor;
  numeroDocumento: string;
  observacion: string | null;
  ubicacion: UbicacionResumen;
  detalles: {
    formatoId: number;
    cantidad: number;
    costoUnitarioNeto: number;
    movimientoId: number;
    subtotalNeto?: number;
  }[];
  unidades?: number;
  costoNetoTotal?: number;
}

/**
 * Una fila de GET /api/inventario/entradas (E11-H2 criterio 1). TODO(SCRUM-111): no existe en el
 * backend; simulado con la forma pedida a SCRUM-37 (ver docs/historias/SCRUM-111.md).
 */
export interface EntradaListado {
  id: number;
  /** AAAA-MM-DD */
  fechaRecepcion: string;
  tipoDocumento: TipoDocumentoProveedor;
  numeroDocumento: string;
  proveedor: { id: number; razonSocial: string };
  ubicacion: UbicacionResumen;
  cantidadFormatos: number;
  unidades: number;
  costoNetoTotal: number;
  registradoPor: { nombre: string };
}

/** backend: src/common/dominio/valores.ts › TIPOS_SALIDA */
export type TipoSalida =
  'merma_vencimiento' | 'merma_dano' | 'consumo_peluqueria';

/**
 * backend: src/modulos/inventario/salidas.service.ts › SalidaRegistrada (respuesta del POST
 * /api/inventario/salidas, E11-H3; el Swagger no la declara).
 */
export interface SalidaRegistrada {
  movimientoId: number;
  tipo: TipoSalida;
  formatoId: number;
  ubicacion: UbicacionResumen;
  cantidad: number;
  /** Unidades que quedan del formato en esa ubicación. */
  stockRestante: number;
  observacion: string | null;
  /** ISO 8601 */
  fechaHora: string;
}

/**
 * backend: src/modulos/inventario/ajustes.service.ts › AjusteRegistrado (respuesta del POST
 * /api/inventario/ajustes, E11-H4; el Swagger no la declara).
 */
export interface AjusteRegistrado {
  movimientoId: number;
  tipo: 'ajuste_positivo' | 'ajuste_negativo';
  formatoId: number;
  ubicacion: UbicacionResumen;
  /** La diferencia con signo, como se pidió: +3 sumó, -2 descontó. */
  cantidad: number;
  /** Unidades que quedan del formato en esa ubicación. */
  stockResultante: number;
  observacion: string;
  /** ISO 8601 */
  fechaHora: string;
}

/**
 * backend: src/modulos/inventario/transferencias.service.ts › TransferenciaRegistrada
 * (respuesta del POST /api/inventario/transferencias, E11-H4; el Swagger no la declara). Cada
 * ubicación trae el stock que le quedó.
 */
export interface TransferenciaRegistrada {
  movimientoId: number;
  formatoId: number;
  origen: UbicacionResumen & { stock: number };
  destino: UbicacionResumen & { stock: number };
  cantidad: number;
  observacion: string | null;
  /** ISO 8601 */
  fechaHora: string;
}

/**
 * backend: src/modulos/inventario/stock.service.ts › StockFormato (respuesta de GET
 * /api/inventario/stock/formatos/{id}, E11-H5; el Swagger no la declara). Solo las ubicaciones
 * con unidades; `activa` es falso si la ubicación o su bodega está desactivada.
 */
export interface StockFormato {
  formato: {
    id: number;
    nombreFormato: string;
    sku: string;
    producto: string;
    activo: boolean;
  };
  ubicaciones: (UbicacionResumen & { activa: boolean; cantidad: number })[];
  total: number;
  ultimaEntrada: {
    /** AAAA-MM-DD */
    fechaRecepcion: string;
    proveedor: { id: number; rut: string; razonSocial: string };
    costoUnitarioNeto: number;
  } | null;
}

/** GET /api/inventario/entradas?bodegaId&buscar&desde&hasta&pagina. Simulado (SCRUM-111). */
export interface ListadoEntradas {
  items: EntradaListado[];
  total: number;
  pagina: number;
  limite: number;
}

/** backend: src/common/dominio/valores.ts › TIPOS_MOVIMIENTO */
export type TipoMovimiento =
  | 'entrada'
  | 'merma_vencimiento'
  | 'merma_dano'
  | 'consumo_peluqueria'
  | 'ajuste_positivo'
  | 'ajuste_negativo'
  | 'transferencia'
  | 'venta'
  | 'reingreso';

/**
 * Una fila de GET /api/inventario/stock (E11-H5 criterio 1). TODO(SCRUM-114): no existe en el
 * backend; simulado con la forma pedida a SCRUM-40 (ver docs/historias/SCRUM-114.md).
 * `ubicaciones` y `stock` son de la bodega elegida (o de todas); `bajoMinimo` lo decide el
 * backend.
 */
export interface StockListado {
  formatoId: number;
  sku: string;
  producto: string;
  nombreFormato: string;
  /** Foto principal del formato. */
  imagen: string | null;
  ubicaciones: { id: number; codigo: string }[];
  stock: number;
  stockMinimo: number | null;
  bajoMinimo: boolean;
  /** Nula si el formato nunca se recibió. */
  ultimaEntrada: {
    costoUnitarioNeto: number;
    proveedor: { id: number; razonSocial: string };
  } | null;
}

/** GET /api/inventario/stock?bodegaId&buscar&bajoMinimo&pagina&limite. Simulado (SCRUM-114). */
export interface ListadoStock {
  items: StockListado[];
  total: number;
  pagina: number;
  limite: number;
  /** Formatos bajo el mínimo con la bodega y la búsqueda elegidas, para el chip. */
  totalBajoMinimo: number;
}

/**
 * Una fila de GET /api/inventario/movimientos (E11-H5 criterio 2). TODO(SCRUM-114): no existe
 * en el backend; simulado con la forma pedida a SCRUM-40 (ver docs/historias/SCRUM-114.md).
 */
export interface MovimientoListado {
  id: number;
  /** ISO 8601 */
  fechaHora: string;
  tipo: TipoMovimiento;
  formato: { id: number; producto: string; nombreFormato: string };
  /** Con signo; la transferencia, positiva. */
  cantidad: number;
  /** El origen, en la transferencia. */
  ubicacion: UbicacionResumen;
  /** Solo en la transferencia. */
  destino: UbicacionResumen | null;
  /** N.º de documento, código del pedido u observación. */
  referencia: string | null;
  /** Nulo: lo registró el sistema (ventas y reingresos). */
  registradoPor: { nombre: string } | null;
}

/** Grupos de los chips de «Movimientos»; el backend decide qué tipos entran en cada uno. */
export type GrupoMovimientos =
  'entradas' | 'ventas' | 'salidas' | 'transferencias';

/**
 * GET /api/inventario/movimientos?bodegaId&grupo&desde&hasta&buscar&pagina&limite, del más
 * reciente al más antiguo. Simulado (SCRUM-114).
 */
export interface ListadoMovimientos {
  items: MovimientoListado[];
  total: number;
  pagina: number;
  limite: number;
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
  /** Ingredientes del reverso (E4-H2), hasta 3000 caracteres; `null` si no se guardaron. */
  ingredientes: string | null;
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

/**
 * Un elemento de GET /api/inventario/stock/bajo-minimo (E11-H6, SCRUM-41). El Swagger no
 * declara la respuesta: backend `src/modulos/inventario/stock-bajo.service.ts` ›
 * `FormatoBajoMinimo`. Viene ordenada del que más falta al que menos; el stock es el total de
 * todas las ubicaciones.
 */
export interface FormatoBajoMinimo {
  formatoId: number;
  sku: string;
  producto: string;
  nombreFormato: string;
  activo: boolean;
  stockMinimo: number;
  stockTotal: number;
  /** Unidades que faltan para llegar al mínimo. */
  faltante: number;
}

/**
 * Una línea del carrito de la cuenta (E5-H1, SCRUM-43). El Swagger no declara la respuesta:
 * backend `src/modulos/carrito/carrito.service.ts` › `LineaCarrito`. Precio, subtotal, stock y
 * si impide el pedido los calcula el backend al consultar, según el rol (RNF-03).
 */
export interface LineaCarrito {
  /** Id del formato o del pack. */
  articuloId: number;
  /** `formato` o `pack`; `null` si no se debe mostrar (carrito del visitante, E5-H2). */
  tipo: 'formato' | 'pack' | null;
  /** Nombre del producto o del pack. */
  nombre: string;
  /** Nombre del formato; `null` en un pack. */
  nombreFormato: string | null;
  /** URL pública de su imagen principal; `null` si no tiene. */
  imagen: string | null;
  cantidad: number;
  /** Precio unitario con IVA; `null` si ya no se vende a esta cuenta. */
  precioUnitario: number | null;
  /** Precio unitario por cantidad, con IVA; `null` si ya no se vende. */
  subtotal: number | null;
  aLaVenta: boolean;
  /** Si el stock cubre la cantidad (no dice cuántas hay); `null` si ya no se vende. */
  stockSuficiente: boolean | null;
  /** Mientras sea `true` no se puede crear el pedido: hay que quitarlo o ajustarlo. */
  impideCrearPedido: boolean;
}

/**
 * GET /api/carrito y las respuestas de agregar, cambiar y quitar (E5-H1, SCRUM-43). Backend
 * `src/modulos/carrito/carrito.service.ts` › `CarritoCuenta`. TODO(SCRUM-116): el Swagger no
 * declara la respuesta; pedido a SCRUM-43.
 */
export interface CarritoCuenta {
  items: LineaCarrito[];
  /** Suma de los subtotales que se venden, con IVA. */
  total: number;
  /** Hay artículos y ninguno impide crear el pedido. */
  puedeCrearPedido: boolean;
}

/**
 * Un artículo del navegador que no entró tal cual al unir (E5-H2, SCRUM-44). Backend
 * `src/modulos/carrito/carrito.service.ts` › `AjusteUnionCarrito` (`AJUSTES_UNION_CARRITO`).
 * No informa cuántas unidades hay.
 */
export interface AjusteUnionCarrito {
  articuloId: number;
  /** Se descartó (`no_disponible`, `agotado`) o quedó en el tope de 999 (`cantidad_ajustada`). */
  motivo: 'no_disponible' | 'agotado' | 'cantidad_ajustada';
}

/**
 * POST /api/carrito/unir (E5-H2, SCRUM-44): el carrito de la cuenta ya unido y lo que se ajustó.
 * Backend `carrito.service.ts` › `CarritoUnido`. TODO(SCRUM-117): el Swagger no declara la
 * respuesta; pedido a SCRUM-44.
 */
export interface CarritoUnido extends CarritoCuenta {
  /** Vacío si todo entró tal cual. */
  ajustes: AjusteUnionCarrito[];
}

/**
 * backend: src/modulos/cuentas/datos-facturacion.service.ts › DatosFacturacionCuenta (E9-H2).
 * El Swagger no declara la respuesta de GET, POST ni PATCH: se pidió documentarla.
 */
export interface DatosFacturacionCuenta {
  id: number;
  /** Formato único: `76086429-3`. */
  rut: string;
  razonSocial: string;
  giro: string;
  direccion: string;
  correoFacturacion: string | null;
  comuna: UbicacionOficial & { region: UbicacionOficial };
}

/**
 * Un pedido del historial de la cuenta (E8-H1, SCRUM-57). Backend
 * `src/modulos/pedidos/mis-pedidos.service.ts` › `ResumenPedido`. TODO(SCRUM-129): el Swagger no
 * declara la respuesta; pedido a SCRUM-57.
 */
export interface ResumenPedido {
  codigoPublico: string;
  /** ISO 8601. */
  fechaPedido: string;
  /** Total con IVA, en pesos. */
  total: number;
  estado: string;
}

/** GET /api/pedidos (E8-H1). Backend `mis-pedidos.service.ts` › `HistorialPedidos`. */
export interface HistorialPedidos {
  /** Del más reciente al más antiguo. */
  items: ResumenPedido[];
  /** Cuántos pedidos tiene la cuenta en total. */
  total: number;
  pagina: number;
  limite: number;
}

/** Un artículo del pedido (E8-H1). Backend `src/modulos/pedidos/mis-pedidos.service.ts` › `LineaPedido`. */
export interface LineaPedido {
  articuloId: number;
  tipo: 'formato' | 'pack';
  nombre: string;
  nombreFormato: string | null;
  imagen: string | null;
  cantidad: number;
  /** Precio unitario con IVA que se cobró. */
  precioUnitario: number;
  subtotal: number;
}

/** El despacho del pedido (E7-H2). Backend `mis-pedidos.service.ts` › `EnvioPedido`. */
export interface EnvioPedido {
  servicio: string;
  /** Costo del envío con IVA, en pesos. */
  costo: number;
  estado: string;
  codigoSeguimiento: string | null;
  /** `AAAA-MM-DD`. */
  fechaEstimada: string | null;
  destinatario: string;
  telefonoContacto: string | null;
  calle: string;
  numero: string;
  referencia: string | null;
  comuna: UbicacionOficial;
}

/**
 * POST /api/pedidos y GET /api/pedidos/{codigoPedido} (E5-H3, E8-H1, SCRUM-45 y SCRUM-57).
 * Backend `src/modulos/pedidos/mis-pedidos.service.ts` › `DetallePedidoCuenta`. TODO(SCRUM-118):
 * el Swagger no declara la respuesta; pedido a SCRUM-45.
 */
export interface DetallePedidoCuenta {
  codigoPublico: string;
  /** ISO 8601. */
  fechaPedido: string;
  estado: string;
  /** Hasta cuándo se puede pagar (ISO 8601); solo mientras espera el pago. */
  pagarHasta: string | null;
  tipoEntrega: 'despacho' | 'retiro';
  tipoDocumento: 'boleta' | 'factura';
  porcentajeIva: number;
  montos: { neto: number; iva: number; total: number };
  items: LineaPedido[];
  /** `null` si es retiro en tienda. */
  envio: EnvioPedido | null;
  /** La factura: `null` si pidió boleta o está cancelado (E9-H4). */
  documento: {
    tipo: 'factura';
    /** Backend `facturacion/documento-pedido.ts` › `ESTADOS_DESCARGA_DOCUMENTO`. */
    estado: 'pendiente' | 'disponible';
    folio: number | null;
    fechaEmision: string | null;
  } | null;
  idTransaccionPago: string | null;
  historial: { estado: string; fecha: string }[];
}

/**
 * POST /api/pedidos/{codigoPedido}/pago (E6-H1, SCRUM-47). Backend
 * `src/modulos/pagos/pagar-pedido.service.ts` › `CobroIniciado`. TODO(SCRUM-118): el Swagger no
 * declara la respuesta; pedido a SCRUM-47.
 */
export interface CobroIniciado {
  /** Adonde se lleva al comprador para pagar en Mercado Pago. */
  urlPago: string;
  /** ISO 8601. */
  pagarHasta: string;
}

/**
 * POST /api/pedidos/{codigoPedido}/pago/confirmar (E6-H1, SCRUM-47). Backend
 * `src/modulos/pagos/pagar-pedido.service.ts` › `PagoConfirmado`. TODO(SCRUM-120): el Swagger no
 * declara la respuesta; pedido a SCRUM-47.
 */
export interface PagoConfirmado {
  /** Lo que informó Mercado Pago, consultado por el backend (nunca el `status` de la URL). */
  estadoPago: 'aprobado' | 'rechazado' | 'pendiente';
  pedido: DetallePedidoCuenta;
}

/**
 * GET /api/despacho/cotizacion?direccionId= (E7-H2, SCRUM-51). Backend
 * `src/modulos/despacho/cotizar-envio.service.ts` › `CotizacionDespacho`. TODO(SCRUM-122): el
 * Swagger no declara la respuesta; pedido a SCRUM-51.
 */
export interface CotizacionDespacho {
  /** Costo del despacho con IVA, en pesos. */
  costo: number;
  /** Total del carrito con IVA, sin el despacho. */
  totalCarrito: number;
  /** Lo que pagaría: carrito más despacho. */
  total: number;
}

/**
 * Un pedido de la lista del panel (E8-H2). TODO(SCRUM-130): `GET /api/gestion/pedidos` aún no
 * existe; forma pedida a SCRUM-58 (ver docs/historias/SCRUM-130.md).
 */
export interface PedidoGestion {
  codigoPublico: string;
  /** ISO 8601. */
  fechaPedido: string;
  /** Nombre o razón social de quien compró. */
  cliente: string;
  tipoEntrega: 'despacho' | 'retiro';
  estado: string;
  /** Total con IVA, en pesos. */
  total: number;
  /** Suma de las cantidades del pedido. */
  unidades: number;
}

/** Un grupo del filtro de la lista: qué estados entran en cada uno lo decide el backend. */
export interface GrupoPedidos {
  clave: string;
  nombre: string;
  /** `null`: el grupo no muestra cuántos pedidos tiene. */
  cantidad: number | null;
}

/** GET /api/gestion/pedidos (E8-H2). Pedida a SCRUM-58. */
export interface ListadoPedidosGestion {
  /** Del más reciente al más antiguo. */
  items: PedidoGestion[];
  total: number;
  pagina: number;
  limite: number;
  grupos: GrupoPedidos[];
  /** El grupo que se aplicó: sin `grupo` en la consulta, el que el backend elige por defecto. */
  grupo: string;
}

/**
 * Un cambio de estado que el personal puede hacer desde el estado actual del pedido (E8-H2). Sale
 * de `transiciones-estado-pedido.ts` del backend: el frontend no conoce la secuencia.
 */
export interface CambioPermitido {
  estado: string;
  sentido: 'avance' | 'retroceso';
  /** Al despachar se pide el número de la OT de Chilexpress (E7-H3). */
  pideCodigoSeguimiento: boolean;
  /** Si el backend avisa al cliente por correo (`ESTADOS_CON_AVISO`). */
  avisaAlCliente: boolean;
}

/** GET /api/gestion/pedidos/{codigoPedido} (E8-H2). Pedida a SCRUM-58. */
export interface DetallePedidoGestion extends Omit<
  DetallePedidoCuenta,
  'historial'
> {
  cliente: { nombre: string; correo: string; telefono: string | null };
  historial: {
    estado: string;
    /** ISO 8601. */
    fecha: string;
    comentario: string | null;
    /** «Sistema», «Cliente» o el nombre de quien lo cambió. */
    realizadoPor: string;
  }[];
  /** Vacío si el pedido ya no cambia desde el panel (entregado, retirado, cancelado). */
  cambiosPermitidos: CambioPermitido[];
  /**
   * Si el personal puede cancelarlo (E8-H3): hoy, solo un pedido pendiente de pago. Lo decide el
   * backend. TODO(SCRUM-131): pedido a SCRUM-58 junto con el detalle.
   */
  sePuedeCancelar: boolean;
}

/**
 * POST /api/pedidos/{codigoPedido}/cancelar (E8-H3). Backend `cancelar-pedido.service.ts` ›
 * `PedidoCancelado`. TODO(SCRUM-131): el Swagger no declara la respuesta; pedido a SCRUM-59.
 */
export interface PedidoCancelado {
  codigoPublico: string;
  estado: string;
}

/**
 * POST /api/pedidos/{codigoPedido}/estado (E8-H2). Backend `cambiar-estado-pedido.service.ts` ›
 * `PedidoConNuevoEstado`. TODO(SCRUM-130): el Swagger no declara la respuesta; pedido a SCRUM-58.
 */
export interface PedidoConNuevoEstado {
  codigoPublico: string;
  estado: string;
}

/**
 * Cómo va la factura de un pedido que la pidió (E9-H3): `por_emitir` hasta que el personal la
 * registra con su folio. TODO(SCRUM-127): forma propuesta a SCRUM-55 (ver
 * docs/historias/SCRUM-127.md).
 */
export type EstadoFacturaGestion = 'por_emitir' | 'emitida';

/** Un pedido de la pestaña «Facturas por emitir» (E9-H3). */
export interface FacturaGestion {
  codigoPedido: string;
  razonSocial: string;
  /** Como lo guarda el backend: 76123456-0. */
  rut: string;
  /** Total con IVA, en pesos. */
  total: number;
  estado: EstadoFacturaGestion;
  /** `null` mientras está por emitir. */
  folio: number | null;
}

/**
 * GET /api/gestion/facturas (E9-H3). Los pedidos que pidieron factura y ya se pagaron; cuáles
 * entran y en qué orden lo decide el backend. TODO(SCRUM-127): pedida a SCRUM-55.
 */
export interface ListadoFacturasGestion {
  items: FacturaGestion[];
  /** Cuántos quedan por emitir, para la pestaña. */
  porEmitir: number;
  total: number;
  pagina: number;
  limite: number;
}

/**
 * GET /api/gestion/facturas/{codigoPedido} (E9-H3). Los datos para emitirla en el SII: el
 * receptor (de los datos de facturación del pedido) y los montos del pedido. Ya emitida, los que
 * copió el documento. TODO(SCRUM-127): pedida a SCRUM-55.
 */
export interface DetalleFacturaGestion {
  codigoPedido: string;
  estado: EstadoFacturaGestion;
  receptor: {
    razonSocial: string;
    rut: string;
    giro: string;
    direccion: string;
    /** Nombre de la comuna. */
    comuna: string;
  };
  montos: { neto: number; iva: number; total: number };
  porcentajeIva: number;
  folio: number | null;
  /** AAAA-MM-DD; `null` mientras está por emitir. */
  fechaEmision: string | null;
}

/**
 * POST /api/pedidos/{codigoPedido}/factura (E9-H3). Backend `registrar-factura.service.ts` ›
 * `FacturaRegistrada`. TODO(SCRUM-127): el Swagger no declara la respuesta; pedido a SCRUM-55.
 */
export interface FacturaRegistrada {
  codigoPedido: string;
  tipo: string;
  folio: number;
  /** AAAA-MM-DD. */
  fechaEmision: string;
  estado: string;
}

/** Estados de la solicitud de verificación (backend `common/dominio/valores.ts` › ESTADOS_SOLICITUD). */
export type EstadoSolicitudVerificacion =
  'pendiente' | 'revision_manual' | 'aprobada' | 'rechazada';

/** Tipos de documento de la verificación (backend `valores.ts` › TIPOS_ANTECEDENTE, E10-H2). */
export type TipoDocumentoVerificacion = 'titulo' | 'certificado' | 'otro';

/**
 * GET /api/verificaciones/yo, POST /api/verificaciones y POST /api/verificaciones/yo/documentos
 * (E10-H1 y E10-H2). Backend `solicitud-verificacion.service.ts` › `SolicitudVerificacionCuenta`.
 * TODO(SCRUM-134): el Swagger no declara la respuesta; pedido a SCRUM-62.
 */
export interface SolicitudVerificacionCuenta {
  estado: EstadoSolicitudVerificacion;
  /** ISO 8601. */
  fechaSolicitud: string;
  /** ISO 8601; `null` mientras no se resuelve. */
  fechaResolucion: string | null;
  /** Solo si fue rechazada. */
  motivoRechazo: string | null;
  /** `true` si el SII no la aprobó y falta adjuntar documentos (estado `pendiente`). */
  requiereDocumentos: boolean;
  /** Los documentos que adjuntó; vacío mientras no los envíe. */
  documentos: { tipo: TipoDocumentoVerificacion; nombreArchivo: string }[];
}

/**
 * GET y PUT /api/perfil-profesional/yo (E10-H5; el GET da 404 si aún no lo completa). Backend
 * `perfil-profesional.service.ts` › `PerfilProfesionalCuenta`.
 * TODO(SCRUM-137): el Swagger no declara la respuesta de ninguno de los dos; pedido a SCRUM-66.
 */
export interface PerfilProfesionalCuenta {
  anosExperiencia: number;
  modalidad: components['schemas']['GuardarPerfilProfesionalDto']['modalidad'];
  especialidades: components['schemas']['GuardarPerfilProfesionalDto']['especialidades'];
  nombreLugarTrabajo: string | null;
  redSocial: string | null;
  /** ISO 8601. */
  fechaActualizacion: string;
}

/**
 * Por qué una solicitud no se aprobó sola: lo que dio la consulta al SII (backend `valores.ts` ›
 * RESULTADOS_CONSULTA_SII sin `aprobado`). `null` si no se consultó.
 */
export type MotivoRevisionVerificacion =
  'sin_inicio_actividades' | 'otro_giro' | 'no_disponible';

/**
 * Una solicitud en revisión manual en el panel: GET /api/verificaciones/revision-manual (E10-H7).
 * Backend `consulta-verificacion.service.ts` › `SolicitudEnRevision`.
 * TODO(SCRUM-135): el Swagger no declara la respuesta; pedido a SCRUM-64.
 */
export interface SolicitudEnRevision {
  /** `codigoPublico` de la cuenta que solicitó: abre el detalle y sirve para resolver. */
  codigoPublicoCuenta: string;
  nombre: string;
  apellido: string;
  rut: string | null;
  /** ISO 8601. */
  fechaEnvio: string;
  motivoRevision: MotivoRevisionVerificacion | null;
}

export interface ListadoSolicitudesEnRevision {
  items: SolicitudEnRevision[];
  total: number;
  pagina: number;
  limite: number;
}

/** Quien del personal resolvió la solicitud; `null` si la aprobó el sistema. */
export interface ResolutorSolicitud {
  codigoPublico: string;
  nombre: string;
  apellido: string;
}

/** Backend `consulta-verificacion.service.ts` › `ResumenSolicitud`. */
export interface ResumenSolicitudVerificacion {
  estado: EstadoSolicitudVerificacion;
  /** ISO 8601. */
  fechaSolicitud: string;
  fechaResolucion: string | null;
  /** Solo si fue rechazada. */
  motivoRechazo: string | null;
  resolutor: ResolutorSolicitud | null;
}

/** Un giro que informó el SII (backend `proveedor-situacion-tributaria.ts` › `ActividadSii`). */
export interface GiroSii {
  /** Código del giro (`960200`). */
  codigo: string;
  nombre: string;
  /** AAAA-MM-DD; `null` si el proveedor no la entrega. */
  fechaInicio: string | null;
}

export interface DocumentoSolicitudVerificacion {
  /** Posición en la solicitud, desde 1: con ella se pide el enlace. */
  numero: number;
  tipo: TipoDocumentoVerificacion;
  nombreArchivo: string;
  /** ISO 8601 si el archivo ya se borró (E10-H6): entonces no hay enlace. */
  fechaEliminacion: string | null;
}

/**
 * GET /api/verificaciones/{codigoPublico} (E10-H7). Backend `consulta-verificacion.service.ts` ›
 * `DetalleVerificacion`. TODO(SCRUM-135): el Swagger no declara la respuesta; pedido a SCRUM-64.
 */
export interface DetalleVerificacion {
  cliente: {
    codigoPublico: string;
    nombre: string;
    apellido: string;
    rut: string | null;
    email: string;
    telefono: string | null;
  };
  /** La solicitud más reciente de la cuenta. */
  solicitud: ResumenSolicitudVerificacion & {
    motivoRevision: MotivoRevisionVerificacion | null;
    /** `null` si nunca se consultó al SII. */
    consultaSii: {
      fecha: string;
      resultado: MotivoRevisionVerificacion | 'aprobado';
      /** `null` si la consulta falló (`no_disponible`). */
      giros: GiroSii[] | null;
    } | null;
    documentos: DocumentoSolicitudVerificacion[];
  };
  /** Las anteriores, de la más reciente a la más antigua. */
  solicitudesAnteriores: ResumenSolicitudVerificacion[];
}

/**
 * GET /api/verificaciones/{codigoPublico}/documentos/{numero} (E10-H7): enlace firmado que vence
 * en 60 s. Backend `consulta-verificacion.service.ts` › `EnlaceDocumento`.
 */
export interface EnlaceDocumentoVerificacion {
  url: string;
  /** ISO 8601. */
  venceEn: string;
  tipo: TipoDocumentoVerificacion;
  nombreArchivo: string;
}

/**
 * POST /api/verificaciones/{codigoPublico}/aprobar y …/rechazar (E10-H3). Backend
 * `revision-verificacion.service.ts` › `SolicitudResuelta`.
 */
export interface SolicitudResuelta {
  codigoPublicoCuenta: string;
  estado: 'aprobada' | 'rechazada';
  fechaSolicitud: string;
  fechaResolucion: string;
  motivoRechazo: string | null;
  resolutor: ResolutorSolicitud;
}

/**
 * GET y PUT /api/cuentas/yo/ofertas (E12-H2). TODO(SCRUM-69): el backend aún no lo tiene; forma
 * propuesta en docs/historias/SCRUM-139.md (API simulada). Sale de `Usuario.aceptaMarketingEmail`,
 * `fechaConsentimientoMarketing` y `fechaVerificacionCorreo`.
 */
export interface PreferenciaOfertas {
  /** Si la cuenta acepta publicidad por correo. */
  activa: boolean;
  /** ISO 8601. Cuándo la activó; `null` si nunca la activó o la desactivó. */
  fechaConsentimiento: string | null;
  email: string;
  correoVerificado: boolean;
}

/*
 * Campañas del panel (E12-H3). TODO(SCRUM-70): el backend aún no las tiene; forma propuesta en
 * docs/historias/SCRUM-140.md (API simulada). Permiso `campanas.gestionar`. Quién cuenta como
 * destinatario (consentimiento, rebotes) y los textos del segmento los decide el backend.
 */

export type EstadoCampana = 'borrador' | 'enviada';

/** Contactos con consentimiento: los contadores de «Campañas». */
export interface ContactosCampanas {
  aceptanPublicidad: number;
  cuentasVerificadas: number;
  suscriptoresSinCuenta: number;
  conRebote: number;
}

/** Una fila de GET /api/gestion/campanas. */
export interface CampanaListada {
  codigo: string;
  asunto: string;
  /** Texto del segmento armado por el backend, p. ej. «Profesionales · Colorimetría». */
  segmento: string;
  /** Borrador: los que recibirían hoy; enviada: a cuántos salió. */
  destinatarios: number;
  estado: EstadoCampana;
  /** ISO 8601. */
  fechaEdicion: string;
  /** ISO 8601; `null` en un borrador. */
  fechaEnvio: string | null;
  /** 0 a 100; `null` en un borrador. */
  porcentajeApertura: number | null;
}

/** GET /api/gestion/campanas. */
export interface ListadoCampanas {
  contactos: ContactosCampanas;
  /** En el orden del backend (las más recientes primero). */
  campanas: CampanaListada[];
}

export interface OpcionSegmento {
  valor: string;
  texto: string;
}

/** Criterio extra de un tipo de segmento, p. ej. especialidad para «Profesionales». */
export interface CriterioSegmento {
  clave: string;
  texto: string;
  opciones: OpcionSegmento[];
}

export interface TipoSegmento extends OpcionSegmento {
  criterios: CriterioSegmento[];
}

/** GET /api/gestion/campanas/segmentos: lo que se puede elegir en «¿A quién le llega?». */
export interface OpcionesSegmentoCampana {
  tipos: TipoSegmento[];
}

/** El segmento elegido, como se envía y se guarda. */
export interface SegmentoCampana {
  tipo: string;
  /** Un valor por criterio como máximo. */
  criterios: { clave: string; valor: string }[];
}

/** Cuerpo de POST /api/gestion/campanas, PUT …/{codigo} y POST …/vista-previa. */
export interface DatosCampana {
  asunto: string;
  /** Texto simple: párrafos separados por una línea en blanco; `{nombre}` se reemplaza. */
  cuerpo: string;
  segmento: SegmentoCampana;
}

/** GET /api/gestion/campanas/{codigo}, y respuesta de POST y PUT. */
export interface CampanaGestion extends DatosCampana {
  codigo: string;
  estado: EstadoCampana;
  /** ISO 8601. */
  fechaEdicion: string;
  /** ISO 8601; `null` en un borrador. */
  fechaEnvio: string | null;
}

/** POST /api/gestion/campanas/vista-previa: el correo como lo verá quien lo recibe. */
export interface VistaPreviaCampana {
  /** Nombre del remitente (RNF-26). */
  remitente: string;
  asunto: string;
  /** El cuerpo en párrafos, con `{nombre}` ya reemplazado por un nombre de ejemplo. */
  parrafos: string[];
  /** Por qué le llega, p. ej. «Recibes este correo porque aceptaste ofertas…». */
  pie: string;
  /** Texto del enlace de baja que lleva cada correo (RNF-26). */
  textoBaja: string;
  /** Destinatarios con consentimiento del segmento, contados por el backend. */
  destinatarios: number;
  /** Texto del segmento, como en el listado. */
  segmento: string;
}

/** POST /api/gestion/campanas/{codigo}/envio (202). Sale una sola vez; otra vez, 409. */
export interface CampanaEnviada {
  codigo: string;
  estado: 'enviada';
  destinatarios: number;
  /** ISO 8601. */
  fechaEnvio: string;
}

/**
 * GET y PATCH /api/gestion/campanas/cumpleanos (E12-H5). TODO(SCRUM-72): el backend aún no lo
 * tiene; forma propuesta en docs/historias/SCRUM-141.md (API simulada). Permiso
 * `campanas.gestionar`. Qué es la oferta del saludo sigue por definir.
 */
export interface SaludoCumpleanos {
  activo: boolean;
  incluyeOferta: boolean;
  /** Asunto del correo, con `{nombre}` sin reemplazar. */
  asunto: string;
  /** Saludos que saldrán en el mes en curso, contados por el backend. */
  programadosEsteMes: number;
  /** 0 a 100; `null` si el mes anterior no salió ninguno. */
  porcentajeAperturaUltimoMes: number | null;
}

/** Cuerpo de PATCH /api/gestion/campanas/cumpleanos: solo lo que cambia. */
export type CambioSaludoCumpleanos = Partial<
  Pick<SaludoCumpleanos, 'activo' | 'incluyeOferta'>
>;

/**
 * Pedidos y montos de un tipo de cliente en el reporte de ventas (E14-H2). Montos en pesos,
 * cerrados del pedido y con el despacho incluido. Backend:
 * src/modulos/reportes/reporte-ventas.service.ts (`TotalesVentas`).
 */
export interface TotalesVentas {
  pedidos: number;
  montoNeto: number;
  montoIva: number;
  montoTotal: number;
}

/**
 * GET /api/reportes/ventas?desde&hasta (E14-H2): pedidos pagados del período (ambos días
 * incluidos, hora de Chile), separados por el precio que se aplicó al comprar. Sin pedidos, todo
 * en cero. El Swagger no declara la respuesta. Backend:
 * src/modulos/reportes/reporte-ventas.service.ts (`ReporteVentas`).
 */
export interface ReporteVentas {
  /** AAAA-MM-DD */
  desde: string;
  /** AAAA-MM-DD */
  hasta: string;
  /** Compras a precio minorista: «Cliente» en el panel. */
  minorista: TotalesVentas;
  /** Compras a precio mayorista: «Profesional» en el panel. */
  mayorista: TotalesVentas;
  total: TotalesVentas;
}

/** Objetivos específicos del proyecto (E14-H1). */
export type CodigoObjetivo = 'OE1' | 'OE2' | 'OE3';

/** Lo decide el backend al comparar el porcentaje con la meta (RNF-03). */
export type EstadoObjetivo = 'sobre-la-meta' | 'bajo-la-meta' | 'sin-datos';

export interface IndicadorObjetivo {
  codigo: CodigoObjetivo;
  /** Meta en porcentaje: 30, 70 u 80. */
  meta: number;
  /** De 0 a 100; `null` cuando no hay registros en el período. */
  porcentaje: number | null;
  /** Registros que cumplen (OE1: cuentas verificadas que compraron a precio mayorista). */
  cumplen: number;
  /** Registros considerados (OE1: cuentas con solicitud). */
  total: number;
  estado: EstadoObjetivo;
}

/**
 * GET /api/reportes/objetivos?desde&hasta (E14-H1). API SIMULADA: el endpoint aún no existe;
 * forma propuesta a SCRUM-74 (ver docs/historias/SCRUM-142.md). El backend calcula porcentaje,
 * meta y estado; el frontend solo los muestra.
 */
export interface ReporteObjetivos {
  /** AAAA-MM-DD */
  desde: string;
  /** AAAA-MM-DD */
  hasta: string;
  objetivos: IndicadorObjetivo[];
}
