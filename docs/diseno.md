# Diseño

Fuente de verdad: archivo de Figma **«Cabello Perfecto – Frontend (Copy)»**
(https://www.figma.com/design/cl9eSD5YBS9qF4tQXJki68). Páginas: Componentes, Tienda · Escritorio,
Tienda · Celular, Panel · Escritorio, Panel · Celular y Correos. Las pantallas y sus nodos están en
[pantallas.md](pantallas.md).

Dirección visual «vitrina cálida»: un solo color de marca (turquesa) sobre fondo hueso cálido. El
brillo (destellos turquesa) vive solo en el banner principal del inicio.

## Tokens

Definidos en `app/globals.css` con los mismos nombres de las variables de Figma (colección
«Cabello Perfecto», modo «Claro»). Si cambia un valor en Figma, se cambia ahí.

| Figma                                  | Tailwind                                          | Valor             | Uso                                                                         |
| -------------------------------------- | ------------------------------------------------- | ----------------- | --------------------------------------------------------------------------- |
| marca/profundo                         | `marca-profundo` · `primary`                      | #0B3B3A           | Botón primario, títulos de marca, footer, barra y menú del panel            |
| marca/acento                           | `marca-acento` · `ring`                           | #14B8A6           | Botón acento sobre fondo oscuro, detalles, foco. **Nunca con texto blanco** |
| marca/logo                             | `marca-logo`                                      | #2ED3C2           | Logo y destellos sobre fondo oscuro                                         |
| marca/acento-suave                     | `marca-acento-suave` · `secondary`, `accent`      | #D5F2ED           | Precio profesional, opciones y filas elegidas, avisos informativos          |
| fondo/hueso                            | `fondo-hueso` · `background`                      | #F3EFE6           | Fondo general                                                               |
| fondo/superficie                       | `fondo-superficie` · `card`, `popover`            | #FFFCF6           | Tarjetas y campos                                                           |
| fondo/hueso-oscuro                     | `fondo-hueso-oscuro` · `border`, `input`, `muted` | #E6DFD0           | Bordes y separadores                                                        |
| texto/principal                        | `texto-principal` · `foreground`                  | #2A2E2D           | Texto                                                                       |
| texto/secundario                       | `texto-secundario` · `muted-foreground`           | #5C6361           | Texto de apoyo                                                              |
| texto/sobre-oscuro                     | `texto-sobre-oscuro` · `primary-foreground`       | #F3EFE6           | Texto sobre marca/profundo                                                  |
| estado/error                           | `estado-error` · `destructive`                    | #B42318           | Errores de formulario y acciones destructivas                               |
| estado/aviso-fondo, estado/aviso-texto | `estado-aviso-fondo`, `estado-aviso-texto`        | #FDF0D5 / #8A4B08 | Avisos que bloquean o piden acción (`<Alert variant="aviso">`)              |
| grafico/serie-1, grafico/serie-2       | `grafico-serie-1`, `grafico-serie-2`              | #009483 / #C4712E | Series de gráficos. Etiquetas y textos de gráficos usan colores de texto    |

**Espaciado** (espacio/4 a espacio/64): la escala de Tailwind `1, 2, 3, 4, 6, 8, 12, 16`.

**Radios:** radio/s 8 → `rounded-md` (campos) · radio/m 16 → `rounded-lg` (tarjetas) · radio/l 28
→ `rounded-xl` · radio/pill → `rounded-full` (botones, chips, cantidad).

**Tipografía:** Fraunces (títulos) y DM Sans (texto), servidas desde el sitio (`compartido/fuentes.ts`).
Cada estilo de texto de Figma es una utilidad:

| Figma               | Clase                 | Tamaño / interlineado                                                              |
| ------------------- | --------------------- | ---------------------------------------------------------------------------------- |
| Display/Escritorio  | `display-escritorio`  | Fraunces Light 64 / 1,05 — solo el banner del inicio                               |
| Display/Celular     | `display-celular`     | Fraunces Light 40 / 1,08                                                           |
| Título/H1           | `titulo-h1`           | Fraunces 40 / 1,15 — páginas internas en escritorio                                |
| Título/H2           | `titulo-h2`           | Fraunces 28 / 1,2 — páginas internas en celular                                    |
| Título/H3           | `titulo-h3`           | Fraunces 20 / 1,25                                                                 |
| Texto/Cuerpo        | `texto-cuerpo`        | DM Sans 16 / 1,5 (por defecto en `body`)                                           |
| Texto/Cuerpo fuerte | `texto-cuerpo-fuerte` | DM Sans SemiBold 16                                                                |
| Texto/Pequeño       | `texto-pequeno`       | DM Sans 14 / 1,45                                                                  |
| Texto/Etiqueta      | `texto-etiqueta`      | DM Sans SemiBold 14 — etiquetas de campos y botones medianos                       |
| Texto/Leyenda       | `texto-leyenda`       | DM Sans Medium 12                                                                  |
| Texto/Precio        | `texto-precio`        | DM Sans Bold 20, cifras tabulares                                                  |
| Texto/Sobretítulo   | `texto-sobretitulo`   | DM Sans SemiBold 12 en mayúsculas — **solo** la marca sobre el nombre del producto |

Las páginas internas usan `titulo-h2 md:titulo-h1`, nunca el display.

## Componentes

| Figma › Componentes                                           | Código                                                | Notas                                                                                                                         |
| ------------------------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Logo (Turquesa, Profundo)                                     | `compartido/marca/logo.tsx`                           | Toma el color del texto: `text-marca-profundo` o `text-marca-logo`                                                            |
| Ícono                                                         | `lucide-react`                                        | Trazo 1,75 (el botón ya lo aplica). Buscar → `Search`, Carrito → `ShoppingCart`, Verificado → `BadgeCheck`, Camión → `Truck`… |
| Botón (Primario, Acento, Contorno · Grande, Mediano)          | `compartido/ui/button.tsx`                            | `variant="primario" \| "acento" \| "contorno"`, `size="grande" \| "mediano"`                                                  |
| Campo                                                         | `compartido/ui/input.tsx` + `label.tsx` / `field.tsx` | Etiqueta `texto-etiqueta`, 6 px sobre la caja                                                                                 |
| Cantidad                                                      | por construir                                         | Píldora con − y +; mínimo 3 para profesionales (RF-05.10)                                                                     |
| Chip (Activo Sí/No)                                           | por construir                                         | Filtros del catálogo                                                                                                          |
| Imagen de producto                                            | `next/image`                                          | Las de Figma son provisorias                                                                                                  |
| Tarjeta de producto (Minorista/Profesional · Normal/Compacto) | por construir (SCRUM-106/109)                         |                                                                                                                               |
| Header y Footer (Escritorio, Celular)                         | por construir (SCRUM-106)                             | Ninguna historia los nombra: se arman con el inicio                                                                           |
| Panel: menú lateral, barra superior, navegación inferior      | por construir (SCRUM-99)                              |                                                                                                                               |

Al construir uno, ponlo en `compartido/ui` (si es genérico) o en `tienda/`/`panel/`, y agrégalo a
`/muestrario`.

## Criterios de contenido

Decididos el 12 de octubre para que el sitio se vea como tienda y no como landing:

- El inicio muestra productos: promociones arriba, «Más vendidos», «Novedades» y marcas. Sin hero
  con titular y dos botones, sin pasos explicativos ni fila de beneficios.
- Header de tienda: buscador grande, cuenta, carrito y fila de categorías con acceso a «Precio
  profesional». Sin franja de anuncio.
- Blue Express aparece solo donde se decide o consulta el envío (checkout, detalle de pedido);
  Mercado Pago solo en el botón de pagar y en el aviso de pago no aprobado.
- «IVA incluido» en la ficha, el carrito y el checkout; no en cada tarjeta.
- Sin sobretítulos decorativos en mayúsculas; la marca sobre el nombre del producto sí.
- Documento tributario: sin selector boleta/factura. Por defecto, comprobante electrónico; la
  factura se pide con el interruptor «Necesito factura» y usa los datos de facturación de la cuenta.
- Fotos por formato (no por producto): la tarjeta muestra la principal del formato predeterminado y
  la galería de la ficha cambia con el formato elegido. Un pack tiene sus propias fotos.
- Estados vacíos y agotados ofrecen solo lo que piden los requisitos (ir al catálogo, explorar
  categorías). Sin «avísame cuando llegue» ni productos sugeridos.
- Las cifras de Figma (pedidos, precios, stock, personas) son de ejemplo: en el código, siempre las
  de la API.

## Panel

Funciona en computador y en celular (RNF-25: 360 px sin desplazamiento horizontal).

- **Escritorio:** menú lateral oscuro (Inicio, Pedidos, Productos, Inventario, Verificaciones,
  Campañas, Reportes, Personal); tablas; vista dividida lista + detalle en pedidos, verificaciones y
  facturas; panel lateral (`Sheet`) para registrar salidas y crear cuentas de personal; ventana de
  confirmación (`AlertDialog`) para enviar campañas.
- **Celular:** barra superior con logo y avatar; navegación inferior con Inicio, Pedidos,
  Productos, Inventario y Más. Las tablas se muestran como listas; lista y detalle en pantallas
  separadas.

## Pendiente de definir (no inventar)

- Fotos reales, categorías, marcas y ofertas.
- Si la foto del reverso que usa la IA se publica como foto del formato.
- Permisos de vendedor y bodeguero en el panel (el backend ya tiene `permisos.ts`; las pantallas
  de Figma muestran la vista del administrador).
- Modalidades y especialidades del perfil profesional, segmentos de campañas y la oferta del saludo
  de cumpleaños.
- Textos de términos y condiciones y política de privacidad.
- Ícono del sitio: hoy usa el logo completo (`app/icon.svg`); no hay versión cuadrada en Figma.
