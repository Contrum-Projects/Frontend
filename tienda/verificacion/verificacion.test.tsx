import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { paths } from '@/compartido/api/esquema';
import type {
  DatosPersonales,
  SolicitudVerificacionCuenta,
} from '@/compartido/api/respuestas';
import { leerEstado, reiniciarParaPruebas } from '@/compartido/sesion/almacen';
import {
  DATOS,
  mostrarPantallaCuenta,
  responder,
} from '@/tienda/cuenta/cuentaDePrueba';
import { PantallaVerificacion } from './pantallaVerificacion';

vi.mock('@/compartido/api/cliente', async (original) => {
  const { middlewareDeSesion } =
    await original<typeof import('@/compartido/api/cliente')>();
  const { default: createClient } = await import('openapi-fetch');
  const api = createClient<paths>({
    baseUrl: 'http://tienda.test',
    fetch: (peticion) => globalThis.fetch(peticion),
  });
  api.use(middlewareDeSesion);
  return { api, middlewareDeSesion };
});

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => '/cuenta/verificacion',
}));

const CON_RUT: DatosPersonales = { ...DATOS, rut: '12345678-5' };

const solicitud = (
  extra: Partial<SolicitudVerificacionCuenta>,
): SolicitudVerificacionCuenta => ({
  estado: 'pendiente',
  fechaSolicitud: '2026-10-12T15:00:00.000Z',
  fechaResolucion: null,
  motivoRechazo: null,
  requiereDocumentos: true,
  documentos: [],
  ...extra,
});

const EN_REVISION = solicitud({
  estado: 'revision_manual',
  requiereDocumentos: false,
  documentos: [
    { tipo: 'certificado', nombreArchivo: 'certificado-peluqueria.pdf' },
  ],
});

const RECHAZADA = solicitud({
  estado: 'rechazada',
  requiereDocumentos: false,
  fechaResolucion: '2026-10-13T15:00:00.000Z',
  motivoRechazo: 'El certificado no muestra tu nombre completo.',
  documentos: [{ tipo: 'otro', nombreArchivo: 'certificado-curso.jpg' }],
});

/**
 * Backend simulado en el borde (`fetch`). Registra las escrituras («MÉTODO /ruta») sin leer su
 * cuerpo: el FormData de jsdom no llega al Request de Node (ver `espiarMultipart`). Lo que no
 * está en `rutas` responde 404 (así responde GET /verificaciones/yo sin solicitud).
 */
const simular = (rutas: Record<string, () => Response>) => {
  const escrituras: string[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn((entrada: Request | string, opciones?: RequestInit) => {
      const peticionHttp =
        typeof entrada === 'string'
          ? new Request(new URL(entrada, 'http://tienda.test'), opciones)
          : entrada;
      const clave = `${peticionHttp.method} ${new URL(peticionHttp.url).pathname}`;
      if (peticionHttp.method !== 'GET') escrituras.push(clave);
      const manejar = rutas[clave];
      return manejar
        ? manejar()
        : responder({ statusCode: 404, message: 'No existe.' }, 404);
    }),
  );
  return escrituras;
};

/** Lo que se agregó al multipart, en orden: [campo, valor]. */
const espiarMultipart = () => {
  const agregado = vi.spyOn(FormData.prototype, 'append');
  return () => agregado.mock.calls.map(([campo, valor]) => [campo, valor]);
};

const conDatos = (datos: DatosPersonales = CON_RUT) => ({
  'GET /api/cuentas/yo': () => responder(datos),
});

const pdf = (nombre = 'certificado-peluqueria.pdf', bytes = 1200) =>
  new File([new Uint8Array(bytes)], nombre, { type: 'application/pdf' });

const abrir = () => mostrarPantallaCuenta(<PantallaVerificacion />);

const subir = async (
  usuario: ReturnType<typeof userEvent.setup>,
  ...archivos: File[]
) => {
  await usuario.upload(
    await screen.findByLabelText(/PDF, JPG o PNG/),
    archivos,
  );
};

const elegirTipo = async (
  usuario: ReturnType<typeof userEvent.setup>,
  archivo: string,
  tipo: string,
) => {
  const fila = screen.getByText(archivo).closest('li');
  if (!fila) throw new Error(`No está el archivo ${archivo}`);
  await usuario.click(
    within(fila).getByRole('combobox', { name: 'Tipo de documento' }),
  );
  await usuario.click(await screen.findByRole('option', { name: tipo }));
};

const enviar = (usuario: ReturnType<typeof userEvent.setup>) =>
  usuario.click(screen.getByRole('button', { name: 'Enviar solicitud' }));

beforeEach(() => reiniciarParaPruebas());

afterEach(() => {
  reiniciarParaPruebas();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('E10-H1 FE · Verificación profesional', () => {
  it('E10-H1 FE · formulario: con RUT y documentos envía la solicitud y muestra «En revisión»', async () => {
    const usuario = userEvent.setup();
    const escrituras = simular({
      ...conDatos(),
      'POST /api/verificaciones': () => responder(solicitud({}), 201),
      'POST /api/verificaciones/yo/documentos': () =>
        responder(EN_REVISION, 201),
    });
    const multipart = espiarMultipart();
    abrir();

    expect(await screen.findByText('12.345.678-5')).toBeInTheDocument();
    await subir(usuario, pdf());
    expect(screen.getByText('certificado-peluqueria.pdf')).toBeInTheDocument();
    await elegirTipo(
      usuario,
      'certificado-peluqueria.pdf',
      'Certificado o curso',
    );
    await enviar(usuario);

    const titulo = await screen.findByRole('heading', {
      name: 'Solicitud en revisión',
    });
    // El foco no queda en body al cambiar de estado
    await waitFor(() => expect(titulo).toHaveFocus());
    expect(
      screen.getByText(/La recibimos el 12 de octubre de 2026/),
    ).toBeInTheDocument();
    expect(escrituras).toEqual([
      'POST /api/verificaciones',
      'POST /api/verificaciones/yo/documentos',
    ]);
    const [[campoArchivo, archivo], tipo] = multipart();
    expect(campoArchivo).toBe('archivos');
    expect((archivo as File).name).toBe('certificado-peluqueria.pdf');
    expect(tipo).toEqual(['tipos', 'certificado']);
  });

  it('E10-H1 FE · formulario: si el SII la aprueba, no sube documentos, renueva la sesión y muestra la cuenta profesional', async () => {
    const usuario = userEvent.setup();
    const escrituras = simular({
      ...conDatos(),
      'POST /api/verificaciones': () =>
        responder(
          solicitud({ estado: 'aprobada', requiereDocumentos: false }),
          201,
        ),
      'POST /api/cuentas/sesion/renovar': () =>
        responder({
          tokenAcceso: 'token-profesional',
          expiraEn: 900,
          usuario: {
            codigoPublico: 'u-1',
            nombre: 'Camila',
            apellido: 'Rojas',
            rol: 'profesional',
          },
        }),
    });
    abrir();

    await subir(usuario, pdf());
    await elegirTipo(usuario, 'certificado-peluqueria.pdf', 'Título');
    await enviar(usuario);

    expect(
      await screen.findByRole('heading', {
        name: 'Cuenta verificada',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Ya ves el precio profesional en todo el catálogo.'),
    ).toBeInTheDocument();
    expect(escrituras).toEqual([
      'POST /api/verificaciones',
      'POST /api/cuentas/sesion/renovar',
    ]);
    const estado = leerEstado();
    expect(estado.tipo === 'activa' && estado.usuario.rol).toBe('profesional');
  });

  it('E10-H1 FE · formulario: pide al menos un documento y el tipo de cada uno antes de enviar', async () => {
    const usuario = userEvent.setup();
    const escrituras = simular(conDatos());
    abrir();

    await screen.findByText('12.345.678-5');
    await enviar(usuario);
    expect(
      await screen.findByText('Adjunta al menos un documento.'),
    ).toBeInTheDocument();

    await subir(usuario, pdf());
    expect(
      screen.queryByText('Adjunta al menos un documento.'),
    ).not.toBeInTheDocument();
    await enviar(usuario);
    expect(
      await screen.findByText('Elige qué documento es.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('combobox', { name: 'Tipo de documento' }),
    ).toHaveFocus();
    expect(escrituras).toEqual([]);
  });

  it('E10-H1 FE · formulario: no agrega archivos que no son PDF, JPG ni PNG o que superan 4 MB, y deja quitar uno', async () => {
    const usuario = userEvent.setup({ applyAccept: false });
    simular(conDatos());
    abrir();

    await subir(
      usuario,
      new File(['x'], 'notas.docx', { type: 'application/msword' }),
      pdf('grande.pdf', 4 * 1024 * 1024 + 1),
      pdf('titulo.pdf'),
    );
    expect(
      screen.getByText(
        '«notas.docx» no es PDF, JPG ni PNG. «grande.pdf» supera los 4 MB.',
      ),
    ).toBeInTheDocument();
    const lista = screen.getByRole('list', { name: 'Documentos elegidos' });
    expect(within(lista).getAllByRole('listitem')).toHaveLength(1);

    await usuario.click(
      screen.getByRole('button', { name: 'Quitar titulo.pdf' }),
    );
    expect(
      screen.queryByRole('list', { name: 'Documentos elegidos' }),
    ).not.toBeInTheDocument();
  });

  it('E10-H1 FE · sin RUT: al intentar enviar le pide registrarlo en Mis datos', async () => {
    const usuario = userEvent.setup();
    const escrituras = simular(conDatos({ ...DATOS, rut: null }));
    abrir();

    expect(
      await screen.findByText('Aún no registras tu RUT'),
    ).toBeInTheDocument();
    await subir(usuario, pdf());
    await elegirTipo(usuario, 'certificado-peluqueria.pdf', 'Título');
    await enviar(usuario);

    expect(
      await screen.findByText(
        'Registra tu RUT en tus datos antes de solicitar la verificación.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Registrar RUT' })).toHaveAttribute(
      'href',
      '/cuenta/datos',
    );
    expect(escrituras).toEqual([]);
  });

  it('E10-H1 FE · sin RUT: si el backend responde que falta, también le pide registrarlo', async () => {
    const usuario = userEvent.setup();
    simular({
      ...conDatos(),
      'POST /api/verificaciones': () =>
        responder(
          {
            statusCode: 409,
            message:
              'Registra tu RUT en tus datos antes de solicitar la verificación.',
          },
          409,
        ),
    });
    abrir();

    await subir(usuario, pdf());
    await elegirTipo(usuario, 'certificado-peluqueria.pdf', 'Título');
    await enviar(usuario);

    expect(
      await screen.findByText(
        'Registra tu RUT en tus datos antes de solicitar la verificación.',
      ),
    ).toBeInTheDocument();
    // Lo elegido sigue ahí
    expect(screen.getByText('certificado-peluqueria.pdf')).toBeInTheDocument();
  });

  it('E10-H1 FE · rechazada: ve el motivo y puede enviar una nueva solicitud', async () => {
    const usuario = userEvent.setup();
    const escrituras = simular({
      ...conDatos(),
      'GET /api/verificaciones/yo': () => responder(RECHAZADA),
      'POST /api/verificaciones': () => responder(solicitud({}), 201),
      'POST /api/verificaciones/yo/documentos': () =>
        responder(EN_REVISION, 201),
    });
    abrir();

    expect(
      await screen.findByRole('heading', {
        name: 'Tu solicitud no fue aprobada',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Motivo: El certificado no muestra tu nombre completo.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Revisada el 13 de octubre de 2026'),
    ).toBeInTheDocument();

    await usuario.click(
      screen.getByRole('button', { name: 'Enviar nueva solicitud' }),
    );
    expect(
      screen.getByText(/Sube un certificado, título o curso/),
    ).toHaveFocus();
    await subir(usuario, pdf('titulo-estilista.jpg'));
    await elegirTipo(usuario, 'titulo-estilista.jpg', 'Título');
    await enviar(usuario);

    expect(
      await screen.findByRole('heading', { name: 'Solicitud en revisión' }),
    ).toBeInTheDocument();
    expect(escrituras).toEqual([
      'POST /api/verificaciones',
      'POST /api/verificaciones/yo/documentos',
    ]);
  });

  it('E10-H1 FE · archivos: informa que se borran a los 30 días de resuelta la solicitud', async () => {
    simular(conDatos());
    abrir();

    expect(
      await screen.findByText(
        'Puedes subir más de un documento. Borramos los archivos 30 días después de resolver tu solicitud.',
      ),
    ).toBeInTheDocument();
  });

  it('E10-H2 FE · pendiente de documentos: solo los adjunta y, si el backend los rechaza, conserva lo elegido', async () => {
    const usuario = userEvent.setup();
    let documentos = () =>
      responder(
        { statusCode: 413, message: 'Cada documento puede pesar hasta 4 MB.' },
        413,
      );
    const escrituras = simular({
      ...conDatos(),
      'GET /api/verificaciones/yo': () => responder(solicitud({})),
      'POST /api/verificaciones/yo/documentos': () => documentos(),
    });
    abrir();

    expect(
      await screen.findByText(/No pudimos verificarte con el SII/),
    ).toBeInTheDocument();
    // Con la solicitud abierta el RUT no se edita
    expect(
      screen.queryByRole('link', { name: 'Editar' }),
    ).not.toBeInTheDocument();
    await subir(usuario, pdf());
    await elegirTipo(usuario, 'certificado-peluqueria.pdf', 'Otro');
    await enviar(usuario);

    expect(
      await screen.findByText('Cada documento puede pesar hasta 4 MB.'),
    ).toBeInTheDocument();
    expect(screen.getByText('certificado-peluqueria.pdf')).toBeInTheDocument();

    documentos = () => responder(EN_REVISION, 201);
    await enviar(usuario);
    expect(
      await screen.findByRole('heading', { name: 'Solicitud en revisión' }),
    ).toBeInTheDocument();
    expect(escrituras).toEqual([
      'POST /api/verificaciones/yo/documentos',
      'POST /api/verificaciones/yo/documentos',
    ]);
  });

  it('E10-H2 FE · primera solicitud: si el SII la deja pendiente y falla la subida, avisa y el reintento solo adjunta', async () => {
    const usuario = userEvent.setup();
    let miSolicitud = () =>
      responder({ statusCode: 404, message: 'No tienes solicitudes.' }, 404);
    let documentos = () =>
      responder(
        { statusCode: 413, message: 'Cada documento puede pesar hasta 4 MB.' },
        413,
      );
    const escrituras = simular({
      ...conDatos(),
      'GET /api/verificaciones/yo': () => miSolicitud(),
      'POST /api/verificaciones': () => {
        miSolicitud = () => responder(solicitud({}));
        return responder(solicitud({}), 201);
      },
      'POST /api/verificaciones/yo/documentos': () => documentos(),
    });
    abrir();

    await subir(usuario, pdf());
    await elegirTipo(usuario, 'certificado-peluqueria.pdf', 'Título');
    await enviar(usuario);

    expect(
      await screen.findByText('Cada documento puede pesar hasta 4 MB.'),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/No pudimos verificarte con el SII/),
    ).toBeInTheDocument();
    expect(screen.getByText('certificado-peluqueria.pdf')).toBeInTheDocument();

    documentos = () => responder(EN_REVISION, 201);
    await enviar(usuario);
    expect(
      await screen.findByRole('heading', { name: 'Solicitud en revisión' }),
    ).toBeInTheDocument();
    expect(escrituras).toEqual([
      'POST /api/verificaciones',
      'POST /api/verificaciones/yo/documentos',
      'POST /api/verificaciones/yo/documentos',
    ]);
  });

  it('E10-H1 FE · otro rechazo del backend: muestra su mensaje junto al botón', async () => {
    const usuario = userEvent.setup();
    simular({
      ...conDatos(),
      'POST /api/verificaciones': () =>
        responder(
          {
            statusCode: 409,
            message: 'Ya tienes una solicitud de verificación en curso.',
          },
          409,
        ),
    });
    abrir();

    await subir(usuario, pdf());
    await elegirTipo(usuario, 'certificado-peluqueria.pdf', 'Título');
    await enviar(usuario);

    expect(
      await screen.findByText(
        'Ya tienes una solicitud de verificación en curso.',
      ),
    ).toBeInTheDocument();
  });

  it('E10-H1 FE · aprobada: al abrir la pantalla muestra la cuenta profesional activa', async () => {
    simular({
      ...conDatos(),
      'GET /api/verificaciones/yo': () =>
        responder(
          solicitud({
            estado: 'aprobada',
            requiereDocumentos: false,
            fechaResolucion: '2026-10-12T15:00:00.000Z',
          }),
        ),
    });
    mostrarPantallaCuenta(<PantallaVerificacion />, undefined, 'profesional');

    const titulo = await screen.findByRole('heading', {
      name: 'Cuenta verificada',
    });
    // Al abrir la pantalla el foco no se mueve: solo tras un envío
    expect(titulo).not.toHaveFocus();
    expect(
      screen.queryByRole('button', { name: 'Enviar solicitud' }),
    ).not.toBeInTheDocument();
  });

  it('E10-H1 FE · en revisión: muestra los documentos enviados y el RUT', async () => {
    simular({
      ...conDatos(),
      'GET /api/verificaciones/yo': () => responder(EN_REVISION),
    });
    abrir();

    const documentos = await screen.findByRole('region', {
      name: 'Documentos enviados',
    });
    expect(
      within(documentos).getByText('certificado-peluqueria.pdf'),
    ).toBeInTheDocument();
    expect(
      within(documentos).getByText('Certificado o curso'),
    ).toBeInTheDocument();
    expect(screen.getByText('12.345.678-5')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Enviar solicitud' }),
    ).not.toBeInTheDocument();
  });

  it('E10-H1 FE · error del servidor: no muestra detalles técnicos y deja reintentar', async () => {
    simular({
      ...conDatos(),
      'GET /api/verificaciones/yo': () =>
        responder(
          { statusCode: 500, message: 'TypeError: x is undefined' },
          500,
        ),
    });
    abrir();

    expect(
      await screen.findByText(
        'No pudimos completar la acción. Intenta de nuevo en unos minutos.',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/TypeError/)).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Reintentar' }),
    ).toBeInTheDocument();
  });
});
