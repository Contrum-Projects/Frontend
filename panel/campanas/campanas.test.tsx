import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { paths } from '@/compartido/api/esquema';
import type {
  CampanaGestion,
  DatosCampana,
  ListadoCampanas,
} from '@/compartido/api/respuestas';
import { crearClienteDeConsultas } from '@/compartido/proveedores';
import {
  guardarSesion,
  reiniciarParaPruebas,
} from '@/compartido/sesion/almacen';
import { Toaster } from '@/compartido/ui/sonner';
import { puedeAbrir } from '@/panel/diseno/secciones';
import { PantallaCampanaNueva, PantallaEditarCampana } from './pantallaCampana';
import { PantallaCampanas } from './pantallaCampanas';

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

const enrutador = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn() }));
vi.mock('next/navigation', () => ({
  useRouter: () => enrutador,
  usePathname: () => '/panel/campanas',
}));

const RUTA = '/api/marketing/campanas';
const TODOS: DatosCampana['segmento'] = {
  tipos: ['cliente', 'profesional', 'suscriptor'],
  categorias: [],
  marcas: [],
};
const PROFESIONALES_COLORACION = {
  tipos: ['profesional' as const],
  categorias: [3],
  marcas: [],
};

const CATEGORIAS = [
  {
    id: 3,
    nombre: 'Coloración y tinturas',
    descripcion: null,
    padreId: null,
    subcategorias: [],
  },
];
const MARCAS = [{ id: 5, nombre: 'Loreal', activa: true }];

/** Una campaña como la devuelve el backend (detalle, POST y PATCH). */
const guardada = (
  id: number,
  datos: DatosCampana,
  cambios: Partial<CampanaGestion> = {},
): CampanaGestion => ({
  id,
  asunto: datos.asunto,
  cuerpo: datos.cuerpo,
  segmento: {
    tipos: datos.segmento.tipos,
    categorias: datos.segmento.categorias ?? [],
    marcas: datos.segmento.marcas ?? [],
  },
  enviada: false,
  fechaCreacion: '2026-11-04T13:20:00.000Z',
  fechaEnvio: null,
  creadaPor: { nombre: 'Marcela', apellido: 'Díaz' },
  envios: {
    total: 0,
    pendientes: 0,
    enviados: 0,
    fallidos: 0,
    cancelados: 0,
    rebotados: 0,
  },
  ...cambios,
});

const fila = (
  campana: CampanaGestion,
  cifras: { destinatarios: number; porcentajeApertura: number | null },
) => {
  const { envios: _envios, ...resto } = campana;
  return { ...resto, ...cifras };
};

const LISTADO: ListadoCampanas = {
  contactos: {
    aceptanPublicidad: 2284,
    cuentasVerificadas: 1932,
    suscriptoresSinCuenta: 352,
    conRebote: 41,
  },
  items: [
    fila(
      guardada(7, {
        asunto: 'Tintes nuevos para el salón',
        cuerpo: 'Hola',
        segmento: PROFESIONALES_COLORACION,
      }),
      { destinatarios: 186, porcentajeApertura: null },
    ),
    fila(
      guardada(
        8,
        { asunto: 'Mascarillas 20% dcto.', cuerpo: 'Hola', segmento: TODOS },
        { enviada: true, fechaEnvio: '2026-10-01T13:00:00.000Z' },
      ),
      { destinatarios: 2140, porcentajeApertura: 41 },
    ),
  ],
  total: 2,
  pagina: 1,
  limite: 100,
};

const PIE =
  'Cabello Perfecto te envía este correo porque aceptaste recibir sus ofertas.';
const BAJA = 'Dejar de recibir ofertas: https://tienda.cl/ofertas/baja';

/** El correo que arma el backend: asunto, cuerpo, pie y baja, en texto plano. */
const correo = ({ asunto, cuerpo }: { asunto: string; cuerpo: string }) => ({
  asunto,
  html: '<html></html>',
  texto: [asunto, cuerpo, PIE, BAJA].join('\n\n'),
});

type Manejador = (peticion: Request) => Response | Promise<Response>;

/** Responde lo básico de las pantallas; `rutas` agrega o reemplaza por «MÉTODO /ruta». */
const simularBackend = (rutas: Record<string, Manejador> = {}) => {
  const pedidas: { clave: string; cuerpo: unknown }[] = [];
  const base: Record<string, Manejador> = {
    [`GET ${RUTA}`]: () => Response.json(LISTADO),
    'GET /api/catalogo/categorias': () => Response.json(CATEGORIAS),
    'GET /api/catalogo/marcas': () => Response.json(MARCAS),
    'GET /api/marketing/cumpleanos': () =>
      Response.json({
        activo: true,
        asunto: 'Feliz cumpleaños, {nombre}',
        cuerpo: 'Te deseamos un gran día.',
        oferta: { activa: false, texto: null },
        configurado: true,
        programadosEsteMes: 87,
        porcentajeAperturaUltimoMes: 63,
      }),
    [`POST ${RUTA}/vista-previa`]: async (peticion) =>
      Response.json(
        correo((await peticion.json()) as { asunto: string; cuerpo: string }),
      ),
    [`POST ${RUTA}`]: async (peticion) =>
      Response.json(guardada(41, (await peticion.json()) as DatosCampana), {
        status: 201,
      }),
    [`POST ${RUTA}/41/vista-previa`]: () =>
      Response.json({
        ...correo({
          asunto: 'Llegaron tonos nuevos para tu salón',
          cuerpo: '',
        }),
        destinatarios: 186,
        confirmacion: 'emision.firma',
      }),
    [`POST ${RUTA}/41/envio`]: () =>
      Response.json(
        { id: 41, destinatarios: 186, fechaEnvio: '2026-11-04T15:01:00.000Z' },
        { status: 202 },
      ),
    ...rutas,
  };
  const fetch = vi.fn(async (peticion: Request) => {
    const url = new URL(peticion.url);
    const clave = `${peticion.method} ${url.pathname}`;
    const cuerpo =
      peticion.method === 'GET'
        ? undefined
        : await peticion
            .clone()
            .json()
            .catch(() => undefined);
    pedidas.push({ clave, cuerpo });
    const manejador = base[clave];
    if (!manejador) throw new Error(`Petición no simulada: ${clave}`);
    return manejador(peticion);
  });
  vi.stubGlobal('fetch', fetch);
  return {
    pedidas: (clave: string) =>
      pedidas.filter((pedida) => pedida.clave === clave),
  };
};

/** Un error como el del backend; con `campos`, cada mensaje lleva su campo (SCRUM-150). */
const error = (
  status: number,
  message: string | string[],
  campos: string[] = [],
) =>
  Response.json(
    {
      statusCode: status,
      message,
      ...(campos.length > 0 && {
        errores: campos.flatMap((campo) =>
          [message].flat().map((mensaje) => ({ campo, mensaje })),
        ),
      }),
    },
    { status },
  );

const mostrar = (pantalla: ReactNode) =>
  render(
    <QueryClientProvider client={crearClienteDeConsultas()}>
      {pantalla}
      <Toaster />
    </QueryClientProvider>,
  );

beforeEach(() => {
  reiniciarParaPruebas();
  enrutador.push.mockReset();
  act(() =>
    guardarSesion({
      tokenAcceso: 'token',
      expiraEn: 900,
      usuario: {
        codigoPublico: 'u-1',
        nombre: 'Marcela',
        apellido: 'Díaz',
        rol: 'administrador',
      },
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

/** Escribe la campaña y deja solo a los profesionales que compraron en Coloración. */
const redactar = async (usuario: ReturnType<typeof userEvent.setup>) => {
  await usuario.type(
    screen.getByLabelText('Asunto'),
    'Llegaron tonos nuevos para tu salón',
  );
  await usuario.type(
    screen.getByLabelText('Cuerpo'),
    'Hola: llegaron tonos nuevos.',
  );
  await usuario.click(screen.getByRole('checkbox', { name: 'Clientes' }));
  await usuario.click(
    screen.getByRole('checkbox', { name: 'Suscriptores sin cuenta' }),
  );
  await usuario.click(await screen.findByRole('button', { name: 'Categoría' }));
  await usuario.click(
    await screen.findByRole('menuitemcheckbox', {
      name: 'Coloración y tinturas',
    }),
  );
  await usuario.keyboard('{Escape}');
};

describe('Listado de campañas (SCRUM-140)', () => {
  it('E12-H3 FE · CA1 listado: muestra los contactos con consentimiento contados por el backend', async () => {
    simularBackend();
    mostrar(<PantallaCampanas />);

    const contactos = await screen.findByRole('list', { name: 'Contactos' });
    expect(within(contactos).getByText('2.284')).toBeInTheDocument();
    expect(
      within(contactos).getByText('aceptan publicidad'),
    ).toBeInTheDocument();
    expect(within(contactos).getByText('1.932')).toBeInTheDocument();
    expect(within(contactos).getByText('352')).toBeInTheDocument();
    expect(
      within(contactos).getByText('direcciones con rebote'),
    ).toBeInTheDocument();
  });

  it('E12-H3 FE · CA1 listado: muestra las campañas con segmento, destinatarios, estado y apertura', async () => {
    const { pedidas } = simularBackend();
    mostrar(<PantallaCampanas />);

    const tabla = await screen.findByRole('table', { name: 'Campañas' });
    expect(
      within(tabla)
        .getAllByRole('columnheader')
        .map((celda) => celda.textContent),
    ).toEqual([
      'Campaña',
      'Segmento',
      'Destinatarios',
      'Estado',
      'Abiertos',
      'Abrir',
    ]);
    const [, borrador, enviada] = within(tabla).getAllByRole('row');
    const celdas = (fila: HTMLElement) =>
      within(fila)
        .getAllByRole('cell')
        .slice(1, 5)
        .map((celda) => celda.textContent);
    expect(celdas(enviada!)).toEqual([
      'Clientes, Profesionales y Suscriptores sin cuenta',
      '2.140',
      'Enviada',
      '41%',
    ]);
    // El texto del segmento se arma con los nombres del catálogo
    await waitFor(() =>
      expect(celdas(borrador!)).toEqual([
        'Profesionales · compraron en Coloración y tinturas',
        '186',
        'Borrador',
        '—',
      ]),
    );
    // Un borrador se abre por su id para seguir editándolo; una enviada no tiene detalle
    expect(
      within(tabla).getByRole('link', { name: 'Tintes nuevos para el salón' }),
    ).toHaveAttribute('href', '/panel/campanas/7');
    expect(
      within(tabla).queryByRole('link', { name: 'Mascarillas 20% dcto.' }),
    ).not.toBeInTheDocument();
    // Celular: las mismas campañas como lista
    const lista = screen.getByRole('list', { name: 'Campañas' });
    expect(within(lista).getAllByRole('listitem')).toHaveLength(2);
    expect(
      within(lista).getByText(/2\.140 enviados · 41% abiertos/),
    ).toBeInTheDocument();
    // Pide la página más grande que admite el backend
    expect(pedidas(`GET ${RUTA}`)).toHaveLength(1);
  });

  it('E12-H3 FE · CA1 listado: sin campañas lo dice, y un error del backend se muestra tal cual', async () => {
    simularBackend({
      [`GET ${RUTA}`]: () => Response.json({ ...LISTADO, items: [], total: 0 }),
    });
    const { unmount } = mostrar(<PantallaCampanas />);
    expect(await screen.findByText(/Aún no hay campañas/)).toBeInTheDocument();
    unmount();

    simularBackend({
      [`GET ${RUTA}`]: () =>
        error(403, 'No tienes permiso para gestionar campañas.'),
    });
    mostrar(<PantallaCampanas />);
    expect(
      await screen.findByText('No tienes permiso para gestionar campañas.'),
    ).toBeInTheDocument();
  });

  it('E12-H3 FE · CA1 listado: solo quien tiene campanas.gestionar abre Campañas', () => {
    expect(puedeAbrir('administrador', '/panel/campanas')).toBe(true);
    expect(puedeAbrir('administrador', '/panel/campanas/nueva')).toBe(true);
    expect(puedeAbrir('vendedor', '/panel/campanas')).toBe(false);
    expect(puedeAbrir('bodeguero', '/panel/campanas/nueva')).toBe(false);
  });
});

describe('Saludo de cumpleaños en Campañas (SCRUM-141)', () => {
  it('E12-H5 FE · CA1 activar: al abrir Campañas se ve la tarjeta del saludo con su interruptor', async () => {
    simularBackend();
    mostrar(<PantallaCampanas />);

    const tarjeta = await screen.findByRole('region', {
      name: 'Saludo de cumpleaños',
    });
    expect(
      await within(tarjeta).findByRole('switch', {
        name: 'Saludo de cumpleaños',
      }),
    ).toBeChecked();
  });

  it('E12-H5 FE · CA1 activar: si la lista de campañas falla, la tarjeta del saludo sigue visible', async () => {
    simularBackend({
      [`GET ${RUTA}`]: () => error(400, 'No se pudo cargar la lista.'),
    });
    mostrar(<PantallaCampanas />);

    expect(
      await screen.findByText('No se pudo cargar la lista.'),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('switch', { name: 'Saludo de cumpleaños' }),
    ).toBeInTheDocument();
  });
});

describe('Redactar una campaña (SCRUM-140)', () => {
  it('E12-H3 FE · CA2 redactar: la vista previa en vivo muestra el correo con remitente y enlace de baja, sin guardar', async () => {
    const usuario = userEvent.setup();
    const { pedidas } = simularBackend();
    mostrar(<PantallaCampanaNueva />);

    const correoVista = screen.getByRole('article', { name: 'Correo' });
    // Sin asunto ni mensaje no hay correo que armar
    expect(correoVista).toHaveTextContent(
      'Escribe el asunto y el mensaje para ver el correo.',
    );

    await redactar(usuario);

    await waitFor(() =>
      expect(
        within(correoVista).getByText('Llegaron tonos nuevos para tu salón'),
      ).toBeInTheDocument(),
    );
    expect(
      within(correoVista).getByText('De: Cabello Perfecto'),
    ).toBeInTheDocument();
    expect(
      within(correoVista).getByText('Hola: llegaron tonos nuevos.'),
    ).toBeInTheDocument();
    expect(within(correoVista).getByText(PIE)).toBeInTheDocument();
    expect(within(correoVista).getByText(BAJA)).toBeInTheDocument();
    // SCRUM-150: la vista previa en vivo solo lleva lo que se ve; no guarda la campaña
    expect(pedidas(`POST ${RUTA}/vista-previa`).at(-1)?.cuerpo).toEqual({
      asunto: 'Llegaron tonos nuevos para tu salón',
      cuerpo: 'Hola: llegaron tonos nuevos.',
    });
    expect(pedidas(`POST ${RUTA}`)).toHaveLength(0);
  });

  it('SCRUM-150 · marcadores: el menú agrega el dato donde está el cursor, en el último campo usado', async () => {
    const usuario = userEvent.setup();
    simularBackend();
    mostrar(<PantallaCampanaNueva />);

    const cuerpo = screen.getByLabelText('Cuerpo');
    const asunto = screen.getByLabelText('Asunto');
    // Sin tocar ningún campo, va al cuerpo
    await usuario.click(screen.getByRole('button', { name: 'Nombre' }));
    expect(cuerpo).toHaveValue('{nombre}');

    await usuario.type(asunto, 'Novedades para ');
    await usuario.click(screen.getByRole('button', { name: 'Nombre' }));
    expect(asunto).toHaveValue('Novedades para {nombre}');
    expect(asunto).toHaveFocus();

    // Con texto seleccionado en el cuerpo, el dato lo reemplaza
    act(() => {
      (cuerpo as HTMLTextAreaElement).focus();
      (cuerpo as HTMLTextAreaElement).setSelectionRange(0, '{nombre}'.length);
    });
    await usuario.click(
      screen.getByRole('button', { name: 'Enlace a la tienda' }),
    );
    expect(cuerpo).toHaveValue('{enlace_tienda}');
    expect(asunto).toHaveValue('Novedades para {nombre}');
  });

  it('E12-H3 FE · CA2 redactar: el segmento admite varios tipos y varias categorías y marcas', async () => {
    const usuario = userEvent.setup();
    simularBackend();
    mostrar(<PantallaCampanaNueva />);

    // Una campaña nueva parte a todos
    for (const tipo of [
      'Clientes',
      'Profesionales',
      'Suscriptores sin cuenta',
    ]) {
      expect(screen.getByRole('checkbox', { name: tipo })).toBeChecked();
    }
    await usuario.click(await screen.findByRole('button', { name: 'Marca' }));
    await usuario.click(
      await screen.findByRole('menuitemcheckbox', { name: 'Loreal' }),
    );
    await usuario.keyboard('{Escape}');

    const quitar = screen.getByRole('button', { name: 'Quitar marca: Loreal' });
    await usuario.click(quitar);
    expect(
      screen.queryByRole('button', { name: 'Quitar marca: Loreal' }),
    ).not.toBeInTheDocument();
  });

  it('E12-H3 FE · CA2 redactar: en celular la vista previa va en una pestaña aparte', async () => {
    const usuario = userEvent.setup();
    simularBackend();
    mostrar(<PantallaCampanaNueva />);

    const editar = screen.getByRole('tab', { name: 'Editar' });
    const vista = screen.getByRole('tab', { name: 'Vista previa' });
    expect(editar).toHaveAttribute('aria-selected', 'true');
    await usuario.click(vista);
    expect(vista).toHaveAttribute('aria-selected', 'true');
    // Lo escrito sigue ahí: las dos pestañas quedan montadas
    expect(screen.getByLabelText('Asunto')).toBeInTheDocument();
  });

  it('E12-H3 FE · CA2 redactar: sin asunto, mensaje ni destinatarios avisa junto a cada campo y no guarda', async () => {
    const usuario = userEvent.setup();
    const { pedidas } = simularBackend();
    mostrar(<PantallaCampanaNueva />);

    for (const tipo of [
      'Clientes',
      'Profesionales',
      'Suscriptores sin cuenta',
    ]) {
      await usuario.click(screen.getByRole('checkbox', { name: tipo }));
    }
    await usuario.click(
      screen.getAllByRole('button', { name: 'Guardar borrador' })[0]!,
    );

    expect(await screen.findByText('Escribe el asunto.')).toBeInTheDocument();
    expect(screen.getByText('Escribe el mensaje.')).toBeInTheDocument();
    expect(screen.getByText('Elige a quién le llega.')).toBeInTheDocument();
    expect(screen.getByLabelText('Asunto')).toHaveAccessibleDescription(
      'Escribe el asunto.',
    );
    expect(pedidas(`POST ${RUTA}`)).toHaveLength(0);
  });

  it('E12-H3 FE · CA2 redactar: el rechazo del backend queda junto al campo que indica, sin perder lo escrito', async () => {
    const usuario = userEvent.setup();
    simularBackend({
      [`POST ${RUTA}`]: () =>
        Response.json(
          {
            statusCode: 400,
            message: [
              'El asunto de la campaña debe tener hasta 200 caracteres.',
              'Alguna categoría indicada no existe.',
            ],
            errores: [
              {
                campo: 'asunto',
                mensaje:
                  'El asunto de la campaña debe tener hasta 200 caracteres.',
              },
              {
                campo: 'segmento.categorias',
                mensaje: 'Alguna categoría indicada no existe.',
              },
            ],
          },
          { status: 400 },
        ),
    });
    mostrar(<PantallaCampanaNueva />);

    await redactar(usuario);
    await usuario.click(
      screen.getAllByRole('button', { name: 'Guardar borrador' })[0]!,
    );

    expect(screen.getByLabelText('Asunto')).toHaveAccessibleDescription(
      'El asunto de la campaña debe tener hasta 200 caracteres.',
    );
    expect(
      await screen.findByText('Alguna categoría indicada no existe.'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Asunto')).toHaveValue(
      'Llegaron tonos nuevos para tu salón',
    );
  });

  it('E12-H3 FE · CA2 redactar: guarda el borrador con el segmento elegido y lo deja en su dirección', async () => {
    const usuario = userEvent.setup();
    const { pedidas } = simularBackend();
    const cambiarUrl = vi.spyOn(window.history, 'replaceState');
    mostrar(<PantallaCampanaNueva />);

    await redactar(usuario);
    await usuario.click(
      screen.getAllByRole('button', { name: 'Guardar borrador' })[0]!,
    );

    expect(await screen.findByText('Borrador guardado.')).toBeInTheDocument();
    expect(pedidas(`POST ${RUTA}`).map(({ cuerpo }) => cuerpo)).toEqual([
      {
        asunto: 'Llegaron tonos nuevos para tu salón',
        cuerpo: 'Hola: llegaron tonos nuevos.',
        segmento: { tipos: ['profesional'], categorias: [3], marcas: [] },
      },
    ]);
    expect(cambiarUrl).toHaveBeenCalledWith(null, '', '/panel/campanas/41');
  });

  it('E12-H3 FE · CA2 redactar: un borrador se abre con lo guardado y se guarda con PATCH', async () => {
    const usuario = userEvent.setup();
    const borrador = guardada(7, {
      asunto: 'Tintes nuevos para el salón',
      cuerpo: 'Hola:',
      segmento: { tipos: ['cliente'], categorias: [], marcas: [] },
    });
    const { pedidas } = simularBackend({
      [`GET ${RUTA}/7`]: () => Response.json(borrador),
      [`PATCH ${RUTA}/7`]: async (peticion) =>
        Response.json(guardada(7, (await peticion.json()) as DatosCampana)),
    });
    mostrar(<PantallaEditarCampana id="7" />);

    expect(await screen.findByLabelText('Asunto')).toHaveValue(
      'Tintes nuevos para el salón',
    );
    expect(screen.getByRole('checkbox', { name: 'Clientes' })).toBeChecked();
    expect(
      screen.getByRole('checkbox', { name: 'Profesionales' }),
    ).not.toBeChecked();
    await usuario.click(
      screen.getAllByRole('button', { name: 'Guardar borrador' })[0]!,
    );

    await waitFor(() => expect(pedidas(`PATCH ${RUTA}/7`)).toHaveLength(1));
    expect(pedidas(`POST ${RUTA}`)).toHaveLength(0);
  });

  it('E12-H3 FE · CA2 redactar: una campaña ya enviada no se puede editar', async () => {
    simularBackend({
      [`GET ${RUTA}/8`]: () =>
        Response.json(
          guardada(
            8,
            {
              asunto: 'Mascarillas 20% dcto.',
              cuerpo: 'Hola',
              segmento: TODOS,
            },
            { enviada: true, fechaEnvio: '2026-10-01T13:00:00.000Z' },
          ),
        ),
    });
    mostrar(<PantallaEditarCampana id="8" />);

    expect(
      await screen.findByText(/Esta campaña ya se envió/),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText('Asunto')).not.toBeInTheDocument();
  });

  it('E12-H3 FE · una dirección que no es un id responde como una campaña que no existe, sin pedirla', async () => {
    const { pedidas } = simularBackend();
    mostrar(<PantallaEditarCampana id="CAMPBORRAD01" />);

    expect(
      screen.getByRole('heading', { name: 'Campaña no encontrada' }),
    ).toBeInTheDocument();
    expect(pedidas(`GET ${RUTA}/CAMPBORRAD01`)).toHaveLength(0);
  });
});

describe('Confirmar el envío (SCRUM-140)', () => {
  it('E12-H3 FE · CA3 confirmar envío: guarda, pide confirmar con los destinatarios del backend y envía con su confirmación', async () => {
    const usuario = userEvent.setup();
    const { pedidas } = simularBackend();
    mostrar(<PantallaCampanaNueva />);

    await redactar(usuario);
    await usuario.click(
      screen.getAllByRole('button', { name: 'Revisar y enviar' })[0]!,
    );

    const ventana = await screen.findByRole('alertdialog', {
      name: '¿Enviar la campaña?',
    });
    expect(ventana).toHaveTextContent(
      '«Llegaron tonos nuevos para tu salón» se enviará ahora a 186 destinatarios con consentimiento (Profesionales · compraron en Coloración y tinturas).',
    );
    expect(
      within(ventana).getByText(
        'Una campaña se envía una sola vez y no se puede deshacer.',
      ),
    ).toBeInTheDocument();
    // Antes de confirmar queda guardada como borrador y se pide su vista previa, pero no sale
    expect(pedidas(`POST ${RUTA}`)).toHaveLength(1);
    expect(pedidas(`POST ${RUTA}/41/vista-previa`)).toHaveLength(1);
    expect(pedidas(`POST ${RUTA}/41/envio`)).toHaveLength(0);

    await usuario.click(
      within(ventana).getByRole('button', { name: 'Enviar a 186' }),
    );

    expect(
      await screen.findByText('Campaña enviada a 186 destinatarios.'),
    ).toBeInTheDocument();
    expect(
      pedidas(`POST ${RUTA}/41/envio`).map(({ cuerpo }) => cuerpo),
    ).toEqual([{ confirmacion: 'emision.firma' }]);
    expect(enrutador.push).toHaveBeenCalledWith('/panel/campanas');
  });

  it('E12-H3 FE · CA3 confirmar envío: «Volver» cierra la ventana sin enviar', async () => {
    const usuario = userEvent.setup();
    const { pedidas } = simularBackend();
    mostrar(<PantallaCampanaNueva />);

    await redactar(usuario);
    await usuario.click(
      screen.getAllByRole('button', { name: 'Revisar y enviar' })[0]!,
    );
    const ventana = await screen.findByRole('alertdialog');
    await usuario.click(
      within(ventana).getByRole('button', { name: 'Volver' }),
    );

    await waitFor(() =>
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument(),
    );
    expect(pedidas(`POST ${RUTA}/41/envio`)).toHaveLength(0);
    expect(screen.getByLabelText('Asunto')).toHaveValue(
      'Llegaron tonos nuevos para tu salón',
    );
  });

  it('E12-H3 FE · CA3 confirmar envío: si ya salió (409), lo avisa y vuelve a Campañas', async () => {
    const usuario = userEvent.setup();
    simularBackend({
      [`POST ${RUTA}/41/envio`]: () => error(409, 'La campaña ya se envió.'),
    });
    mostrar(<PantallaCampanaNueva />);

    await redactar(usuario);
    await usuario.click(
      screen.getAllByRole('button', { name: 'Revisar y enviar' })[0]!,
    );
    const ventana = await screen.findByRole('alertdialog');
    await usuario.click(
      within(ventana).getByRole('button', { name: 'Enviar a 186' }),
    );

    expect(
      await screen.findByText('La campaña ya se envió.'),
    ).toBeInTheDocument();
    expect(enrutador.push).toHaveBeenCalledWith('/panel/campanas');
  });

  it('E12-H3 FE · CA3 confirmar envío: otro rechazo del backend se muestra en la ventana', async () => {
    const usuario = userEvent.setup();
    simularBackend({
      [`POST ${RUTA}/41/envio`]: () =>
        error(500, 'No pudimos completar la solicitud. Intenta de nuevo.'),
    });
    mostrar(<PantallaCampanaNueva />);

    await redactar(usuario);
    await usuario.click(
      screen.getAllByRole('button', { name: 'Revisar y enviar' })[0]!,
    );
    const ventana = await screen.findByRole('alertdialog');
    await usuario.click(
      within(ventana).getByRole('button', { name: 'Enviar a 186' }),
    );

    expect(
      await within(ventana).findByText(
        'No pudimos completar la acción. Intenta de nuevo en unos minutos.',
      ),
    ).toBeInTheDocument();
    expect(ventana).not.toHaveTextContent('Intenta de nuevo.');
    expect(enrutador.push).not.toHaveBeenCalled();
  });

  it('E12-H3 FE · CA3 confirmar envío: sin destinatarios con consentimiento no deja enviar', async () => {
    const usuario = userEvent.setup();
    const { pedidas } = simularBackend({
      [`POST ${RUTA}/41/vista-previa`]: () =>
        Response.json({
          ...correo({
            asunto: 'Llegaron tonos nuevos para tu salón',
            cuerpo: '',
          }),
          destinatarios: 0,
          confirmacion: 'emision.firma',
        }),
    });
    mostrar(<PantallaCampanaNueva />);

    await redactar(usuario);
    await usuario.click(
      screen.getAllByRole('button', { name: 'Revisar y enviar' })[0]!,
    );
    const ventana = await screen.findByRole('alertdialog');

    expect(
      within(ventana).getByText(/no tiene destinatarios con consentimiento/),
    ).toBeInTheDocument();
    expect(
      within(ventana).getByRole('button', { name: 'Enviar a 0' }),
    ).toBeDisabled();
    expect(pedidas(`POST ${RUTA}/41/envio`)).toHaveLength(0);
  });

  it('E12-H3 FE · CA2 redactar: Enter en el asunto no abre la confirmación ni envía', async () => {
    const usuario = userEvent.setup();
    const { pedidas } = simularBackend();
    mostrar(<PantallaCampanaNueva />);

    await redactar(usuario);
    await usuario.type(screen.getByLabelText('Asunto'), '{Enter}');

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(pedidas(`POST ${RUTA}/41/envio`)).toHaveLength(0);
  });
});
