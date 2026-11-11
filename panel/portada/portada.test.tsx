import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { paths } from '@/compartido/api/esquema';
import { crearClienteDeConsultas } from '@/compartido/proveedores';
import {
  guardarSesion,
  reiniciarParaPruebas,
} from '@/compartido/sesion/almacen';
import { puedeAbrir } from '@/panel/diseno/secciones';
import type { SlidePanel } from './consultasPortada';
import { PantallaPortada } from './pantallaPortada';

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

const slide = (id: number, cambios: Partial<SlidePanel> = {}): SlidePanel => ({
  id,
  orden: id,
  imagenEscritorio: `/portada/e-${id}.jpg`,
  imagenCelular: null,
  disponible: true,
  destino: { tipo: 'pack', destino: String(10 + id), nombre: `Pack ${id}` },
  ...cambios,
});

type Manejador = (peticion: Request) => Response | Promise<Response>;

const simularBackend = (rutas: Record<string, Manejador> = {}) => {
  const pedidas: { clave: string; peticion: Request }[] = [];
  const base: Record<string, Manejador> = {
    'GET /api/portada/slides': () => Response.json([slide(1)]),
    'GET /api/portada/destinos': (peticion) =>
      Response.json(
        new URL(peticion.url).searchParams.get('tipo') === 'pagina'
          ? [{ destino: 'packs', nombre: 'Packs' }]
          : [{ destino: '12', nombre: 'Pack reparación' }],
      ),
    ...rutas,
  };
  vi.stubGlobal(
    'fetch',
    vi.fn(async (peticion: Request) => {
      const clave = `${peticion.method} ${new URL(peticion.url).pathname}`;
      pedidas.push({ clave, peticion: peticion.clone() });
      const manejador = base[clave];
      if (!manejador) throw new Error(`Petición no simulada: ${clave}`);
      return manejador(peticion);
    }),
  );
  return (clave: string) =>
    pedidas.filter((p) => p.clave === clave).map((p) => p.peticion);
};

const mostrar = () =>
  render(
    <QueryClientProvider client={crearClienteDeConsultas()}>
      <PantallaPortada />
    </QueryClientProvider>,
  );

const jpeg = (nombre = 'portada.jpg') =>
  new File(['imagen'], nombre, { type: 'image/jpeg' });

beforeEach(() => {
  reiniciarParaPruebas();
  URL.createObjectURL = vi.fn(() => 'blob:vista');
  URL.revokeObjectURL = vi.fn();
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

describe('Portada del panel (SCRUM-157)', () => {
  it('SCRUM-157 FE · criterio 7: solo quien gestiona campañas abre la portada', () => {
    expect(puedeAbrir('administrador', '/panel/portada')).toBe(true);
    expect(puedeAbrir('vendedor', '/panel/portada')).toBe(false);
    expect(puedeAbrir('bodeguero', '/panel/portada')).toBe(false);
  });

  it('SCRUM-157 FE · criterio 5: marca los slides cuyo destino ya no está a la venta', async () => {
    simularBackend({
      'GET /api/portada/slides': () =>
        Response.json([
          slide(1),
          slide(2, {
            disponible: false,
            destino: { tipo: 'producto', destino: '9', nombre: 'Shampoo' },
          }),
        ]),
    });
    mostrar();

    const lista = await screen.findByRole('list', {
      name: 'Imágenes de la portada',
    });
    const [primero, segundo] = within(lista).getAllByRole('listitem');
    expect(primero).toHaveTextContent('Pack 1');
    expect(primero).not.toHaveTextContent('Destino no disponible');
    expect(segundo).toHaveTextContent('Shampoo');
    expect(segundo).toHaveTextContent(
      'Destino no disponible: no se muestra en la tienda',
    );
  });

  it('SCRUM-157 FE · criterio 6: sin imágenes explica que el inicio muestra el pack', async () => {
    simularBackend({ 'GET /api/portada/slides': () => Response.json([]) });
    mostrar();

    expect(
      await screen.findByText(/el inicio muestra el pack vigente/),
    ).toBeInTheDocument();
  });

  it('SCRUM-157 FE · criterio 4: con 8 imágenes no deja agregar otra', async () => {
    simularBackend({
      'GET /api/portada/slides': () =>
        Response.json(Array.from({ length: 8 }, (_, i) => slide(i + 1))),
    });
    mostrar();

    await screen.findByText('Pack 8');
    expect(screen.getByRole('button', { name: /Agregar/ })).toBeDisabled();
    expect(screen.getByText(/el máximo/)).toBeInTheDocument();
  });

  it('SCRUM-157 FE · criterio 1 y 2: agrega una imagen con su destino elegido de la lista; la de celular es opcional', async () => {
    const usuario = userEvent.setup();
    const pedidas = simularBackend({
      'POST /api/portada/slides': () =>
        Response.json([slide(1), slide(2)], { status: 201 }),
    });
    const agregado = vi.spyOn(FormData.prototype, 'append');
    mostrar();
    await screen.findByText('Pack 1');

    await usuario.click(screen.getByRole('button', { name: /Agregar/ }));
    const dialogo = await screen.findByRole('dialog', {
      name: 'Agregar imagen a la portada',
    });

    // Sin imagen ni destino, avisa junto a cada campo
    await usuario.click(
      within(dialogo).getByRole('button', { name: 'Agregar' }),
    );
    expect(
      within(dialogo).getByText('Sube la imagen para escritorio.'),
    ).toBeInTheDocument();
    expect(
      within(dialogo).getByText('Elige a dónde lleva la imagen.'),
    ).toBeInTheDocument();
    expect(pedidas('POST /api/portada/slides')).toHaveLength(0);

    await usuario.upload(
      within(dialogo).getByLabelText('Imagen para escritorio'),
      jpeg(),
    );
    await usuario.click(
      await within(dialogo).findByRole('radio', { name: 'Pack reparación' }),
    );
    await usuario.click(
      within(dialogo).getByRole('button', { name: 'Agregar' }),
    );

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(pedidas('POST /api/portada/slides')).toHaveLength(1);
    expect(agregado).toHaveBeenCalledWith('tipoDestino', 'pack');
    expect(agregado).toHaveBeenCalledWith('destino', '12');
    expect(agregado).toHaveBeenCalledWith('escritorio', expect.any(File));
    expect(agregado).not.toHaveBeenCalledWith('celular', expect.anything());
    expect(await screen.findByText('Pack 2')).toBeInTheDocument();
  });

  it('SCRUM-157 FE · criterio 4: un archivo que no es imagen se rechaza antes de enviar', async () => {
    const usuario = userEvent.setup({ applyAccept: false });
    simularBackend();
    mostrar();
    await screen.findByText('Pack 1');

    await usuario.click(screen.getByRole('button', { name: /Agregar/ }));
    const dialogo = await screen.findByRole('dialog');
    await usuario.upload(
      within(dialogo).getByLabelText('Imagen para escritorio'),
      new File(['texto'], 'notas.pdf', { type: 'application/pdf' }),
    );

    expect(
      within(dialogo).getByText('La imagen debe ser JPEG, PNG o WebP.'),
    ).toBeInTheDocument();
  });

  it('SCRUM-157 FE · criterio 2: el error de destino del backend se muestra junto al campo', async () => {
    const usuario = userEvent.setup();
    simularBackend({
      'POST /api/portada/slides': () =>
        Response.json(
          {
            statusCode: 400,
            message:
              'El destino elegido no existe o no está a la venta en la tienda.',
            error: 'Bad Request',
            errores: [
              {
                campo: 'destino',
                mensaje:
                  'El destino elegido no existe o no está a la venta en la tienda.',
              },
            ],
          },
          { status: 400 },
        ),
    });
    mostrar();
    await screen.findByText('Pack 1');

    await usuario.click(screen.getByRole('button', { name: /Agregar/ }));
    const dialogo = await screen.findByRole('dialog');
    await usuario.upload(
      within(dialogo).getByLabelText('Imagen para escritorio'),
      jpeg(),
    );
    await usuario.click(
      await within(dialogo).findByRole('radio', { name: 'Pack reparación' }),
    );
    await usuario.click(
      within(dialogo).getByRole('button', { name: 'Agregar' }),
    );

    const grupo = within(dialogo).getByRole('group', {
      name: '¿A dónde lleva la imagen?',
    });
    expect(
      await within(grupo).findByText(
        'El destino elegido no existe o no está a la venta en la tienda.',
      ),
    ).toBeInTheDocument();
  });

  it('SCRUM-157 FE · criterio 3: cambia el destino a una página de la tienda', async () => {
    const usuario = userEvent.setup();
    const pedidas = simularBackend({
      'PATCH /api/portada/slides/1': () =>
        Response.json([
          slide(1, {
            destino: { tipo: 'pagina', destino: 'packs', nombre: 'Packs' },
          }),
        ]),
    });
    mostrar();
    await screen.findByText('Pack 1');

    await usuario.click(
      screen.getByRole('button', { name: 'Acciones de la imagen 1' }),
    );
    await usuario.click(
      screen.getByRole('menuitem', { name: 'Cambiar destino' }),
    );
    const dialogo = await screen.findByRole('dialog', {
      name: 'Cambiar destino',
    });
    await usuario.selectOptions(
      within(dialogo).getByLabelText('Tipo de destino'),
      'pagina',
    );
    await usuario.click(
      await within(dialogo).findByRole('radio', { name: 'Packs' }),
    );
    await usuario.click(
      within(dialogo).getByRole('button', { name: 'Guardar' }),
    );

    await waitFor(() =>
      expect(pedidas('PATCH /api/portada/slides/1')).toHaveLength(1),
    );
    expect(await pedidas('PATCH /api/portada/slides/1')[0].json()).toEqual({
      tipoDestino: 'pagina',
      destino: 'packs',
    });
  });

  it('SCRUM-157 FE · criterio 3: elimina una imagen después de confirmar', async () => {
    const usuario = userEvent.setup();
    const pedidas = simularBackend({
      'GET /api/portada/slides': () => Response.json([slide(1), slide(2)]),
      'DELETE /api/portada/slides/2': () => Response.json([slide(1)]),
    });
    mostrar();
    await screen.findByText('Pack 2');

    await usuario.click(
      screen.getByRole('button', { name: 'Acciones de la imagen 2' }),
    );
    await usuario.click(screen.getByRole('menuitem', { name: 'Eliminar' }));
    const confirmar = await screen.findByRole('alertdialog');
    await usuario.click(
      within(confirmar).getByRole('button', { name: 'Eliminar' }),
    );

    await waitFor(() =>
      expect(screen.queryByText('Pack 2')).not.toBeInTheDocument(),
    );
    expect(pedidas('DELETE /api/portada/slides/2')).toHaveLength(1);
  });

  it('SCRUM-157 FE · criterio 3: reemplaza la imagen de celular desde el menú', async () => {
    const usuario = userEvent.setup();
    const pedidas = simularBackend({
      'PUT /api/portada/slides/1/imagenes/celular': () =>
        Response.json([slide(1, { imagenCelular: '/portada/c-1.jpg' })]),
    });
    const agregado = vi.spyOn(FormData.prototype, 'append');
    mostrar();
    await screen.findByText('Pack 1');

    const archivo = jpeg('celular.jpg');
    await usuario.upload(
      screen.getByLabelText('Nueva imagen de celular de la imagen 1'),
      archivo,
    );

    expect(
      await screen.findByText('Con imagen para celular'),
    ).toBeInTheDocument();
    expect(pedidas('PUT /api/portada/slides/1/imagenes/celular')).toHaveLength(
      1,
    );
    expect(agregado).toHaveBeenCalledWith('imagen', archivo);
  });
});
