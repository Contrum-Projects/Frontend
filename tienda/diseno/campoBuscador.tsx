'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { RUTAS } from './enlaces';

export interface PropsCampoBuscador {
  /** El header lo muestra dos veces (escritorio y celular): cada uno con su id. */
  id: string;
  placeholder: string;
}

const CLASE_CAMPO =
  'min-w-0 flex-1 bg-transparent py-3 texto-pequeno text-texto-principal outline-none placeholder:text-texto-secundario';

const Campo = ({
  id,
  placeholder,
  valor,
}: PropsCampoBuscador & { valor?: string }) => (
  // `key`: al buscar otra cosa, el campo toma el texto nuevo
  <input
    key={valor}
    id={id}
    name="q"
    type="search"
    placeholder={placeholder}
    defaultValue={valor}
    className={CLASE_CAMPO}
  />
);

const CampoConBusqueda = (props: PropsCampoBuscador) => {
  const ruta = usePathname();
  const q = useSearchParams().get('q') ?? undefined;
  return <Campo {...props} valor={ruta === RUTAS.buscar ? q : undefined} />;
};

/** Campo del buscador; con `conBusqueda`, en /buscar muestra el texto buscado. */
export const CampoBuscador = ({
  conBusqueda = false,
  ...props
}: PropsCampoBuscador & { conBusqueda?: boolean }) =>
  conBusqueda ? <CampoConBusqueda {...props} /> : <Campo {...props} />;
