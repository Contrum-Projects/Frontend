# SCRUM-99 · E13-H2 · Menú y rutas del panel según el rol

**Orden:** 7 de 53 · **Puntos:** 5 · **Historia backend:** SCRUM-25 · **API:** Sí

**Necesita antes (frontend):** [SCRUM-94](SCRUM-94.md)  
**La necesitan después:** [SCRUM-98](SCRUM-98.md), [SCRUM-103](SCRUM-103.md), [SCRUM-100](SCRUM-100.md), [SCRUM-110](SCRUM-110.md), [SCRUM-130](SCRUM-130.md), [SCRUM-135](SCRUM-135.md), [SCRUM-140](SCRUM-140.md), [SCRUM-143](SCRUM-143.md)

Como un Administrador, necesito que el panel muestre solo lo que cada rol puede usar, con la finalidad de evitar acciones no autorizadas desde la interfaz.

**Historia backend:** SCRUM-25 · **Figma:** Panel · Escritorio y Panel · Celular (menú lateral, navegación inferior)

## Criterios de aceptación

1. **Opciones por rol.** El usuario del personal inicia sesión. Cuando se carga el panel. El menú muestra solo las secciones permitidas a su rol.
2. **Acceso denegado.** El servidor responde 403. Cuando la interfaz lo recibe. Muestra un aviso de falta de permiso y no cambia datos en pantalla.
3. **Cliente en el panel.** Una cuenta cliente o profesional abre la dirección del panel. Cuando carga. Se la redirige a la tienda.

**Nota:** el frontend solo oculta opciones; quien autoriza es el backend. Los permisos de vendedor y bodeguero siguen por definir.

## Pantalla y ruta

| Pantalla   | Escritorio | Celular  | Ruta     |
| ---------- | ---------- | -------- | -------- |
| P1 Resumen | 2028:470   | 2023:206 | `/panel` |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 28-10-2026: **Sí**. No hace falta un endpoint propio: el rol llega en `usuario.rol` al
iniciar sesión y al renovarla (`POST /api/cuentas/sesion`, `POST /api/cuentas/sesion/renovar`).
La matriz de permisos es la de backend `src/common/dominio/permisos.ts` (SCRUM-25, acordada el
19-10-2026), copiada en `compartido/sesion/roles.ts`. Cada endpoint del panel responde 403 si el
rol no tiene el permiso. Sin rutas simuladas.

## Notas de trabajo

- **PR:** [Contrum-Projects/Frontend#12](https://github.com/Contrum-Projects/Frontend/pull/12)
- **Permisos de vendedor y bodeguero:** la nota de Jira («siguen por definir») quedó
  desactualizada. La matriz se acordó el 19-10-2026 en SCRUM-25 y es la que usa el menú.
- **Menú por permiso, no por rol.** `panel/diseno/secciones.ts` dice qué permiso pide cada
  sección (el mismo que exigen sus endpoints). Algunas páginas piden uno propio:
  `/panel/inventario/proveedores` (`proveedores.gestionar`), `/panel/inventario/entradas`
  (`inventario.registrar`), `/panel/packs` y `/panel/marcas-y-categorias` (`catalogo.gestionar`).
  Las próximas historias del panel agregan aquí su ruta si pide otro permiso.
- **Acceso denegado:** una sección que el rol no tiene muestra «No tienes acceso a esta sección»
  en lugar de la página. Un 403 del backend muestra su mensaje como aviso (toast) desde
  `compartido/proveedores.tsx`, para todas las consultas y acciones, sin invalidar datos.
- **Cliente en el panel:** cliente y profesional van a la tienda; sin sesión, a
  `/ingresar?volver=…`. El cierre de sesión sigue a «Mi cuenta» (en este dispositivo, a la
  tienda; en todos, a ingresar).
- **Resumen:** solo el título. Los indicadores y tablas de Figma llegan con SCRUM-130 (pedidos),
  SCRUM-135 (verificaciones) y SCRUM-115 (stock bajo); no hay endpoints y el equipo prefirió no
  simularlos (28-10-2026). La búsqueda del panel tampoco tiene endpoint ni historia.
- **«Más» en celular:** Figma no tiene la hoja abierta. Es una hoja desde abajo con las secciones
  del rol que no caben en la barra, la persona y «Cerrar sesión» (decisión del 28-10-2026).
- **Aviso de 403 solo en el panel:** en la tienda cada formulario muestra su error junto al
  campo (los endpoints de cuenta también declaran 403), así que el aviso global no se repite ahí.
- El menú lateral se muestra desde 1024 px (`lg`); más angosto, barra superior y navegación
  inferior.
