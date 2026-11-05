/** Tarjeta de carritos y campañas (Figma P6 2041:1419 y 2042:1123). */
export const TARJETA_REPORTE =
  'flex min-w-0 flex-col gap-3 rounded-lg border bg-card p-4 lg:gap-4 lg:p-6';

/** Una cifra con su texto debajo, dentro de un `<dl>` (Figma celular 2042:1125 y 2042:1138). */
export const Cifra = ({ valor, texto }: { valor: string; texto: string }) => (
  <div className="flex flex-col">
    <dt className="order-2 texto-leyenda text-texto-secundario">{texto}</dt>
    <dd className="order-1 texto-cuerpo-fuerte text-texto-principal tabular-nums">
      {valor}
    </dd>
  </div>
);
