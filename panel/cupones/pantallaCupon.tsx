'use client';

import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Skeleton } from '@/compartido/ui/skeleton';
import { useCupon } from './consultasCupones';
import { FormularioCupon } from './formularioCupon';

export function PantallaCuponNuevo() {
  return <FormularioCupon cupon={null} />;
}

/** Un id que no es número no se pide: responde como un cupón que no existe. */
export function PantallaEditarCupon({ id }: { id: string }) {
  const numero = /^\d+$/.test(id) ? Number(id) : null;
  const consulta = useCupon(numero);
  if (numero === null || consulta.isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {consulta.error?.message ?? 'El cupón no existe.'}
        </AlertDescription>
      </Alert>
    );
  }
  if (consulta.isPending) return <EsqueletoCupon />;
  // Con `key`: si llega otra versión del cupón, el formulario parte de ella
  return <FormularioCupon key={consulta.data.id} cupon={consulta.data} />;
}

export const EsqueletoCupon = () => (
  <div aria-hidden className="flex flex-col gap-4 lg:gap-6">
    <Skeleton className="h-10 w-56" />
    <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
      <Skeleton className="h-80 rounded-lg" />
      <Skeleton className="h-80 rounded-lg" />
    </div>
  </div>
);
