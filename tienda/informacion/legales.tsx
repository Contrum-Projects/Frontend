import Link from 'next/link';
import { CORREO_CONTACTO } from '@/tienda/diseno/contacto';
import { RUTAS } from '@/tienda/diseno/enlaces';
import { Lista, type PaginaInformativa } from './paginaInformativa';

type Contenido = Omit<Parameters<typeof PaginaInformativa>[0], 'migas'>;

/*
 * BORRADOR para la clienta (15 nov 2026), pendiente de revisión por un abogado. Lo que dice del
 * funcionamiento de la tienda sale de cp-backend/docs/reglas-de-negocio.md (épica citada al
 * lado). Los datos de la empresa van entre corchetes hasta que la clienta los entregue.
 *
 * Marco legal: Ley 19.496 (protección de los derechos de los consumidores, con los cambios de la
 * Ley 21.398) y Ley 19.628 reformada por la Ley 21.719 (protección de datos personales), que
 * rige desde el 1 de diciembre de 2026.
 */

const ACTUALIZACION = 'Borrador del 15 de noviembre de 2026.';

/** Aviso de borrador sobre el título de las dos páginas. */
export const AVISO_BORRADOR =
  'Borrador en revisión. Este texto todavía no es la versión final ni ha sido revisado por un abogado.';

const Correo = () => (
  <a
    href={`mailto:${CORREO_CONTACTO}`}
    className="rounded-md text-marca-profundo underline"
  >
    {CORREO_CONTACTO}
  </a>
);

const DATOS_EMPRESA = (
  <Lista>
    <li>Razón social: [RAZÓN SOCIAL]</li>
    <li>RUT: [RUT DE LA EMPRESA]</li>
    <li>Domicilio: [DIRECCIÓN, COMUNA, REGIÓN]</li>
    <li>Representante legal: [NOMBRE]</li>
    <li>
      Correo de contacto: <Correo />
    </li>
  </Lista>
);

export const TERMINOS_Y_CONDICIONES: Contenido = {
  titulo: 'Términos y condiciones',
  bajada: `Las reglas para comprar en Cabello Perfecto. ${ACTUALIZACION}`,
  secciones: [
    {
      titulo: 'Quiénes somos',
      contenido: (
        <>
          <p>
            Cabello Perfecto es una tienda de productos capilares. Este sitio lo
            opera:
          </p>
          {DATOS_EMPRESA}
          <p>
            Al comprar aceptas estos términos. Si los cambiamos, publicamos la
            nueva versión aquí con su fecha; cada compra se rige por los
            términos vigentes el día en que la hiciste.
          </p>
        </>
      ),
    },
    {
      // E1
      titulo: 'Tu cuenta',
      contenido: (
        <Lista>
          <li>
            Para comprar necesitas una cuenta con tu correo confirmado. Puedes
            ver el catálogo sin cuenta.
          </li>
          <li>
            Tus datos deben ser verdaderos y estar al día. Tu contraseña es
            personal: si crees que alguien más la conoce, cámbiala.
          </li>
          <li>
            Podemos desactivar una cuenta que se use para fraudes o para dañar
            la tienda. Te avisamos el motivo y puedes pedir que lo revisemos.
          </li>
        </Lista>
      ),
    },
    {
      // E2-H4, E10
      titulo: 'Precio profesional',
      contenido: (
        <>
          <p>
            Si trabajas en peluquería, puedes verificar tu cuenta para comprar a
            precio profesional y ver los productos exclusivos. Revisamos tu
            inicio de actividades en el SII o los documentos que subas.
          </p>
          <p>
            El precio profesional es para tu trabajo. Si la información que
            entregaste no es verdadera, podemos retirar la verificación.
          </p>
        </>
      ),
    },
    {
      // E2, E5, RNF-11
      titulo: 'Precios y stock',
      contenido: (
        <Lista>
          <li>
            Los precios están en pesos chilenos e incluyen IVA. El costo del
            despacho se muestra aparte, antes de pagar.
          </li>
          <li>
            Pagas el precio que ves al confirmar el pedido, aunque después
            cambie.
          </li>
          <li>
            Al crear el pedido reservamos los productos. Si un producto se agota
            antes, no te dejamos confirmarlo.
          </li>
        </Lista>
      ),
    },
    {
      // E6
      titulo: 'Pago',
      contenido: (
        <>
          <p>
            Pagas con Mercado Pago. Nosotros no vemos ni guardamos los datos de
            tu tarjeta.
          </p>
          <p>
            Tu pedido muestra hasta cuándo puedes pagarlo. Si no se paga a
            tiempo, se cancela y los productos vuelven a estar disponibles. La
            compra queda hecha cuando Mercado Pago aprueba el pago: te avisamos
            por correo.
          </p>
        </>
      ),
    },
    {
      // E7
      titulo: 'Despacho y retiro',
      contenido: (
        <p>
          Enviamos con Chilexpress a la dirección que elijas, o puedes retirar
          sin costo en [DIRECCIÓN Y HORARIO DE RETIRO]. Los detalles están en{' '}
          <Link
            href={RUTAS.despacho}
            className="rounded-md text-marca-profundo underline"
          >
            Despacho y retiro
          </Link>
          . Revisa tu pedido al recibirlo y escríbenos si llega dañado o
          incompleto.
        </p>
      ),
    },
    {
      // E9
      titulo: 'Boleta y factura',
      contenido: (
        <p>
          Si no pides factura, el comprobante de Mercado Pago es tu boleta. Si
          la pides, la emitimos en el SII con los datos de facturación que
          elegiste y la descargas desde tu pedido.
        </p>
      ),
    },
    {
      titulo: 'Derecho a retracto',
      contenido: (
        <>
          <p>
            Como compraste a distancia, tienes 10 días desde que recibes el
            pedido para arrepentirte (artículo 3 bis de la Ley 19.496).
          </p>
          <Lista>
            <li>
              Por higiene, el producto debe venir sin abrir, sin uso y con su
              sello y envase original.
            </li>
            <li>
              Escríbenos a <Correo /> con el código de tu pedido. Te decimos
              cómo devolverlo.
            </li>
            <li>
              Te devolvemos lo que pagaste por el producto, por el mismo medio
              de pago, dentro de [PLAZO] desde que lo recibimos. [QUIÉN PAGA EL
              ENVÍO DE LA DEVOLUCIÓN].
            </li>
          </Lista>
        </>
      ),
    },
    {
      titulo: 'Garantía legal',
      contenido: (
        <>
          <p>
            Si un producto viene defectuoso, vencido o no es lo que compraste,
            tienes 6 meses desde que lo recibes para elegir entre cambiarlo o
            que te devolvamos lo que pagaste (artículos 19 y 20 de la Ley
            19.496).
          </p>
          <p>
            Escríbenos a <Correo /> con el código de tu pedido y una foto del
            producto. Esta garantía no se aplica al daño por mal uso.
          </p>
        </>
      ),
    },
    {
      // E12
      titulo: 'Correos de ofertas',
      contenido: (
        <p>
          Si recibes nuestras ofertas por correo y ya no las quieres, escríbenos
          a <Correo /> y te damos de baja. Los correos de tus pedidos y de tu
          cuenta te siguen llegando, porque son parte de tu compra.
        </p>
      ),
    },
    {
      titulo: 'Uso del sitio',
      contenido: (
        <p>
          Los textos, fotos, logos y el diseño de este sitio son de Cabello
          Perfecto o de las marcas que vendemos. No los copies ni los uses sin
          permiso. Las marcas de los productos son de sus dueños.
        </p>
      ),
    },
    {
      titulo: 'Reclamos y ley aplicable',
      contenido: (
        <p>
          Estos términos se rigen por las leyes de Chile. Si tienes un reclamo,
          escríbenos a <Correo /> y te respondemos dentro de [PLAZO]. También
          puedes acudir al SERNAC o al juzgado de policía local de tu comuna.
        </p>
      ),
    },
  ],
  acciones: [
    { texto: 'Política de privacidad', href: RUTAS.privacidad },
    { texto: 'Ir al catálogo', href: RUTAS.catalogo },
  ],
};

export const POLITICA_DE_PRIVACIDAD: Contenido = {
  titulo: 'Política de privacidad',
  bajada: `Qué datos tuyos usamos, para qué y cómo ejercer tus derechos. ${ACTUALIZACION}`,
  secciones: [
    {
      titulo: 'Quién es responsable de tus datos',
      contenido: (
        <>
          <p>
            Esta política cumple la Ley 19.628 sobre protección de la vida
            privada, con los cambios de la Ley 21.719, que rige desde el 1 de
            diciembre de 2026. El responsable de tus datos es:
          </p>
          {DATOS_EMPRESA}
        </>
      ),
    },
    {
      // E1, E9, E10, E8, E12, RNF-09
      titulo: 'Qué datos usamos',
      contenido: (
        <Lista>
          <li>
            <strong>Tu cuenta:</strong> nombre, apellido, correo y contraseña
            (guardada cifrada, nadie puede leerla). Si los das: teléfono, RUT,
            fecha de nacimiento y género.
          </li>
          <li>
            <strong>Tus compras:</strong> direcciones de despacho, datos de
            facturación (RUT, razón social, giro, dirección), pedidos y el
            número de operación de tu pago. No recibimos los datos de tu
            tarjeta.
          </li>
          <li>
            <strong>Si pides precio profesional:</strong> tu RUT, el resultado
            de la consulta de tu inicio de actividades en el SII, los documentos
            que subas y tu perfil profesional.
          </li>
          <li>
            <strong>Correos de ofertas:</strong> tu correo, la fecha en que
            aceptaste recibirlos y si abres los correos o haces clic en ellos.
          </li>
          <li>
            <strong>Seguridad:</strong> la dirección IP y los intentos de
            ingreso, para evitar accesos indebidos y abusos.
          </li>
        </Lista>
      ),
    },
    {
      titulo: 'Para qué los usamos',
      contenido: (
        <Lista>
          <li>
            <strong>Para venderte:</strong> crear tu cuenta, preparar, cobrar,
            despachar y facturar tus pedidos y avisarte de su estado. Es
            necesario para cumplir la compra.
          </li>
          <li>
            <strong>Para verificar que eres profesional,</strong> cuando lo
            pides.
          </li>
          <li>
            <strong>Para cumplir la ley:</strong> guardar boletas y facturas
            como exigen las normas tributarias.
          </li>
          <li>
            <strong>Para enviarte ofertas,</strong> recordarte un carrito sin
            terminar y saludarte en tu cumpleaños, solo con tu consentimiento.
          </li>
          <li>
            <strong>Para proteger la tienda</strong> y a sus clientes de fraudes
            y accesos indebidos.
          </li>
        </Lista>
      ),
    },
    {
      // E10, RNF-27
      titulo: 'Decisiones automáticas',
      contenido: (
        <p>
          Cuando pides precio profesional, el sistema consulta tu inicio de
          actividades en el SII. Si tienes el giro de peluquería, tu cuenta se
          aprueba al instante. El sistema nunca rechaza una solicitud por sí
          solo: en cualquier otro caso la revisa una persona de nuestro equipo.
        </p>
      ),
    },
    {
      // E6, E7, E10, E1-H6, E3-H3
      titulo: 'Con quién los compartimos',
      contenido: (
        <>
          <p>
            No vendemos tus datos. Solo los compartimos con los servicios que
            necesitamos para operar, que los usan por encargo nuestro:
          </p>
          <Lista>
            <li>Mercado Pago, para cobrar tus pedidos.</li>
            <li>
              Chilexpress, para el despacho: tu nombre, dirección y teléfono.
            </li>
            <li>
              Khipu, para consultar tu inicio de actividades en el SII con tu
              RUT.
            </li>
            <li>Resend, para enviarte los correos.</li>
            <li>
              Cloudflare, para guardar los documentos y archivos de la tienda.
            </li>
            <li>[PROVEEDOR DE HOSTING], donde funciona el sitio.</li>
          </Lista>
          <p>
            Algunos de estos servicios guardan datos fuera de Chile. Solo
            trabajamos con proveedores que se comprometen a protegerlos con un
            nivel adecuado. También entregamos datos a una autoridad cuando la
            ley lo exige.
          </p>
        </>
      ),
    },
    {
      // E10-H6
      titulo: 'Cuánto tiempo los guardamos',
      contenido: (
        <Lista>
          <li>Los datos de tu cuenta, mientras la tengas.</li>
          <li>
            Los documentos de la verificación profesional se borran 30 días
            después de resolver tu solicitud. Guardamos solo el resultado.
          </li>
          <li>
            Los pedidos, boletas y facturas, durante el plazo que exigen las
            normas tributarias (6 años).
          </li>
          <li>Tu correo para ofertas, hasta que pidas la baja.</li>
        </Lista>
      ),
    },
    {
      titulo: 'Tus derechos',
      contenido: (
        <>
          <p>Cuando quieras, puedes pedirnos:</p>
          <Lista>
            <li>
              <strong>Acceso:</strong> saber qué datos tuyos tenemos y para qué.
            </li>
            <li>
              <strong>Rectificación:</strong> corregir los que estén mal. Muchos
              los cambias tú en Mis datos.
            </li>
            <li>
              <strong>Supresión:</strong> borrar tus datos, salvo los que la ley
              nos obliga a guardar.
            </li>
            <li>
              <strong>Oposición:</strong> que dejemos de usarlos para un fin,
              como las ofertas.
            </li>
            <li>
              <strong>Portabilidad:</strong> recibirlos en un formato que puedas
              llevar a otro lugar.
            </li>
            <li>
              <strong>Bloqueo:</strong> que dejemos de usarlos mientras se
              revisa otra solicitud tuya.
            </li>
            <li>
              Que una persona revise una decisión que el sistema tomó solo.
            </li>
          </Lista>
          <p>
            Escríbenos a <Correo /> desde el correo de tu cuenta. Es gratis. Te
            respondemos en 30 días corridos como máximo; si necesitamos más
            tiempo, te avisamos y son hasta 30 días más.
          </p>
          <p>
            Si no te respondemos o no estás de acuerdo con la respuesta, puedes
            reclamar ante la Agencia de Protección de Datos Personales.
          </p>
        </>
      ),
    },
    {
      // E12
      titulo: 'Correos de ofertas',
      contenido: (
        <p>
          Te enviamos ofertas solo si las aceptaste. Para dejar de recibirlas,
          escríbenos a <Correo /> y te damos de baja de inmediato. Cada correo
          de ofertas trae esa dirección al pie.
        </p>
      ),
    },
    {
      // RNF-01 a RNF-10
      titulo: 'Cómo los protegemos',
      contenido: (
        <>
          <p>
            Usamos conexión cifrada, guardamos las contraseñas cifradas y solo
            el personal que lo necesita para su trabajo ve tus datos.
          </p>
          <p>
            Si ocurre un incidente que ponga en riesgo tus datos, lo informamos
            a la Agencia de Protección de Datos Personales y, cuando
            corresponda, a ti, como exige la ley.
          </p>
        </>
      ),
    },
    {
      // E1-H2 (cookie de refresco), E5 (carrito del visitante)
      titulo: 'Cookies',
      contenido: (
        <Lista>
          <li>
            Usamos una cookie solo para mantener tu sesión iniciada. Sin ella no
            puedes entrar a tu cuenta.
          </li>
          <li>
            Si compras sin sesión, tu carrito se guarda en tu navegador hasta
            que ingreses.
          </li>
          <li>No usamos cookies de publicidad ni de seguimiento.</li>
        </Lista>
      ),
    },
    {
      titulo: 'Menores de edad',
      contenido: (
        <p>
          La tienda está dirigida a personas mayores de 18 años. Si eres menor
          de 14, no crees una cuenta sin la autorización de tu madre, padre o
          tutor.
        </p>
      ),
    },
    {
      titulo: 'Cambios a esta política',
      contenido: (
        <p>
          Si cambiamos esta política, publicamos la nueva versión aquí con su
          fecha. Si el cambio es importante, te avisamos por correo.
        </p>
      ),
    },
  ],
  acciones: [
    { texto: 'Términos y condiciones', href: RUTAS.terminos },
    { texto: 'Mis datos', href: RUTAS.misDatos },
  ],
};
