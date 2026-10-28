import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { paths } from '@/compartido/api/esquema';
import type { CategoriaTienda, MarcaPanel } from '@/compartido/api/respuestas';
import { crearClienteDeConsultas } from '@/compartido/proveedores';
import {
  guardarSesion,
  reiniciarParaPruebas,
} from '@/compartido/sesion/almacen';
import { Toaster } from '@/compartido/ui/sonner';
import { PantallaMarcasYCategorias } from './pantallaMarcasYCategorias';

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

const MARCAS: MarcaPanel[] = [
  { id: 1, nombre: 'Kérastase', activa: true },
  { id: 2, nombre: 'Wella', activa: true },
];

const categoria = (
  id: number,
  nombre: string,
  padreId: number | null,
  subcategorias: CategoriaTienda[] = [],
): CategoriaTienda => ({
  id,
  nombre,
  descripcion: null,
  padreId,
  subcategorias,
});

const ARBOL: CategoriaTienda[] = [
  categoria(1, 'Coloración', null, [categoria(3, 'Tintes', 1)]),
  categoria(2, 'Shampoo', null, [categoria(4, 'Reparación', 2)]),
];

type Manejador = (peticion: Request) => Response | Promise<Response>;

/**
 * Backend simulado: las listas se leen de `estado` en cada GET, así lo que una acción guarda
 * se ve al volver a pedirlas. `rutas` responde las demás peticiones por «MÉTODO /ruta».
 */
const simularBackend = (rutas: Record<string, Manejador> = {}) => {
  const estado = { marcas: MARCAS, arbol: ARBOL };
  /** Cuerpos de los POST y PATCH, en orden. */
  const enviados: unknown[] = [];
  const fetch = vi.fn(async (peticion: Request) => {
    const clave = `${peticion.method} ${new URL(peticion.url).pathname}`;
    if (peticion.method !== 'GET') enviados.push(await peticion.clone().json());
    if (clave === 'GET /api/catalogo/marcas')
      return Response.json(estado.marcas);
    if (clave === 'GET /api/catalogo/categorias')
      return Response.json(estado.arbol);
    const manejador = rutas[clave];
    if (!manejador) throw new Error(`Petición no simulada: ${clave}`);
    return manejador(peticion);
  });
  vi.stubGlobal('fetch', fetch);
  return { estado, fetch, enviados };
};

const error = (status: number, message: string) =>
  Response.json({ statusCode: status, message }, { status });

const mostrarPantalla = () =>
  render(
    <QueryClientProvider client={crearClienteDeConsultas()}>
      <PantallaMarcasYCategorias />
      <Toaster />
    </QueryClientProvider>,
  );

/** Cada tarjeta es una región con su título; la lista es la primera dentro de ella. */
const listaDe = (titulo: string) =>
  within(screen.getByRole('region', { name: titulo })).getAllByRole('list')[0];
const listaMarcas = () => listaDe('Marcas');
const arbol = () => listaDe('Categorías');
/** El `li` de una categoría, con sus subcategorías dentro. */
const nodoDe = (nombre: string) =>
  within(arbol()).getByText(nombre).closest('li') as HTMLElement;

beforeEach(() => {
  reiniciarParaPruebas();
  act(() =>
    guardarSesion({
      tokenAcceso: 'token',
      expiraEn: 900,
      usuario: {
        codigoPublico: 'admin-1',
        nombre: 'Violeta',
        apellido: 'Ramírez',
        rol: 'administrador',
      },
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Marcas y categorías (SCRUM-103)', () => {
  it('muestra las marcas y el árbol de categorías del backend', async () => {
    simularBackend();
    mostrarPantalla();

    expect(
      screen.getByRole('heading', { level: 1, name: 'Marcas y categorías' }),
    ).toBeInTheDocument();
    expect(
      await within(screen.getByRole('region', { name: 'Marcas' })).findByText(
        'Kérastase',
      ),
    ).toBeVisible();
    expect(within(listaMarcas()).getByText('Wella')).toBeVisible();
    expect(
      within(nodoDe('Coloración')).getByText('Tintes'),
    ).toBeInTheDocument();
  });

  it('pliega y despliega las subcategorías de una categoría', async () => {
    const usuario = userEvent.setup();
    simularBackend();
    mostrarPantalla();

    const plegar = await screen.findByRole('button', {
      name: 'Ocultar subcategorías de Shampoo',
    });
    expect(plegar).toHaveAttribute('aria-expanded', 'true');
    await usuario.click(plegar);

    expect(within(arbol()).getByText('Reparación')).not.toBeVisible();
    await usuario.click(
      screen.getByRole('button', { name: 'Mostrar subcategorías de Shampoo' }),
    );
    expect(within(arbol()).getByText('Reparación')).toBeVisible();
  });

  it('muestra los vacíos sin prometer nada', async () => {
    const { estado } = simularBackend();
    estado.marcas = [];
    estado.arbol = [];
    mostrarPantalla();

    expect(await screen.findByText('Aún no hay marcas.')).toBeVisible();
    expect(screen.getByText('Aún no hay categorías.')).toBeVisible();
  });

  it('un 5xx al cargar no muestra detalles técnicos', async () => {
    simularBackend();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => error(500, 'PrismaClientKnownRequestError')),
    );
    mostrarPantalla();

    // Los 5xx se reintentan dos veces antes de mostrar el error
    await waitFor(
      () =>
        expect(
          screen.getAllByText(
            'No pudimos completar la acción. Intenta de nuevo en unos minutos.',
          ),
        ).toHaveLength(2),
      { timeout: 6000 },
    );
    expect(screen.queryByText(/Prisma/)).not.toBeInTheDocument();
  }, 10_000);

  it('E3-H4 FE · marcas: crea una marca y la lista la muestra', async () => {
    const usuario = userEvent.setup();
    const { estado, enviados } = simularBackend({
      'POST /api/catalogo/marcas': async (peticion) => {
        const { nombre } = (await peticion.json()) as { nombre: string };
        const marca = { id: 3, nombre, activa: true };
        estado.marcas = [...estado.marcas, marca];
        return Response.json(marca, { status: 201 });
      },
    });
    mostrarPantalla();

    await usuario.click(
      await screen.findByRole('button', { name: 'Nueva marca' }),
    );
    const formulario = screen.getByRole('form', { name: 'Nueva marca' });
    await usuario.type(
      within(formulario).getByLabelText('Nombre'),
      '  Schwarzkopf ',
    );
    await usuario.click(
      within(formulario).getByRole('button', { name: 'Crear marca' }),
    );

    expect(
      await screen.findByText('Creamos la marca Schwarzkopf.'),
    ).toBeVisible();
    expect(within(listaMarcas()).getByText('Schwarzkopf')).toBeVisible();
    expect(
      screen.queryByRole('form', { name: 'Nueva marca' }),
    ).not.toBeInTheDocument();
    expect(enviados).toEqual([{ nombre: 'Schwarzkopf' }]);
  });

  it('E3-H4 FE · marcas: no envía una marca sin nombre', async () => {
    const usuario = userEvent.setup();
    const { fetch } = simularBackend();
    mostrarPantalla();

    await usuario.click(
      await screen.findByRole('button', { name: 'Nueva marca' }),
    );
    await usuario.click(screen.getByRole('button', { name: 'Crear marca' }));

    expect(
      await screen.findByText('Escribe el nombre de la marca.'),
    ).toBeVisible();
    expect(
      fetch.mock.calls.some(([peticion]) => peticion.method === 'POST'),
    ).toBe(false);
  });

  it('E3-H4 FE · errores: una marca repetida muestra el motivo junto al nombre, sin perder lo escrito', async () => {
    const usuario = userEvent.setup();
    simularBackend({
      'POST /api/catalogo/marcas': () =>
        error(409, 'Ya existe una marca con ese nombre.'),
    });
    mostrarPantalla();

    await usuario.click(
      await screen.findByRole('button', { name: 'Nueva marca' }),
    );
    const campo = screen.getByLabelText('Nombre');
    await usuario.type(campo, 'kerastase');
    await usuario.click(screen.getByRole('button', { name: 'Crear marca' }));

    const mensaje = await screen.findByText(
      'Ya existe una marca con ese nombre.',
    );
    expect(campo).toHaveAttribute('aria-invalid', 'true');
    expect(campo).toHaveAccessibleDescription(mensaje.textContent ?? '');
    expect(campo).toHaveValue('kerastase');
  });

  it('E3-H4 FE · árbol de categorías: crea una subcategoría y el árbol la muestra bajo su categoría', async () => {
    const usuario = userEvent.setup();
    const { estado, enviados } = simularBackend({
      'POST /api/catalogo/categorias': async (peticion) => {
        const cuerpo = (await peticion.json()) as {
          nombre: string;
          padreId: number;
        };
        const nueva = categoria(5, cuerpo.nombre, cuerpo.padreId);
        estado.arbol = estado.arbol.map((raiz) =>
          raiz.id === cuerpo.padreId
            ? { ...raiz, subcategorias: [...raiz.subcategorias, nueva] }
            : raiz,
        );
        return Response.json(nueva, { status: 201 });
      },
    });
    mostrarPantalla();

    await usuario.click(
      await screen.findByRole('button', { name: 'Nueva categoría' }),
    );
    const formulario = screen.getByRole('form', { name: 'Nueva categoría' });
    await usuario.type(
      within(formulario).getByLabelText('Nombre'),
      'Hidratación',
    );
    await usuario.click(within(formulario).getByLabelText('Categoría padre'));
    await usuario.click(screen.getByRole('option', { name: 'Shampoo' }));
    await usuario.click(
      within(formulario).getByRole('button', { name: 'Crear categoría' }),
    );

    expect(
      await screen.findByText('Creamos la categoría Hidratación.'),
    ).toBeVisible();
    await waitFor(() =>
      expect(within(nodoDe('Shampoo')).getByText('Hidratación')).toBeVisible(),
    );
    expect(enviados).toEqual([
      {
        nombre: 'Hidratación',
        padreId: 2,
      },
    ]);
  });

  it('E3-H4 FE · árbol de categorías: edita una categoría con sus datos y la deja como principal', async () => {
    const usuario = userEvent.setup();
    const { enviados } = simularBackend({
      'PATCH /api/catalogo/categorias/4': async (peticion) =>
        Response.json({ id: 4, ...((await peticion.json()) as object) }),
    });
    mostrarPantalla();

    await usuario.click(
      await screen.findByRole('button', { name: 'Editar Reparación' }),
    );
    const formulario = screen.getByRole('form', { name: 'Editar categoría' });
    expect(within(formulario).getByLabelText('Nombre')).toHaveValue(
      'Reparación',
    );
    // La categoría no se ofrece como su propio padre
    await usuario.click(within(formulario).getByLabelText('Categoría padre'));
    expect(
      screen.queryByRole('option', { name: 'Shampoo › Reparación' }),
    ).not.toBeInTheDocument();
    await usuario.click(
      screen.getByRole('option', { name: 'Ninguna (categoría principal)' }),
    );
    await usuario.click(
      within(formulario).getByRole('button', { name: 'Guardar cambios' }),
    );

    expect(
      await screen.findByText('Guardamos los cambios de Reparación.'),
    ).toBeVisible();
    expect(enviados).toEqual([
      {
        nombre: 'Reparación',
        descripcion: null,
        padreId: null,
      },
    ]);
  });

  it('E3-H4 FE · errores: un ciclo de categorías muestra el motivo junto a la categoría padre', async () => {
    const usuario = userEvent.setup();
    const motivo =
      'No se puede mover una categoría dentro de sí misma ni de una de sus subcategorías: formaría un ciclo.';
    simularBackend({
      'PATCH /api/catalogo/categorias/1': () => error(409, motivo),
    });
    mostrarPantalla();

    await usuario.click(
      await screen.findByRole('button', { name: 'Editar Coloración' }),
    );
    const formulario = screen.getByRole('form', { name: 'Editar categoría' });
    const padre = within(formulario).getByLabelText('Categoría padre');
    await usuario.click(padre);
    await usuario.click(
      screen.getByRole('option', { name: 'Coloración › Tintes' }),
    );
    await usuario.click(
      within(formulario).getByRole('button', { name: 'Guardar cambios' }),
    );

    const mensaje = await within(formulario).findByText(motivo);
    expect(padre).toHaveAttribute('aria-invalid', 'true');
    expect(padre).toHaveAccessibleDescription(mensaje.textContent ?? '');
    expect(padre).toHaveTextContent('Coloración › Tintes');
  });

  it('E3-H4 FE · errores: un error sin campo se muestra arriba del formulario', async () => {
    const usuario = userEvent.setup();
    simularBackend({
      'PATCH /api/catalogo/categorias/2': () =>
        error(404, 'La categoría no existe.'),
    });
    mostrarPantalla();

    await usuario.click(
      await screen.findByRole('button', { name: 'Editar Shampoo' }),
    );
    await usuario.click(
      screen.getByRole('button', { name: 'Guardar cambios' }),
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'La categoría no existe.',
    );
  });
});
