import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/compartido/ui/tabs';

interface DetallesFichaProps {
  descripcion: string;
  /** Lista del reverso (SCRUM-150); `null` o vacía si el producto no la tiene. */
  ingredientes?: string | null;
}

const PESTANA =
  'h-auto flex-none rounded-none border-0 px-0 pt-0 pb-3 texto-pequeno text-texto-secundario hover:text-texto-principal data-[state=active]:font-semibold data-[state=active]:text-texto-principal md:texto-cuerpo group-data-[orientation=horizontal]/tabs:after:-bottom-px after:bg-marca-profundo';
const TEXTO =
  'max-w-[720px] texto-pequeno whitespace-pre-line text-texto-secundario md:texto-cuerpo md:text-texto-principal';

/**
 * Bajo la ficha (Figma › 03 Ficha 2007:635): «Descripción» e «Ingredientes» en pestañas. Solo
 * aparecen las que tienen texto; «Modo de uso» no tiene datos en la API y no se muestra.
 */
export const DetallesFicha = ({
  descripcion,
  ingredientes,
}: DetallesFichaProps) => {
  const secciones = [
    { valor: 'descripcion', titulo: 'Descripción', texto: descripcion.trim() },
    {
      valor: 'ingredientes',
      titulo: 'Ingredientes',
      texto: ingredientes?.trim() ?? '',
    },
  ].filter((seccion) => seccion.texto !== '');
  const [primera] = secciones;
  if (!primera) return null;

  return (
    <section
      aria-label="Detalles del producto"
      className="mt-8 border-t pt-4 md:mt-16 md:border-t-0 md:pt-0"
    >
      <Tabs defaultValue={primera.valor} className="gap-3 md:gap-6">
        <TabsList
          variant="line"
          className="h-auto w-full justify-start gap-6 rounded-none p-0 md:gap-8 md:border-b"
        >
          {secciones.map((seccion) => (
            <TabsTrigger
              key={seccion.valor}
              value={seccion.valor}
              className={PESTANA}
            >
              {seccion.titulo}
            </TabsTrigger>
          ))}
        </TabsList>
        {secciones.map((seccion) => (
          <TabsContent key={seccion.valor} value={seccion.valor}>
            <p className={TEXTO}>{seccion.texto}</p>
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
};
