'use client';

import { useCallback, useState } from 'react';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Button } from '@/compartido/ui/button';
import { Skeleton } from '@/compartido/ui/skeleton';
import {
  Buscador,
  ChipsFiltro,
  FiltroFechas,
  type OpcionChip,
} from '@/panel/inventario/filtrosInventario';
import {
  type ConsultaRegistroErrores,
  type FiltroOrigen,
  type ListadoRegistroErrores,
  type RegistroError,
  useRegistroErrores,
} from './consultasRegistroErrores';
import { DetalleError } from './detalleError';
import {
  ListaRegistroErroresCelular,
  TablaRegistroErrores,
} from './listaRegistroErrores';
import { NOMBRE_ORIGEN } from './textosRegistroErrores';

const opcionesOrigen = (
  conteos?: ListadoRegistroErrores['conteos'],
): OpcionChip<FiltroOrigen>[] => {
  const con = (texto: string, conteo?: number) =>
    conteo === undefined ? texto : `${texto} · ${conteo}`;
  return [
    { valor: 'todos', texto: con('Todos', conteos?.todos) },
    { valor: 'api', texto: con(NOMBRE_ORIGEN.api, conteos?.api) },
    {
      valor: 'navegador',
      texto: con(NOMBRE_ORIGEN.navegador, conteos?.navegador),
    },
    {
      valor: 'servidor_web',
      texto: con(NOMBRE_ORIGEN.servidor_web, conteos?.servidorWeb),
    },
  ];
};

/**
 * «Registro de errores» (SCRUM-168; sin Figma, con el patrón de Clientes e Inventario): el
 * administrador ve qué falló, cuándo y en qué componente, y busca por el código que le dio la
 * persona.
 */
export function PantallaRegistroErrores() {
  const [consulta, setConsulta] = useState<ConsultaRegistroErrores>({
    origen: 'todos',
    buscar: '',
    desde: '',
    hasta: '',
    pagina: 1,
  });
  const [abierto, setAbierto] = useState<RegistroError | null>(null);
  const cambiar = useCallback(
    (cambios: Partial<ConsultaRegistroErrores>) =>
      setConsulta((actual) => ({ ...actual, ...cambios, pagina: 1 })),
    [],
  );
  const registro = useRegistroErrores(consulta);

  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      <h1 className="titulo-h2 text-texto-principal">Registro de errores</h1>
      <div className="flex flex-col gap-3 lg:rounded-lg lg:border lg:bg-card lg:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <Buscador
            id="buscar-errores"
            etiqueta="Buscar errores por código, componente o mensaje"
            placeholder="Código, componente o mensaje"
            alCambiar={(buscar) => cambiar({ buscar })}
          />
          <FiltroFechas
            etiqueta="Fechas"
            desde={consulta.desde}
            hasta={consulta.hasta}
            alCambiar={(desde, hasta) => cambiar({ desde, hasta })}
          />
        </div>
        <ChipsFiltro
          etiqueta="Origen"
          opciones={opcionesOrigen(registro.data?.conteos)}
          valor={consulta.origen}
          alCambiar={(origen) => cambiar({ origen })}
        />
        <Resultados
          consulta={consulta}
          alAbrir={setAbierto}
          alCambiarPagina={(pagina) =>
            setConsulta((actual) => ({ ...actual, pagina }))
          }
        />
      </div>
      <p className="texto-leyenda text-texto-secundario">
        Se registran los errores inesperados del backend, de la tienda y del
        panel; no los avisos de validación. Cada error se guarda{' '}
        {registro.data?.diasRetencion ?? 90} días.
      </p>
      <DetalleError error={abierto} alCerrar={() => setAbierto(null)} />
    </div>
  );
}

const textoVacio = ({
  buscar,
  desde,
  hasta,
  origen,
}: ConsultaRegistroErrores) => {
  if (buscar) return `No encontramos errores con «${buscar}».`;
  if (desde || hasta || origen !== 'todos') {
    return 'No hay errores con estos filtros.';
  }
  return 'No hay errores registrados.';
};

const Resultados = ({
  consulta,
  alAbrir,
  alCambiarPagina,
}: {
  consulta: ConsultaRegistroErrores;
  alAbrir: (error: RegistroError) => void;
  alCambiarPagina: (pagina: number) => void;
}) => {
  const registro = useRegistroErrores(consulta);

  if (registro.isPending) return <EsqueletoRegistro />;
  if (registro.isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{registro.error.message}</AlertDescription>
      </Alert>
    );
  }
  const { items, total, pagina, limite } = registro.data;
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
        <TablaRegistroErrores errores={items} alAbrir={alAbrir} />
      </div>
      <div className="rounded-lg border bg-card px-4 py-1 lg:hidden">
        <ListaRegistroErroresCelular errores={items} alAbrir={alAbrir} />
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
const EsqueletoRegistro = () => (
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
        <Skeleton className="h-4 w-28 max-lg:hidden" />
        <div className="flex flex-1 flex-col gap-1">
          <Skeleton className="h-4 w-56 max-w-full" />
          <Skeleton className="h-3 w-72 max-w-full" />
        </div>
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
    ))}
  </div>
);
