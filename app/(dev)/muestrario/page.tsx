import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';
import { Logo } from '@/compartido/marca/logo';
import { formatearPesos } from '@/compartido/formato/moneda';
import { Alert, AlertDescription, AlertTitle } from '@/compartido/ui/alert';
import { Badge } from '@/compartido/ui/badge';
import { Button } from '@/compartido/ui/button';
import { Input } from '@/compartido/ui/input';
import { Label } from '@/compartido/ui/label';

export const metadata: Metadata = {
  title: 'Muestrario',
  robots: { index: false },
};

const COLORES = [
  ['marca-profundo', 'bg-marca-profundo'],
  ['marca-acento', 'bg-marca-acento'],
  ['marca-logo', 'bg-marca-logo'],
  ['marca-acento-suave', 'bg-marca-acento-suave'],
  ['fondo-hueso', 'bg-fondo-hueso'],
  ['fondo-superficie', 'bg-fondo-superficie'],
  ['fondo-hueso-oscuro', 'bg-fondo-hueso-oscuro'],
  ['texto-principal', 'bg-texto-principal'],
  ['texto-secundario', 'bg-texto-secundario'],
  ['estado-error', 'bg-estado-error'],
  ['estado-aviso-fondo', 'bg-estado-aviso-fondo'],
  ['estado-aviso-texto', 'bg-estado-aviso-texto'],
  ['grafico-serie-1', 'bg-grafico-serie-1'],
  ['grafico-serie-2', 'bg-grafico-serie-2'],
] as const;

const TEXTOS = [
  ['display-escritorio', 'Display escritorio'],
  ['display-celular', 'Display celular'],
  ['titulo-h1', 'Título H1'],
  ['titulo-h2', 'Título H2'],
  ['titulo-h3', 'Título H3'],
  ['texto-cuerpo', 'Texto cuerpo'],
  ['texto-cuerpo-fuerte', 'Texto cuerpo fuerte'],
  ['texto-pequeno', 'Texto pequeño'],
  ['texto-etiqueta', 'Texto etiqueta'],
  ['texto-leyenda', 'Texto leyenda'],
  ['texto-precio', formatearPesos(22990)],
  ['texto-sobretitulo', 'Marca del producto'],
] as const;

/**
 * Tokens y componentes base, para comparar con Figma › Componentes.
 * Solo existe en desarrollo (`pnpm dev` → /muestrario).
 */
export default function Muestrario() {
  if (process.env.NODE_ENV === 'production') notFound();

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-12 px-4 py-12">
      <header className="flex flex-col gap-2">
        <h1 className="titulo-h1">Muestrario</h1>
        <p className="text-muted-foreground">
          Tokens de Figma y componentes base. Fuente: Figma › Componentes y
          docs/diseno.md.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="titulo-h2">Logo</h2>
        <div className="flex flex-wrap items-center gap-6">
          <Logo className="h-auto w-40 text-marca-profundo" />
          <div className="rounded-lg bg-marca-profundo p-6">
            <Logo className="h-auto w-40 text-marca-logo" />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="titulo-h2">Colores</h2>
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {COLORES.map(([nombre, clase]) => (
            <li key={nombre} className="flex flex-col gap-2">
              <span className={`h-16 rounded-md border ${clase}`} />
              <span className="texto-leyenda">{nombre}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="titulo-h2">Textos</h2>
        <ul className="flex flex-col gap-3">
          {TEXTOS.map(([clase, ejemplo]) => (
            <li key={clase} className="flex flex-wrap items-baseline gap-x-6">
              <code className="w-44 shrink-0 texto-leyenda text-muted-foreground">
                {clase}
              </code>
              <span className={clase}>{ejemplo}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="titulo-h2">Botones</h2>
        <div className="flex flex-wrap items-center gap-4">
          <Button size="grande">
            Agregar al carrito <ShoppingCart />
          </Button>
          <Button>
            Agregar al carrito <ShoppingCart />
          </Button>
          <Button variant="contorno" size="grande">
            Ver detalle
          </Button>
          <Button variant="link">Seguir comprando</Button>
          <Button disabled>Deshabilitado</Button>
        </div>
        <div className="flex flex-wrap items-center gap-4 rounded-lg bg-marca-profundo p-6">
          <Button variant="acento" size="grande">
            Ver ofertas
          </Button>
          <Button variant="acento">Ver ofertas</Button>
        </div>
      </section>

      <section className="flex max-w-sm flex-col gap-4">
        <h2 className="titulo-h2">Campo</h2>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="correo">
            Correo electrónico
          </Label>
          <Input id="correo" type="email" placeholder="nombre@correo.cl" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="rut">
            RUT
          </Label>
          <Input id="rut" defaultValue="12.345.678-0" aria-invalid />
          <p className="texto-pequeno text-destructive">El RUT no es válido.</p>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="titulo-h2">Avisos y etiquetas</h2>
        <Alert variant="aviso">
          <AlertTitle>Mínimo 3 unidades por formato</AlertTitle>
          <AlertDescription>
            Con precio profesional, cada formato se compra desde 3 unidades.
          </AlertDescription>
        </Alert>
        <Alert variant="info">
          <AlertTitle>Precio profesional activo</AlertTitle>
        </Alert>
        <div className="flex flex-wrap gap-2">
          <Badge>Agotado</Badge>
          <Badge variant="secondary">Novedad</Badge>
          <Badge variant="outline">Exclusivo profesionales</Badge>
        </div>
      </section>
    </main>
  );
}
