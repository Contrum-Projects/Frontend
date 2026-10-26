# SCRUM-106 · E2-H1 · Inicio y catálogo por categorías y marcas

**Orden:** 1 de 53 · **Puntos:** 8 · **Historia backend:** SCRUM-32 · **API:** Sí

**Necesita antes (frontend):** nada  
**La necesitan después:** [SCRUM-94](SCRUM-94.md), [SCRUM-107](SCRUM-107.md), [SCRUM-108](SCRUM-108.md), [SCRUM-138](SCRUM-138.md)

Como un Visitante o Cliente, necesito el inicio y el catálogo de la tienda, con la finalidad de encontrar productos por categoría o marca.

**Historia backend:** SCRUM-32 · **Figma:** 01 Inicio, 02 Catálogo, 12 Menú

## Criterios de aceptación

1. **Inicio.** El usuario abre la tienda. Cuando carga. Ve promociones, filas de «Más vendidos» y «Novedades» y marcas, con header de tienda (buscador, cuenta, carrito y categorías).
2. **Catálogo por categoría o marca.** El usuario elige una categoría o marca. Cuando se carga el listado. Ve las tarjetas de producto (foto principal del formato predeterminado, nombre, marca y precio).
3. **Sin productos.** La categoría no tiene productos. Cuando el usuario la abre. La pantalla lo indica y ofrece explorar otras categorías.
4. **Celular.** El usuario abre el menú. Cuando navega. Ve categorías con subcategorías, packs, marcas, ayuda y cuenta.

## Pantalla y ruta

| Pantalla                  | Escritorio | Celular                     | Ruta                          |
| ------------------------- | ---------- | --------------------------- | ----------------------------- |
| 01 Inicio                 | 2016:1184  | 2017:1191                   | `/`                           |
| 02 Catálogo (con filtros) | 2006:395   | 2005:374 · filtros 2005:662 | `/catalogo?categoria=&marca=` |
| 12 Menú                   | —          | 2060:2101                   | componente del header         |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 26-10-2026 (`compartido/api/esquema.d.ts` regenerado desde `main` del backend): **Sí**,
con un parámetro simulado.

- Reales: `GET /api/tienda/productos` (`categoriaId`, `marcaId`, `pagina`, `limite`),
  `GET /api/tienda/categorias`, `GET /api/tienda/marcas` y `GET /api/tienda/packs` (banner).
- Simulado (`compartido/api/simulado/tienda.ts`, solo con `API_SIMULADA=1`): el parámetro
  `orden=mas-vendidos|novedades` en `GET /api/tienda/productos`, para las filas «Más vendidos» y
  «Novedades». Forma propuesta al backend: mismo listado y misma respuesta, con `orden` opcional
  (sin `orden`, por nombre como hoy). Mientras no exista, la ruta simulada devuelve el listado real
  por nombre; sin la API simulada el backend responde 400 y las dos filas no se muestran.
- El Swagger no declara las respuestas: los tipos están en `compartido/api/respuestas.ts`
  (`ProductoTienda`, `ListadoTienda`, `CategoriaTienda`, `MarcaTienda`, `PackTienda`).

## Notas de trabajo

- **PR:** https://github.com/Contrum-Projects/Frontend/pull/3 (En revisión desde el 26-10-2026).
- **Decisiones con el usuario (26-10):** las filas usan `?orden=` simulado; el banner de
  promociones muestra el pack vigente que vence antes (los packs son las promociones del backend) y
  no aparece si no hay packs; los enlaces a páginas que aún no existen se ponen igual
  (`tienda/diseno/enlaces.ts`, con `as Route` y un TODO por historia).
- **Fuera de esta historia:** botón del carrito en la tarjeta y número del carrito (SCRUM-116),
  newsletter del footer (SCRUM-138), filtros laterales del catálogo (SCRUM-107), cerrar sesión en
  el menú (SCRUM-95), tarjeta profesional (SCRUM-109).
- **«Cargar más productos»** es un enlace a `?pagina=N`: el servidor pide las páginas 1 a N (12 por
  página, hasta 20 páginas). Funciona sin JavaScript y mantiene el precio minorista de visitante en
  todas las páginas.
- **Diferencias con Figma:** la tarjeta no muestra «2 formatos · desde 300 ml» (la API del listado no
  lo entrega); el título del banner usa `display-celular` (40 px) en escritorio porque Figma usa 48 px
  sin token; el fondo `#efe4d2` de Figma (sin token) se reemplazó por `fondo-hueso-oscuro`; las
  marcas del inicio también se ven en celular (el criterio 1 las pide).
- **Para el backend:** (1) agregar `orden=mas-vendidos|novedades` a `GET /tienda/productos`;
  (2) declarar las respuestas en Swagger (`@ApiOkResponse({ type })`); (3) si la tarjeta debe mostrar
  formatos y contenido, el listado tendría que traerlos.
- **Pendiente para «Hecha»:** probar con el backend real sin la ruta simulada (cuando exista `orden`).
  Una categoría o marca inexistente muestra la página 404, pero con estado HTTP 200: `notFound()`
  ocurre dentro de `<Suspense>`, después de enviar la cabecera (limitación del streaming).
