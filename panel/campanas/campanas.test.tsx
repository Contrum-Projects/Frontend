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
  OpcionesSegmentoCampana,
  VistaPreviaCampana,
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
  ],
};

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
          opciones: [
            { valor: 'coloracion_tinturas', texto: 'Coloración y tinturas' },
            { valor: 'alisados', texto: 'Alisados' },
          ],
        },
      ],
    },
  ],
};

/** El backend arma la vista previa; aquí, con lo que llegó y conteos fijos por tipo. */
const vistaPrevia = (datos: DatosCampana): VistaPreviaCampana => ({
  remitente: 'Cabello Perfecto',
  asunto: datos.asunto,
  parrafos: datos.cuerpo ? [datos.cuerpo.replaceAll('{nombre}', 'Camila')] : [],
  pie: 'Recibes este correo porque aceptaste ofertas de Cabello Perfecto.',
  textoBaja: 'Darme de baja',
  destinatarios:
    datos.segmento.tipo === 'profesionales'
      ? datos.segmento.criterios.length > 0
        ? 186
        : 312
      : 2140,
  segmento:
    datos.segmento.tipo === 'profesionales'
      ? 'Profesionales · Coloración y tinturas'
      : 'Todos',
});

const guardada = (codigo: string, datos: DatosCampana): CampanaGestion => ({
  ...datos,
  codigo,
  estado: 'borrador',
  fechaEdicion: '2026-11-04T15:00:00.000Z',
  fechaEnvio: null,
});

type Manejador = (peticion: Request) => Response | Promise<Response>;

/** Responde lo básico de las pantallas; `rutas` agrega o reemplaza por «MÉTODO /ruta». */
const simularBackend = (rutas: Record<string, Manejador> = {}) => {
  const pedidas: { clave: string; cuerpo: unknown }[] = [];
  const base: Record<string, Manejador> = {
    'GET /api/gestion/campanas': () => Response.json(LISTADO),
    'GET /api/gestion/campanas/segmentos': () => Response.json(SEGMENTOS),
    'POST /api/gestion/campanas/vista-previa': async (peticion) =>
      Response.json(vistaPrevia((await peticion.json()) as DatosCampana)),
    'POST /api/gestion/campanas': async (peticion) =>
      Response.json(
        guardada('CAMPNUEVA001', (await peticion.json()) as DatosCampana),
        { status: 201 },
      ),
    'POST /api/gestion/campanas/CAMPNUEVA001/envio': () =>
      Response.json(
        {
          codigo: 'CAMPNUEVA001',
          estado: 'enviada',
          destinatarios: 186,
          fechaEnvio: '2026-11-04T15:01:00.000Z',
        },
        { status: 202 },
      ),
    ...rutas,
  };
  const fetch = vi.fn(async (peticion: Request) => {
    const clave = `${peticion.method} ${new URL(peticion.url).pathname}`;
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

const error = (status: number, message: string | string[]) =>
  Response.json({ statusCode: status, message }, { status });

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

/** Escribe la campaña y elige «Profesionales» con una especialidad. */
const redactar = async (usuario: ReturnType<typeof userEvent.setup>) => {
  await usuario.type(
    screen.getByLabelText('Asunto'),
    'Llegaron tonos nuevos para tu salón',
  );
  await usuario.type(
    screen.getByLabelText('Cuerpo'),
    'Hola, {{nombre}: llegaron tonos nuevos.',
  );
  await usuario.click(
    await screen.findByRole('radio', { name: 'Profesionales' }),
  );
  await usuario.click(screen.getByRole('button', { name: /criterio/i }));
  await usuario.click(
    await screen.findByRole('menuitem', { name: 'Coloración y tinturas' }),
  );
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
    simularBackend();
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
    expect(celdas(enviada!)).toEqual(['Todos', '2.140', 'Enviada', '41%']);
    expect(celdas(borrador!)).toEqual([
      'Profesionales · Coloración y tinturas',
      '186',
      'Borrador',
      '—',
    ]);
    // Un borrador se abre para seguir editándolo; una enviada no tiene detalle
    expect(
      within(tabla).getByRole('link', { name: 'Tintes nuevos para el salón' }),
    ).toHaveAttribute('href', '/panel/campanas/CAMPBORRAD01');
    expect(
      within(tabla).queryByRole('link', { name: 'Mascarillas 20% dcto.' }),
    ).not.toBeInTheDocument();
    // Celular: las mismas campañas como lista
    const lista = screen.getByRole('list', { name: 'Campañas' });
    expect(within(lista).getAllByRole('listitem')).toHaveLength(2);
    expect(
      within(lista).getByText(/2\.140 enviados · 41% abiertos/),
    ).toBeInTheDocument();
  });

  it('E12-H3 FE · CA1 listado: sin campañas lo dice, y un error del backend se muestra tal cual', async () => {
    simularBackend({
      'GET /api/gestion/campanas': () =>
        Response.json({ ...LISTADO, campanas: [] }),
    });
    const { unmount } = mostrar(<PantallaCampanas />);
    expect(await screen.findByText(/Aún no hay campañas/)).toBeInTheDocument();
    unmount();

    simularBackend({
      'GET /api/gestion/campanas': () =>
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

describe('Redactar una campaña (SCRUM-140)', () => {
  it('E12-H3 FE · CA2 redactar: la vista previa muestra el correo con remitente y enlace de baja', async () => {
    const usuario = userEvent.setup();
    const { pedidas } = simularBackend();
    mostrar(<PantallaCampanaNueva />);

    await redactar(usuario);

    const correo = screen.getByRole('article', { name: 'Correo' });
    await waitFor(() =>
      expect(
        within(correo).getByText('Llegaron tonos nuevos para tu salón'),
      ).toBeInTheDocument(),
    );
    expect(
      within(correo).getByText('De: Cabello Perfecto'),
    ).toBeInTheDocument();
    expect(
      within(correo).getByText('Hola, Camila: llegaron tonos nuevos.'),
    ).toBeInTheDocument();
    expect(within(correo).getByText('Darme de baja')).toBeInTheDocument();
    // La pide al backend con lo escrito y el segmento elegido
    expect(
      pedidas('POST /api/gestion/campanas/vista-previa').at(-1)?.cuerpo,
    ).toEqual({
      asunto: 'Llegaron tonos nuevos para tu salón',
      cuerpo: 'Hola, {nombre}: llegaron tonos nuevos.',
      segmento: {
        tipo: 'profesionales',
        criterios: [{ clave: 'especialidad', valor: 'coloracion_tinturas' }],
      },
    });
  });

  it('E12-H3 FE · CA2 redactar: muestra el conteo de destinatarios con consentimiento del segmento', async () => {
    const usuario = userEvent.setup();
    simularBackend();
    mostrar(<PantallaCampanaNueva />);

    // Parte con el primer segmento del backend
    expect(
      await screen.findByText('2.140 destinatarios con consentimiento.'),
    ).toBeInTheDocument();
    await usuario.click(screen.getByRole('radio', { name: 'Profesionales' }));
    expect(
      await screen.findByText('312 destinatarios con consentimiento.'),
    ).toBeInTheDocument();
    await usuario.click(screen.getByRole('button', { name: /criterio/i }));
    await usuario.click(
      await screen.findByRole('menuitem', { name: 'Coloración y tinturas' }),
    );
    expect(
      await screen.findByText('186 destinatarios con consentimiento.'),
    ).toBeInTheDocument();
    // Quitar el criterio vuelve al conteo del tipo
    await usuario.click(
      screen.getByRole('button', {
        name: 'Quitar Especialidad: Coloración y tinturas',
      }),
    );
    expect(
      await screen.findByText('312 destinatarios con consentimiento.'),
    ).toBeInTheDocument();
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

  it('E12-H3 FE · CA2 redactar: sin asunto ni mensaje avisa junto a cada campo y no guarda', async () => {
    const usuario = userEvent.setup();
    const { pedidas } = simularBackend();
    mostrar(<PantallaCampanaNueva />);

    await usuario.click(
      screen.getAllByRole('button', { name: 'Guardar borrador' })[0]!,
    );

    expect(await screen.findByText('Escribe el asunto.')).toBeInTheDocument();
    expect(screen.getByText('Escribe el mensaje.')).toBeInTheDocument();
    expect(screen.getByLabelText('Asunto')).toHaveAccessibleDescription(
      'Escribe el asunto.',
    );
    expect(pedidas('POST /api/gestion/campanas')).toHaveLength(0);
  });

  it('E12-H3 FE · CA2 redactar: el rechazo del backend queda junto a su campo sin perder lo escrito', async () => {
    const usuario = userEvent.setup();
    simularBackend({
      'POST /api/gestion/campanas': () =>
        error(400, ['El asunto no puede superar los 120 caracteres.']),
    });
    mostrar(<PantallaCampanaNueva />);

    await redactar(usuario);
    await usuario.click(
      screen.getAllByRole('button', { name: 'Guardar borrador' })[0]!,
    );

    expect(
      await screen.findByText('El asunto no puede superar los 120 caracteres.'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Asunto')).toHaveValue(
      'Llegaron tonos nuevos para tu salón',
    );
  });

  it('E12-H3 FE · CA2 redactar: guarda el borrador y lo deja en su dirección', async () => {
    const usuario = userEvent.setup();
    const { pedidas } = simularBackend();
    const cambiarUrl = vi.spyOn(window.history, 'replaceState');
    mostrar(<PantallaCampanaNueva />);

    await redactar(usuario);
    await usuario.click(
      screen.getAllByRole('button', { name: 'Guardar borrador' })[0]!,
    );

    expect(await screen.findByText('Borrador guardado.')).toBeInTheDocument();
    expect(pedidas('POST /api/gestion/campanas')).toHaveLength(1);
    expect(cambiarUrl).toHaveBeenCalledWith(
      null,
      '',
      '/panel/campanas/CAMPNUEVA001',
    );
  });

  it('E12-H3 FE · CA2 redactar: un borrador se abre con lo guardado y se guarda con PUT', async () => {
    const usuario = userEvent.setup();
    const borrador = guardada('CAMPBORRAD01', {
      asunto: 'Tintes nuevos para el salón',
      cuerpo: 'Hola, {nombre}:',
      segmento: { tipo: 'clientes', criterios: [] },
    });
    const { pedidas } = simularBackend({
      'GET /api/gestion/campanas/CAMPBORRAD01': () => Response.json(borrador),
      'PUT /api/gestion/campanas/CAMPBORRAD01': async (peticion) =>
        Response.json(
          guardada('CAMPBORRAD01', (await peticion.json()) as DatosCampana),
        ),
    });
    mostrar(<PantallaEditarCampana codigo="CAMPBORRAD01" />);

    expect(await screen.findByLabelText('Asunto')).toHaveValue(
      'Tintes nuevos para el salón',
    );
    expect(
      await screen.findByRole('radio', { name: 'Clientes' }),
    ).toBeChecked();
    await usuario.click(
      screen.getAllByRole('button', { name: 'Guardar borrador' })[0]!,
    );

    await waitFor(() =>
      expect(pedidas('PUT /api/gestion/campanas/CAMPBORRAD01')).toHaveLength(1),
    );
    expect(pedidas('POST /api/gestion/campanas')).toHaveLength(0);
  });

  it('E12-H3 FE · CA2 redactar: una campaña ya enviada no se puede editar', async () => {
    simularBackend({
      'GET /api/gestion/campanas/CAMPENVIAD01': () =>
        Response.json({
          ...guardada('CAMPENVIAD01', {
            asunto: 'Mascarillas 20% dcto.',
            cuerpo: 'Hola',
            segmento: { tipo: 'todos', criterios: [] },
          }),
          estado: 'enviada',
          fechaEnvio: '2026-10-01T13:00:00.000Z',
        }),
    });
    mostrar(<PantallaEditarCampana codigo="CAMPENVIAD01" />);

    expect(
      await screen.findByText(/Esta campaña ya se envió/),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText('Asunto')).not.toBeInTheDocument();
  });
});

describe('Confirmar el envío (SCRUM-140)', () => {
  it('E12-H3 FE · CA3 confirmar envío: pide confirmar con el número de destinatarios y avisa que se envía una sola vez', async () => {
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
      '«Llegaron tonos nuevos para tu salón» se enviará ahora a 186 destinatarios con consentimiento (Profesionales · Coloración y tinturas).',
    );
    expect(
      within(ventana).getByText(
        'Una campaña se envía una sola vez y no se puede deshacer.',
      ),
    ).toBeInTheDocument();
    // Antes de confirmar queda guardada como borrador, pero no sale
    expect(pedidas('POST /api/gestion/campanas')).toHaveLength(1);
    expect(
      pedidas('POST /api/gestion/campanas/CAMPNUEVA001/envio'),
    ).toHaveLength(0);

    await usuario.click(
      within(ventana).getByRole('button', { name: 'Enviar a 186' }),
    );

    expect(
      await screen.findByText('Campaña enviada a 186 destinatarios.'),
    ).toBeInTheDocument();
    expect(
      pedidas('POST /api/gestion/campanas/CAMPNUEVA001/envio'),
    ).toHaveLength(1);
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
    expect(
      pedidas('POST /api/gestion/campanas/CAMPNUEVA001/envio'),
    ).toHaveLength(0);
    expect(screen.getByLabelText('Asunto')).toHaveValue(
      'Llegaron tonos nuevos para tu salón',
    );
  });

  it('E12-H3 FE · CA3 confirmar envío: si ya salió (409), lo avisa y vuelve a Campañas', async () => {
    const usuario = userEvent.setup();
    simularBackend({
      'POST /api/gestion/campanas/CAMPNUEVA001/envio': () =>
        error(409, 'Esta campaña ya se envió.'),
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
      await screen.findByText('Esta campaña ya se envió.'),
    ).toBeInTheDocument();
    expect(enrutador.push).toHaveBeenCalledWith('/panel/campanas');
  });

  it('E12-H3 FE · CA3 confirmar envío: otro rechazo del backend se muestra en la ventana', async () => {
    const usuario = userEvent.setup();
    simularBackend({
      'POST /api/gestion/campanas/CAMPNUEVA001/envio': () =>
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
      'POST /api/gestion/campanas/vista-previa': async (peticion) =>
        Response.json({
          ...vistaPrevia((await peticion.json()) as DatosCampana),
          destinatarios: 0,
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
    expect(
      pedidas('POST /api/gestion/campanas/CAMPNUEVA001/envio'),
    ).toHaveLength(0);
  });

  it('E12-H3 FE · CA2 redactar: Enter en el asunto no abre la confirmación ni envía', async () => {
    const usuario = userEvent.setup();
    const { pedidas } = simularBackend();
    mostrar(<PantallaCampanaNueva />);

    await redactar(usuario);
    await usuario.type(screen.getByLabelText('Asunto'), '{Enter}');

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(
      pedidas('POST /api/gestion/campanas/CAMPNUEVA001/envio'),
    ).toHaveLength(0);
  });
});
