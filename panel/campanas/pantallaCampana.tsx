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

/** El id de la URL, o `null` si no es un id (responde como una campaña que no existe). */
const idDeRuta = (valor: string): number | null =>
  /^[1-9]\d{0,9}$/.test(valor) ? Number(valor) : null;

/** Un borrador abierto desde el listado para seguir editándolo. Una enviada ya no se edita. */
export function PantallaEditarCampana({ id }: { id: string }) {
  const idCampana = idDeRuta(id);
  const consulta = useCampana(idCampana);

  if (idCampana === null) return <CampanaNoEncontrada />;
  if (consulta.isPending) return <EsqueletoCampana />;
  if (consulta.isError) {
    if (consulta.error instanceof ErrorDeApi && consulta.error.estado === 404) {
      return <CampanaNoEncontrada />;
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
  if (consulta.data.enviada) {
    return (
      <AvisoCampana
        titulo={consulta.data.asunto}
        texto="Esta campaña ya se envió. Una campaña enviada no se edita."
      />
    );
  }
  return <FormularioCampana key={idCampana} campana={consulta.data} />;
}

const CampanaNoEncontrada = () => (
  <AvisoCampana
    titulo="Campaña no encontrada"
    texto="No encontramos esta campaña."
  />
);

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
    {/* Pestañas «Editar / Vista previa» de celular */}
    <Skeleton className="h-12 rounded-full lg:hidden" />
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="flex flex-col gap-4 lg:col-span-3 lg:gap-6">
        <Skeleton className="h-72 lg:rounded-lg" />
        <Skeleton className="h-44 lg:rounded-lg" />
      </div>
      <Skeleton className="h-96 rounded-lg max-lg:hidden lg:col-span-2" />
    </div>
    <div className="flex flex-col gap-3 lg:hidden">
      <Skeleton className="h-14 rounded-full" />
      <Skeleton className="h-14 rounded-full" />
    </div>
  </div>
);
