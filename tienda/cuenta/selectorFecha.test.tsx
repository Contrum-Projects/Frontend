import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { SelectorFecha } from './selectorFecha';

const Prueba = ({
  inicial = '',
  alCambiar,
  horaInicial,
}: {
  inicial?: string;
  alCambiar: (valor: string) => void;
  horaInicial?: string;
}) => {
  const [valor, setValor] = useState(inicial);
  return (
    <SelectorFecha
      valor={valor}
      alCambiar={(nuevo) => {
        setValor(nuevo);
        alCambiar(nuevo);
      }}
      desde={new Date(2026, 0)}
      hasta={new Date(2027, 11, 31)}
      mesInicial={new Date(2026, 10)}
      conHora
      horaInicial={horaInicial}
      control={{ id: 'vigencia' }}
    />
  );
};

describe('SelectorFecha con hora', () => {
  it('muestra la fecha y la hora guardadas', () => {
    render(<Prueba inicial="2026-11-12T18:30" alCambiar={vi.fn()} />);
    expect(screen.getByRole('button')).toHaveTextContent('12/11/2026 18:30');
  });

  it('al elegir un día usa la hora inicial y luego deja cambiarla', async () => {
    const usuario = userEvent.setup();
    const alCambiar = vi.fn();
    render(<Prueba alCambiar={alCambiar} horaInicial="23:59" />);

    await usuario.click(screen.getByRole('button', { name: /dd\/mm\/aaaa/ }));
    expect(screen.getByRole('combobox', { name: 'Hora' })).toBeDisabled();

    await usuario.click(
      screen.getByRole('button', { name: /20 de noviembre/i }),
    );
    expect(alCambiar).toHaveBeenLastCalledWith('2026-11-20T23:59');

    await usuario.click(screen.getByRole('combobox', { name: 'Hora' }));
    await usuario.click(screen.getByRole('option', { name: '09' }));
    expect(alCambiar).toHaveBeenLastCalledWith('2026-11-20T09:59');

    await usuario.click(screen.getByRole('combobox', { name: 'Minutos' }));
    await usuario.click(screen.getByRole('option', { name: '15' }));
    expect(alCambiar).toHaveBeenLastCalledWith('2026-11-20T09:15');
  });
});
