import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { paths } from '@/compartido/api/esquema';
import type { DatosFacturacionCuenta } from '@/compartido/api/respuestas';
import { reiniciarParaPruebas } from '@/compartido/sesion/almacen';
import {
  mostrarPantallaCuenta,
  responder,
  RUTAS_UBICACIONES,
  simularBackend,
} from './cuentaDePrueba';
import { PantallaFacturacion } from './pantallaFacturacion';

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
  usePathname: () => '/cuenta/facturacion',
}));

const RM = { codigoCut: '13', nombre: 'Metropolitana de Santiago' };

const registro = (
  id: number,
  razonSocial: string,
  rut: string,
  extra: Partial<DatosFacturacionCuenta> = {},
): DatosFacturacionCuenta => ({
  id,
  rut,
  razonSocial,
  giro: 'Servicios de peluquería',
  direccion: `Av. Ejemplo ${100 + id}`,
  correoFacturacion: null,
  comuna: { codigoCut: '13123', nombre: 'Providencia', region: RM },
  ...extra,
});

const AROMOS = registro(1, 'Peluquería Los Aromos SpA', '76086429-3');
const ROJAS = registro(2, 'Servicios Rojas EIRL', '11111111-1', {
  giro: 'Servicios de belleza',
  correoFacturacion: 'facturas@rojas.cl',
  comuna: {
    codigoCut: '05109',
    nombre: 'Viña del Mar',
    region: { codigoCut: '05', nombre: 'Valparaíso' },
  },
});

/** Backend con una lista que cambia con cada escritura, como el real. */
const conFacturacion = (
  inicial: DatosFacturacionCuenta[],
  escrituras: Record<string, (cuerpo: unknown) => Response> = {},
) => {
  let lista = inicial;
  const registro = simularBackend({
    ...RUTAS_UBICACIONES,
    'GET /api/cuentas/yo/facturacion': () => responder(lista),
    ...escrituras,
  });
  return {
    registro,
    cambiarLista: (nueva: DatosFacturacionCuenta[]) => {
      lista = nueva;
    },
  };
};

const lista = () =>
  screen.findByRole('region', { name: 'Tus datos de facturación' });
const formulario = (nombre: RegExp = /datos de facturación/) =>
  screen.getByRole('form', { name: nombre });

const elegir = async (
  usuario: ReturnType<typeof userEvent.setup>,
  contenedor: HTMLElement,
  campo: RegExp,
  opcion: string,
) => {
  const selector = within(contenedor).getByRole('combobox', { name: campo });
  await waitFor(() => expect(selector).toBeEnabled());
  await usuario.click(selector);
  await usuario.click(await screen.findByRole('option', { name: opcion }));
};

/** Completa el formulario de datos nuevos con datos válidos. */
const completar = async (
  usuario: ReturnType<typeof userEvent.setup>,
  form: HTMLElement,
) => {
  // Pegar en vez de escribir letra por letra: la prueba queda dentro del tiempo
  const escribir = async (campo: RegExp, texto: string) => {
    await usuario.click(within(form).getByLabelText(campo));
    await usuario.paste(texto);
  };
  await escribir(/^RUT/, '11.111.111-1');
  await escribir(/Razón social/, 'Servicios Rojas EIRL');
  await escribir(/Giro/, 'Servicios de belleza');
  await escribir(/Dirección/, 'Av. Ejemplo 102');
  await elegir(usuario, form, /Región/, 'Valparaíso');
  await elegir(usuario, form, /Comuna/, 'Viña del Mar');
};

beforeEach(() => reiniciarParaPruebas());

afterEach(() => {
  reiniciarParaPruebas();
  vi.unstubAllGlobals();
});

// Cada alta recorre dos Select de Radix y vuelve a pedir la lista: con la suite completa en
// paralelo, 5 s no alcanzan
describe('SCRUM-126 · Datos de facturación', { timeout: 15_000 }, () => {
  it('E9-H2 FE · lista y alta: guarda RUT, razón social, giro y dirección con comuna, y aparecen en la lista', async () => {
    const backend = conFacturacion([AROMOS], {
      'POST /api/cuentas/yo/facturacion': () => {
        backend.cambiarLista([AROMOS, ROJAS]);
        return responder(ROJAS, 201);
      },
    });
    mostrarPantallaCuenta(<PantallaFacturacion />);
    await within(await lista()).findByText('Peluquería Los Aromos SpA');
    const usuario = userEvent.setup();

    const form = formulario(/Agregar datos de facturación/);
    await completar(usuario, form);
    await usuario.click(within(form).getByLabelText(/Correo para la factura/));
    await usuario.paste('facturas@rojas.cl');
    await usuario.click(within(form).getByRole('button', { name: 'Guardar' }));

    const tarjeta = await within(await lista()).findByRole('article', {
      name: 'Servicios Rojas EIRL',
    });
    expect(backend.registro).toEqual([
      {
        peticion: 'POST /api/cuentas/yo/facturacion',
        cuerpo: {
          rut: '11111111-1',
          razonSocial: 'Servicios Rojas EIRL',
          giro: 'Servicios de belleza',
          direccion: 'Av. Ejemplo 102',
          comuna: '05109',
          correoFacturacion: 'facturas@rojas.cl',
        },
      },
    ]);
    expect(tarjeta).toHaveTextContent('RUT 11.111.111-1');
    expect(tarjeta).toHaveTextContent('Giro: Servicios de belleza');
    expect(tarjeta).toHaveTextContent(
      'Av. Ejemplo 102, Viña del Mar, Valparaíso',
    );
    // El formulario queda vacío para agregar otros
    expect(within(formulario(/Agregar/)).getByLabelText(/^RUT/)).toHaveValue(
      '',
    );
  });

  it('E9-H2 FE · lista y alta: sin correo de facturación, no lo envía', async () => {
    const backend = conFacturacion([], {
      'POST /api/cuentas/yo/facturacion': () => responder(ROJAS, 201),
    });
    mostrarPantallaCuenta(<PantallaFacturacion />);
    const usuario = userEvent.setup();

    const form = formulario(/Agregar/);
    await completar(usuario, form);
    await usuario.click(within(form).getByRole('button', { name: 'Guardar' }));

    await waitFor(() => expect(backend.registro).toHaveLength(1));
    expect(backend.registro[0]!.cuerpo).not.toHaveProperty('correoFacturacion');
  });

  it('E9-H2 FE · lista y alta: sin registros, lo dice', async () => {
    conFacturacion([]);
    mostrarPantallaCuenta(<PantallaFacturacion />);

    expect(
      await within(await lista()).findByText(
        'Aún no tienes datos de facturación.',
      ),
    ).toBeInTheDocument();
  });

  it('E9-H2 FE · varios registros: muestra todos, en el orden del backend, cada uno con sus datos', async () => {
    conFacturacion([AROMOS, ROJAS]);
    mostrarPantallaCuenta(<PantallaFacturacion />);

    const tarjetas = await within(await lista()).findAllByRole('article');
    expect(
      tarjetas.map((t) => within(t).getByRole('heading').textContent),
    ).toEqual(['Peluquería Los Aromos SpA', 'Servicios Rojas EIRL']);
    expect(tarjetas[0]).toHaveTextContent('RUT 76.086.429-3');
    expect(tarjetas[0]).toHaveTextContent(
      'Av. Ejemplo 101, Providencia, Metropolitana de Santiago',
    );
    expect(tarjetas[1]).toHaveTextContent('facturas@rojas.cl');
    for (const tarjeta of tarjetas) {
      expect(
        within(tarjeta).getByRole('button', { name: 'Editar' }),
      ).toBeInTheDocument();
      expect(
        within(tarjeta).getByRole('button', { name: 'Eliminar' }),
      ).toBeInTheDocument();
    }
  });

  it('E9-H2 FE · varios registros: edita uno en la misma tarjeta y borra su correo', async () => {
    const editado = { ...ROJAS, giro: 'Peluquería', correoFacturacion: null };
    const backend = conFacturacion([AROMOS, ROJAS], {
      'PATCH /api/cuentas/yo/facturacion/2': () => {
        backend.cambiarLista([AROMOS, editado]);
        return responder(editado);
      },
    });
    mostrarPantallaCuenta(<PantallaFacturacion />);
    const tarjeta = await within(await lista()).findByRole('article', {
      name: 'Servicios Rojas EIRL',
    });
    const usuario = userEvent.setup();

    await usuario.click(
      within(tarjeta).getByRole('button', { name: 'Editar' }),
    );
    const form = formulario(/Editar datos de facturación/);
    expect(within(form).getByLabelText(/^RUT/)).toHaveFocus();
    expect(within(form).getByLabelText(/^RUT/)).toHaveValue('11.111.111-1');
    await usuario.clear(within(form).getByLabelText(/Giro/));
    await usuario.type(within(form).getByLabelText(/Giro/), 'Peluquería');
    await usuario.clear(within(form).getByLabelText(/Correo para la factura/));
    await usuario.click(within(form).getByRole('button', { name: 'Guardar' }));

    expect(
      await screen.findByRole('form', { name: /Agregar datos de facturación/ }),
    ).toBeInTheDocument();
    expect(backend.registro).toEqual([
      {
        peticion: 'PATCH /api/cuentas/yo/facturacion/2',
        cuerpo: {
          rut: '11111111-1',
          razonSocial: 'Servicios Rojas EIRL',
          giro: 'Peluquería',
          direccion: 'Av. Ejemplo 102',
          comuna: '05109',
          correoFacturacion: null,
        },
      },
    ]);
    expect(
      await within(await lista()).findByText('Giro: Peluquería'),
    ).toBeInTheDocument();
  });

  it('E9-H2 FE · varios registros: elimina uno después de confirmar', async () => {
    const backend = conFacturacion([AROMOS, ROJAS], {
      'DELETE /api/cuentas/yo/facturacion/1': () => {
        backend.cambiarLista([ROJAS]);
        return responder(undefined, 204);
      },
    });
    mostrarPantallaCuenta(<PantallaFacturacion />);
    const tarjeta = await within(await lista()).findByRole('article', {
      name: 'Peluquería Los Aromos SpA',
    });
    const usuario = userEvent.setup();

    await usuario.click(
      within(tarjeta).getByRole('button', { name: 'Eliminar' }),
    );
    const confirmacion = screen.getByRole('alertdialog');
    expect(confirmacion).toHaveTextContent('Peluquería Los Aromos SpA');
    await usuario.click(
      within(confirmacion).getByRole('button', { name: 'Eliminar' }),
    );

    await waitFor(() =>
      expect(
        screen.queryByRole('article', { name: 'Peluquería Los Aromos SpA' }),
      ).not.toBeInTheDocument(),
    );
    expect(backend.registro.map((r) => r.peticion)).toEqual([
      'DELETE /api/cuentas/yo/facturacion/1',
    ]);
  });

  it('E9-H2 FE · datos incompletos: señala cada campo obligatorio que falta y no envía', async () => {
    const backend = conFacturacion([]);
    mostrarPantallaCuenta(<PantallaFacturacion />);
    const usuario = userEvent.setup();

    const form = formulario(/Agregar/);
    await usuario.type(
      within(form).getByLabelText(/Razón social/),
      'Servicios Rojas EIRL',
    );
    await usuario.click(within(form).getByRole('button', { name: 'Guardar' }));

    expect(within(form).getByLabelText(/^RUT/)).toHaveAccessibleDescription(
      'Escribe el RUT.',
    );
    expect(within(form).getByLabelText(/Giro/)).toHaveAccessibleDescription(
      'Escribe el giro.',
    );
    expect(
      within(form).getByLabelText(/Dirección/),
    ).toHaveAccessibleDescription('Escribe la dirección.');
    expect(
      within(form).getByRole('combobox', { name: /Región/ }),
    ).toHaveAccessibleDescription('Elige una región.');
    expect(
      within(form).getByRole('combobox', { name: /Comuna/ }),
    ).toHaveAccessibleDescription('Elige una comuna.');
    expect(within(form).getByLabelText(/Razón social/)).not.toHaveAttribute(
      'aria-invalid',
    );
    expect(backend.registro).toEqual([]);
  });

  it('E9-H2 FE · datos incompletos: el error del backend queda junto a su campo sin perder lo escrito', async () => {
    conFacturacion([], {
      'POST /api/cuentas/yo/facturacion': () =>
        responder(
          {
            statusCode: 400,
            message: ['El RUT no es válido.'],
            errores: [{ campo: 'rut', mensaje: 'El RUT no es válido.' }],
          },
          400,
        ),
    });
    mostrarPantallaCuenta(<PantallaFacturacion />);
    const usuario = userEvent.setup();

    const form = formulario(/Agregar/);
    await completar(usuario, form);
    await usuario.click(within(form).getByRole('button', { name: 'Guardar' }));

    await waitFor(() =>
      expect(within(form).getByLabelText(/^RUT/)).toHaveAccessibleDescription(
        'El RUT no es válido.',
      ),
    );
    expect(within(form).getByLabelText(/Razón social/)).toHaveValue(
      'Servicios Rojas EIRL',
    );
  });

  it('E9-H2 FE · error del servidor: no muestra detalles técnicos', async () => {
    conFacturacion([], {
      'POST /api/cuentas/yo/facturacion': () =>
        responder(
          { statusCode: 500, message: 'PrismaClientKnownRequestError' },
          500,
        ),
    });
    mostrarPantallaCuenta(<PantallaFacturacion />);
    const usuario = userEvent.setup();

    const form = formulario(/Agregar/);
    await completar(usuario, form);
    await usuario.click(within(form).getByRole('button', { name: 'Guardar' }));

    expect(
      await within(form).findByText(/No pudimos completar la acción/),
    ).toBeInTheDocument();
    expect(form).not.toHaveTextContent('Prisma');
  });

  it('E9-H2 FE · celular: «Agregar datos de facturación» abre el formulario y «Cancelar» vuelve al botón', async () => {
    conFacturacion([AROMOS]);
    mostrarPantallaCuenta(<PantallaFacturacion />);
    await within(await lista()).findByText('Peluquería Los Aromos SpA');
    const usuario = userEvent.setup();

    await usuario.click(
      screen.getByRole('button', { name: 'Agregar datos de facturación' }),
    );
    const form = formulario(/Agregar/);
    expect(within(form).getByLabelText(/^RUT/)).toHaveFocus();
    expect(
      screen.queryByRole('button', { name: 'Agregar datos de facturación' }),
    ).not.toBeInTheDocument();

    await usuario.click(within(form).getByRole('button', { name: 'Cancelar' }));
    expect(
      screen.getByRole('button', { name: 'Agregar datos de facturación' }),
    ).toHaveFocus();
  });

  it('E9-H2 FE · lista y alta: «Agregar datos» no borra lo que ya está escrito', async () => {
    conFacturacion([AROMOS]);
    mostrarPantallaCuenta(<PantallaFacturacion />);
    const usuario = userEvent.setup();

    const razon = within(formulario(/Agregar/)).getByLabelText(/Razón social/);
    await usuario.click(razon);
    await usuario.paste('Servicios Rojas EIRL');
    await usuario.click(
      within(await lista()).getByRole('button', { name: 'Agregar datos' }),
    );

    const form = formulario(/Agregar/);
    expect(within(form).getByLabelText(/^RUT/)).toHaveFocus();
    expect(within(form).getByLabelText(/Razón social/)).toHaveValue(
      'Servicios Rojas EIRL',
    );
  });

  it('E9-H2 FE · varios registros: «Cancelar» una edición vuelve a datos nuevos sin enviar nada', async () => {
    const backend = conFacturacion([AROMOS, ROJAS]);
    mostrarPantallaCuenta(<PantallaFacturacion />);
    const tarjeta = await within(await lista()).findByRole('article', {
      name: 'Servicios Rojas EIRL',
    });
    const usuario = userEvent.setup();

    await usuario.click(
      within(tarjeta).getByRole('button', { name: 'Editar' }),
    );
    await usuario.click(
      within(formulario(/Editar/)).getByRole('button', { name: 'Cancelar' }),
    );

    expect(within(formulario(/Agregar/)).getByLabelText(/^RUT/)).toHaveValue(
      '',
    );
    expect(
      screen.getByRole('heading', { name: 'Tus datos de facturación' }),
    ).toHaveFocus();
    expect(backend.registro).toEqual([]);
  });

  it('E9-H2 FE · varios registros: eliminar el que se está editando vuelve a datos nuevos', async () => {
    const backend = conFacturacion([AROMOS, ROJAS], {
      'DELETE /api/cuentas/yo/facturacion/2': () => {
        backend.cambiarLista([AROMOS]);
        return responder(undefined, 204);
      },
    });
    mostrarPantallaCuenta(<PantallaFacturacion />);
    const tarjeta = await within(await lista()).findByRole('article', {
      name: 'Servicios Rojas EIRL',
    });
    const usuario = userEvent.setup();

    await usuario.click(
      within(tarjeta).getByRole('button', { name: 'Editar' }),
    );
    await usuario.click(
      within(tarjeta).getByRole('button', { name: 'Eliminar' }),
    );
    await usuario.click(
      within(screen.getByRole('alertdialog')).getByRole('button', {
        name: 'Eliminar',
      }),
    );

    expect(
      await screen.findByRole('form', { name: /Agregar datos de facturación/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('form', { name: /Editar/ }),
    ).not.toBeInTheDocument();
  });

  it('E9-H2 FE · lista y alta: si la lista no carga, lo dice sin detalles técnicos', async () => {
    simularBackend({
      ...RUTAS_UBICACIONES,
      'GET /api/cuentas/yo/facturacion': () =>
        responder({ statusCode: 500, message: 'Error interno' }, 500),
    });
    mostrarPantallaCuenta(<PantallaFacturacion />);

    expect(
      await within(await lista()).findByText(/No pudimos completar la acción/),
    ).toBeInTheDocument();
  });
});
