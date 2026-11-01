import type {
  PackDetalle,
  PackDetalleProfesional,
} from '@/compartido/api/respuestas';
import { formatearDiaMes } from '@/compartido/formato/fecha';
import { Migas } from '@/tienda/catalogo/migas';
import { RUTAS, urlPack } from '@/tienda/diseno/enlaces';
import { InsigniaPrecioProfesional } from '@/tienda/profesional/insignias';
import { precioVisible } from '@/tienda/profesional/precio';
import { Compra } from './compra';
import { EstadoDisponibilidad } from './disponibilidad';
import { Galeria } from './galeria';
import { DisenoFicha, PrecioFicha, TituloFicha } from './partesFicha';

/**
 * Ficha de pack (SCRUM-108 criterio 3, Figma › 03c Ficha de pack 2058:3302): sus fotos, los
 * formatos que incluye con cantidades, el precio con IVA y la disponibilidad de su componente
 * más escaso (la calcula el backend). Con `exclusivo`, es lo que recibe el profesional
 * (SCRUM-109): el mayorista. El mínimo de 3 es por formato, así que el pack no lo lleva.
 *
 * Falta el precio por separado de Figma: la API no lo entrega (pedido a SCRUM-34, ver
 * docs/historias/SCRUM-108.md).
 */
export const InfoPack = ({
  pack,
}: {
  pack: PackDetalle | PackDetalleProfesional;
}) => (
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
    <div className="flex flex-col items-start gap-4">
      {'exclusivo' in pack && <InsigniaPrecioProfesional />}
      <div className="flex flex-col gap-1">
        <PrecioFicha precio={precioVisible(pack)} />
        {pack.vigenteHasta && (
          <p className="texto-pequeno text-texto-secundario">
            Hasta el {formatearDiaMes(pack.vigenteHasta)}
          </p>
        )}
      </div>
    </div>
    {pack.componentes.length > 0 && (
      <div className="flex flex-col gap-3">
        <h2 id="titulo-incluye" className="texto-etiqueta text-texto-principal">
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
    <Compra
      articuloId={pack.id}
      disponibilidad={pack.disponibilidad}
      articulo={pack.nombre}
    />
  </DisenoFicha>
);
