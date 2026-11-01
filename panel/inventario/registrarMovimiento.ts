import { api } from '@/compartido/api/cliente';
import { exigir } from '@/compartido/api/errores';
import type {
  AjusteRegistrado,
  SalidaRegistrada,
  TransferenciaRegistrada,
} from '@/compartido/api/respuestas';
import { nombreUbicacion } from './consultasEntradas';
import {
  cuerpoAjuste,
  cuerpoSalida,
  cuerpoTransferencia,
  type DatosSalida,
} from './esquemaSalida';

/** «Queda 1 en …» o «Quedan 3 en …»: solo el texto, el número es del backend. */
const queda = (unidades: number, ubicacion: string) =>
  `${unidades === 1 ? 'Queda' : 'Quedan'} ${unidades} en ${ubicacion}`;

/**
 * Envía el movimiento al endpoint de su tipo y devuelve el aviso para la persona, con el stock
 * que informa el backend (el frontend no lo calcula, RNF-03). Si el backend rechaza, lanza
 * `ErrorDeApi`.
 */
export const registrarMovimiento = async (
  datos: DatosSalida,
): Promise<string> => {
  if (datos.tipo === 'ajuste') {
    const ajuste = exigir<AjusteRegistrado>(
      await api.POST('/api/inventario/ajustes', { body: cuerpoAjuste(datos) }),
    );
    return `Ajuste registrado. ${queda(ajuste.stockResultante, nombreUbicacion(ajuste.ubicacion))}.`;
  }

  if (datos.tipo === 'transferencia') {
    const { origen, destino } = exigir<TransferenciaRegistrada>(
      await api.POST('/api/inventario/transferencias', {
        body: cuerpoTransferencia(datos),
      }),
    );
    return `Transferencia registrada. ${queda(origen.stock, nombreUbicacion(origen))} y ${destino.stock} en ${nombreUbicacion(destino)}.`;
  }

  const salida = exigir<SalidaRegistrada>(
    await api.POST('/api/inventario/salidas', { body: cuerpoSalida(datos) }),
  );
  return `Salida registrada. ${queda(salida.stockRestante, nombreUbicacion(salida.ubicacion))}.`;
};
