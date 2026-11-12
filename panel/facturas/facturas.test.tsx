import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { paths } from '@/compartido/api/esquema';
import type {
  DetalleFacturaGestion,
  ListadoFacturasGestion,
} from '@/compartido/api/respuestas';
import { crearClienteDeConsultas } from '@/compartido/proveedores';
import type { Rol } from '@/compartido/sesion/roles';
import {
  guardarSesion,
  reiniciarParaPruebas,
} from '@/compartido/sesion/almacen';
import { Toaster } from '@/compartido/ui/sonner';
import { puedeAbrir } from '@/panel/diseno/secciones';
import { PestanasPedidos } from '@/panel/pedidos/pestanasPedidos';
import { DetalleFacturaPanel } from './detalleFactura';
import { DisenoFacturas } from './disenoFacturas';

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
  usePathname: () => '/panel/pedidos/facturas',
}));

const LISTADO: ListadoFacturasGestion = {
  items: [
    {
      codigoPedido: 'FACTPOREMI01',
      razonSocial: 'Peluquería Ejemplo SpA',
      rut: '76123456-0',
      total: 73190,
      estado: 'por_emitir',
      folio: null,
    },
    {
      codigoPedido: 'FACTEMITID01',
      razonSocial: 'Estudio Ejemplo Ltda.',
      rut: '78234567-2',
      total: 45220,
      estado: 'emitida',
      folio: 1532,
    },
  ],
  porEmitir: 1,
  total: 2,
  pagina: 1,
  limite: 20,
};

const POR_EMITIR: DetalleFacturaGestion = {
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
};

const EMITIDA: DetalleFacturaGestion = {
  ...POR_EMITIR,
  estado: 'emitida',
  folio: 4521,
  fechaEmision: '2026-10-30',
};

type Manejador = (peticion: Request) => Response | Promise<Response>;

/** Responde lo básico de la pantalla; `rutas` agrega o reemplaza por «MÉTODO /ruta». */
const simularBackend = (rutas: Record<string, Manejador> = {}) => {
  const pedidas: Request[] = [];
  const base: Record<string, Manejador> = {
    'GET /api/gestion/facturas': () => Response.json(LISTADO),
    'GET /api/gestion/facturas/FACTPOREMI01': () => Response.json(POR_EMITIR),
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
  return { pedidas };
};

const error = (
  status: number,
  message: string | string[],
  /** Campos a los que pertenece el error (`errores` del backend, SCRUM-150). */
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

const iniciarSesion = (rol: Rol) =>
  act(() =>
    guardarSesion({
      tokenAcceso: 'token',
      expiraEn: 900,
      usuario: {
        codigoPublico: 'u-1',
        nombre: 'Marcela',
        apellido: 'Díaz',
        rol,
      },
    }),
  );

const hoyEnChile = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santiago' }).format(
    new Date(),
  );

const pdf = (nombre = 'factura-4521.pdf') =>
  new File(['%PDF-1.4'], nombre, { type: 'application/pdf' });

/** Lo que se agregó al multipart, por campo (el FormData de jsdom no llega al Request de Node). */
const espiarMultipart = () => {
  const agregado = vi.spyOn(FormData.prototype, 'append');
  return () =>
    Object.fromEntries(
      agregado.mock.calls.map(([campo, valor]) => [campo, valor]),
    ) as Record<string, unknown>;
};

beforeEach(() => {
  navegacion.segmento = null;
  reiniciarParaPruebas();
  iniciarSesion('vendedor');
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('Facturas por emitir (SCRUM-127)', () => {
  it('E9-H3 FE · CA1 facturas por emitir: lista los pedidos que pidieron factura, por emitir o con folio', async () => {
    simularBackend();
    mostrar(<DisenoFacturas>{null}</DisenoFacturas>);

    const tabla = await screen.findByRole('table', { name: 'Facturas' });
    expect(
      within(tabla)
        .getAllByRole('columnheader')
        .map((celda) => celda.textContent),
    ).toEqual(['Pedido', 'Razón social', 'RUT', 'Total', 'Factura']);
    const [, porEmitir, emitida] = within(tabla).getAllByRole('row');
    expect(
      within(porEmitir!)
        .getAllByRole('cell')
        .map((celda) => celda.textContent),
    ).toEqual([
      'FACTPOREMI01',
      'Peluquería Ejemplo SpA',
      '76.123.456-0',
      expect.stringMatching(/^\$73\.190$/),
      'Por emitir',
    ]);
    expect(within(emitida!).getByText('Folio 1532')).toBeInTheDocument();
    expect(
      within(tabla).getByRole('link', { name: 'FACTPOREMI01' }),
    ).toHaveAttribute('href', '/panel/pedidos/facturas/FACTPOREMI01');
    // Celular: los mismos pedidos como tarjetas
    expect(
      within(screen.getByRole('list', { name: 'Facturas' })).getAllByRole(
        'listitem',
      ),
    ).toHaveLength(2);
  });

  it('E9-H3 FE · CA1 facturas por emitir: la pestaña muestra cuántas quedan por emitir según el backend', async () => {
    simularBackend();
    mostrar(<DisenoFacturas>{null}</DisenoFacturas>);

    const pestanas = screen.getByRole('navigation', {
      name: 'Secciones de pedidos',
    });
    expect(
      await within(pestanas).findByRole('link', {
        name: 'Facturas por emitir · 1',
      }),
    ).toHaveAttribute('aria-current', 'page');
    expect(
      within(pestanas).getByRole('link', { name: 'Todos los pedidos' }),
    ).toHaveAttribute('href', '/panel/pedidos');
  });

  it('E9-H3 FE · CA1 facturas por emitir: sin pedidos con factura, lo dice', async () => {
    simularBackend({
      'GET /api/gestion/facturas': () =>
        Response.json({ ...LISTADO, items: [], porEmitir: 0, total: 0 }),
    });
    mostrar(<DisenoFacturas>{null}</DisenoFacturas>);

    expect(
      await screen.findByText('Aún no hay pedidos con factura.'),
    ).toBeInTheDocument();
  });

  it('E9-H3 FE · CA1 facturas por emitir: el bodeguero no ve la pestaña ni pide las facturas', () => {
    iniciarSesion('bodeguero');
    const { pedidas } = simularBackend();
    mostrar(<PestanasPedidos actual="todos" />);

    expect(
      screen.queryByRole('navigation', { name: 'Secciones de pedidos' }),
    ).not.toBeInTheDocument();
    expect(pedidas).toHaveLength(0);
  });

  it('E9-H3 FE · CA2 registrar: la tarjeta muestra el receptor y los montos del pedido', async () => {
    simularBackend();
    mostrar(<DetalleFacturaPanel codigo="FACTPOREMI01" />);

    const datos = await screen.findByRole('region', {
      name: 'Datos para emitir en el SII',
    });
    expect(within(datos).getByText('Peluquería Ejemplo SpA')).toBeVisible();
    expect(
      within(datos).getByText('RUT 76.123.456-0 · Giro: peluquería'),
    ).toBeInTheDocument();
    expect(
      within(datos).getByText('Av. Muestra 450, Providencia'),
    ).toBeInTheDocument();
    const montos = within(datos)
      .getAllByRole('definition')
      .map((monto) => monto.textContent);
    expect(montos).toEqual([
      expect.stringMatching(/^\$61\.504$/),
      expect.stringMatching(/^\$11\.686$/),
      expect.stringMatching(/^\$73\.190$/),
    ]);
    expect(within(datos).getByText(/IVA/)).toHaveTextContent('IVA (19%)');
  });

  it('E9-H3 FE · CA2 registrar: envía el folio, la fecha y el PDF, y la tarjeta queda con la factura registrada', async () => {
    let registrada = false;
    const { pedidas } = simularBackend({
      'GET /api/gestion/facturas/FACTPOREMI01': () =>
        Response.json(registrada ? EMITIDA : POR_EMITIR),
      'POST /api/pedidos/FACTPOREMI01/factura': () => {
        registrada = true;
        return Response.json(
          {
            codigoPedido: 'FACTPOREMI01',
            tipo: 'factura',
            folio: 4521,
            fechaEmision: '2026-10-30',
            estado: 'emitido',
          },
          { status: 201 },
        );
      },
    });
    const multipart = espiarMultipart();
    const usuario = userEvent.setup();
    mostrar(<DetalleFacturaPanel codigo="FACTPOREMI01" />);

    await usuario.type(await screen.findByLabelText('Folio'), '4521');
    // La fecha de emisión parte en hoy
    expect(
      screen.getByRole('button', { name: /Fecha de emisión/ }),
    ).toHaveTextContent(hoyEnChile().split('-').reverse().join('/'));
    await usuario.upload(screen.getByLabelText(/Archivo de la factura/), pdf());
    expect(screen.getByText('factura-4521.pdf')).toBeInTheDocument();
    await usuario.click(
      screen.getByRole('button', { name: 'Registrar factura' }),
    );

    expect(
      await screen.findByText(
        'Registraste la factura n.º 4521 del pedido FACTPOREMI01.',
      ),
    ).toBeInTheDocument();
    const envio = pedidas.find((peticion) => peticion.method === 'POST');
    expect(new URL(envio!.url).pathname).toBe(
      '/api/pedidos/FACTPOREMI01/factura',
    );
    const campos = multipart();
    expect(campos.folio).toBe('4521');
    expect(campos.fechaEmision).toBe(hoyEnChile());
    expect((campos.archivo as File).name).toBe('factura-4521.pdf');
    // Vuelve como emitida: folio, fecha y la descarga, sin el formulario
    expect(await screen.findByText('Factura registrada')).toBeInTheDocument();
    expect(screen.getByText('30 oct 2026')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Descargar factura' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('form', { name: 'Registrar factura' }),
    ).not.toBeInTheDocument();
  });

  it('E9-H3 FE · CA2 registrar: sin folio ni PDF avisa junto a cada campo y no envía nada', async () => {
    const { pedidas } = simularBackend();
    const usuario = userEvent.setup();
    mostrar(<DetalleFacturaPanel codigo="FACTPOREMI01" />);

    await usuario.click(
      await screen.findByRole('button', { name: 'Registrar factura' }),
    );

    expect(
      await screen.findByText('Escribe el folio de la factura.'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Folio')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(
      screen.getByText('Adjunta el PDF de la factura.'),
    ).toBeInTheDocument();
    expect(pedidas.some((peticion) => peticion.method === 'POST')).toBe(false);
  });

  it('E9-H3 FE · CA3 folio repetido: muestra el error del backend junto al folio, sin perder lo escrito ni el PDF', async () => {
    simularBackend({
      'POST /api/pedidos/FACTPOREMI01/factura': () =>
        error(409, 'Ya existe una factura con el folio 1532.', ['folio']),
    });
    const usuario = userEvent.setup();
    mostrar(<DetalleFacturaPanel codigo="FACTPOREMI01" />);

    const folio = await screen.findByLabelText('Folio');
    await usuario.type(folio, '1532');
    await usuario.upload(screen.getByLabelText(/Archivo de la factura/), pdf());
    await usuario.click(
      screen.getByRole('button', { name: 'Registrar factura' }),
    );

    const mensaje = await screen.findByText(
      'Ya existe una factura con el folio 1532.',
    );
    await waitFor(() => expect(folio).toHaveFocus());
    expect(folio).toHaveAttribute('aria-invalid', 'true');
    expect(folio.getAttribute('aria-describedby')).toBe(mensaje.id);
    expect(folio).toHaveValue('1532');
    expect(screen.getByText('factura-4521.pdf')).toBeInTheDocument();
  });

  it('E9-H3 FE · CA3 folio repetido: un rechazo que no es de un campo va arriba del formulario', async () => {
    simularBackend({
      'POST /api/pedidos/FACTPOREMI01/factura': () =>
        error(409, 'El pedido ya tiene una factura registrada.'),
    });
    const usuario = userEvent.setup();
    mostrar(<DetalleFacturaPanel codigo="FACTPOREMI01" />);

    await usuario.type(await screen.findByLabelText('Folio'), '4521');
    await usuario.upload(screen.getByLabelText(/Archivo de la factura/), pdf());
    await usuario.click(
      screen.getByRole('button', { name: 'Registrar factura' }),
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'El pedido ya tiene una factura registrada.',
    );
  });

  it('E9-H3 FE · ya emitida: muestra el folio y descarga el PDF registrado', async () => {
    const { pedidas } = simularBackend({
      'GET /api/gestion/facturas/FACTPOREMI01': () => Response.json(EMITIDA),
      'GET /api/pedidos/FACTPOREMI01/factura': () =>
        // Cuerpo en texto: el Blob de jsdom no lo lee el Response de Node 22 (SCRUM-161)
        new Response('%PDF-1.4', {
          headers: {
            'content-type': 'application/pdf',
            'content-disposition': 'attachment; filename="factura-4521.pdf"',
          },
        }),
    });
    const crearUrl = vi.fn(() => 'blob:factura');
    vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: crearUrl }));
    const clic = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {});
    const usuario = userEvent.setup();
    mostrar(<DetalleFacturaPanel codigo="FACTPOREMI01" />);

    expect(await screen.findByText('Folio 4521')).toBeInTheDocument();
    await usuario.click(
      screen.getByRole('button', { name: 'Descargar factura' }),
    );

    await waitFor(() => expect(clic).toHaveBeenCalled());
    expect(
      pedidas.some(
        (peticion) =>
          new URL(peticion.url).pathname ===
          '/api/pedidos/FACTPOREMI01/factura',
      ),
    ).toBe(true);
  });

  it('E9-H3 FE · registrar: un pedido que no existe muestra que no se encontró', async () => {
    simularBackend({
      'GET /api/gestion/facturas/NOEXISTE0001': () =>
        error(404, 'El pedido no existe.'),
    });
    mostrar(<DetalleFacturaPanel codigo="NOEXISTE0001" />);

    expect(
      await screen.findByRole('heading', {
        name: 'No encontramos este pedido',
      }),
    ).toBeInTheDocument();
  });
  it('E9-H3 FE · CA1 facturas por emitir: sin permiso de facturación, la ruta no se abre', () => {
    expect(puedeAbrir('bodeguero', '/panel/pedidos/facturas')).toBe(false);
    expect(
      puedeAbrir('bodeguero', '/panel/pedidos/facturas/FACTPOREMI01'),
    ).toBe(false);
    expect(puedeAbrir('bodeguero', '/panel/pedidos')).toBe(true);
    expect(puedeAbrir('vendedor', '/panel/pedidos/facturas')).toBe(true);
  });

  it('E9-H3 FE · CA1 facturas por emitir: si la lista falla, muestra el error sin detalles técnicos y deja reintentar', async () => {
    let intentos = 0;
    simularBackend({
      'GET /api/gestion/facturas': () => {
        intentos++;
        return intentos <= 3
          ? error(500, 'TypeError: detalle interno')
          : Response.json(LISTADO);
      },
    });
    const usuario = userEvent.setup();
    mostrar(<DisenoFacturas>{null}</DisenoFacturas>);

    const boton = await screen.findByRole(
      'button',
      { name: 'Reintentar' },
      { timeout: 8000 },
    );
    expect(screen.queryByText(/TypeError/)).not.toBeInTheDocument();
    await usuario.click(boton);
    expect(
      await screen.findByRole('table', { name: 'Facturas' }),
    ).toBeInTheDocument();
  }, 15000);

  it('E9-H3 FE · CA2 registrar: si el detalle falla, muestra el error y deja reintentar', async () => {
    simularBackend({
      'GET /api/gestion/facturas/FACTPOREMI01': () =>
        error(403, 'No tienes permiso para gestionar la facturación.'),
    });
    mostrar(<DetalleFacturaPanel codigo="FACTPOREMI01" />);

    expect(
      await screen.findByText(
        'No tienes permiso para gestionar la facturación.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeVisible();
    expect(
      screen.queryByRole('form', { name: 'Registrar factura' }),
    ).not.toBeInTheDocument();
  });
});
