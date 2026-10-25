import { describe, expect, it } from 'vitest';
import { cn } from './utils';

describe('cn()', () => {
  it('el último estilo de texto de Figma gana', () => {
    expect(cn('texto-cuerpo', 'texto-pequeno')).toBe('texto-pequeno');
    expect(cn('text-sm font-medium', 'texto-etiqueta')).toBe('texto-etiqueta');
  });

  it('no mezcla estilo de texto con color de texto', () => {
    expect(cn('texto-cuerpo', 'text-muted-foreground')).toBe(
      'texto-cuerpo text-muted-foreground',
    );
  });
});
