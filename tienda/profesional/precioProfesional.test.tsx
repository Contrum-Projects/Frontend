import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { paths } from '@/compartido/api/esquema';
import type {
  FormatoDetalle,
  FormatoDetalleProfesional,
  PackDetalle,
  ProductoDetalle,
  ProductoDetalleProfesional,
  ProductoTiendaProfesional,
} from '@/compartido/api/respuestas';
import {
  guardarSesion,
  olvidarSesion,
  reiniciarParaPruebas,
} from '@/compartido/sesion/almacen';
import type { Rol } from '@/compartido/sesion/roles';
import {
  categoria,
  producto as productoListado,
  renderizar,
} from '@/tienda/catalogo/apiDePrueba';
import { Catalogo } from '@/tienda/catalogo/catalogo';
import { FilaProductos } from '@/tienda/catalogo/filaProductos';
import { FichaPack } from '@/tienda/ficha/fichaPack';
import { FichaProducto } from '@/tienda/ficha/fichaProducto';
import { ProductoExclusivo } from '@/tienda/ficha/fichaSegunRol';

const navegacion = vi.hoisted(() => ({ ruta: '/productos/10' }));

// El cliente del navegador con una URL absoluta y el `fetch` simulado de cada prueba
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

vi.mock('next/server', () => ({ connection: async () => {} }));
vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND');
  },
  usePathname: () => navegacion.ruta,
  useRouter: () => ({ push: vi.fn() }),
}));

afterEach(() => {
  vi.unstubAllGlobals();
  reiniciarParaPruebas();
});

const iniciarComo = (rol: Rol) =>
  act(() =>
    guardarSesion({
      tokenAcceso: 'token',
      expiraEn: 900,
      usuario: { codigoPublico: 'u-1', nombre: 'Ana', apellido: 'Soto', rol },
    }),
  );

const json = (cuerpo: unknown, status = 200) =>
  new Response(JSON.stringify(cuerpo), {
    status,
    headers: { 'content-type': 'application/json' },
  });

const NO_EXISTE = () => json({ statusCode: 404, message: 'No existe.' }, 404);

/**
 * Simula el backend en el borde: cada ruta responde distinto si la petición lleva el token
 * (`profesional`) o no (el servidor, que pide como visitante). Lo que no está responde 404.
 */
/** La petición tal como la arma openapi-fetch (un Request, quizá de otro entorno) o un texto. */
const leerPeticion = (entrada: Request | string | URL) =>
  typeof entrada === 'object' && 'headers' in entrada
    ? {
        ruta: new URL(entrada.url).pathname,
        conToken: entrada.headers.has('authorization'),
      }
    : { ruta: new URL(entrada).pathname, conToken: false };

/**
 * Simula el backend en el borde: cada ruta responde distinto si la petición lleva el token
 * (`profesional`) o no (el servidor, que pide como visitante). Lo que no está responde 404.
 */
const simular = (
  rutas: Record<
    string,
    { visitante?: () => Response; profesional?: () => Response }
  >,
) => {
  const mock = vi.fn(async (entrada: Request | string | URL) => {
    const { ruta, conToken } = leerPeticion(entrada);
    const responder = conToken
      ? rutas[ruta]?.profesional
      : rutas[ruta]?.visitante;
    return responder ? responder() : NO_EXISTE();
  });
  vi.stubGlobal('fetch', mock);
  return mock;
};

/** Rutas pedidas con el token del profesional. */
const conToken = (mock: ReturnType<typeof simular>) =>
  mock.mock.calls
    .map(([entrada]) => leerPeticion(entrada))
    .filter((peticion) => peticion.conToken)
    .map((peticion) => peticion.ruta);

/** El precio grande de la ficha, con su nota («IVA incluido» o «c/u · IVA incluido»). */
const precioFicha = (nota: string) => screen.getByText(nota).parentElement;

const formato = (
  id: number,
  nombre: string,
  precio: number,
): FormatoDetalle => ({
  id,
  nombre,
  contenido: null,
  unidadMedida: null,
  esPredeterminado: id === 1,
  imagenes: [`https://imagenes.test/${id}.jpg`],
  precio,
  disponibilidad: 'disponible',
});

const formatoProfesional = (
  base: FormatoDetalle,
  precioMayorista: number,
  precio: number | null = base.precio,
): FormatoDetalleProfesional => ({ ...base, precio, precioMayorista });

const SHAMPOO: ProductoDetalle = {
  id: 10,
  nombre: 'Shampoo reparador',
  descripcion: 'Limpia con suavidad.',
  marca: { id: 1, nombre: 'Marca A' },
  categoria: { id: 3, nombre: 'Shampoo' },
  formatos: [formato(1, '300 ml', 12990), formato(2, '1 L', 29990)],
};

const SHAMPOO_PROFESIONAL: ProductoDetalleProfesional = {
  ...SHAMPOO,
  exclusivo: false,
  formatos: [
    formatoProfesional(SHAMPOO.formatos[0], 8490),
    formatoProfesional(SHAMPOO.formatos[1], 19490),
  ],
};

const OXIDANTE_EXCLUSIVO: ProductoDetalleProfesional = {
  ...SHAMPOO,
  nombre: 'Oxidante 20 vol',
  exclusivo: true,
  formatos: [formatoProfesional(formato(1, '1 L', 0), 6990, null)],
};

describe('SCRUM-109 · Precio profesional en la ficha', () => {
  it('E2-H4 FE · precio profesional: el peluquero ve el mayorista, «c/u · IVA incluido» y la cantidad desde 3', async () => {
    const api = simular({
      '/api/tienda/productos/10': {
        visitante: () => json(SHAMPOO),
        profesional: () => json(SHAMPOO_PROFESIONAL),
      },
    });
    iniciarComo('profesional');

    renderizar(await FichaProducto({ id: '10' }));

    expect(
      await screen.findByText('Precio profesional · cuenta verificada'),
    ).toBeInTheDocument();
    expect(precioFicha('c/u · IVA incluido')).toHaveTextContent('$8.490');
    expect(screen.queryByText('$12.990')).not.toBeInTheDocument();
    // Los formatos también con el mayorista
    expect(screen.getByRole('radio', { name: '1 L, $19.490' })).toBeVisible();
    // La cantidad empieza en 3 y no baja de ahí
    const cantidad = screen.getByRole('group', {
      name: 'Cantidad de Shampoo reparador 300 ml',
    });
    expect(within(cantidad).getByText('3')).toBeInTheDocument();
    expect(
      within(cantidad).getByRole('button', { name: 'Quitar una unidad' }),
    ).toBeDisabled();
    expect(
      screen.getByText(
        'Para tu precio profesional, el mínimo es 3 unidades de este formato.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Agregar 3 al carrito' }),
    ).toBeInTheDocument();
    // Sin subtotal: el frontend no calcula montos (decisión del 30-10-2026)
    expect(screen.queryByText('Subtotal')).not.toBeInTheDocument();
    expect(screen.queryByText('¿Eres peluquero?')).not.toBeInTheDocument();
    expect(conToken(api)).toEqual(['/api/tienda/productos/10']);
  });

  it('E2-H4 FE · precio profesional: al subir la cantidad, el botón dice cuántas agrega', async () => {
    simular({
      '/api/tienda/productos/10': {
        visitante: () => json(SHAMPOO),
        profesional: () => json(SHAMPOO_PROFESIONAL),
      },
    });
    iniciarComo('profesional');
    renderizar(await FichaProducto({ id: '10' }));

    await userEvent.click(
      await screen.findByRole('button', { name: 'Agregar una unidad' }),
    );

    expect(
      screen.getByRole('button', { name: 'Agregar 4 al carrito' }),
    ).toBeInTheDocument();
  });

  it('E2-H4 FE · exclusivos: el peluquero abre un exclusivo por su enlace (el servidor, como visitante, recibe 404)', async () => {
    simular({
      '/api/tienda/productos/10': {
        profesional: () => json(OXIDANTE_EXCLUSIVO),
      },
    });
    await expect(FichaProducto({ id: '10' })).rejects.toThrow('NEXT_NOT_FOUND');
    iniciarComo('profesional');

    renderizar(<ProductoExclusivo noEncontrado={<p>No encontramos</p>} />);

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Oxidante 20 vol' }),
    ).toBeInTheDocument();
    expect(precioFicha('c/u · IVA incluido')).toHaveTextContent('$6.990');
    expect(screen.queryByText('No encontramos')).not.toBeInTheDocument();
  });

  it('E2-H4 FE · exclusivos: quien no es profesional ve «No encontramos» y no se pide nada con token', async () => {
    const api = simular({
      '/api/tienda/productos/10': {
        profesional: () => json(OXIDANTE_EXCLUSIVO),
      },
    });
    iniciarComo('cliente');

    renderizar(<ProductoExclusivo noEncontrado={<p>No encontramos</p>} />);

    expect(screen.getByText('No encontramos')).toBeInTheDocument();
    expect(conToken(api)).toEqual([]);
  });

  it('E2-H4 FE · precio profesional: si falla la lectura, muestra el mensaje y «Reintentar»', async () => {
    let fallar = true;
    simular({
      '/api/tienda/productos/10': {
        visitante: () => json(SHAMPOO),
        profesional: () =>
          fallar
            ? json({ statusCode: 500, message: 'Error interno' }, 500)
            : json(SHAMPOO_PROFESIONAL),
      },
    });
    iniciarComo('profesional');
    renderizar(await FichaProducto({ id: '10' }));

    const reintentar = await screen.findByRole('button', {
      name: 'Reintentar',
    });
    expect(screen.queryByText('Error interno')).not.toBeInTheDocument();

    fallar = false;
    await userEvent.click(reintentar);

    expect(
      await screen.findByText('Precio profesional · cuenta verificada'),
    ).toBeInTheDocument();
    expect(precioFicha('c/u · IVA incluido')).toHaveTextContent('$8.490');
  });

  it('E2-H4 FE · pack: el peluquero ve el mayorista del pack', async () => {
    const pack: PackDetalle = {
      id: 7,
      nombre: 'Pack reparación',
      descripcion: '',
      precio: 24990,
      imagen: 'https://imagenes.test/pack.jpg',
      imagenes: [],
      vigenteHasta: null,
      componentes: [],
      disponibilidad: 'disponible',
    };
    simular({
      '/api/tienda/packs/7': {
        visitante: () => json(pack),
        profesional: () =>
          json({ ...pack, precioMayorista: 17990, exclusivo: false }),
      },
    });
    iniciarComo('profesional');

    renderizar(await FichaPack({ id: '7' }));

    expect(await screen.findByText('$17.990')).toBeInTheDocument();
    expect(
      screen.getByText('Precio profesional · cuenta verificada'),
    ).toBeInTheDocument();
    expect(screen.queryByText('$24.990')).not.toBeInTheDocument();
  });
});

const listadoProfesional = (items: ProductoTiendaProfesional[]) =>
  json({ items, total: items.length, pagina: 1, limite: 12 });

const profesional = (
  id: number,
  nombre: string,
  precioMayorista: number,
  exclusivo = false,
): ProductoTiendaProfesional => ({
  ...productoListado(id, nombre),
  precio: exclusivo ? null : 12990,
  precioMayorista,
  exclusivo,
});

describe('SCRUM-109 · Exclusivos y mayorista en los listados', () => {
  const RUTAS_CATALOGO = {
    '/api/tienda/categorias': {
      visitante: () => json([categoria(1, 'Shampoo')]),
    },
    '/api/tienda/marcas': { visitante: () => json([]) },
  };

  it('E2-H4 FE · exclusivos: aparecen en la búsqueda del peluquero con su precio y la marca «Exclusivo profesional»', async () => {
    simular({
      ...RUTAS_CATALOGO,
      '/api/tienda/productos': {
        visitante: () =>
          json({
            items: [productoListado(10, 'Shampoo reparador')],
            total: 1,
            pagina: 1,
            limite: 12,
          }),
        profesional: () =>
          listadoProfesional([
            profesional(10, 'Shampoo reparador', 8490),
            profesional(11, 'Shampoo técnico', 7990, true),
          ]),
      },
    });
    iniciarComo('profesional');

    renderizar(
      await Catalogo({
        parametros: {
          buscar: 'shampoo',
          categoriaIds: [],
          marcaIds: [],
          paginas: 1,
        },
      }),
    );

    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(2));
    expect(screen.getByText('2 productos')).toBeInTheDocument();
    const [general, exclusivo] = screen.getAllByRole('article');
    expect(within(general).getByText('$8.490')).toBeInTheDocument();
    expect(within(general).getByText('Precio profesional')).toBeInTheDocument();
    expect(within(general).getByText('Mín. 3 unidades')).toBeInTheDocument();
    expect(
      within(general).queryByText('Exclusivo profesional'),
    ).not.toBeInTheDocument();
    expect(within(exclusivo).getByText('Shampoo técnico')).toBeInTheDocument();
    expect(
      within(exclusivo).getByText('Exclusivo profesional'),
    ).toBeInTheDocument();
  });

  it('E2-H4 FE · exclusivos: una búsqueda que solo encuentra exclusivos los muestra al peluquero', async () => {
    simular({
      ...RUTAS_CATALOGO,
      '/api/tienda/productos': {
        visitante: () => json({ items: [], total: 0, pagina: 1, limite: 12 }),
        profesional: () =>
          listadoProfesional([profesional(11, 'Oxidante 20 vol', 6990, true)]),
      },
    });
    iniciarComo('profesional');

    renderizar(
      await Catalogo({
        parametros: {
          buscar: 'oxidante',
          categoriaIds: [],
          marcaIds: [],
          paginas: 1,
        },
      }),
    );

    expect(await screen.findByText('Oxidante 20 vol')).toBeInTheDocument();
    expect(screen.getByText('1 producto')).toBeInTheDocument();
  });

  it('E2-H4 FE · exclusivos: la fila del inicio del peluquero trae los exclusivos', async () => {
    simular({
      '/api/tienda/productos': {
        visitante: () => json({ items: [], total: 0, pagina: 1, limite: 5 }),
        profesional: () =>
          listadoProfesional([profesional(11, 'Oxidante 20 vol', 6990, true)]),
      },
    });
    iniciarComo('profesional');

    renderizar(
      await FilaProductos({
        titulo: 'Novedades',
        orden: 'novedades',
        celular: 'grilla',
      }),
    );

    const fila = await screen.findByRole('region', { name: 'Novedades' });
    expect(
      await within(fila).findByText('Oxidante 20 vol'),
    ).toBeInTheDocument();
    expect(within(fila).getByText('Exclusivo profesional')).toBeInTheDocument();
  });
});

describe('SCRUM-109 · Visitante o cliente', () => {
  it('E2-H4 FE · visitante: ve solo el minorista y el acceso para verificarse como peluquero', async () => {
    const api = simular({
      '/api/tienda/productos/10': { visitante: () => json(SHAMPOO) },
    });
    act(() => olvidarSesion());

    renderizar(await FichaProducto({ id: '10' }));

    expect(precioFicha('IVA incluido')).toHaveTextContent('$12.990');
    expect(
      screen.queryByText('Precio profesional · cuenta verificada'),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Agregar al carrito' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: '¿Eres peluquero?' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Verifica tu cuenta y compra este producto a precio profesional, desde 3 unidades.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Verificar' })).toHaveAttribute(
      'href',
      '/cuenta/verificacion',
    );
    expect(conToken(api)).toEqual([]);
  });

  it('E2-H4 FE · cliente: ve el minorista y el aviso, sin pedir el precio profesional', async () => {
    const api = simular({
      '/api/tienda/productos/10': { visitante: () => json(SHAMPOO) },
      '/api/tienda/productos': {
        visitante: () =>
          json({
            items: [productoListado(10, 'Shampoo reparador')],
            total: 1,
            pagina: 1,
            limite: 5,
          }),
      },
    });
    iniciarComo('cliente');

    renderizar(await FichaProducto({ id: '10' }));
    renderizar(
      await FilaProductos({
        titulo: 'Novedades',
        orden: 'novedades',
        celular: 'grilla',
      }),
    );

    expect(precioFicha('IVA incluido')).toHaveTextContent('$12.990');
    expect(screen.getByRole('article')).toHaveTextContent('$12.990');
    expect(screen.queryByText('Precio profesional')).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: '¿Eres peluquero?' }),
    ).toBeInTheDocument();
    expect(conToken(api)).toEqual([]);
  });

  it('E2-H4 FE · mientras no se sabe quién mira, se ve la ficha del servidor con el aviso (no salta al llegar la sesión)', async () => {
    simular({
      '/api/tienda/productos/10': { visitante: () => json(SHAMPOO) },
    });

    renderizar(await FichaProducto({ id: '10' }));

    expect(precioFicha('IVA incluido')).toHaveTextContent('$12.990');
    expect(
      screen.getByRole('heading', { name: '¿Eres peluquero?' }),
    ).toBeInTheDocument();
  });
});
