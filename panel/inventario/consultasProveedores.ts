'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/compartido/api/cliente';
import { exigir } from '@/compartido/api/errores';
import type { Proveedor } from '@/compartido/api/respuestas';
import { conErrorDeApi } from '@/tienda/cuenta/consultasCuenta';

/** Proveedores activos, ordenados por razón social (E11-H1). Pide `proveedores.gestionar`. */
export const CLAVE_PROVEEDORES = [
  'panel',
  'inventario',
  'proveedores',
] as const;

export const useProveedores = () =>
  useQuery({
    queryKey: CLAVE_PROVEEDORES,
    queryFn: () =>
      conErrorDeApi(async () =>
        exigir<Proveedor[]>(await api.GET('/api/inventario/proveedores')),
      ),
  });
