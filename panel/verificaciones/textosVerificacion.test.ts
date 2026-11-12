import { describe, expect, it } from 'vitest';
import { MOTIVO_CORTO, avisoDeMotivo } from './textosVerificacion';

describe('Textos del motivo de revisión', () => {
  it('SCRUM-164 · nombre que no calza con el SII: texto corto y aviso de la revisión', () => {
    expect(MOTIVO_CORTO.nombre_no_coincide).toBe('Nombre no coincide');
    expect(avisoDeMotivo('nombre_no_coincide')).toBe(
      'El SII muestra el giro de peluquería, pero el nombre del contribuyente no coincide con el de la cuenta. Revisa los documentos.',
    );
  });
});
