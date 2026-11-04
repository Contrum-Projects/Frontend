/**
 * Rutas simuladas de los pedidos del panel.
 *
 * SCRUM-130 · `GET /gestion/pedidos` y `GET /gestion/pedidos/:codigoPedido`: el backend solo tiene
 * los pedidos de la cuenta del cliente. Datos fijos con la forma pedida a SCRUM-58 (ver
 * docs/historias/SCRUM-130.md): los grupos, sus conteos y los cambios permitidos de cada pedido
 * vienen escritos; el grupo y la búsqueda solo eligen filas.
 *
 * `POST /pedidos/:codigoPedido/estado` ya existe en el backend: aquí solo se responde para los
 * códigos simulados (que el backend no conoce) y el detalle no cambia, porque es fijo.
 */
import 'server-only';
import type {
  CambioPermitido,
  DetallePedidoGestion,
  GrupoPedidos,
  ListadoPedidosGestion,
  PedidoGestion,
} from '@/compartido/api/respuestas';
import { errorSimulado, json, type RutaSimulada } from './index';

const COMUNA = { codigoCut: '13120', nombre: 'Ñuñoa' };

const AVANCE: Omit<CambioPermitido, 'estado'> = {
  sentido: 'avance',
  pideCodigoSeguimiento: false,
  avisaAlCliente: false,
};
const RETROCESO: Omit<CambioPermitido, 'estado'> = {
  sentido: 'retroceso',
  pideCodigoSeguimiento: false,
  avisaAlCliente: false,
};

interface PedidoSimulado {
  fila: PedidoGestion;
  /** Las claves de los grupos en que aparece, además de «todos». */
  grupos: string[];
  detalle: Omit<
    DetallePedidoGestion,
    'codigoPublico' | 'fechaPedido' | 'estado' | 'tipoEntrega'
  >;
}

const SHAMPOO = {
  articuloId: 11,
  tipo: 'formato' as const,
  nombre: 'Shampoo reparador',
  nombreFormato: '300 ml',
  imagen: null,
  cantidad: 1,
  precioUnitario: 12990,
  subtotal: 12990,
};
const ACONDICIONADOR = {
  articuloId: 14,
  tipo: 'formato' as const,
  nombre: 'Acondicionador hidratante',
  nombreFormato: '300 ml',
  imagen: null,
  cantidad: 1,
  precioUnitario: 11990,
  subtotal: 11990,
};

const ENVIO = {
  servicio: 'Chilexpress · Día hábil siguiente',
  costo: 3990,
  estado: 'pendiente',
  codigoSeguimiento: null,
  fechaEstimada: null,
  destinatario: 'Cliente de prueba Uno',
  telefonoContacto: '+56 9 1234 5678',
  calle: 'Av. Ejemplo',
  numero: '1234',
  referencia: 'depto. 56',
  comuna: COMUNA,
};

const BASE = {
  pagarHasta: null,
  tipoDocumento: 'boleta' as const,
  porcentajeIva: 19,
  documento: null,
  idTransaccionPago: '1320000001',
  sePuedeCancelar: false,
};

const CLIENTE_UNO = {
  nombre: 'Cliente de prueba Uno',
  correo: 'cliente.uno@correo.test',
  telefono: '+56 9 1234 5678',
};
const CLIENTE_DOS = {
  nombre: 'Peluquería de prueba SpA',
  correo: 'peluqueria@correo.test',
  telefono: null,
};

const CREADO = (fecha: string) => ({
  estado: 'pendiente_pago',
  fecha,
  comentario: null,
  realizadoPor: 'Cliente',
});
const PAGADO = (fecha: string) => ({
  estado: 'pagado',
  fecha,
  comentario: null,
  realizadoPor: 'Sistema',
});

const PEDIDOS: PedidoSimulado[] = [
  {
    fila: {
      codigoPublico: 'PAGADODESP01',
      fechaPedido: '2026-11-03T13:14:00.000Z',
      cliente: CLIENTE_UNO.nombre,
      tipoEntrega: 'despacho',
      estado: 'pagado',
      total: 28970,
      unidades: 2,
    },
    grupos: ['por_preparar'],
    detalle: {
      ...BASE,
      montos: { neto: 24345, iva: 4625, total: 28970 },
      items: [SHAMPOO, ACONDICIONADOR],
      envio: ENVIO,
      cliente: CLIENTE_UNO,
      historial: [
        CREADO('2026-11-03T13:14:00.000Z'),
        PAGADO('2026-11-03T13:15:00.000Z'),
      ],
      cambiosPermitidos: [{ estado: 'en_preparacion', ...AVANCE }],
    },
  },
  {
    fila: {
      codigoPublico: 'PREPRETIRO01',
      fechaPedido: '2026-11-03T12:02:00.000Z',
      cliente: CLIENTE_DOS.nombre,
      tipoEntrega: 'retiro',
      estado: 'en_preparacion',
      total: 64950,
      unidades: 5,
    },
    grupos: ['por_preparar'],
    detalle: {
      ...BASE,
      tipoDocumento: 'factura',
      documento: {
        tipo: 'factura',
        estado: 'pendiente',
        folio: null,
        fechaEmision: null,
      },
      montos: { neto: 54580, iva: 10370, total: 64950 },
      items: [{ ...SHAMPOO, cantidad: 5, subtotal: 64950 }],
      envio: null,
      cliente: CLIENTE_DOS,
      historial: [
        CREADO('2026-11-03T12:02:00.000Z'),
        PAGADO('2026-11-03T12:04:00.000Z'),
        {
          estado: 'en_preparacion',
          fecha: '2026-11-03T14:30:00.000Z',
          comentario: 'Falta confirmar el tono.',
          realizadoPor: 'Personal de prueba',
        },
      ],
      cambiosPermitidos: [
        { estado: 'listo_para_retiro', ...AVANCE, avisaAlCliente: true },
        { estado: 'pagado', ...RETROCESO },
      ],
    },
  },
  {
    fila: {
      codigoPublico: 'LISTORETIR01',
      fechaPedido: '2026-11-02T21:40:00.000Z',
      cliente: CLIENTE_UNO.nombre,
      tipoEntrega: 'retiro',
      estado: 'listo_para_retiro',
      total: 12990,
      unidades: 1,
    },
    grupos: ['listos_para_retiro'],
    detalle: {
      ...BASE,
      montos: { neto: 10916, iva: 2074, total: 12990 },
      items: [SHAMPOO],
      envio: null,
      cliente: CLIENTE_UNO,
      historial: [
        CREADO('2026-11-02T21:40:00.000Z'),
        PAGADO('2026-11-02T21:41:00.000Z'),
        {
          estado: 'en_preparacion',
          fecha: '2026-11-03T11:00:00.000Z',
          comentario: null,
          realizadoPor: 'Personal de prueba',
        },
        {
          estado: 'listo_para_retiro',
          fecha: '2026-11-03T12:10:00.000Z',
          comentario: null,
          realizadoPor: 'Personal de prueba',
        },
      ],
      cambiosPermitidos: [
        { estado: 'retirado', ...AVANCE, avisaAlCliente: true },
        { estado: 'en_preparacion', ...RETROCESO },
      ],
    },
  },
  {
    fila: {
      codigoPublico: 'DESPACHADO01',
      fechaPedido: '2026-11-02T19:12:00.000Z',
      cliente: CLIENTE_DOS.nombre,
      tipoEntrega: 'despacho',
      estado: 'en_preparacion',
      total: 28970,
      unidades: 2,
    },
    grupos: ['por_preparar'],
    detalle: {
      ...BASE,
      montos: { neto: 24345, iva: 4625, total: 28970 },
      items: [SHAMPOO, ACONDICIONADOR],
      envio: { ...ENVIO, destinatario: CLIENTE_DOS.nombre },
      cliente: CLIENTE_DOS,
      historial: [
        CREADO('2026-11-02T19:12:00.000Z'),
        PAGADO('2026-11-02T19:13:00.000Z'),
        {
          estado: 'en_preparacion',
          fecha: '2026-11-03T10:00:00.000Z',
          comentario: null,
          realizadoPor: 'Personal de prueba',
        },
      ],
      cambiosPermitidos: [
        {
          estado: 'despachado',
          ...AVANCE,
          pideCodigoSeguimiento: true,
          avisaAlCliente: true,
        },
        { estado: 'pagado', ...RETROCESO },
      ],
    },
  },
  {
    fila: {
      codigoPublico: 'PENDPAGO0001',
      fechaPedido: '2026-11-04T09:30:00.000Z',
      cliente: CLIENTE_UNO.nombre,
      tipoEntrega: 'despacho',
      estado: 'pendiente_pago',
      total: 16980,
      unidades: 1,
    },
    grupos: ['pendientes_pago'],
    detalle: {
      ...BASE,
      pagarHasta: '2026-11-04T10:00:00.000Z',
      idTransaccionPago: null,
      montos: { neto: 14269, iva: 2711, total: 16980 },
      items: [SHAMPOO],
      envio: ENVIO,
      cliente: CLIENTE_UNO,
      historial: [CREADO('2026-11-04T09:30:00.000Z')],
      // Pagar es del pago (E6) y cancelar de su propia ruta (E8-H3)
      cambiosPermitidos: [],
      sePuedeCancelar: true,
    },
  },
];

const GRUPOS: GrupoPedidos[] = [
  { clave: 'por_preparar', nombre: 'Por preparar', cantidad: 3 },
  { clave: 'listos_para_retiro', nombre: 'Listos para retiro', cantidad: 1 },
  { clave: 'despachados', nombre: 'Despachados', cantidad: null },
  { clave: 'pendientes_pago', nombre: 'Pendientes de pago', cantidad: null },
  { clave: 'todos', nombre: 'Todos', cantidad: null },
];
const GRUPO_POR_DEFECTO = 'por_preparar';

/** Como el backend: sin token responde 401, para poder ver ese estado en el navegador. */
const sinSesion = (peticion: Request) =>
  peticion.headers.has('authorization')
    ? null
    : errorSimulado(401, 'Debes iniciar sesión.');

const buscado = ({ fila }: PedidoSimulado, texto: string) =>
  `${fila.codigoPublico} ${fila.cliente}`
    .toLowerCase()
    .includes(texto.toLowerCase());

const detalleDe = ({
  fila,
  detalle,
}: PedidoSimulado): DetallePedidoGestion => ({
  ...detalle,
  codigoPublico: fila.codigoPublico,
  fechaPedido: fila.fechaPedido,
  estado: fila.estado,
  tipoEntrega: fila.tipoEntrega,
});

const pedidoSimulado = (codigo: string) =>
  PEDIDOS.find(({ fila }) => fila.codigoPublico === codigo);

export const rutasPanelPedidos: RutaSimulada[] = [
  {
    metodo: 'GET',
    ruta: '/gestion/pedidos',
    historia: 'SCRUM-130',
    responder: ({ peticion, url }) => {
      const noAutorizado = sinSesion(peticion);
      if (noAutorizado) return noAutorizado;
      const grupo = url.searchParams.get('grupo') || GRUPO_POR_DEFECTO;
      const texto = url.searchParams.get('q') ?? '';
      const filas = PEDIDOS.filter(
        (pedido) =>
          (grupo === 'todos' || pedido.grupos.includes(grupo)) &&
          buscado(pedido, texto),
      );
      const listado: ListadoPedidosGestion = {
        items: filas.map(({ fila }) => fila),
        total: filas.length,
        pagina: 1,
        limite: 20,
        grupos: GRUPOS,
        grupo,
      };
      return json(listado);
    },
  },
  {
    metodo: 'GET',
    ruta: '/gestion/pedidos/:codigoPedido',
    historia: 'SCRUM-130',
    responder: ({ peticion, params }) => {
      const noAutorizado = sinSesion(peticion);
      if (noAutorizado) return noAutorizado;
      const pedido = pedidoSimulado(params.codigoPedido);
      return pedido
        ? json(detalleDe(pedido))
        : errorSimulado(404, 'El pedido no existe.');
    },
  },
  {
    metodo: 'POST',
    ruta: '/pedidos/:codigoPedido/estado',
    historia: 'SCRUM-130',
    // Los pedidos de verdad siguen al backend
    responder: async ({ peticion, params }) => {
      const pedido = pedidoSimulado(params.codigoPedido);
      if (!pedido) return null;
      const noAutorizado = sinSesion(peticion);
      if (noAutorizado) return noAutorizado;
      const cuerpo = (await peticion.json().catch(() => null)) as {
        estado?: unknown;
      } | null;
      const estado = typeof cuerpo?.estado === 'string' ? cuerpo.estado : '';
      if (!estado) return errorSimulado(400, 'El estado es obligatorio.');
      // Los cambios permitidos son datos fijos del pedido, no la secuencia del backend
      const permitido = pedido.detalle.cambiosPermitidos.some(
        (cambio) => cambio.estado === estado,
      );
      if (!permitido) {
        return errorSimulado(
          409,
          'El cambio no está permitido desde el estado actual del pedido.',
        );
      }
      return json({ codigoPublico: params.codigoPedido, estado });
    },
  },
  {
    metodo: 'POST',
    ruta: '/pedidos/:codigoPedido/cancelar',
    historia: 'SCRUM-131',
    // El endpoint existe (SCRUM-59), pero no conoce los pedidos simulados: los demás van al backend
    responder: ({ peticion, params }) => {
      const pedido = pedidoSimulado(params.codigoPedido);
      if (!pedido) return null;
      const noAutorizado = sinSesion(peticion);
      if (noAutorizado) return noAutorizado;
      if (!pedido.detalle.sePuedeCancelar) {
        return errorSimulado(
          409,
          'Solo se puede cancelar un pedido pendiente de pago.',
        );
      }
      return json({ codigoPublico: params.codigoPedido, estado: 'cancelado' });
    },
  },
];
