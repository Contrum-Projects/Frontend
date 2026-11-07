import { RUTAS, urlCatalogo } from '@/tienda/diseno/enlaces';
import { Lista, type PaginaInformativa } from './paginaInformativa';

type Contenido = Omit<Parameters<typeof PaginaInformativa>[0], 'migas'>;

/*
 * Cada afirmación de estas páginas sale de una regla del backend (cp-backend/docs/reglas-de-
 * negocio.md, citada al lado). No se escriben datos que dependen de la configuración (plazo para
 * pagar, dirección de retiro) ni promesas que el sistema no cumple (plazos de revisión o de entrega).
 */

/** E2-H4, E10 (verificación con el SII o con documentos) y E10-H4 (aviso al aprobar). */
export const PRECIO_PROFESIONAL: Contenido = {
  titulo: 'Precio profesional',
  bajada:
    'Si trabajas en peluquería, verifica tu cuenta y compra a precio profesional.',
  secciones: [
    {
      titulo: 'Qué obtienes',
      contenido: (
        <Lista>
          <li>
            Ves el precio profesional de cada producto, con IVA incluido, junto
            al precio normal.
          </li>
          <li>Ves y compras los productos exclusivos para profesionales.</li>
        </Lista>
      ),
    },
    {
      titulo: 'Cómo se verifica',
      contenido: (
        <>
          <p>
            Necesitas una cuenta con tu RUT. Al pedir la verificación revisamos
            en el SII tu inicio de actividades:
          </p>
          <Lista>
            <li>
              Si tienes el giro de peluquería y otros tratamientos de belleza
              (960200), tu cuenta se aprueba al instante.
            </li>
            <li>
              Si no, sube tu título, un certificado de curso u otro documento
              que lo acredite: hasta 5 archivos PDF, JPG o PNG de hasta 4 MB
              cada uno. Nuestro equipo los revisa.
            </li>
          </Lista>
          <p>
            Ninguna solicitud se rechaza de forma automática: si no se aprueba,
            te explicamos el motivo.
          </p>
        </>
      ),
    },
    {
      titulo: 'Cuando se aprueba',
      contenido: (
        <p>
          Te avisamos por correo y desde ese momento ves el precio profesional
          al entrar con tu cuenta. Revisamos los documentos solo para la
          verificación: se borran 30 días después de resolverla.
        </p>
      ),
    },
  ],
  acciones: [
    { texto: 'Verificar mi cuenta', href: RUTAS.verificacion },
    { texto: 'Crear una cuenta', href: RUTAS.registro },
  ],
};

/** E7 (despacho con Chilexpress o retiro), E7-H3 (seguimiento), E8-H2 (avisos) y E6-H3 (plazo de pago). */
export const DESPACHO_Y_RETIRO: Contenido = {
  titulo: 'Despacho y retiro',
  bajada:
    'Al comprar eliges si te lo enviamos a domicilio o si lo retiras en tienda.',
  secciones: [
    {
      titulo: 'Despacho a domicilio',
      contenido: (
        <>
          <p>
            Enviamos con Chilexpress a la dirección que elijas de tu cuenta. El
            costo del envío depende de la comuna y del peso y tamaño de tu
            pedido: lo ves, con IVA incluido, antes de pagar.
          </p>
          <p>
            Si en ese momento no podemos cotizar el envío, te lo decimos y
            puedes elegir retiro en tienda.
          </p>
        </>
      ),
    },
    {
      titulo: 'Retiro en tienda',
      contenido: (
        <p>
          No tiene costo. Te avisamos por correo cuando tu pedido esté listo
          para retirar.
        </p>
      ),
    },
    {
      titulo: 'Seguimiento',
      contenido: (
        <>
          <p>
            En tu pedido ves en qué estado está. Te escribimos cuando va en
            camino, cuando se entrega, cuando está listo para retiro y cuando lo
            retiras.
          </p>
          <p>
            Al despacharlo agregamos el código de seguimiento de Chilexpress,
            que ves en el detalle de tu pedido.
          </p>
        </>
      ),
    },
    {
      titulo: 'Pago',
      contenido: (
        <p>
          Pagas con Mercado Pago. Tu pedido muestra hasta cuándo puedes pagarlo:
          si no se paga a tiempo, se cancela y los productos vuelven a estar
          disponibles.
        </p>
      ),
    },
  ],
  acciones: [
    { texto: 'Ver mis pedidos', href: RUTAS.misPedidos },
    { texto: 'Ir al catálogo', href: urlCatalogo({}) },
  ],
};

/** E9 (boleta de Mercado Pago, factura registrada por el personal) y E9-H2 a E9-H4. */
export const COMPROBANTE_Y_FACTURA: Contenido = {
  titulo: 'Comprobante y factura',
  bajada:
    'Cada compra tiene su comprobante. Si lo necesitas para tu empresa, pide factura.',
  secciones: [
    {
      titulo: 'Boleta',
      contenido: (
        <p>
          Si no pides factura, el comprobante de tu pago en Mercado Pago es tu
          boleta. Su número de operación aparece en el detalle de tu pedido.
        </p>
      ),
    },
    {
      titulo: 'Factura',
      contenido: (
        <>
          <p>
            Guarda los datos de facturación en tu cuenta: RUT, razón social,
            giro, dirección y comuna. Puedes tener varios y elegir uno al
            comprar.
          </p>
          <p>
            Después del pago emitimos la factura en el SII con esos datos.
            Cuando está lista, la descargas en PDF desde el detalle de tu
            pedido.
          </p>
        </>
      ),
    },
  ],
  acciones: [
    { texto: 'Mis datos de facturación', href: RUTAS.facturacion },
    { texto: 'Ver mis pedidos', href: RUTAS.misPedidos },
  ],
};
