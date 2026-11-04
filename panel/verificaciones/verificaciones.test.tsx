import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { paths } from '@/compartido/api/esquema';
import type {
  DetalleVerificacion,
  ListadoSolicitudesEnRevision,
  SolicitudResuelta,
} from '@/compartido/api/respuestas';
import { crearClienteDeConsultas } from '@/compartido/proveedores';
import type { Rol } from '@/compartido/sesion/roles';
import {
  guardarSesion,
  reiniciarParaPruebas,
} from '@/compartido/sesion/almacen';
import { Toaster } from '@/compartido/ui/sonner';
import { puedeAbrir, seccionesDelRol } from '@/panel/diseno/secciones';
import { DisenoVerificaciones } from './disenoVerificaciones';
import { RevisionVerificacion } from './revisionVerificacion';

// Cliente igual al de la app, con URL absoluta y el fetch simulado de cada prueba
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

const navegacion = vi.hoisted(() => ({ segmento: null as string | null }));
vi.mock('next/navigation', () => ({
  useSelectedLayoutSegment: () => navegacion.segmento,
  usePathname: () => '/panel/verificaciones',
}));

const ANDREA = '5b3c1e2a-7d4f-4a8b-9c0d-1e2f3a4b5c6d';
const JAVIER = '6c4d2f3b-8e5a-4b9c-8d1e-2f3a4b5c6d7e';

const LISTADO: ListadoSolicitudesEnRevision = {
  items: [
    {
      codigoPublicoCuenta: ANDREA,
      nombre: 'Andrea',
      apellido: 'Ejemplo',
      rut: '15678901-2',
      fechaEnvio: '2026-10-12T11:40:00.000Z',
      motivoRevision: 'sin_inicio_actividades',
    },
    {
      codigoPublicoCuenta: JAVIER,
      nombre: 'Javier',
      apellido: 'Muestra',
      rut: '12345678-5',
      fechaEnvio: '2026-10-13T00:15:00.000Z',
      motivoRevision: null,
    },
  ],
  total: 2,
  pagina: 1,
  limite: 100,
};

const DETALLE: DetalleVerificacion = {
  cliente: {
    codigoPublico: ANDREA,
    nombre: 'Andrea',
    apellido: 'Ejemplo',
    rut: '11111111-1',
    email: 'andrea@correo.test',
    telefono: null,
  },
  solicitud: {
    estado: 'revision_manual',
    fechaSolicitud: '2026-10-12T11:40:00.000Z',
    fechaResolucion: null,
    motivoRechazo: null,
    resolutor: null,
    motivoRevision: 'otro_giro',
    consultaSii: {
      fecha: '2026-10-12T11:40:05.000Z',
      resultado: 'otro_giro',
      giros: [
        {
          codigo: '479100',
          nombre: 'Venta al por menor por internet',
          fechaInicio: '2020-03-02',
        },
      ],
    },
    documentos: [
      {
        numero: 1,
        tipo: 'certificado',
        nombreArchivo: 'certificado-peluqueria.pdf',
        fechaEliminacion: null,
      },
      {
        numero: 2,
        tipo: 'titulo',
        nombreArchivo: 'titulo-estilista.jpg',
        fechaEliminacion: null,
      },
    ],
  },
  solicitudesAnteriores: [],
};

const RESOLUTOR = {
  codigoPublico: 'u-1',
  nombre: 'Marcela',
  apellido: 'Díaz',
};

const resuelta = (
  estado: SolicitudResuelta['estado'],
  motivoRechazo: string | null = null,
): SolicitudResuelta => ({
  codigoPublicoCuenta: ANDREA,
  estado,
  fechaSolicitud: DETALLE.solicitud.fechaSolicitud,
  fechaResolucion: '2026-11-04T15:00:00.000Z',
  motivoRechazo,
  resolutor: RESOLUTOR,
});

type Manejador = (peticion: Request) => Response | Promise<Response>;

/** Responde lo básico de la pantalla; `rutas` agrega o reemplaza por «MÉTODO /ruta». */
const simularBackend = (rutas: Record<string, Manejador> = {}) => {
  const pedidas: Request[] = [];
  const base: Record<string, Manejador> = {
    'GET /api/verificaciones/revision-manual': () => Response.json(LISTADO),
    [`GET /api/verificaciones/${ANDREA}`]: () => Response.json(DETALLE),
    ...rutas,
  };
  const fetch = vi.fn(async (peticion: Request) => {
    pedidas.push(peticion);
    const clave = `${peticion.method} ${new URL(peticion.url).pathname}`;
    const manejador = base[clave];
    if (!manejador) throw new Error(`Petición no simulada: ${clave}`);
    return manejador(peticion);
  });
  vi.stubGlobal('fetch', fetch);
  const de = (clave: string) =>
    pedidas.filter(
      (peticion) =>
        `${peticion.method} ${new URL(peticion.url).pathname}` === clave,
    );
  return { pedidas, de };
};

const error = (status: number, message: string | string[]) =>
  Response.json({ statusCode: status, message }, { status });

/** jsdom no tiene matchMedia: sin ella, la pantalla se comporta como en celular. */
const simularEscritorio = () =>
  vi.stubGlobal(
    'matchMedia',
    (consulta: string) =>
      ({
        matches: true,
        media: consulta,
        addEventListener: () => {},
        removeEventListener: () => {},
      }) as unknown as MediaQueryList,
  );

const mostrar = (pantalla: ReactNode) =>
  render(
    <QueryClientProvider client={crearClienteDeConsultas()}>
      {pantalla}
      <Toaster />
    </QueryClientProvider>,
  );

/** La pantalla con la solicitud de Andrea abierta, como en `/panel/verificaciones/[codigo]`. */
const mostrarRevision = () => {
  navegacion.segmento = ANDREA;
  return mostrar(
    <DisenoVerificaciones>
      <RevisionVerificacion codigo={ANDREA} />
    </DisenoVerificaciones>,
  );
};

const iniciarSesion = (rol: Rol) =>
  act(() =>
    guardarSesion({
      tokenAcceso: 'token',
      expiraEn: 900,
      usuario: { ...RESOLUTOR, rol },
    }),
  );

beforeEach(() => {
  navegacion.segmento = null;
  reiniciarParaPruebas();
  iniciarSesion('administrador');
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('Panel de verificaciones (SCRUM-135)', () => {
  describe('CA1 pendientes', () => {
    it('E10-H3 FE · CA1 pendientes: lista las solicitudes en revisión con su total, fecha y motivo', async () => {
      simularBackend();
      mostrar(<DisenoVerificaciones>{null}</DisenoVerificaciones>);

      expect(
        await screen.findByRole('heading', { name: 'Pendientes · 2' }),
      ).toBeInTheDocument();
      const lista = screen.getByRole('list', {
        name: 'Solicitudes pendientes',
      });
      const [andrea, javier] = within(lista).getAllByRole('link');
      expect(andrea).toHaveAttribute('href', `/panel/verificaciones/${ANDREA}`);
      expect(andrea).toHaveTextContent('Andrea Ejemplo');
      expect(andrea).toHaveTextContent(
        '12 oct, 08:40 · Sin inicio de actividades',
      );
      // Sin consulta al SII, solo la fecha
      expect(javier).toHaveTextContent(/^Javier Muestra12 oct, 21:15$/);
    });

    it('E10-H3 FE · CA1 pendientes: pide la primera página de 100 al backend', async () => {
      const { de } = simularBackend();
      mostrar(<DisenoVerificaciones>{null}</DisenoVerificaciones>);

      await screen.findByRole('heading', { name: 'Pendientes · 2' });
      const [peticion] = de('GET /api/verificaciones/revision-manual');
      expect(new URL(peticion!.url).searchParams.toString()).toBe(
        'pagina=1&limite=100',
      );
    });

    it('E10-H3 FE · CA1 pendientes: sin solicitudes, lo dice sin prometer nada', async () => {
      simularBackend({
        'GET /api/verificaciones/revision-manual': () =>
          Response.json({ ...LISTADO, items: [], total: 0 }),
      });
      mostrar(<DisenoVerificaciones>{null}</DisenoVerificaciones>);

      expect(
        await screen.findByText('No hay solicitudes por revisar.'),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: 'Pendientes · 0' }),
      ).toBeInTheDocument();
    });

    it('E10-H3 FE · CA1 pendientes: si falla, muestra el mensaje y deja reintentar', async () => {
      let intentos = 0;
      simularBackend({
        'GET /api/verificaciones/revision-manual': () => {
          intentos += 1;
          return intentos === 1
            ? error(403, 'No tienes permiso para esta acción.')
            : Response.json(LISTADO);
        },
      });
      mostrar(<DisenoVerificaciones>{null}</DisenoVerificaciones>);

      expect(
        await screen.findByText('No tienes permiso para esta acción.'),
      ).toBeInTheDocument();
      await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
      expect(
        await screen.findByRole('heading', { name: 'Pendientes · 2' }),
      ).toBeInTheDocument();
    });

    it('E10-H3 FE · CA1 pendientes: en escritorio la revisión va al lado de la lista, con la solicitud marcada', async () => {
      simularEscritorio();
      simularBackend();
      mostrarRevision();

      const lista = await screen.findByRole('list', {
        name: 'Solicitudes pendientes',
      });
      expect(
        within(lista).getByRole('link', { name: /Andrea Ejemplo/ }),
      ).toHaveAttribute('aria-current', 'page');
      expect(
        await screen.findByRole('heading', {
          name: 'Andrea Ejemplo',
          level: 2,
        }),
      ).toBeInTheDocument();
    });

    it('E10-H3 FE · CA1 pendientes: en celular la revisión es una pantalla aparte, sin pedir la lista, y vuelve a los pendientes', async () => {
      const { de } = simularBackend();
      mostrarRevision();

      expect(
        await screen.findByRole('heading', {
          name: 'Andrea Ejemplo',
          level: 2,
        }),
      ).toBeInTheDocument();
      expect(de('GET /api/verificaciones/revision-manual')).toHaveLength(0);
      expect(
        screen.getByRole('link', { name: 'Verificaciones pendientes' }),
      ).toHaveAttribute('href', '/panel/verificaciones');
    });

    it('E10-H3 FE · CA1 pendientes: solo el administrador ve y abre «Verificaciones»', () => {
      expect(puedeAbrir('administrador', '/panel/verificaciones')).toBe(true);
      expect(
        puedeAbrir('administrador', `/panel/verificaciones/${ANDREA}`),
      ).toBe(true);
      for (const rol of ['vendedor', 'bodeguero', 'cliente'] as const) {
        expect(puedeAbrir(rol, '/panel/verificaciones')).toBe(false);
        expect(
          seccionesDelRol(rol).some(
            (seccion) => seccion.texto === 'Verificaciones',
          ),
        ).toBe(false);
      }
    });
  });

  describe('CA2 revisión', () => {
    it('E10-H3 FE · CA2 revisión: muestra los datos, el motivo de revisión manual y lo que informó el SII', async () => {
      simularBackend();
      mostrarRevision();

      const revision = await screen.findByRole('article', {
        name: 'Andrea Ejemplo',
      });
      expect(within(revision).getByText('Revisión manual')).toBeInTheDocument();
      expect(within(revision).getByText('11.111.111-1')).toBeInTheDocument();
      expect(
        within(revision).getByText('andrea@correo.test'),
      ).toBeInTheDocument();
      expect(
        within(revision).getByText(
          'El SII no muestra el giro de peluquería (960200) para este RUT.',
        ),
      ).toBeInTheDocument();
      const giros = within(revision).getByRole('list', {
        name: 'Giros informados',
      });
      expect(giros).toHaveTextContent(
        '479100 · Venta al por menor por internet',
      );
      expect(giros).toHaveTextContent('Desde el 2 mar 2020');
    });

    it.each([
      [
        'sin_inicio_actividades',
        'El SII no muestra inicio de actividades para este RUT.',
      ],
      ['no_disponible', 'No se pudo consultar al SII. Revisa los documentos.'],
      [null, 'Esta solicitud no se consultó al SII.'],
    ] as const)(
      'E10-H3 FE · CA2 revisión: con motivo %s muestra «%s»',
      async (motivo, texto) => {
        simularBackend({
          [`GET /api/verificaciones/${ANDREA}`]: () =>
            Response.json({
              ...DETALLE,
              solicitud: {
                ...DETALLE.solicitud,
                motivoRevision: motivo,
                consultaSii:
                  motivo === null
                    ? null
                    : {
                        fecha: '2026-10-12T11:40:05.000Z',
                        resultado: motivo,
                        giros: motivo === 'no_disponible' ? null : [],
                      },
              },
            }),
        });
        mostrarRevision();

        expect(await screen.findByText(texto)).toBeInTheDocument();
        if (motivo === 'no_disponible') {
          expect(
            screen.getByText('El SII no respondió a la consulta.'),
          ).toBeInTheDocument();
        }
        if (motivo === null) {
          expect(
            screen.queryByRole('heading', { name: 'Consulta al SII' }),
          ).not.toBeInTheDocument();
        }
      },
    );

    it('E10-H3 FE · CA2 revisión: lista los documentos con su tipo y, al abrir uno, pide el enlace y lo abre en otra pestaña', async () => {
      const pestana = {
        opener: {} as unknown,
        location: { href: '' },
        close: vi.fn(),
      };
      const abrir = vi
        .spyOn(window, 'open')
        .mockReturnValue(pestana as unknown as Window);
      const { de } = simularBackend({
        [`GET /api/verificaciones/${ANDREA}/documentos/2`]: () =>
          Response.json({
            url: 'https://almacen.test/firmado?x=1',
            venceEn: '2026-11-04T15:01:00.000Z',
            tipo: 'titulo',
            nombreArchivo: 'titulo-estilista.jpg',
          }),
      });
      mostrarRevision();

      const documento = (
        await screen.findByText('titulo-estilista.jpg')
      ).closest('li')!;
      expect(documento).toHaveTextContent('Título');
      await userEvent.click(
        within(documento).getByRole('button', {
          name: 'Abrir titulo-estilista.jpg',
        }),
      );

      await waitFor(() =>
        expect(pestana.location.href).toBe('https://almacen.test/firmado?x=1'),
      );
      expect(abrir).toHaveBeenCalledWith('', '_blank');
      expect(pestana.opener).toBeNull();
      expect(de(`GET /api/verificaciones/${ANDREA}/documentos/2`)).toHaveLength(
        1,
      );
    });

    it('E10-H3 FE · CA2 revisión: si el archivo ya se eliminó, cierra la pestaña y muestra el mensaje del backend', async () => {
      const pestana = { opener: null, location: { href: '' }, close: vi.fn() };
      vi.spyOn(window, 'open').mockReturnValue(pestana as unknown as Window);
      simularBackend({
        [`GET /api/verificaciones/${ANDREA}/documentos/1`]: () =>
          error(410, 'El documento se eliminó el 03-11-2026.'),
      });
      mostrarRevision();

      await userEvent.click(
        await screen.findByRole('button', {
          name: 'Abrir certificado-peluqueria.pdf',
        }),
      );

      expect(
        await screen.findByText('El documento se eliminó el 03-11-2026.'),
      ).toBeInTheDocument();
      expect(pestana.close).toHaveBeenCalled();
    });

    it('E10-H3 FE · CA2 revisión: un documento eliminado muestra la fecha y no se puede abrir', async () => {
      simularBackend({
        [`GET /api/verificaciones/${ANDREA}`]: () =>
          Response.json({
            ...DETALLE,
            solicitud: {
              ...DETALLE.solicitud,
              documentos: [
                {
                  ...DETALLE.solicitud.documentos[0]!,
                  fechaEliminacion: '2026-11-03T12:00:00.000Z',
                },
              ],
            },
          }),
      });
      mostrarRevision();

      const documento = (
        await screen.findByText('certificado-peluqueria.pdf')
      ).closest('li')!;
      expect(documento).toHaveTextContent('Se eliminó el 3 nov 2026');
      expect(within(documento).queryByRole('button')).not.toBeInTheDocument();
    });

    it('E10-H3 FE · CA2 revisión: una cuenta sin solicitud (404) o un código inválido muestran que no se encontró', async () => {
      const { de } = simularBackend({
        [`GET /api/verificaciones/${ANDREA}`]: () =>
          error(404, 'La cuenta no tiene solicitudes de verificación.'),
      });
      mostrarRevision();
      expect(
        await screen.findByRole('heading', {
          name: 'No encontramos esta solicitud',
        }),
      ).toBeInTheDocument();

      mostrar(<RevisionVerificacion codigo="no-es-uuid" />);
      expect(
        screen.getAllByRole('heading', {
          name: 'No encontramos esta solicitud',
        }),
      ).toHaveLength(2);
      expect(de('GET /api/verificaciones/no-es-uuid')).toHaveLength(0);
    });
  });

  describe('CA3 resolver', () => {
    it('E10-H3 FE · CA3 resolver: rechazar sin motivo muestra el error junto al campo y no envía nada', async () => {
      const { de } = simularBackend();
      mostrarRevision();

      await userEvent.click(
        await screen.findByRole('button', { name: 'Rechazar' }),
      );

      const campo = screen.getByLabelText('Motivo (obligatorio para rechazar)');
      expect(campo).toHaveAccessibleDescription(
        'El motivo del rechazo es obligatorio.',
      );
      expect(campo).toHaveFocus();
      await userEvent.type(campo, 'Corto');
      await userEvent.click(screen.getByRole('button', { name: 'Rechazar' }));
      expect(campo).toHaveAccessibleDescription(
        'El motivo del rechazo debe tener al menos 10 caracteres.',
      );
      expect(de(`POST /api/verificaciones/${ANDREA}/rechazar`)).toHaveLength(0);
    });

    it('E10-H3 FE · CA3 resolver: rechaza con el motivo, la solicitud sale de la lista y se confirma', async () => {
      simularEscritorio();
      let rechazada = false;
      const motivo = 'El certificado no indica el nombre del titular.';
      const { de } = simularBackend({
        'GET /api/verificaciones/revision-manual': () =>
          Response.json(
            rechazada
              ? { ...LISTADO, items: LISTADO.items.slice(1), total: 1 }
              : LISTADO,
          ),
        [`POST /api/verificaciones/${ANDREA}/rechazar`]: () => {
          rechazada = true;
          return Response.json(resuelta('rechazada', motivo));
        },
      });
      mostrarRevision();

      await userEvent.type(
        await screen.findByLabelText('Motivo (obligatorio para rechazar)'),
        `  ${motivo}  `,
      );
      await userEvent.click(screen.getByRole('button', { name: 'Rechazar' }));

      expect(
        await screen.findByText(
          'Rechazaste la solicitud de Andrea Ejemplo. Verá tu motivo en su cuenta.',
        ),
      ).toBeInTheDocument();
      const [peticion] = de(`POST /api/verificaciones/${ANDREA}/rechazar`);
      expect(await peticion!.json()).toEqual({ motivo });
      expect(
        await screen.findByRole('heading', { name: 'Pendientes · 1' }),
      ).toBeInTheDocument();
      expect(
        within(
          screen.getByRole('list', { name: 'Solicitudes pendientes' }),
        ).queryByText('Andrea Ejemplo'),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('form', { name: 'Resolver la solicitud' }),
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: 'Andrea Ejemplo', level: 2 }),
      ).toHaveFocus();
    });

    it('E10-H3 FE · CA3 resolver: aprueba sin motivo y confirma que la cuenta ya es profesional', async () => {
      const { de } = simularBackend({
        [`POST /api/verificaciones/${ANDREA}/aprobar`]: () =>
          Response.json(resuelta('aprobada')),
      });
      mostrarRevision();

      await userEvent.click(
        await screen.findByRole('button', { name: 'Aprobar' }),
      );

      expect(
        await screen.findByText(
          'Aprobaste la solicitud de Andrea Ejemplo. Ya tiene la cuenta profesional.',
        ),
      ).toBeInTheDocument();
      expect(de(`POST /api/verificaciones/${ANDREA}/aprobar`)).toHaveLength(1);
      expect(screen.getByText('Aprobada')).toBeInTheDocument();
    });

    it('E10-H3 FE · CA3 resolver: si otra persona ya la resolvió (409), muestra el mensaje del backend y su resolución', async () => {
      let resuelto = false;
      simularBackend({
        [`GET /api/verificaciones/${ANDREA}`]: () =>
          Response.json(
            resuelto
              ? {
                  ...DETALLE,
                  solicitud: {
                    ...DETALLE.solicitud,
                    estado: 'aprobada',
                    fechaResolucion: '2026-11-04T14:00:00.000Z',
                    resolutor: {
                      codigoPublico: 'u-2',
                      nombre: 'Rosa',
                      apellido: 'Paz',
                    },
                  },
                }
              : DETALLE,
          ),
        [`POST /api/verificaciones/${ANDREA}/aprobar`]: () => {
          resuelto = true;
          return error(
            409,
            'Solo se puede resolver una solicitud en revisión manual.',
          );
        },
      });
      mostrarRevision();

      await userEvent.click(
        await screen.findByRole('button', { name: 'Aprobar' }),
      );

      expect(
        await screen.findAllByText(
          'Solo se puede resolver una solicitud en revisión manual.',
        ),
      ).not.toHaveLength(0);
      expect(
        await screen.findByText('Aprobada el 4 nov, 11:00 por Rosa Paz.'),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Aprobar' }),
      ).not.toBeInTheDocument();
    });

    it('E10-H3 FE · CA3 resolver: un 400 del backend queda junto al campo sin perder lo escrito', async () => {
      simularBackend({
        [`POST /api/verificaciones/${ANDREA}/rechazar`]: () =>
          error(400, [
            'El motivo del rechazo no puede superar los 1000 caracteres.',
          ]),
      });
      mostrarRevision();

      const campo = await screen.findByLabelText(
        'Motivo (obligatorio para rechazar)',
      );
      await userEvent.type(campo, 'Documento ilegible en todas sus páginas.');
      await userEvent.click(screen.getByRole('button', { name: 'Rechazar' }));

      await waitFor(() =>
        expect(campo).toHaveAccessibleDescription(
          'El motivo del rechazo no puede superar los 1000 caracteres.',
        ),
      );
      expect(campo).toHaveValue('Documento ilegible en todas sus páginas.');
    });
  });

  describe('CA2 revisión · abrir documentos con seguridad', () => {
    it('E10-H3 FE · CA2 revisión: si el navegador bloquea la pestaña, pide permitirla y no navega el panel ni pide el enlace', async () => {
      vi.spyOn(window, 'open').mockReturnValue(null);
      const { de } = simularBackend();
      mostrarRevision();

      await userEvent.click(
        await screen.findByRole('button', {
          name: 'Abrir certificado-peluqueria.pdf',
        }),
      );

      expect(
        await screen.findByText(
          'Permite las ventanas emergentes para abrir el documento.',
        ),
      ).toBeInTheDocument();
      expect(de(`GET /api/verificaciones/${ANDREA}/documentos/1`)).toHaveLength(
        0,
      );
    });

    it('E10-H3 FE · CA2 revisión: un enlace que no es https no se abre y la pestaña se cierra', async () => {
      const pestana = { opener: null, location: { href: '' }, close: vi.fn() };
      vi.spyOn(window, 'open').mockReturnValue(pestana as unknown as Window);
      simularBackend({
        [`GET /api/verificaciones/${ANDREA}/documentos/1`]: () =>
          Response.json({
            url: 'javascript:alert(1)',
            venceEn: '2026-11-04T15:01:00.000Z',
            tipo: 'certificado',
            nombreArchivo: 'certificado-peluqueria.pdf',
          }),
      });
      mostrarRevision();

      await userEvent.click(
        await screen.findByRole('button', {
          name: 'Abrir certificado-peluqueria.pdf',
        }),
      );

      await waitFor(() => expect(pestana.close).toHaveBeenCalled());
      expect(pestana.location.href).toBe('');
    });
  });

  describe('Casos de borde', () => {
    it('E10-H3 FE · CA2 revisión: muestra la fecha de la consulta al SII', async () => {
      simularBackend();
      mostrarRevision();

      const bloque = (
        await screen.findByRole('heading', { name: 'Consulta al SII' })
      ).closest('section')!;
      expect(bloque).toHaveTextContent('12 oct, 08:40');
    });

    it('E10-H3 FE · CA2 revisión: si el detalle falla (5xx), no muestra detalles técnicos y deja reintentar', async () => {
      let intentos = 0;
      simularBackend({
        [`GET /api/verificaciones/${ANDREA}`]: () => {
          intentos += 1;
          return intentos <= 3
            ? error(500, 'Internal server error')
            : Response.json(DETALLE);
        },
      });
      mostrarRevision();

      const reintentar = await screen.findByRole(
        'button',
        { name: 'Reintentar' },
        { timeout: 5000 },
      );
      expect(
        screen.queryByText('Internal server error'),
      ).not.toBeInTheDocument();
      await userEvent.click(reintentar);
      expect(
        await screen.findByRole('article', { name: 'Andrea Ejemplo' }),
      ).toBeInTheDocument();
    });

    it('E10-H3 FE · CA3 resolver: al aprobar, la solicitud sale de la lista', async () => {
      simularEscritorio();
      let aprobada = false;
      simularBackend({
        'GET /api/verificaciones/revision-manual': () =>
          Response.json(
            aprobada
              ? { ...LISTADO, items: LISTADO.items.slice(1), total: 1 }
              : LISTADO,
          ),
        [`POST /api/verificaciones/${ANDREA}/aprobar`]: () => {
          aprobada = true;
          return Response.json(resuelta('aprobada'));
        },
      });
      mostrarRevision();

      await userEvent.click(
        await screen.findByRole('button', { name: 'Aprobar' }),
      );

      expect(
        await screen.findByRole('heading', { name: 'Pendientes · 1' }),
      ).toBeInTheDocument();
      expect(
        within(
          screen.getByRole('list', { name: 'Solicitudes pendientes' }),
        ).queryByText('Andrea Ejemplo'),
      ).not.toBeInTheDocument();
    });

    it('E10-H3 FE · CA3 resolver: una solicitud sin documentos (pendiente) no se puede resolver', async () => {
      simularBackend({
        [`GET /api/verificaciones/${ANDREA}`]: () =>
          Response.json({
            ...DETALLE,
            solicitud: {
              ...DETALLE.solicitud,
              estado: 'pendiente',
              documentos: [],
            },
          }),
      });
      mostrarRevision();

      expect(
        await screen.findByText(
          'Podrás resolverla cuando adjunte sus documentos.',
        ),
      ).toBeInTheDocument();
      expect(screen.getByText('Faltan documentos')).toBeInTheDocument();
      expect(
        screen.getByText('Aún no adjunta documentos.'),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Aprobar' }),
      ).not.toBeInTheDocument();
    });

    it('E10-H3 FE · CA3 resolver: una solicitud aprobada por el SII dice quién la resolvió', async () => {
      simularBackend({
        [`GET /api/verificaciones/${ANDREA}`]: () =>
          Response.json({
            ...DETALLE,
            solicitud: {
              ...DETALLE.solicitud,
              estado: 'aprobada',
              motivoRevision: null,
              fechaResolucion: '2026-10-12T11:40:05.000Z',
              resolutor: null,
            },
          }),
      });
      mostrarRevision();

      expect(
        await screen.findByText(
          'Aprobada el 12 oct, 08:40 por la consulta al SII.',
        ),
      ).toBeInTheDocument();
    });
  });
});
