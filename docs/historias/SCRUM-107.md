# SCRUM-107 · E2-H2 · Búsqueda y filtros del catálogo

**Orden:** 15 de 53 · **Puntos:** 5 · **Historia backend:** SCRUM-33 · **API:** Parcial

**Necesita antes (frontend):** [SCRUM-106](SCRUM-106.md)  
**La necesitan después:** ninguna

Como un Visitante o Cliente, necesito buscar y filtrar en la tienda, con la finalidad de llegar rápido al producto.

**Historia backend:** SCRUM-33 · **Figma:** 02 Catálogo (filtros), 11 Búsqueda

## Criterios de aceptación

1. **Resultados.** El usuario escribe en el buscador. Cuando envía. Ve los resultados con filtros por categoría, subcategoría y marca.
2. **Sin resultados.** Nada coincide. Cuando se muestra la respuesta. La pantalla lo indica y propone categorías para seguir.
3. **Filtros en celular.** El usuario está en un celular. Cuando abre los filtros. Se muestra un panel de filtros y los resultados se actualizan al aplicarlos.

## Pantalla y ruta

| Pantalla                  | Escritorio | Celular                     | Ruta                          |
| ------------------------- | ---------- | --------------------------- | ----------------------------- |
| 02 Catálogo (con filtros) | 2006:395   | 2005:374 · filtros 2005:662 | `/catalogo?categoria=&marca=` |
| 11 Búsqueda               | 2058:2736  | sin resultados 2060:2396    | `/buscar?q=`                  |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 30-10-2026 (Swagger del backend en local): **Parcial**.

**Ya existe:** `GET /api/tienda/productos?buscar=&categoriaId=&marcaId=&pagina=&limite=`. `buscar`
exige que cada palabra (hasta 5, máx. 100 caracteres) esté en el nombre, la marca o la categoría
(propia o superior); combina con los filtros; sin coincidencias responde 200 con `items: []`; más
de 5 palabras o más de 100 caracteres responde 400 con el mensaje en español.

**Falta (acordado con SCRUM-33 el 30-10-2026), simulado mientras tanto:**

1. **Varias categorías y marcas.** Figma permite marcar varias. Hoy `categoriaId` y `marcaId`
   aceptan un solo valor (dos `categoriaId` responden 400). Forma pedida: los dos parámetros se
   repiten (`?categoriaId=3305&categoriaId=3308&marcaId=2400`). Dentro de un grupo es «o» (cualquiera
   de las categorías, con sus subcategorías) y entre grupos es «y» (y además de esa marca). La
   respuesta no cambia (`ListadoTienda`). Un id que no existe sigue respondiendo 400.
2. **Conteos por categoría y marca (facetas).** Figma muestra cuántos productos hay en cada opción
   y, en la búsqueda, solo las opciones con resultados. Forma pedida:

   ```http
   GET /api/tienda/facetas?buscar=&categoriaId=&marcaId=   (mismos filtros que /tienda/productos)
   200 {
     "categorias": [{ "id": 3305, "total": 24 }, { "id": 3306, "total": 9 }],
     "marcas":     [{ "id": 2400, "total": 10 }]
   }
   ```

   - El total de una categoría incluye sus subcategorías, igual que el filtro.
   - El conteo de cada grupo aplica `buscar` y los filtros del **otro** grupo, no los de su propio
     grupo (así marcar Shampoo no deja en 0 a Acondicionador).
   - Solo trae las opciones con `total > 0`. Mismas reglas de visibilidad que el listado (venta
     general; con sesión profesional, también exclusivos). Los mismos 400 que el listado.
   - Ruta aparte para no chocar con `GET /api/tienda/productos/{id}`.

**Simulación** (`compartido/api/simulado/tienda.ts`, solo con `API_SIMULADA=1`): no inventa datos.
Con varios ids, la ruta simulada pide al backend real cada combinación de categoría y marca, junta
los productos sin repetir y los ordena por nombre como el backend. Las facetas se arman contando
los productos reales de cada categoría y cada marca. Son varias llamadas por página; se borra cuando
el backend lo tenga.

## Notas de trabajo

30-10-2026 · rama `SCRUM-107-busqueda-filtros`.

**Qué se hizo**

- `/buscar?q=&categoria=&marca=` (nueva) y `/catalogo?categoria=&marca=` comparten `Catalogo`
  (`tienda/catalogo/catalogo.tsx`). `categoria` y `marca` se pueden repetir en la URL.
- Escritorio (desde `lg`): columna de filtros con casillas (`filtrosEscritorio.tsx`) que aplican al
  instante (la casilla cambia de inmediato con `useOptimistic`), «Limpiar filtros» y chips
  «Filtrando por» con × (enlaces, funcionan sin JavaScript).
- Celular: «Filtros (n)» abre un `Sheet` desde abajo (`filtrosCelular.tsx`). Lo marcado no se aplica
  hasta «Ver N productos»; el número lo cuenta el backend con `limite=1`. Cerrar descarta lo no
  aplicado.
- Sin resultados (`sinResultados.tsx`): textos de Figma 2060:2396 y «Explora por categoría».
- `buscarCategoria` pasó de `consultas.ts` (solo servidor) a `seleccionFiltros.ts`, porque los
  filtros del navegador también lo usan.

**Decisiones (aprobadas el 30-10-2026)**

- Varias categorías y marcas, con conteos por opción, como en Figma: pedido al backend (sección API).
- Marcar una subcategoría desmarca su categoría superior y al revés (la categoría ya incluye sus
  subcategorías). En el catálogo se ven las subcategorías de la categoría marcada; en la búsqueda,
  todas las que tienen resultados. Las opciones sin productos se ocultan (salvo las marcadas).
- Título: con una sola categoría (con o sin marca) o una sola marca, su nombre; con varias,
  «Catálogo». En la búsqueda, «Resultados para «q»» o «Búsqueda» si no hay resultados (Figma).
- `/buscar` sin texto redirige a `/catalogo` con los mismos filtros. `q` en `/catalogo` no filtra.
- Un 400 de la búsqueda (más de 5 palabras) muestra el mensaje del backend en lugar de un 404.
- Si `/tienda/facetas` falla, los filtros se muestran igual, sin números.
- `/buscar` lleva `robots: noindex`: cada búsqueda no es una página para buscadores.
- El total del botón del celular se pide **sin sesión** (`apiPublica` en `compartido/api/cliente.ts`):
  la página se arma como visitante y el número debe coincidir. Revisarlo en SCRUM-109.

- Los títulos «CATEGORÍA» y «MARCA» de los filtros usan Texto/Sobretítulo porque así están en
  Figma (2006:451), aunque `docs/diseno.md` reserva el sobretítulo para la marca del producto.
- En `/buscar` el campo del header muestra el texto buscado (Figma 2058:2736).
- Mientras se aplican los filtros, los resultados actuales se atenúan (`transicionFiltros.tsx`).

**Pregunta abierta**

- Búsqueda con filtros que no deja resultados: hoy dice «No encontramos productos para «q»» y
  propone categorías (que llevan al catálogo, sin la búsqueda). Figma no tiene una variante «sin
  resultados con estos filtros»: ¿se agrega una?

**Pendiente**

- Backend (SCRUM-33): `categoriaId`/`marcaId` repetidos y `GET /api/tienda/facetas`. Al llegar:
  `pnpm api:tipos`, borrar las rutas SCRUM-107 de `compartido/api/simulado/tienda.ts`, el tipo
  `FacetasTienda` de `respuestas.ts` y los `TODO(SCRUM-107)` (casts en `consultaFiltros.ts` y
  `consultas.ts`), y probar con el backend real. Hasta entonces la historia no queda Hecha.
- Sin navegador en esta sesión: la pantalla a 1440 y 360 px no se miró en vivo (se revisó el HTML del
  servidor y se comparó el código con Figma).
