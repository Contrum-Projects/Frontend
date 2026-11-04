'use client';

import Link from 'next/link';
import { ErrorDeApi } from '@/compartido/api/errores';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Button } from '@/compartido/ui/button';
import { Skeleton } from '@/compartido/ui/skeleton';
import { useCampana } from './consultasCampanas';
import { FormularioCampana } from './formularioCampana';
import { RUTA_CAMPANAS } from './pantallaCampanas';

/** «Nueva campaña» (P7a): el formulario vacío. */
export function PantallaCampanaNueva() {
  return <FormularioCampana campana={null} />;
}

/** Un borrador abierto desde el listado para seguir editándolo. Una enviada ya no se edita. */
export function PantallaEditarCampana({ codigo }: { codigo: string }) {
  const consulta = useCampana(codigo);

  if (consulta.isPending) return <EsqueletoCampana />;
  if (consulta.isError) {
    if (consulta.error instanceof ErrorDeApi && consulta.error.estado === 404) {
      return (
        <AvisoCampana
          titulo="Campaña no encontrada"
          texto="No encontramos esta campaña."
        />
      );
    }
    return (
      <div className="flex flex-col gap-4">
        <h1 className="titulo-h2 text-texto-principal">Editar campaña</h1>
        <Alert variant="destructive">
          <AlertDescription>{consulta.error.message}</AlertDescription>
        </Alert>
      </div>
    );
  }
  if (consulta.data.estado === 'enviada') {
    return (
      <AvisoCampana
        titulo={consulta.data.asunto}
        texto="Esta campaña ya se envió. Una campaña enviada no se edita."
      />
    );
  }
  return <FormularioCampana key={codigo} campana={consulta.data} />;
}

const AvisoCampana = ({ titulo, texto }: { titulo: string; texto: string }) => (
  <div className="flex flex-col items-start gap-3">
    <h1 className="titulo-h2 wrap-break-word text-texto-principal">{titulo}</h1>
    <p className="texto-pequeno text-texto-secundario">{texto}</p>
    <Button asChild variant="contorno">
      <Link href={RUTA_CAMPANAS}>Ver campañas</Link>
    </Button>
  </div>
);

/** Con la forma del formulario, para que nada salte al cargar (RNF-17). */
export const EsqueletoCampana = () => (
  <div aria-hidden className="flex flex-col gap-4 lg:gap-6">
    <Skeleton className="h-10 w-28" />
    <Skeleton className="h-9 w-64 max-w-full" />
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="flex flex-col gap-4 lg:col-span-3">
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-44 rounded-2xl" />
      </div>
      <Skeleton className="h-96 rounded-xl max-lg:hidden lg:col-span-2" />
    </div>
  </div>
);
