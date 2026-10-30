import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type {
  FormatoDetalle,
  PackDetalle,
  ProductoDetalle,
} from '@/compartido/api/respuestas';
import { FichaPack } from './fichaPack';
import { FichaProducto } from './fichaProducto';

vi.mock('next/server', () => ({ connection: async () => {} }));
vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND');
  },
}));

afterEach(() => {
  vi.unstubAllGlobals();
});

const formato = (
  id: number,
  nombre: string,
  extra: Partial<FormatoDetalle> = {},
): FormatoDetalle => ({
  id,
  nombre,
  contenido: null,
  unidadMedida: null,
  esPredeterminado: false,
  imagenes: [`https://imagenes.test/${id}-a.jpg`],
  precio: 12990,
  disponibilidad: 'disponible',
  ...extra,
});

const producto = (formatos: FormatoDetalle[]): ProductoDetalle => ({
  id: 10,
  nombre: 'Shampoo reparador',
  descripcion: 'Limpia con suavidad el cabello dañado.',
  marca: { id: 1, nombre: 'Marca A' },
  categoria: { id: 3, nombre: 'Shampoo' },
  formatos,
});

const json = (cuerpo: unknown, status = 200) =>
  new Response(JSON.stringify(cuerpo), {
    status,
    headers: { 'content-type': 'application/json' },
  });

/** Simula el backend en el borde: responde la ruta pedida o 404. */
const simular = (rutas: Record<string, Response>) => {
  const mock = vi.fn(async (entrada: Request | string | URL) => {
    const url = new URL(entrada instanceof Request ? entrada.url : entrada);
    return (
      rutas[url.pathname]?.clone() ??
      json({ statusCode: 404, message: 'No existe.' }, 404)
    );
  });
  vi.stubGlobal('fetch', mock);
  return mock;
};

/** La foto grande visible (las demás del carrusel quedan ocultas a lectores). */
const fotoVisible = () =>
  decodeURIComponent(
    screen
      .getAllByRole('img')
      .find((img) => img.getAttribute('alt'))
      ?.getAttribute('src') ?? '',
  );

describe('SCRUM-108 · Ficha de producto', () => {
  it('E2-H3 FE · formatos y galería: al elegir un formato cambian la galería, el precio con «IVA incluido» y la disponibilidad', async () => {
    simular({
      '/api/tienda/productos/10': json(
        producto([
          formato(1, '300 ml', {
            esPredeterminado: true,
            precio: 12990,
            imagenes: ['https://imagenes.test/300.jpg'],
          }),
          formato(2, '1 L', {
            precio: 29990,
            imagenes: [
              'https://imagenes.test/1l-a.jpg',
              'https://imagenes.test/1l-b.jpg',
            ],
          }),
        ]),
      ),
    });
    const persona = userEvent.setup();
    render(await FichaProducto({ id: '10' }));

    expect(
      screen.getByRole('heading', { level: 1, name: 'Shampoo reparador' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Marca A')).toBeInTheDocument();
    expect(screen.getByText('IVA incluido')).toBeInTheDocument();
    // Empieza en el predeterminado
    expect(
      screen.getByRole('radio', { name: '300 ml, $12.990' }),
    ).toBeChecked();
    expect(
      screen.getByText('$12.990', {
        selector: 'span.texto-precio-ficha-celular',
      }),
    ).toBeInTheDocument();
    expect(fotoVisible()).toContain('https://imagenes.test/300.jpg');
    expect(
      screen.getByText('Disponible para despacho y retiro'),
    ).toBeInTheDocument();

    await persona.click(screen.getByRole('radio', { name: '1 L, $29.990' }));

    expect(screen.getByRole('radio', { name: '1 L, $29.990' })).toBeChecked();
    expect(
      screen.getByText('$29.990', {
        selector: 'span.texto-precio-ficha-celular',
      }),
    ).toBeInTheDocument();
    expect(fotoVisible()).toContain('https://imagenes.test/1l-a.jpg');
    expect(
      screen.getByRole('button', { name: 'Ver foto 2 de 2' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Agregar al carrito/ }),
    ).toBeEnabled();
  });

  it('E2-H3 FE · formato agotado: se marca «Agotado», el botón queda deshabilitado y avisa que otro formato sí está', async () => {
    simular({
      '/api/tienda/productos/10': json(
        producto([
          formato(1, '300 ml', { esPredeterminado: true }),
          formato(2, '1 L', { precio: 29990, disponibilidad: 'agotado' }),
        ]),
      ),
    });
    const persona = userEvent.setup();
    render(await FichaProducto({ id: '10' }));

    const agotado = screen.getByRole('radio', { name: '1 L, agotado' });
    expect(within(agotado).getByText('Agotado')).toBeInTheDocument();

    await persona.click(agotado);

    expect(screen.getByRole('status')).toHaveTextContent(
      'Agotado en este formato. El de 300 ml sí está disponible.',
    );
    expect(screen.getByRole('button', { name: 'Agotado' })).toBeDisabled();
    expect(
      screen.queryByRole('button', { name: /Agregar al carrito/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('group', { name: /Cantidad/ }),
    ).not.toBeInTheDocument();
  });

  it('E2-H3 FE · formato agotado: si ningún otro formato está disponible, no promete otro', async () => {
    simular({
      '/api/tienda/productos/10': json(
        producto([
          formato(1, '300 ml', { disponibilidad: 'agotado' }),
          formato(2, '1 L', { disponibilidad: 'agotado' }),
        ]),
      ),
    });
    render(await FichaProducto({ id: '10' }));

    expect(screen.getByRole('status')).toHaveTextContent(
      /^Agotado en este formato\.$/,
    );
    expect(screen.getByRole('button', { name: 'Agotado' })).toBeDisabled();
  });

  it('E2-H3 FE · formato agotado: con varios formatos disponibles los nombra todos', async () => {
    simular({
      '/api/tienda/productos/10': json(
        producto([
          formato(1, '300 ml', { disponibilidad: 'agotado' }),
          formato(2, '500 ml'),
          formato(3, '1 L'),
        ]),
      ),
    });
    render(await FichaProducto({ id: '10' }));

    expect(screen.getByRole('status')).toHaveTextContent(
      'Agotado en este formato. Los de 500 ml y 1 L sí están disponibles.',
    );
  });

  it('E2-H3 FE · un producto que la tienda no muestra responde 404, y un id que no es número no llama al backend', async () => {
    const api = simular({});

    await expect(FichaProducto({ id: '99' })).rejects.toThrow('NEXT_NOT_FOUND');
    await expect(FichaProducto({ id: 'abc' })).rejects.toThrow(
      'NEXT_NOT_FOUND',
    );
    expect(api).toHaveBeenCalledTimes(1);
  });
});

const pack = (extra: Partial<PackDetalle> = {}): PackDetalle => ({
  id: 7,
  nombre: 'Pack reparación',
  descripcion: 'Shampoo y acondicionador juntos.',
  precio: 22990,
  imagen: 'https://imagenes.test/pack.jpg',
  imagenes: ['https://imagenes.test/pack.jpg'],
  vigenteHasta: null,
  componentes: [
    { producto: 'Shampoo reparador', formato: '300 ml', cantidad: 1 },
    { producto: 'Acondicionador hidratante', formato: '300 ml', cantidad: 2 },
  ],
  disponibilidad: 'disponible',
  ...extra,
});

describe('SCRUM-108 · Ficha de pack', () => {
  it('E2-H3 FE · pack: muestra los formatos que incluye con cantidades, el precio con IVA y la disponibilidad', async () => {
    simular({
      '/api/tienda/packs/7': json(pack({ vigenteHasta: '2026-11-30' })),
    });
    render(await FichaPack({ id: '7' }));

    expect(
      screen.getByRole('heading', { level: 1, name: 'Pack reparación' }),
    ).toBeInTheDocument();
    const incluye = screen.getByRole('list', { name: 'Incluye' });
    expect(
      within(incluye)
        .getAllByRole('listitem')
        .map((li) => li.textContent),
    ).toEqual([
      '1 × Shampoo reparador · 300 ml',
      '2 × Acondicionador hidratante · 300 ml',
    ]);
    expect(screen.getByText('$22.990')).toBeInTheDocument();
    expect(screen.getByText('Hasta el 30 de noviembre')).toBeInTheDocument();
    expect(screen.getByText('IVA incluido')).toBeInTheDocument();
    expect(
      screen.getByText('Disponible para despacho y retiro'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Agregar al carrito/ }),
    ).toBeEnabled();
  });

  it('E2-H3 FE · pack: agotado cuando su componente más escaso no alcanza (lo decide el backend)', async () => {
    simular({
      '/api/tienda/packs/7': json(pack({ disponibilidad: 'agotado' })),
    });
    render(await FichaPack({ id: '7' }));

    expect(screen.getByRole('status')).toHaveTextContent('Agotado');
    expect(screen.getByRole('button', { name: 'Agotado' })).toBeDisabled();
  });

  it('E2-H3 FE · un pack fuera de vigencia o que no existe responde 404', async () => {
    simular({});
    await expect(FichaPack({ id: '7' })).rejects.toThrow('NEXT_NOT_FOUND');
  });
});
