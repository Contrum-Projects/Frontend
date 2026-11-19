# Cabello Perfecto — Frontend

Tienda online y panel de administración de Cabello Perfecto, una tienda de productos capilares
que vende a público general y a peluqueros profesionales. Es una sola aplicación Next.js que
consume la API REST del [backend](https://github.com/Contrum-Projects/Backend). Es el proyecto
de título del equipo Contrum-Projects.

## Funcionalidades

**Tienda** (`app/(tienda)`, componentes en `tienda/`)

- Portada con slides, catálogo por categorías y marcas, búsqueda con filtros, ficha de producto y
  packs.
- Registro con confirmación de correo, inicio de sesión, recuperación de contraseña, datos,
  direcciones y facturación.
- Carrito (también para visitantes), checkout con retiro en tienda o despacho Chilexpress,
  cupones y pago con Mercado Pago.
- Seguimiento de pedidos, suscripción a ofertas y baja de la publicidad.
- Precio profesional: verificación como peluquero y precio mayorista solo para profesionales.
- Páginas de ayuda, términos y condiciones y política de privacidad.

**Panel de administración** (`app/panel`, componentes en `panel/`)

- Resumen e indicadores (objetivos OE1 a OE3) y exportación de ventas.
- Productos, formatos, fotos, packs, marcas, categorías y portada.
- Inventario: bodegas, proveedores, entradas, salidas, ajustes, transferencias y movimientos.
- Pedidos, facturas, clientes, verificación de peluqueros, campañas, cupones y personal.

Cada pantalla y su ruta están en [`docs/pantallas.md`](docs/pantallas.md).

## Stack

| Pieza       | Elección                                                                      |
| ----------- | ----------------------------------------------------------------------------- |
| Framework   | Next.js 16 (App Router, Turbopack, Cache Components), React 19, TypeScript 6  |
| Estilos     | Tailwind CSS 4 con los tokens de Figma; shadcn/ui (Radix) en `compartido/ui`  |
| API         | openapi-fetch con tipos generados del Swagger; TanStack Query en el navegador |
| Formularios | react-hook-form + zod                                                         |
| Pruebas     | Vitest + Testing Library                                                      |
| Calidad     | ESLint (next/core-web-vitals), Prettier, GitHub Actions y gitleaks            |

## Cómo se conecta con el backend

```
Navegador ──/api/...──▶ Next.js (app/api/[...ruta]) ──▶ Backend NestJS :3000 /api/...
```

El navegador habla solo con Next. `app/api/[...ruta]/route.ts` es un proxy hacia el backend: así
la cookie de refresco (`SameSite=Strict`) funciona sin CORS, igual en desarrollo y en producción.
El token de acceso vive en memoria. Los precios, el stock y los permisos los calcula el backend:
el frontend solo los muestra. Más detalle en [`docs/arquitectura.md`](docs/arquitectura.md).

## Requisitos

- Node.js 22 o superior y pnpm 11 (`corepack enable`)
- El [backend](https://github.com/Contrum-Projects/Backend) corriendo en `http://localhost:3000`

## Puesta en marcha (desarrollo)

```bash
pnpm install
cp .env.example .env.local
pnpm dev                 # http://localhost:3001
```

- `http://localhost:3001` es la tienda; `http://localhost:3001/panel` es el panel (entra en
  `/ingresar` con la cuenta admin que crea la semilla del backend).
- `http://localhost:3001/muestrario` (solo en desarrollo) muestra los tokens y componentes base.

## Variables de entorno

Están en [`.env.example`](.env.example). El frontend no guarda secretos: todo es público o una
URL.

| Variable                | Para qué                                                               |
| ----------------------- | ---------------------------------------------------------------------- |
| `API_URL`               | URL del backend, sin `/api`. Solo la lee el servidor de Next           |
| `NEXT_PUBLIC_URL_SITIO` | URL pública de la tienda, para metadatos y enlaces. Se usa al compilar |
| `URL_IMAGENES`          | Dominio público de las imágenes del catálogo (Cloudflare R2)           |
| `API_SIMULADA`          | `1` responde con la API simulada las rutas que el backend aún no tiene |

## Comandos

| Comando          | Qué hace                                                               |
| ---------------- | ---------------------------------------------------------------------- |
| `pnpm dev`       | Servidor de desarrollo en el puerto 3001                               |
| `pnpm build`     | Compila para producción                                                |
| `pnpm start`     | Sirve la versión compilada en el puerto 3001                           |
| `pnpm verificar` | Lint, formato, tipos, pruebas y build: debe pasar antes de cada commit |
| `pnpm test`      | Pruebas (`pnpm test:watch` para dejarlas corriendo)                    |
| `pnpm api:tipos` | Regenera `compartido/api/esquema.d.ts` desde el Swagger del backend    |
| `pnpm format`    | Formatea con Prettier (también ordena las clases de Tailwind)          |

## Despliegue

En el servidor, la tienda corre en Docker junto con la API, detrás de nginx, en un solo
subdominio. Los pasos están en
[`despliegue/README.md` del backend](https://github.com/Contrum-Projects/Backend/blob/main/despliegue/README.md).

Para actualizar la tienda después de un merge a `main`:

```bash
cd ~/cabello-perfecto/cp-frontend && git pull
cd ../cp-backend/despliegue && docker compose build tienda && docker compose up -d tienda
```

## Estructura

```
app/
  (tienda)/        # rutas de la tienda
  panel/           # rutas del panel de administración
  api/[...ruta]/   # proxy hacia el backend
tienda/            # componentes y lógica de la tienda, por área
panel/             # componentes y lógica del panel, por área
compartido/        # cliente de la API, sesión, componentes ui, formato y configuración
docs/              # arquitectura, diseño, pantallas e historias
```

## Documentación

- [CLAUDE.md](CLAUDE.md): reglas del proyecto (también las sigue Claude Code).
- [docs/arquitectura.md](docs/arquitectura.md): proxy `/api`, sesión, datos, despliegue.
- [docs/diseno.md](docs/diseno.md): tokens y componentes de Figma, criterios de contenido.
- [docs/pantallas.md](docs/pantallas.md): historias, nodos de Figma y rutas.
- [docs/historias](docs/historias/README.md): tablero del frontend y una ficha por historia.
- [docs/api-simulada.md](docs/api-simulada.md): cómo avanzar sin el endpoint del backend.

## Flujo de trabajo

Una rama por historia desde `main` (`SCRUM-<n>-<descripcion>`), commits en español con la clave de
la historia y pull request revisado por otro integrante. Nadie hace push a `main`. La CI corre
lint, formato, tipos, pruebas, build y gitleaks en cada pull request.

## Claude Code

Con el repo abierto en Claude Code:

- `/siguiente` muestra el avance del tablero y la próxima historia que se puede tomar.
- `/historia SCRUM-93` lee la historia desde `docs/historias/`, revisa su API y su pantalla de
  Figma, crea la rama e implementa con pruebas.
- `/pr` abre el pull request y `/revisar` revisa una rama o PR (código, diseño, seguridad y
  criterios).
- `/api-tipos` actualiza los tipos cuando cambia el backend.

El backlog del frontend está en [docs/historias](docs/historias/README.md) (copia local de Jira con
el orden y el estado de cada historia), así que no hace falta Jira para trabajar. Para pantallas
cuyo endpoint aún no existe, usa la [API simulada](docs/api-simulada.md) (`API_SIMULADA=1`).

Los conectores de Figma y Jira (Atlassian) están en `.mcp.json`; la primera vez cada integrante
inicia sesión con `/mcp`. Jira solo se usa con `/sincronizar-jira`.
