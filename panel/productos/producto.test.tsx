import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { paths } from '@/compartido/api/esquema';
import {
  error,
  iniciarSesion,
  mostrar,
  producto,
  simularBackend,
} from './apiDePrueba';
import {
  PantallaEditarProducto,
  PantallaProductoNuevo,
} from './pantallaProducto';

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

const navegacion = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: navegacion.replace }),
}));

const elegir = async (campo: string, opcion: string) => {
  await userEvent.click(
    screen.getByRole('combobox', { name: new RegExp(`^${campo}`) }),
  );
  await userEvent.click(await screen.findByRole('option', { name: opcion }));
};

/** En jsdom se dibujan los botones del encabezado y los del pie: se usa el primero. */
const guardar = () =>
  userEvent.click(
    screen.getAllByRole('button', { name: 'Guardar producto' })[0],
  );

beforeEach(() => {
  iniciarSesion();
  navegacion.replace.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Producto nuevo (SCRUM-100)', () => {
  it('E3-H1 FE · crear: sin datos marca los campos faltantes y no envía nada', async () => {
    const { pedidas } = simularBackend({});
    mostrar(<PantallaProductoNuevo />);

    await guardar();

    expect(
      await screen.findByText('El nombre del producto es obligatorio.'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/^Nombre/)).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(
      screen.getByText('La marca del producto es obligatoria.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('La categoría del producto es obligatoria.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('La descripción del producto es obligatoria.'),
    ).toBeInTheDocument();
    expect(pedidas.some((pedida) => pedida.startsWith('POST'))).toBe(false);
  });

  it('E3-H1 FE · crear: guarda, confirma y abre el producto creado', async () => {
    const { enviados } = simularBackend({
      'POST /api/catalogo/productos': () =>
        Response.json(producto({ id: 12, canalVenta: 'profesional' }), {
          status: 201,
        }),
    });
    mostrar(<PantallaProductoNuevo />);

    await userEvent.type(screen.getByLabelText(/^Nombre/), 'Shampoo reparador');
    await elegir('Marca', 'Kérastase');
    await elegir('Categoría', 'Shampoo › Reparación');
    await userEvent.click(
      screen.getByRole('switch', { name: 'Exclusivo para profesionales' }),
    );
    await userEvent.type(
      screen.getByLabelText(/^Descripción del producto/),
      'Repara el cabello dañado.',
    );
    await guardar();

    expect(
      await screen.findByText('Creamos el producto Shampoo reparador.'),
    ).toBeInTheDocument();
    expect(enviados).toEqual([
      {
        nombre: 'Shampoo reparador',
        descripcion: 'Repara el cabello dañado.',
        marcaId: 1,
        categoriaId: 4,
        canalVenta: 'profesional',
      },
    ]);
    expect(navegacion.replace).toHaveBeenCalledWith('/panel/productos/12');
  });
});

describe('Editar producto (SCRUM-100)', () => {
  it('E3-H1 FE · editar: muestra los datos guardados y confirma los cambios', async () => {
    const { enviados } = simularBackend({
      'GET /api/catalogo/productos/7': () =>
        Response.json(producto({ origenDescripcion: 'ia' })),
      'PATCH /api/catalogo/productos/7': () =>
        Response.json(producto({ nombre: 'Shampoo reparador intenso' })),
    });
    mostrar(<PantallaEditarProducto id="7" />);

    const nombre = await screen.findByLabelText(/^Nombre/);
    expect(nombre).toHaveValue('Shampoo reparador');
    expect(screen.getByRole('combobox', { name: /^Marca/ })).toHaveTextContent(
      'Kérastase',
    );
    expect(
      await screen.findByRole('combobox', { name: /^Categoría/ }),
    ).toHaveTextContent('Shampoo › Reparación');
    // Origen de la descripción
    expect(
      within(screen.getByRole('region', { name: 'Descripción' })).getByText(
        'IA',
      ),
    ).toBeInTheDocument();

    await userEvent.type(nombre, ' intenso');
    await guardar();

    expect(
      await screen.findByText(
        'Guardamos los cambios de Shampoo reparador intenso.',
      ),
    ).toBeInTheDocument();
    expect(enviados).toEqual([
      {
        nombre: 'Shampoo reparador intenso',
        descripcion: 'Repara el cabello dañado.',
        marcaId: 1,
        categoriaId: 4,
        canalVenta: 'general',
      },
    ]);
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Shampoo reparador intenso',
      }),
    ).toBeInTheDocument();
  });

  it('E3-H1 FE · editar: el rechazo del backend aparece junto a su campo sin perder lo escrito', async () => {
    simularBackend({
      'GET /api/catalogo/productos/7': () => Response.json(producto()),
      'PATCH /api/catalogo/productos/7': () =>
        error(400, 'La marca está desactivada.'),
    });
    mostrar(<PantallaEditarProducto id="7" />);

    const nombre = await screen.findByLabelText(/^Nombre/);
    await userEvent.clear(nombre);
    await userEvent.type(nombre, 'Nombre nuevo');
    await guardar();

    expect(
      await screen.findByText('La marca está desactivada.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /^Marca/ })).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(nombre).toHaveValue('Nombre nuevo');
  });

  it('E3-H1 FE · editar: si el servidor falla, avisa sin detalles y conserva lo escrito', async () => {
    simularBackend({
      'GET /api/catalogo/productos/7': () => Response.json(producto()),
      'PATCH /api/catalogo/productos/7': () => error(500, 'Error interno'),
    });
    mostrar(<PantallaEditarProducto id="7" />);

    const nombre = await screen.findByLabelText(/^Nombre/);
    await userEvent.type(nombre, ' intenso');
    await guardar();

    expect(
      await screen.findByText(
        'No pudimos completar la acción. Intenta de nuevo en unos minutos.',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText('Error interno')).not.toBeInTheDocument();
    expect(nombre).toHaveValue('Shampoo reparador intenso');
  });

  it('E3-H1 FE · desactivar: si el backend lo rechaza, lo avisa en la confirmación', async () => {
    simularBackend({
      'GET /api/catalogo/productos/7': () => Response.json(producto()),
      'PATCH /api/catalogo/productos/7/desactivar': () =>
        error(403, 'No tienes permiso para gestionar el catálogo.'),
    });
    mostrar(<PantallaEditarProducto id="7" />);

    await userEvent.click(
      await screen.findByRole('button', { name: 'Desactivar producto' }),
    );
    const confirmacion = screen.getByRole('alertdialog');
    await userEvent.click(
      within(confirmacion).getByRole('button', { name: 'Desactivar' }),
    );

    expect(await within(confirmacion).findByRole('alert')).toHaveTextContent(
      'No tienes permiso para gestionar el catálogo.',
    );
    expect(screen.getByText('Activo')).toBeInTheDocument();
  });

  it('E3-H1 FE · desactivar: pide confirmación y lo muestra como inactivo', async () => {
    const { pedidas } = simularBackend({
      'GET /api/catalogo/productos/7': () => Response.json(producto()),
      'PATCH /api/catalogo/productos/7/desactivar': () =>
        Response.json(producto({ activo: false })),
    });
    mostrar(<PantallaEditarProducto id="7" />);

    await userEvent.click(
      await screen.findByRole('button', { name: 'Desactivar producto' }),
    );
    const confirmacion = screen.getByRole('alertdialog', {
      name: '¿Desactivar Shampoo reparador?',
    });
    // Nada cambia hasta confirmar
    expect(pedidas.some((pedida) => pedida.includes('/desactivar'))).toBe(
      false,
    );
    await userEvent.click(
      within(confirmacion).getByRole('button', { name: 'Desactivar' }),
    );

    expect(
      await screen.findByText('Desactivamos Shampoo reparador.'),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument(),
    );
    expect(screen.getByText('Inactivo')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Este producto está inactivo: no se muestra en la tienda.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Desactivar producto' }),
    ).not.toBeInTheDocument();
  });

  it('E3-H1 FE · editar: un producto que no existe lo avisa', async () => {
    simularBackend({
      'GET /api/catalogo/productos/99': () =>
        error(404, 'El producto no existe.'),
    });
    mostrar(<PantallaEditarProducto id="99" />);

    expect(
      await screen.findByRole('heading', { name: 'Producto no encontrado' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver productos' })).toHaveAttribute(
      'href',
      '/panel/productos',
    );
  });
});
