/**
 * RUT chileno. Misma regla que el backend (src/common/dominio/rut.ts): se envía en formato
 * único, sin puntos, con guion y el dígito verificador en mayúscula (`12345678-K`).
 * Validar aquí solo adelanta el aviso; el backend vuelve a validar.
 */

const calcularDigitoVerificador = (cuerpo: string): string => {
  let suma = 0;
  let factor = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * factor;
    factor = factor === 7 ? 2 : factor + 1;
  }
  const resto = 11 - (suma % 11);
  if (resto === 11) return '0';
  if (resto === 10) return 'K';
  return String(resto);
};

/** «12.345.678-k» → «12345678-K». `null` si el formato o el dígito verificador no son válidos. */
export function normalizarRut(valor: string): string | null {
  const limpio = valor.replace(/[.\s-]/g, '').toUpperCase();
  const coincidencia = /^(\d{7,8})([\dK])$/.exec(limpio);
  if (!coincidencia) return null;
  const cuerpo = coincidencia[1].replace(/^0+/, '');
  const digito = coincidencia[2];
  if (cuerpo.length < 7) return null;
  if (calcularDigitoVerificador(cuerpo) !== digito) return null;
  return `${cuerpo}-${digito}`;
}

/** «12345678-K» → «12.345.678-K», para mostrar. Si no es válido, lo devuelve igual. */
export function formatearRut(valor: string): string {
  const rut = normalizarRut(valor);
  if (!rut) return valor;
  const [cuerpo, digito] = rut.split('-');
  return `${cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-${digito}`;
}
