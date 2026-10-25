import { Suspense } from 'react';
import { Logo } from '@/compartido/marca/logo';
import { EstadoApi } from './estado-api';

/**
 * Inicio provisorio, hasta SCRUM-106 (Inicio y catálogo). Muestra el patrón para leer la API
 * desde el servidor: el componente que llama al backend va dentro de <Suspense>.
 */
export default function Inicio() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <Logo className="h-auto w-48 text-marca-profundo" />
      <h1 className="titulo-h2 md:titulo-h1">La tienda se está construyendo</h1>
      <p className="text-muted-foreground">
        Pronto vas a encontrar aquí los productos de Cabello Perfecto.
      </p>
      <Suspense
        fallback={
          <p className="texto-pequeno text-muted-foreground">
            Revisando la API…
          </p>
        }
      >
        <EstadoApi />
      </Suspense>
    </main>
  );
}
