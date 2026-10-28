import { LockKeyhole } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/compartido/ui/button';

/**
 * Sección del panel que el rol no tiene (E13-H2, criterio 2): ocupa el lugar de la página. Es
 * comodidad: si alguien llama al endpoint igual, el backend responde 403.
 */
export const AvisoSinPermiso = () => (
  <section className="flex flex-col items-center rounded-lg border bg-fondo-superficie px-6 py-12 text-center md:py-16">
    <LockKeyhole
      className="size-10 text-texto-secundario"
      strokeWidth={1.75}
      aria-hidden
    />
    <h1 className="mt-4 titulo-h2 text-texto-principal">
      No tienes acceso a esta sección
    </h1>
    <p className="mt-2 text-texto-secundario">
      Tu rol no incluye esta parte del panel.
    </p>
    <Button asChild className="mt-6">
      <Link href="/panel">Volver al inicio</Link>
    </Button>
  </section>
);
