import type { Route } from 'next';
import Link from 'next/link';
import { Logo } from '@/compartido/marca/logo';
import { ENLACES_AYUDA, RUTAS } from './enlaces';

interface Columna {
  titulo: string;
  enlaces: readonly { texto: string; href: Route }[];
}

const COLUMNAS: Columna[] = [
  {
    titulo: 'Tienda',
    enlaces: [
      { texto: 'Catálogo', href: RUTAS.catalogo },
      { texto: 'Marcas', href: RUTAS.marcas },
      { texto: 'Packs', href: RUTAS.packs },
      { texto: 'Productos para profesionales', href: RUTAS.precioProfesional },
    ],
  },
  { titulo: 'Ayuda', enlaces: ENLACES_AYUDA },
  {
    titulo: 'Profesionales',
    enlaces: [
      { texto: 'Verificar mi cuenta', href: RUTAS.verificacion },
      {
        texto: 'Cómo funciona el precio profesional',
        href: RUTAS.precioProfesional,
      },
    ],
  },
];

/**
 * Footer de la tienda (Figma › Componentes › Footer 6:115 y 6:166). La suscripción a ofertas
 * de Figma llega con SCRUM-138.
 */
export function Footer() {
  return (
    <footer className="bg-marca-profundo text-texto-sobre-oscuro [&_a:focus-visible]:outline-marca-logo">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-6 pt-12 pb-8 md:gap-12 md:px-16 md:pt-16">
        <div className="flex flex-col gap-8 md:flex-row md:gap-16">
          <div className="flex flex-col gap-4">
            <Logo className="h-auto w-[148px] text-marca-logo md:w-[180px]" />
            <p className="max-w-60 texto-pequeno">
              Productos capilares para tu casa y para tu salón.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 md:flex md:gap-16">
            {COLUMNAS.map((columna) => (
              <nav key={columna.titulo} aria-label={columna.titulo}>
                <h2 className="texto-sobretitulo text-marca-logo">
                  {columna.titulo}
                </h2>
                <ul className="mt-3 flex flex-col gap-2">
                  {columna.enlaces.map((enlace) => (
                    <li key={enlace.texto}>
                      <Link
                        href={enlace.href}
                        className="rounded-md texto-pequeno hover:underline"
                      >
                        {enlace.texto}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2 border-t border-texto-sobre-oscuro/15 pt-6 texto-leyenda md:flex-row md:gap-6">
          <p className="opacity-80">© 2026 Cabello Perfecto</p>
          <Link
            href={RUTAS.terminos}
            className="rounded-md opacity-80 hover:underline"
          >
            Términos y condiciones
          </Link>
          <Link
            href={RUTAS.privacidad}
            className="rounded-md opacity-80 hover:underline"
          >
            Política de privacidad
          </Link>
        </div>
      </div>
    </footer>
  );
}
