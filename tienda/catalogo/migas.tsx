import Link from 'next/link';
import type { ComponentProps } from 'react';

export interface Miga {
  texto: string;
  href: ComponentProps<typeof Link>['href'];
}

/** Migas de pan (Figma › 02 Catálogo › Migas): la última es la página actual, sin enlace. */
export const Migas = ({ migas }: { migas: Miga[] }) => (
  <nav aria-label="Migas de pan">
    <ol className="flex flex-wrap items-center gap-2 texto-pequeno text-texto-secundario">
      {migas.map((miga, i) => {
        const ultima = i === migas.length - 1;
        return (
          <li key={i} className="flex items-center gap-2">
            {ultima ? (
              <span aria-current="page" className="text-texto-principal">
                {miga.texto}
              </span>
            ) : (
              <>
                <Link href={miga.href} className="rounded-md hover:underline">
                  {miga.texto}
                </Link>
                <span aria-hidden>/</span>
              </>
            )}
          </li>
        );
      })}
    </ol>
  </nav>
);
