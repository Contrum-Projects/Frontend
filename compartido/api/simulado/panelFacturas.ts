/**
 * Rutas simuladas de la facturación del panel.
 *
 * SCRUM-127 · `GET /gestion/facturas` y `GET /gestion/facturas/:codigoPedido`: el backend aún no
 * lista los pedidos que pidieron factura. Datos fijos con la forma propuesta a SCRUM-55 (ver
 * docs/historias/SCRUM-127.md): el conteo «por emitir» y el orden vienen escritos.
 *
 * `POST /pedidos/:codigoPedido/factura` y `GET /pedidos/:codigoPedido/factura` ya existen en el
 * backend: aquí solo se responde para los códigos simulados (que el backend no conoce) y el
 * detalle no cambia al registrar, porque es fijo.
 */
import 'server-only';
import type {
  DetalleFacturaGestion,
  FacturaGestion,
  ListadoFacturasGestion,
} from '@/compartido/api/respuestas';
import { errorSimulado, json, type RutaSimulada } from './index';

const DETALLES: readonly DetalleFacturaGestion[] = [
  {
    codigoPedido: 'FACTPOREMI01',
    estado: 'por_emitir',
    receptor: {
      razonSocial: 'Peluquería Ejemplo SpA',
      rut: '76123456-0',
      giro: 'peluquería',
      direccion: 'Av. Muestra 450',
      comuna: 'Providencia',
    },
    montos: { neto: 61504, iva: 11686, total: 73190 },
    porcentajeIva: 19,
    folio: null,
    fechaEmision: null,
  },
  {
    codigoPedido: 'FACTPOREMI02',
    estado: 'por_emitir',
    receptor: {
      razonSocial: 'Barbería Muestra Ltda.',
      rut: '77456789-5',
      giro: 'barbería',
      direccion: 'Calle Prueba 1200, local 3',
      comuna: 'Ñuñoa',
    },
    montos: { neto: 26798, iva: 5092, total: 31890 },
    porcentajeIva: 19,
    folio: null,
    fechaEmision: null,
  },
  {
    codigoPedido: 'FACTEMITID01',
    estado: 'emitida',
    receptor: {
      razonSocial: 'Estudio Ejemplo Ltda.',
      rut: '78234567-2',
      giro: 'salón de belleza',
      direccion: 'Pasaje Demo 88',
      comuna: 'Santiago',
    },
    montos: { neto: 38000, iva: 7220, total: 45220 },
    porcentajeIva: 19,
    folio: 1532,
    fechaEmision: '2026-10-30',
  },
];

/** El folio que la ruta simulada da por repetido, para ver el error de E9-H3 (criterio 3). */
const FOLIO_REPETIDO = 1532;

const filaDe = (detalle: DetalleFacturaGestion): FacturaGestion => ({
  codigoPedido: detalle.codigoPedido,
  razonSocial: detalle.receptor.razonSocial,
  rut: detalle.receptor.rut,
  total: detalle.montos.total,
  estado: detalle.estado,
  folio: detalle.folio,
});

const facturaSimulada = (codigo: string) =>
  DETALLES.find((detalle) => detalle.codigoPedido === codigo);

const sinSesion = (peticion: Request) =>
  peticion.headers.has('authorization')
    ? null
    : errorSimulado(401, 'Debes iniciar sesión.');

/** Lo mínimo para que el navegador lo reconozca como PDF. */
const PDF_DE_PRUEBA = '%PDF-1.4\n%simulado SCRUM-127\n%%EOF\n';

export const rutasPanelFacturas: RutaSimulada[] = [
  {
    metodo: 'GET',
    ruta: '/gestion/facturas',
    historia: 'SCRUM-127',
    responder: ({ peticion }) => {
      const noAutorizado = sinSesion(peticion);
      if (noAutorizado) return noAutorizado;
      const listado: ListadoFacturasGestion = {
        items: DETALLES.map(filaDe),
        porEmitir: 2,
        total: DETALLES.length,
        pagina: 1,
        limite: 20,
      };
      return json(listado);
    },
  },
  {
    metodo: 'GET',
    ruta: '/gestion/facturas/:codigoPedido',
    historia: 'SCRUM-127',
    responder: ({ peticion, params }) => {
      const noAutorizado = sinSesion(peticion);
      if (noAutorizado) return noAutorizado;
      const detalle = facturaSimulada(params.codigoPedido);
      return detalle
        ? json(detalle)
        : errorSimulado(404, 'El pedido no existe.');
    },
  },
  {
    metodo: 'POST',
    ruta: '/pedidos/:codigoPedido/factura',
    historia: 'SCRUM-127',
    // El endpoint existe (SCRUM-55), pero no conoce los pedidos simulados: los demás van al backend
    responder: async ({ peticion, params }) => {
      const detalle = facturaSimulada(params.codigoPedido);
      if (!detalle) return null;
      const noAutorizado = sinSesion(peticion);
      if (noAutorizado) return noAutorizado;
      if (detalle.estado === 'emitida') {
        return errorSimulado(409, 'El pedido ya tiene una factura registrada.');
      }
      const datos = await peticion.formData().catch(() => null);
      const archivo = datos?.get('archivo');
      if (!(archivo instanceof Blob)) {
        return errorSimulado(
          400,
          'Adjunta el PDF de la factura en el campo «archivo».',
        );
      }
      const folio = Number(datos?.get('folio'));
      if (!Number.isInteger(folio) || folio < 1) {
        return errorSimulado(
          400,
          'El folio debe ser un número entero positivo.',
        );
      }
      if (folio === FOLIO_REPETIDO) {
        return errorSimulado(
          409,
          `Ya existe una factura con el folio ${folio}.`,
        );
      }
      const fecha = datos?.get('fechaEmision');
      return json(
        {
          codigoPedido: detalle.codigoPedido,
          tipo: 'factura',
          folio,
          fechaEmision: typeof fecha === 'string' ? fecha : '2026-11-04',
          estado: 'emitido',
        },
        201,
      );
    },
  },
  {
    metodo: 'GET',
    ruta: '/pedidos/:codigoPedido/factura',
    historia: 'SCRUM-127',
    responder: ({ peticion, params }) => {
      const detalle = facturaSimulada(params.codigoPedido);
      if (!detalle) return null;
      const noAutorizado = sinSesion(peticion);
      if (noAutorizado) return noAutorizado;
      if (detalle.estado !== 'emitida') {
        return errorSimulado(
          404,
          'La factura del pedido aún no está registrada.',
        );
      }
      return new Response(PDF_DE_PRUEBA, {
        headers: {
          'content-type': 'application/pdf',
          'content-disposition': `attachment; filename="factura-${detalle.folio}.pdf"`,
        },
      });
    },
  },
];
