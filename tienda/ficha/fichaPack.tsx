import { notFound } from 'next/navigation';
import { formatearDiaMes } from '@/compartido/formato/fecha';
import { Migas } from '@/tienda/catalogo/migas';
import { RUTAS, urlPack } from '@/tienda/diseno/enlaces';
import { Compra } from './compra';
import { leerId, leerPack } from './consultas';
import { EstadoDisponibilidad } from './disponibilidad';
import { Galeria } from './galeria';
import { DisenoFicha, PrecioFicha, TituloFicha } from './partesFicha';

/**
 * Ficha de pack (SCRUM-108 criterio 3, Figma › 03c Ficha de pack 2058:3302): sus fotos, los
 * formatos que incluye con cantidades, el precio con IVA y la disponibilidad de su componente
 * más escaso (la calcula el backend). Un pack fuera de vigencia o exclusivo responde 404.
 *
 * Falta el precio por separado de Figma: la API no lo entrega (pedido a SCRUM-34, ver
 * docs/historias/SCRUM-108.md).
 */
export async function FichaPack({ id }: { id: string }) {
  const numero = leerId(id);
  const pack = numero === null ? null : await leerPack(numero);
  if (!pack) notFound();

  return (
    <DisenoFicha
      descripcion={pack.descripcion}
      migas={
        <Migas
          migas={[
            { texto: 'Inicio', href: RUTAS.inicio },
            { texto: 'Packs', href: RUTAS.packs },
            { texto: pack.nombre, href: urlPack(pack.id) },
          ]}
        />
      }
      galeria={
        <Galeria
          imagenes={pack.imagenes.length > 0 ? pack.imagenes : [pack.imagen]}
          alt={pack.nombre}
        />
      }
    >
      <TituloFicha sobretitulo="Pack" nombre={pack.nombre} />
      <div className="flex flex-col gap-1">
        <PrecioFicha precio={pack.precio} />
        {pack.vigenteHasta && (
          <p className="texto-pequeno text-texto-secundario">
            Hasta el {formatearDiaMes(pack.vigenteHasta)}
          </p>
        )}
      </div>
      {pack.componentes.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2
            id="titulo-incluye"
            className="texto-etiqueta text-texto-principal"
          >
            Incluye
          </h2>
          <ul
            aria-labelledby="titulo-incluye"
            className="flex flex-col gap-2 texto-pequeno text-texto-principal"
          >
            {pack.componentes.map((componente) => (
              <li key={`${componente.producto}-${componente.formato}`}>
                {componente.cantidad} × {componente.producto} ·{' '}
                {componente.formato}
              </li>
            ))}
          </ul>
        </div>
      )}
      <EstadoDisponibilidad disponibilidad={pack.disponibilidad} />
      <Compra disponibilidad={pack.disponibilidad} articulo={pack.nombre} />
    </DisenoFicha>
  );
}
