# SCRUM-141 · E12-H5 · Tarjeta del saludo de cumpleaños

**Orden:** 49 de 53 · **Puntos:** 1 · **Historia backend:** SCRUM-72 · **API:** No

**Necesita antes (frontend):** [SCRUM-140](SCRUM-140.md)  
**La necesitan después:** ninguna

Como un Administrador, necesito activar el saludo de cumpleaños y decidir si lleva oferta, con la finalidad de fidelizar a los clientes.

**Historia backend:** SCRUM-72 · **Figma:** P7 Campañas (tarjeta del saludo de cumpleaños)

## Criterios de aceptación

1. **Activar.** El administrador abre «Campañas». Cuando activa el saludo. La tarjeta muestra el estado activo.
2. **Oferta opcional.** El saludo está activo. Cuando el administrador activa o quita la oferta. La tarjeta lo refleja y guarda el cambio.

**Nota:** qué es la oferta del saludo sigue por definir.

## Pantalla y ruta

| Pantalla                                | Escritorio                        | Celular               | Ruta                                       |
| --------------------------------------- | --------------------------------- | --------------------- | ------------------------------------------ |
| P7 Campañas · P7a Nueva · P7b Confirmar | 2045:1569 · 2046:1646 · 2046:1846 | 2047:1225 · 2047:1323 | `/panel/campanas`, `/panel/campanas/nueva` |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 26-10-2026 (`compartido/api/esquema.d.ts` de `main`): **No**. Aún no existe en el Swagger.

Comprobado el 5-11-2026: el backend solo tiene `TIPOS_CAMPANA.CUMPLEANOS` y
`usuario.fecha_nacimiento`; no hay endpoint. Se trabaja con la **API simulada**
(`compartido/api/simulado/panelCampanas.ts`), con esta forma propuesta a SCRUM-72:

- `GET /api/gestion/campanas/cumpleanos` → 200
  `{ activo, incluyeOferta, asunto, programadosEsteMes, porcentajeAperturaUltimoMes | null }`
  (`SaludoCumpleanos` en `compartido/api/respuestas.ts`).
- `PATCH /api/gestion/campanas/cumpleanos` con `{ activo?, incluyeOferta? }` → 200 con el mismo
  objeto ya guardado. 400 si el cuerpo no es válido; 403 sin `campanas.gestionar`.
- Permiso `campanas.gestionar`. Las cifras (programados del mes, apertura del mes anterior) las
  cuenta el backend.

## Notas de trabajo

**5-11-2026 (rama `SCRUM-141-saludo-cumpleanos`).** PR: https://github.com/Contrum-Projects/Frontend/pull/65

- Tarjeta `panel/campanas/tarjetaCumpleanos.tsx` en «Campañas»: a la derecha de la lista en
  escritorio (columna de 20 rem) y sobre la lista en celular. Tiene su propia consulta: se ve
  aunque la lista falle o siga cargando.
- Decisiones con el usuario: API simulada con la forma de arriba; se muestran asunto, «Este mes»
  y «Último mes» desde la API, **sin «Editar mensaje»** (no hay historia ni pantalla para
  editarlo); «Incluir oferta» **sin subtítulo** (el «Decide el administrador» de Figma es relleno
  y la oferta sigue por definir); en celular la **tarjeta completa** en vez del resumen compacto
  de Figma (2047:1288), porque la oferta también tiene que poder cambiarse ahí.
- Los interruptores guardan al tocarlos (como la tarjeta de ofertas de E12-H2). Mientras guarda,
  muestran lo pedido y se deshabilitan; si el backend rechaza, vuelven a lo guardado y su mensaje
  aparece en la tarjeta. «Incluir oferta» se deshabilita con el saludo inactivo (criterio 2: «El
  saludo está activo»).
- Apertura `null` (sin envíos el mes anterior) se muestra «—», como en la lista de campañas.
- La descripción («Se envía una vez al año, el día del cumpleaños…») es el texto de Figma
  (nodo 2045:1745) y coincide con «Saludo de cumpleaños anual» de las reglas del backend.
- Revisiones (5-11-2026): seguridad sin hallazgos que bloqueen (la ruta simulada ahora devuelve
  solo `activo` e `incluyeOferta`); criterios cumplidos; diseño revisado solo contra el código
  (el revisor no tuvo acceso a Figma). Se corrigieron: el foco ya no se pierde al guardar (se usa
  `aria-disabled` en vez de `disabled`), alturas del esqueleto, etiqueta de «Incluir oferta»
  atenuada con el saludo inactivo, el título ya no cambia el interruptor, título visible en el
  error de carga y `grid-cols-1` en celular. Se agregaron pruebas de la tarjeta dentro de
  «Campañas» y con la lista en error.
- Sin texto que explique por qué «Incluir oferta» está deshabilitado con el saludo inactivo:
  Figma no lo tiene; agregarlo si el equipo lo define.

**Pendientes / para el backend (SCRUM-72):**

- Acordar la forma de la API de arriba. La ruta `/gestion/campanas/cumpleanos` debe declararse
  antes de `/gestion/campanas/:codigo` (o usar otra ruta) para no confundirse con un código.
- Que el PATCH rechace o ignore campos que no sean `activo` o `incluyeOferta`.
- Qué pasa con `incluyeOferta` al desactivar el saludo (¿se conserva?) y si rechaza
  `incluyeOferta: true` con el saludo inactivo.
- Qué es la oferta del saludo (sigue por definir con la clienta). Cuando se defina, puede
  necesitar más campos en la tarjeta.
- El mensaje del saludo (asunto y cuerpo) y su edición: Figma tiene «Editar mensaje», sin
  historia.
