/**
 * Rutas simuladas de las ofertas por correo (docs/api-simulada.md).
 *
 * SCRUM-139 · `GET` y `PUT /cuentas/yo/ofertas` y `POST /marketing/bajas`: el backend aún no tiene
 * la historia SCRUM-69. Forma propuesta en docs/historias/SCRUM-139.md. Datos fijos: el PUT
 * devuelve lo pedido con una fecha fija, sin guardarlo.
 */
import 'server-only';
import type { PreferenciaOfertas } from '@/compartido/api/respuestas';
import { errorSimulado, json, type RutaSimulada } from './index';

const PREFERENCIA: PreferenciaOfertas = {
  activa: true,
  fechaConsentimiento: '2026-09-12T15:00:00.000Z',
  email: 'camila@correo.cl',
  correoVerificado: true,
};

const sinSesion = (peticion: Request) =>
  peticion.headers.has('authorization')
    ? null
    : errorSimulado(401, 'Debes iniciar sesión.');

/** Token de prueba que responde como un enlace que no es válido. */
const TOKEN_INVALIDO = 'invalido';

const leerActiva = async (peticion: Request): Promise<boolean | null> => {
  try {
    const cuerpo: unknown = await peticion.json();
    if (typeof cuerpo !== 'object' || cuerpo === null) return null;
    const { activa } = cuerpo as { activa?: unknown };
    return typeof activa === 'boolean' ? activa : null;
  } catch {
    return null;
  }
};

export const rutasOfertas: RutaSimulada[] = [
  {
    metodo: 'GET',
    ruta: '/cuentas/yo/ofertas',
    historia: 'SCRUM-139',
    responder: ({ peticion }) => sinSesion(peticion) ?? json(PREFERENCIA),
  },
  {
    metodo: 'PUT',
    ruta: '/cuentas/yo/ofertas',
    historia: 'SCRUM-139',
    responder: async ({ peticion }) => {
      const noAutorizado = sinSesion(peticion);
      if (noAutorizado) return noAutorizado;
      const activa = await leerActiva(peticion);
      if (activa === null) {
        return errorSimulado(400, ['activa must be a boolean value']);
      }
      // El backend decide: sin el correo verificado no se activa (la pantalla solo lo refleja)
      if (activa && !PREFERENCIA.correoVerificado) {
        return errorSimulado(409, 'Verifica tu correo para recibir ofertas.');
      }
      return json({
        ...PREFERENCIA,
        activa,
        fechaConsentimiento: activa ? PREFERENCIA.fechaConsentimiento : null,
      } satisfies PreferenciaOfertas);
    },
  },
  {
    metodo: 'POST',
    ruta: '/marketing/bajas',
    historia: 'SCRUM-139',
    responder: async ({ peticion }) => {
      const cuerpo = (await peticion.json().catch(() => null)) as {
        token?: unknown;
      } | null;
      if (
        typeof cuerpo?.token !== 'string' ||
        cuerpo.token === TOKEN_INVALIDO
      ) {
        return errorSimulado(400, 'El enlace de baja no es válido.');
      }
      return json({
        mensaje: 'Ya no recibirás publicidad en esta dirección de correo.',
      });
    },
  },
];
