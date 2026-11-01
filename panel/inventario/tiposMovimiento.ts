import type {
  GrupoMovimientos,
  MovimientoListado,
  TipoMovimiento,
} from '@/compartido/api/respuestas';
import type { OpcionChip } from './filtrosInventario';

/** Nombre de cada tipo de movimiento (backend: valores.ts › TIPOS_MOVIMIENTO). */
export const TIPOS_MOVIMIENTO: Record<TipoMovimiento, string> = {
  entrada: 'Entrada',
  merma_vencimiento: 'Merma por vencimiento',
  merma_dano: 'Merma por daño',
  consumo_peluqueria: 'Consumo en peluquería',
  ajuste_positivo: 'Ajuste positivo',
  ajuste_negativo: 'Ajuste negativo',
  transferencia: 'Transferencia',
  venta: 'Venta',
  reingreso: 'Reingreso por cancelación',
};

/** Chips de «Movimientos» (Figma P5d 2064:2163). Qué tipos entran en cada grupo lo decide el backend. */
export const GRUPOS_MOVIMIENTOS: readonly OpcionChip<GrupoMovimientos | ''>[] =
  [
    { valor: '', texto: 'Todos' },
    { valor: 'entradas', texto: 'Entradas' },
    { valor: 'ventas', texto: 'Ventas' },
    { valor: 'salidas', texto: 'Salidas' },
    { valor: 'transferencias', texto: 'Transferencias' },
  ];

/** «A-01», o «A-01 → S-01» en la transferencia. */
export const textoUbicacion = ({ ubicacion, destino }: MovimientoListado) =>
  destino ? `${ubicacion.codigo} → ${destino.codigo}` : ubicacion.codigo;

/** «-1», «+24»; la transferencia, sin signo (no cambia el total). */
export const textoCantidad = ({ tipo, cantidad }: MovimientoListado) =>
  tipo === 'transferencia' || cantidad <= 0 ? String(cantidad) : `+${cantidad}`;

/** Ventas y reingresos los registra el sistema. */
export const textoRegistro = ({ registradoPor }: MovimientoListado) =>
  registradoPor?.nombre ?? 'Sistema';

/** «Shampoo reparador · 300 ml» */
export const nombreFormato = (formato: {
  producto: string;
  nombreFormato: string;
}) => `${formato.producto} · ${formato.nombreFormato}`;
