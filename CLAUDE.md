# Cabello Perfecto — Frontend

Tienda online y panel de administración de Cabello Perfecto (productos capilares): catálogo con
precio minorista y precio profesional, carrito y compra con Mercado Pago, despacho con Blue
Express, cuenta del cliente y verificación de peluqueros; y el panel del personal para catálogo,
pedidos, inventario, verificaciones, campañas y reportes. Una sola app Next.js que consume la API
REST del backend (repo Contrum-Projects/Backend). Proyecto de título del equipo Contrum-Projects
(3 integrantes), con Scrumban y sprints en Jira.

**Idioma:** responde, comenta y nombra en español. Identificadores sin tildes ni ñ
(`campana`, `pequeno`); textos para personas, con tildes y en el tono de Figma (tú, frases cortas).

@AGENTS.md

## Antes de implementar

1. La historia está en Jira, proyecto **SCRUM** (etiqueta `frontend`). Léela entera: trae los
   criterios de aceptación, su **historia backend** y la **pantalla de Figma**.
2. Lee la historia backend y su endpoint en el Swagger (`compartido/api/esquema.d.ts` o
   http://localhost:3000/api/docs). Si falta el endpoint o no hace lo que la pantalla necesita,
   **avísalo**: no inventes la respuesta ni la lógica en el frontend.
3. Abre la pantalla en Figma con el MCP de Figma (nodos en `docs/pantallas.md`) y respeta
   `docs/diseno.md`. Mira ambas versiones: escritorio (1440) y celular (390).
4. Las reglas de negocio están en el backend: `docs/reglas-de-negocio.md` de Contrum-Projects/Backend
   (`gh api -H "Accept: application/vnd.github.raw" repos/Contrum-Projects/Backend/contents/docs/reglas-de-negocio.md`).
5. Si algo no lo define la historia, Figma ni el backend, **pregunta**. No inventes reglas, textos
   legales, listas de estados ni contenido.

## Stack

| Pieza                                                | Uso                                                               |
| ---------------------------------------------------- | ----------------------------------------------------------------- |
| Next.js 16 (App Router, Turbopack, Cache Components) | Rutas en `app/`; Server Components por defecto                    |
| React 19, TypeScript 6                               | `'use client'` solo donde hay estado, efectos o eventos           |
| Tailwind CSS 4                                       | Tema con los tokens de Figma en `app/globals.css`                 |
| shadcn/ui (Radix)                                    | Componentes base copiados en `compartido/ui/` y adaptados a Figma |
| openapi-fetch + openapi-typescript                   | Cliente tipado desde el Swagger (`pnpm api:tipos`)                |
| TanStack Query 5                                     | Datos del navegador: cuenta, carrito, panel                       |
| react-hook-form + zod                                | Formularios y validación (mensajes en español)                    |
| lucide-react                                         | Íconos (trazo 1,75 como en Figma)                                 |
| Vitest + Testing Library                             | Pruebas (`*.test.ts(x)` junto al código)                          |
| ESLint (next/core-web-vitals) + Prettier             | Lint y formato                                                    |

## Comandos

```bash
pnpm dev               # http://localhost:3001 (el backend corre en :3000)
pnpm verificar         # lint + formato + tipos + pruebas + build: debe pasar antes de cada commit
pnpm test              # pruebas;  pnpm test -- sesion  para filtrar
pnpm api:tipos         # regenera compartido/api/esquema.d.ts desde el Swagger del backend
pnpm dlx shadcn@latest add <componente>   # agrega un componente base a compartido/ui
```

`/muestrario` (solo en desarrollo) muestra los tokens y componentes base para comparar con Figma.

## Estructura

```
app/                     # solo rutas: page, layout, loading, error, route
  (tienda)/              # tienda pública y cuenta del cliente
  panel/                 # panel de administración (personal de tienda)
  api/[...ruta]/route.ts # proxy al backend; no se toca para agregar endpoints
  (dev)/muestrario/      # tokens y componentes (solo desarrollo)
tienda/<area>/           # componentes y hooks de la tienda (catalogo, carrito, cuenta…)
panel/<area>/            # componentes y hooks del panel (pedidos, inventario…)
compartido/
  ui/                    # componentes base (shadcn adaptado a Figma)
  api/                   # cliente.ts (navegador), servidor.ts (Server Components), errores.ts,
                         # esquema.d.ts (generado), respuestas.ts (tipos aún no documentados)
  sesion/                # sesión (token en memoria), roles y permisos
  formato/               # pesos, fechas y RUT
  config/                # variables de entorno validadas con zod
docs/                    # diseno.md, pantallas.md, arquitectura.md
```

Las rutas propuestas para cada historia están en `docs/pantallas.md`. Las páginas de `app/` quedan
delgadas: importan componentes de `tienda/` o `panel/`.

## Reglas de arquitectura

- **El backend decide (RNF-03, RNF-04).** El frontend no calcula precios, IVA, totales, stock ni
  permisos: muestra lo que entrega la API. Ocultar un botón según el rol es comodidad, no seguridad.
- **Llamadas a la API:**
  - En el navegador, `api` de `compartido/api/cliente.ts` (agrega el token y renueva la sesión).
    Envuélvela en TanStack Query y usa `exigir()` para convertir errores en `ErrorDeApi`.
  - En Server Components, `apiServidor()` de `compartido/api/servidor.ts`, **solo datos públicos**
    (catálogo para SEO). Nunca datos de una cuenta ni precio profesional.
  - Nunca `fetch` directo al backend desde el navegador: todo va por `/api/...` (el proxy).
- **Cache Components:** toda lectura de la API en un Server Component va dentro de `<Suspense>`
  con un esqueleto; si no, `next build` intenta llamar al backend. No uses `'use cache'` con
  precios, stock ni datos de cuentas (RNF-30).
- **Sesión:** el token de acceso vive en memoria (`compartido/sesion`). Nunca en localStorage,
  sessionStorage ni cookies propias. Usa `useSesion()`; con estado `desconocida`, muestra esqueleto.
- **Tipos de la API:** usa los de `esquema.d.ts`. Si el Swagger no declara la respuesta, agrega el
  tipo en `compartido/api/respuestas.ts` citando el archivo del backend, y avisa para documentarlo.
- **URLs con `codigoPublico`** (cuenta) y código del pedido, nunca ids correlativos.
- **Errores:** muestra los mensajes del backend (ya vienen en español). Un 5xx nunca muestra
  detalles técnicos. Formularios: el error junto a su campo, sin perder lo escrito.
- **Celular primero (RNF-25, RNF-17):** cada pantalla funciona a 360 px sin desplazamiento
  horizontal; imágenes con `next/image` y tamaño reservado (sin saltos de diseño).
- **Accesibilidad:** HTML semántico, un `h1` por página, etiquetas en todos los campos, foco
  visible, contraste AA. `marca/acento` nunca con texto blanco.
- **Sin HTML crudo:** nada de `dangerouslySetInnerHTML` (ni para descripciones de IA).

## Diseño

- Usa los tokens de `app/globals.css` (`bg-marca-profundo`, `text-texto-secundario`,
  `titulo-h1`, `texto-etiqueta`…) y los componentes de `compartido/ui`. Nada de colores, tamaños
  de letra o radios sueltos (`#0b3b3a`, `text-[17px]`).
- Espaciado solo con la escala de Figma: 1, 2, 3, 4, 6, 8, 12, 16 (4 a 64 px).
- Antes de crear un componente, busca si ya existe en `compartido/ui` o en Figma › Componentes.
- Criterios de contenido de `docs/diseno.md`: tienda y no landing, «IVA incluido» solo en ficha,
  carrito y checkout, sin sobretítulos decorativos, estados vacíos sin promesas que no existen.

## Pruebas

- Cada criterio de aceptación con al menos una prueba que lo nombra:
  `it('E1-H1 FE · correo ya registrado: muestra el error junto al campo', ...)`.
- Componentes con Testing Library (lo que la persona ve y hace, no detalles internos); simula la
  API en el borde (`vi.stubGlobal('fetch', …)` o un cliente de prueba).
- Corre `pnpm verificar` antes de cada commit. No marques nada como listo si falla.

## Flujo de trabajo (Scrumban)

- Jira: sitio Contrum Projects, proyecto **SCRUM**, cloudId `bc9de2c3-63ac-4379-8782-8b69ef593475`.
  Historias de frontend con etiqueta `frontend`. Columnas: Por hacer → En curso → En revisión →
  Finalizado. Puntos en `customfield_10016`, sprint en `customfield_10020`. Una historia a la vez.
- Una rama corta por historia desde `main`: `SCRUM-<n>-<descripcion-corta>` (ej.
  `SCRUM-93-registro`). Vuelve a `main` con un pull request revisado por otro integrante.
- Commits en español con Conventional Commits y la clave de Jira:
  `feat(cuentas): pantalla de registro con confirmación de correo (SCRUM-93)`.
- Nunca hagas push a `main`, `push --force`, ni merge de PR: eso lo hace el equipo.
- Comandos: `/historia SCRUM-<n>`, `/pr`, `/revisar`, `/api-tipos`.
- Los commits y PRs son del integrante que los firma: no agregues `Co-Authored-By`,
  `Claude-Session`, «Generated with Claude Code» ni ninguna otra mención a Claude en mensajes de
  commit ni en descripciones de PR.

## No hacer

- No leas ni edites `.env*` (salvo `.env.example`). Variables nuevas: `compartido/config/` y
  `.env.example`. El frontend no guarda secretos: si algo necesita una clave, va en el backend.
- No edites `compartido/api/esquema.d.ts` (se genera con `pnpm api:tipos`).
- No agregues dependencias sin decirlo y justificarlo.
- No registres en consola tokens, contraseñas ni datos personales.
