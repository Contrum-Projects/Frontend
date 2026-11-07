import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { Button } from '@/compartido/ui/button';
import { type Miga, Migas } from '@/tienda/catalogo/migas';

export interface SeccionInformativa {
  titulo: string;
  contenido: ReactNode;
}

export interface AccionInformativa {
  texto: string;
  href: ComponentProps<typeof Link>['href'];
}

interface PaginaInformativaProps {
  titulo: string;
  /** Una o dos frases bajo el título. */
  bajada: string;
  migas: Miga[];
  secciones: SeccionInformativa[];
  /** Lo que la persona puede hacer al terminar de leer (la primera es la principal). */
  acciones?: AccionInformativa[];
}

/**
 * Página de información de la tienda (ayuda y precio profesional). Figma no las dibuja: siguen
 * el ancho y los títulos del catálogo, con una columna de lectura. Sin HTML crudo: el contenido
 * llega como componentes.
 */
export function PaginaInformativa({
  titulo,
  bajada,
  migas,
  secciones,
  acciones = [],
}: PaginaInformativaProps) {
  return (
    <main className="mx-auto max-w-[1440px] px-4 pt-4 pb-12 md:px-16 md:pt-8 md:pb-16">
      <Migas migas={migas} />
      <div className="mt-2 flex max-w-3xl flex-col gap-8 md:gap-12">
        <header className="flex flex-col gap-3">
          <h1 className="titulo-h2 text-texto-principal md:titulo-h1">
            {titulo}
          </h1>
          <p className="texto-cuerpo text-texto-secundario">{bajada}</p>
        </header>
        {secciones.map((seccion) => (
          <section key={seccion.titulo} className="flex flex-col gap-3">
            <h2 className="titulo-h3 text-texto-principal">{seccion.titulo}</h2>
            <div className="flex flex-col gap-3 texto-cuerpo text-texto-principal">
              {seccion.contenido}
            </div>
          </section>
        ))}
        {acciones.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {acciones.map((accion, indice) => (
              <Button
                key={accion.texto}
                variant={indice === 0 ? 'primario' : 'contorno'}
                asChild
              >
                <Link href={accion.href}>{accion.texto}</Link>
              </Button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

/** Lista con viñetas para el contenido de una sección. */
export const Lista = ({ children }: { children: ReactNode }) => (
  <ul className="flex list-disc flex-col gap-2 pl-6 marker:text-marca-profundo">
    {children}
  </ul>
);
