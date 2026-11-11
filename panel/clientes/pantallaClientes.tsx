'use client';

import { useCallback, useState } from 'react';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Button } from '@/compartido/ui/button';
import { Skeleton } from '@/compartido/ui/skeleton';
import {
  type ConsultaClientes,
  type FiltroClientes,
  useClientes,
} from './consultasClientes';
import { BuscadorClientes, FiltrosClientes } from './filtrosClientes';
import { ListaClientesCelular, TablaClientes } from './listaClientes';

/**
 * «Clientes» (E13-H4 FE, SCRUM-155; sin Figma, con el patrón de Personal y Productos): el
 * administrador busca las cuentas de clientes y profesionales y abre su detalle.
 */
export function PantallaClientes() {
  const [consulta, setConsulta] = useState<ConsultaClientes>({
    filtro: 'todos',
    buscar: '',
    pagina: 1,
  });
  const buscar = useCallback(
    (texto: string) =>
      setConsulta((actual) =>
        actual.buscar === texto
          ? actual
          : { ...actual, buscar: texto, pagina: 1 },
      ),
    [],
  );
  const filtrar = (filtro: FiltroClientes) =>
    setConsulta((actual) => ({ ...actual, filtro, pagina: 1 }));
  const clientes = useClientes(consulta);

  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      <h1 className="titulo-h2 text-texto-principal">Clientes</h1>
      <div className="flex flex-col gap-3 lg:rounded-lg lg:border lg:bg-card lg:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <BuscadorClientes alBuscar={buscar} className="lg:w-80" />
          <FiltrosClientes
            filtro={consulta.filtro}
            conteos={clientes.data?.conteos}
            alCambiar={filtrar}
          />
        </div>
        <Resultados
          consulta={consulta}
          alCambiarPagina={(pagina) =>
            setConsulta((actual) => ({ ...actual, pagina }))
          }
        />
      </div>
      <p className="texto-leyenda text-texto-secundario">
        Desactivar una cuenta le quita el acceso de inmediato. Sus pedidos no
        cambian.
      </p>
    </div>
  );
}

const textoVacio = ({ buscar, filtro }: ConsultaClientes) => {
  if (buscar) return `No encontramos cuentas con «${buscar}».`;
  if (filtro === 'todos') return 'Aún no hay cuentas de clientes.';
  return 'No hay cuentas en este filtro.';
};

const Resultados = ({
  consulta,
  alCambiarPagina,
}: {
  consulta: ConsultaClientes;
  alCambiarPagina: (pagina: number) => void;
}) => {
  const clientes = useClientes(consulta);

  if (clientes.isPending) return <EsqueletoClientes />;
  if (clientes.isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{clientes.error.message}</AlertDescription>
      </Alert>
    );
  }
  const { items, total, pagina, limite } = clientes.data;
  if (items.length === 0) {
    return (
      <p className="py-6 text-center texto-pequeno text-texto-secundario max-lg:rounded-lg max-lg:border max-lg:bg-card">
        {textoVacio(consulta)}
      </p>
    );
  }
  const hasta = (pagina - 1) * limite + items.length;
  return (
    <>
      <div className="max-lg:hidden">
        <TablaClientes cuentas={items} />
      </div>
      <div className="rounded-lg border bg-card px-4 py-1 lg:hidden">
        <ListaClientesCelular cuentas={items} />
      </div>
      <nav
        aria-label="Páginas"
        className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 lg:px-3"
      >
        <p className="flex-1 texto-leyenda text-texto-secundario">
          Mostrando {hasta} de {total}
        </p>
        {pagina > 1 && (
          <Button
            variant="link"
            className="min-h-10 texto-etiqueta"
            onClick={() => alCambiarPagina(pagina - 1)}
          >
            ← Anterior
          </Button>
        )}
        {hasta < total && (
          <Button
            variant="link"
            className="min-h-10 texto-etiqueta"
            onClick={() => alCambiarPagina(pagina + 1)}
          >
            Siguiente →
          </Button>
        )}
      </nav>
    </>
  );
};

const FILAS_ESQUELETO = [0, 1, 2, 3];

/** Con la forma de las filas, para que nada salte al cargar (RNF-17). */
const EsqueletoClientes = () => (
  <div
    aria-hidden
    className="flex flex-col max-lg:rounded-lg max-lg:border max-lg:bg-card max-lg:px-4 max-lg:py-1"
  >
    <div className="h-8 max-lg:hidden" />
    {FILAS_ESQUELETO.map((fila) => (
      <div
        key={fila}
        className="flex items-center gap-3 border-t py-3 max-lg:first:border-t-0 lg:px-3"
      >
        <Skeleton className="size-9 rounded-full" />
        <div className="flex flex-1 flex-col gap-1">
          <Skeleton className="h-4 w-48 max-w-full" />
          <Skeleton className="h-3 w-56 max-w-full" />
        </div>
        <Skeleton className="h-5 w-20 rounded-full max-lg:hidden" />
      </div>
    ))}
  </div>
);
