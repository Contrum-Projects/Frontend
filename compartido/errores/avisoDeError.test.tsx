import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AvisoDeError } from './avisoDeError';
import { reportarError } from './reportarError';

vi.mock('next/navigation', () => ({ usePathname: () => '/panel/pedidos' }));
vi.mock('./reportarError', () => ({ reportarError: vi.fn() }));

const reportar = vi.mocked(reportarError);

describe('AvisoDeError', () => {
  beforeEach(() => {
    reportar.mockReset();
  });

  it('SCRUM-168 FE · un error de la pantalla se registra con la pantalla donde ocurrió y muestra el código', async () => {
    reportar.mockResolvedValue('3f1c2b9e-8a7d-4e0b-9a51-2c4d6e8f0a1b');
    const error = new TypeError('x is undefined');

    render(<AvisoDeError error={error} retry={() => {}} />);

    expect(
      screen.getByRole('heading', { name: 'Algo salió mal' }),
    ).toBeInTheDocument();
    expect(await screen.findByText('3F1C2B9E')).toBeInTheDocument();
    expect(reportar).toHaveBeenCalledWith({
      componente: 'pantalla /panel/pedidos',
      error,
      ruta: '/panel/pedidos',
    });
  });

  it('SCRUM-168 FE · un error del servidor no se reporta dos veces: muestra su digest', () => {
    const error = Object.assign(new Error('Server Components error'), {
      digest: '2834719042',
    });

    render(<AvisoDeError error={error} retry={() => {}} />);

    // Siempre en forma corta: en registro_error se busca por el comienzo del código
    expect(screen.getByText('28347190')).toBeInTheDocument();
    expect(reportar).not.toHaveBeenCalled();
  });

  it('SCRUM-168 FE · nunca muestra el detalle técnico', async () => {
    reportar.mockResolvedValue(undefined);

    render(
      <AvisoDeError error={new Error('detalle interno')} retry={() => {}} />,
    );

    await vi.waitFor(() => expect(reportar).toHaveBeenCalled());
    expect(screen.queryByText(/detalle interno/)).not.toBeInTheDocument();
  });
});
