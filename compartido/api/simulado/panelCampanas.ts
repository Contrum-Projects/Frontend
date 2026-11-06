/**
 * Rutas simuladas de las campañas del panel.
 *
 * SCRUM-140 · El backend aún no tiene campañas (SCRUM-70). Datos fijos con la forma propuesta en
 * docs/historias/SCRUM-140.md. Los conteos de destinatarios vienen escritos por segmento: quién
 * tiene consentimiento lo decide el backend. Nada se guarda: el borrador y el envío responden
 * siempre lo mismo.
 */
import 'server-only';
import type {
  CampanaEnviada,
  CampanaGestion,
  DatosCampana,
  ListadoCampanas,
  OpcionesSegmentoCampana,
  VistaPreviaCampana,
} from '@/compartido/api/respuestas';
import { GRUPOS_ESPECIALIDADES } from '@/tienda/profesional/opcionesPerfil';
import { errorSimulado, json, type RutaSimulada } from './index';

const HISTORIA = 'SCRUM-140';
const LISTADO: ListadoCampanas = {
  contactos: {
    aceptanPublicidad: 2284,
    cuentasVerificadas: 1932,
    suscriptoresSinCuenta: 352,
    conRebote: 41,
  },
  campanas: [
    {
      codigo: 'CAMPBORRAD01',
      asunto: 'Tintes nuevos para el salón',
      segmento: 'Profesionales · Coloración y tinturas',
      destinatarios: 186,
      estado: 'borrador',
      fechaEdicion: '2026-11-04T13:20:00.000Z',
      fechaEnvio: null,
      porcentajeApertura: null,
    },
    {
      codigo: 'CAMPENVIAD01',
      asunto: 'Mascarillas 20% dcto.',
      segmento: 'Todos',
      destinatarios: 2140,
      estado: 'enviada',
      fechaEdicion: '2026-10-01T12:00:00.000Z',
      fechaEnvio: '2026-10-01T13:00:00.000Z',
      porcentajeApertura: 41,
    },
    {
      codigo: 'CAMPENVIAD02',
      asunto: 'Novedades para peluqueros',
      segmento: 'Profesionales',
      destinatarios: 312,
      estado: 'enviada',
      fechaEdicion: '2026-09-18T12:00:00.000Z',
      fechaEnvio: '2026-09-18T13:00:00.000Z',
      porcentajeApertura: 58,
    },
    {
      codigo: 'CAMPENVIAD03',
      asunto: 'Acondicionadores de temporada',
      segmento: 'Clientes',
      destinatarios: 1705,
      estado: 'enviada',
      fechaEdicion: '2026-09-02T12:00:00.000Z',
      fechaEnvio: '2026-09-02T13:00:00.000Z',
      porcentajeApertura: 36,
    },
  ],
};

/** Especialidades: la propuesta del 4-11-2026 del perfil profesional (por validar). */
const SEGMENTOS: OpcionesSegmentoCampana = {
  tipos: [
    { valor: 'todos', texto: 'Todos', criterios: [] },
    { valor: 'clientes', texto: 'Clientes', criterios: [] },
    {
      valor: 'profesionales',
      texto: 'Profesionales',
      criterios: [
        {
          clave: 'especialidad',
          texto: 'Especialidad',
          opciones: GRUPOS_ESPECIALIDADES.flatMap((grupo) => grupo.opciones),
        },
      ],
    },
  ],
};

const BORRADOR: CampanaGestion = {
  codigo: 'CAMPBORRAD01',
  asunto: 'Tintes nuevos para el salón',
  cuerpo:
    'Hola, {nombre}:\n\nSumamos tonos nuevos de tinte permanente, con tu precio profesional.',
  segmento: {
    tipo: 'profesionales',
    criterios: [{ clave: 'especialidad', valor: 'coloracion_tinturas' }],
  },
  estado: 'borrador',
  fechaEdicion: '2026-11-04T13:20:00.000Z',
  fechaEnvio: null,
};

const ENVIADA: CampanaGestion = {
  codigo: 'CAMPENVIAD01',
  asunto: 'Mascarillas 20% dcto.',
  cuerpo: 'Hola, {nombre}:\n\nTodas las mascarillas con 20% de descuento.',
  segmento: { tipo: 'todos', criterios: [] },
  estado: 'enviada',
  fechaEdicion: '2026-10-01T12:00:00.000Z',
  fechaEnvio: '2026-10-01T13:00:00.000Z',
};

const CAMPANAS: Record<string, CampanaGestion> = {
  [BORRADOR.codigo]: BORRADOR,
  [ENVIADA.codigo]: ENVIADA,
};

/** Conteos fijos por caso: el backend los cuenta con el consentimiento de cada contacto. */
const destinatariosDe = ({ tipo, criterios }: DatosCampana['segmento']) => {
  if (tipo === 'profesionales') return criterios.length > 0 ? 186 : 312;
  if (tipo === 'clientes') return 1705;
  return 2140;
};

const textoSegmento = ({ tipo, criterios }: DatosCampana['segmento']) => {
  const elegido = SEGMENTOS.tipos.find((opcion) => opcion.valor === tipo);
  if (!elegido) return tipo;
  const extras = criterios.map(
    ({ clave, valor }) =>
      elegido.criterios
        .find((criterio) => criterio.clave === clave)
        ?.opciones.find((opcion) => opcion.valor === valor)?.texto ?? valor,
  );
  return [elegido.texto, ...extras].join(' · ');
};

const leerDatos = async (peticion: Request): Promise<DatosCampana | null> => {
  try {
    const datos = (await peticion.json()) as Partial<DatosCampana>;
    if (
      typeof datos.asunto !== 'string' ||
      typeof datos.cuerpo !== 'string' ||
      !datos.segmento
    ) {
      return null;
    }
    return datos as DatosCampana;
  } catch {
    return null;
  }
};

const faltantes = (datos: DatosCampana) => [
  ...(datos.asunto.trim() ? [] : ['El asunto es obligatorio.']),
  ...(datos.cuerpo.trim() ? [] : ['El mensaje es obligatorio.']),
];

const guardada = (codigo: string, datos: DatosCampana): CampanaGestion => ({
  ...datos,
  codigo,
  estado: 'borrador',
  fechaEdicion: new Date().toISOString(),
  fechaEnvio: null,
});

export const rutasPanelCampanas: RutaSimulada[] = [
  {
    metodo: 'GET',
    ruta: '/gestion/campanas',
    historia: HISTORIA,
    responder: () => json(LISTADO),
  },
  {
    metodo: 'GET',
    ruta: '/gestion/campanas/segmentos',
    historia: HISTORIA,
    responder: () => json(SEGMENTOS),
  },
  {
    metodo: 'POST',
    ruta: '/gestion/campanas/vista-previa',
    historia: HISTORIA,
    responder: async ({ peticion }) => {
      const datos = await leerDatos(peticion);
      if (!datos) return errorSimulado(400, 'Datos de la campaña inválidos.');
      const vista: VistaPreviaCampana = {
        remitente: 'Cabello Perfecto',
        asunto: datos.asunto,
        parrafos: datos.cuerpo
          .split(/\n\s*\n/)
          .map((parrafo) => parrafo.trim().replaceAll('{nombre}', 'Camila'))
          .filter(Boolean),
        pie: 'Recibes este correo porque aceptaste ofertas de Cabello Perfecto.',
        textoBaja: 'Darme de baja',
        destinatarios: destinatariosDe(datos.segmento),
        segmento: textoSegmento(datos.segmento),
      };
      return json(vista);
    },
  },
  {
    metodo: 'POST',
    ruta: '/gestion/campanas',
    historia: HISTORIA,
    responder: async ({ peticion }) => {
      const datos = await leerDatos(peticion);
      if (!datos) return errorSimulado(400, 'Datos de la campaña inválidos.');
      const errores = faltantes(datos);
      if (errores.length > 0) return errorSimulado(400, errores);
      return json(guardada('CAMPBORRAD02', datos), 201);
    },
  },
  {
    metodo: 'GET',
    ruta: '/gestion/campanas/:codigo',
    historia: HISTORIA,
    responder: ({ params }) =>
      CAMPANAS[params.codigo]
        ? json(CAMPANAS[params.codigo])
        : errorSimulado(404, 'La campaña no existe.'),
  },
  {
    metodo: 'PUT',
    ruta: '/gestion/campanas/:codigo',
    historia: HISTORIA,
    responder: async ({ params, peticion }) => {
      if (CAMPANAS[params.codigo]?.estado === 'enviada') {
        return errorSimulado(
          409,
          'La campaña ya se envió y no se puede editar.',
        );
      }
      const datos = await leerDatos(peticion);
      if (!datos) return errorSimulado(400, 'Datos de la campaña inválidos.');
      const errores = faltantes(datos);
      if (errores.length > 0) return errorSimulado(400, errores);
      return json(guardada(params.codigo, datos));
    },
  },
  {
    metodo: 'POST',
    ruta: '/gestion/campanas/:codigo/envio',
    historia: HISTORIA,
    responder: ({ params }) => {
      if (CAMPANAS[params.codigo]?.estado === 'enviada') {
        return errorSimulado(409, 'Esta campaña ya se envió.');
      }
      const enviada: CampanaEnviada = {
        codigo: params.codigo,
        estado: 'enviada',
        destinatarios: 186,
        fechaEnvio: new Date().toISOString(),
      };
      return json(enviada, 202);
    },
  },
];
