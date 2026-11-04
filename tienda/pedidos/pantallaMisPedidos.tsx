'use client';

import { Button } from '@/compartido/ui/button';
import { Skeleton } from '@/compartido/ui/skeleton';
import { Spinner } from '@/compartido/ui/spinner';
import { errorDeApi } from '@/compartido/api/errores';
import { ErrorProfesional } from '@/tienda/profesional/errorProfesional';
import { useMisPedidos } from './consultasPedidos';
import { SinPedidos } from './sinPedidos';
import { TarjetaPedido } from './tarjetaPedido';

/** 07 Mis pedidos (Figma 2019:1396 y vacío 2058:3544, E8-H1). */
export function PantallaMisPedidos() {
  return (
    <>
      <h1 className="titulo-h2 text-texto-principal md:titulo-h1">
        Mis pedidos
      </h1>
      <ListaPedidos />
    </>
  );
}

const ListaPedidos = () => {
  const consulta = useMisPedidos();

  if (consulta.isPending) return <EsqueletoPedidos />;
  // Si falla «Cargar más», la consulta queda en error pero conserva las páginas ya leídas
  if (!consulta.data) {
    return (
      <ErrorProfesional
        mensaje={textoError(consulta.error)}
        onReintentar={() => void consulta.refetch()}
      />
    );
  }

  const pedidos = consulta.data.pages.flatMap((pagina) => pagina.items);
  if (pedidos.length === 0) return <SinPedidos />;

  return (
    <div className="flex flex-col items-center gap-6">
      <ul aria-label="Pedidos" className="flex w-full flex-col gap-4">
        {pedidos.map((pedido) => (
          <TarjetaPedido key={pedido.codigoPublico} pedido={pedido} />
        ))}
      </ul>
      {consulta.isFetchNextPageError && (
        <ErrorProfesional
          mensaje={textoError(consulta.error)}
          onReintentar={() => void consulta.fetchNextPage()}
        />
      )}
      {consulta.hasNextPage && !consulta.isFetchNextPageError && (
        <Button
          type="button"
          variant="contorno"
          size="grande"
          disabled={consulta.isFetchingNextPage}
          onClick={() => void consulta.fetchNextPage()}
        >
          {consulta.isFetchingNextPage && <Spinner aria-hidden />}
          Cargar más pedidos
        </Button>
      )}
    </div>
  );
};

/** El mensaje del backend; sin él, el genérico (un 5xx nunca muestra detalles técnicos). */
const textoError = (error: Error | null) =>
  error?.message ?? errorDeApi(undefined).message;

/** Cuatro tarjetas con la altura de las reales: la lista no salta al llegar. */
const EsqueletoPedidos = () => (
  <div aria-hidden className="flex flex-col gap-4">
    {[0, 1, 2, 3].map((i) => (
      <Skeleton key={i} className="h-28 w-full rounded-lg md:h-20" />
    ))}
  </div>
);
