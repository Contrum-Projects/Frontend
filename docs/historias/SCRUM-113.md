# SCRUM-113 · E11-H4 · Ajustes y transferencias de stock

**Orden:** 21 de 53 · **Puntos:** 2 · **Historia backend:** SCRUM-39 · **API:** Parcial

**Necesita antes (frontend):** [SCRUM-112](SCRUM-112.md)  
**La necesitan después:** ninguna

Como Personal de tienda, necesito ajustar y transferir stock desde el panel, con la finalidad de corregir conteos y ordenar la bodega.

**Historia backend:** SCRUM-39 · **Figma:** P5c Registrar salida (ajuste y transferencia)

## Criterios de aceptación

1. **Ajuste.** El personal elige «Ajuste». Cuando ingresa cantidad positiva o negativa y guarda. El stock se actualiza y el movimiento aparece en el historial.
2. **Transferencia.** El personal elige origen, destino y cantidad. Cuando guarda. El stock cambia en ambas ubicaciones.
3. **Sin stock.** La cantidad supera el origen. Cuando el servidor la rechaza. La pantalla muestra el error.

## Pantalla y ruta

| Pantalla             | Escritorio                | Celular   | Ruta                                    |
| -------------------- | ------------------------- | --------- | --------------------------------------- |
| P5c Registrar salida | 2043:1689 (panel lateral) | 2044:1209 | panel lateral sobre `/panel/inventario` |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 01-11-2026 (`compartido/api/esquema.d.ts` de `main` y repo del backend): **Parcial**.

| Uso                                   | Endpoint                                                        | Estado                                                                                                                  |
| ------------------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Registrar ajuste (CA1, CA3)           | `POST /api/inventario/ajustes` (`CrearAjusteDto`)               | Real. El Swagger no declara la respuesta (`AjusteRegistrado` de `ajustes.service.ts`, en `respuestas.ts`)               |
| Registrar transferencia (CA2, CA3)    | `POST /api/inventario/transferencias` (`CrearTransferenciaDto`) | Real. El Swagger no declara la respuesta (`TransferenciaRegistrada` de `transferencias.service.ts`, en `respuestas.ts`) |
| Ubicaciones con stock del formato     | `GET /api/inventario/stock/formatos/{id}`                       | Real (E11-H5). Respuesta en `respuestas.ts` (`StockFormato`)                                                            |
| Ubicaciones activas (destino, ajuste) | `GET /api/inventario/ubicaciones`                               | **Simulado** desde SCRUM-111 (pedido a SCRUM-37)                                                                        |
| Buscar formatos                       | `GET /api/catalogo/formatos?buscar=`                            | Simulado desde SCRUM-105                                                                                                |

## Notas de trabajo

<!-- Decisiones, preguntas abiertas y lo que quedó pendiente. Lo completa /historia. -->

**01-11-2026 (/historia):**

- **Mismo formulario que la salida:** «Ajuste» y «Transferencia» son chips de «Tipo de
  movimiento» en «Registrar salida» (Figma P5c 2043:1951 y 2044:1209), en el panel lateral de
  escritorio y en `/panel/inventario/salidas/nueva` en celular. Figma no dibuja sus campos: siguen
  la disposición de la salida. El título queda «Registrar salida»; el botón cambia según el tipo
  («Registrar ajuste», «Registrar transferencia») y la leyenda pasa a «Un movimiento nunca puede
  dejar el stock bajo cero.» (decidido con el usuario).
- **Ajuste:** chips «Sumar / Descontar» (etiqueta «Diferencia») y una cantidad positiva; el
  frontend envía +n o −n, para no escribir «−» en el teclado numérico del celular. «Motivo»
  obligatorio (CrearAjusteDto). La ubicación ofrece las que tienen stock del formato (también
  desactivadas, que el backend acepta) y las demás activas como «stock 0», porque un conteo puede
  encontrar unidades donde no había registro (decidido con el usuario).
- **Transferencia:** «Ubicación de origen» (las que tienen stock, como la salida), «Ubicación de
  destino» (activas, sin la de origen; se habilita después del origen y, si el origen pasa a ser
  el destino elegido, se vuelve a elegir), cantidad y comentario opcional.
- **Disposición:** en el ajuste y la transferencia los campos van uno bajo otro, también en
  escritorio: en el panel lateral (~400 px) dos selectores de ubicación lado a lado recortaban el
  código y el stock (revisión de diseño). «Diferencia» va justo antes de «Cantidad». El motivo
  lleva `aria-required` sin asterisco (el formulario marca lo opcional). Los avisos dicen «Queda
  1» o «Quedan N».
- **Pendiente fuera de esta historia (revisión de diseño):** el foco de los chips y de `Button`
  usa `ring-ring/60` (acento), que no llega a 3:1 sobre fondos claros; y `CampoFormulario` deja
  6 px (`gap-1.5`) entre etiqueta y control, fuera de la escala. Conviene corregirlo en los
  componentes base.
- **Sin cálculo de stock (RNF-03):** el aviso usa `stockResultante` del ajuste y `origen.stock` /
  `destino.stock` de la transferencia. Si no alcanza, el 400 del backend queda junto a la cantidad
  (CA3). «La ubicación o su bodega está desactivada…» en una transferencia va al destino (es la
  única que el backend exige activa).
- **CA1 «el movimiento aparece en el historial»:** el historial es la pestaña Movimientos de
  SCRUM-114, que aún no existe. Aquí se invalida el stock (`CLAVE_STOCK`); SCRUM-114 debe
  invalidar también sus movimientos al registrar.
- **Pedido a SCRUM-39:** declarar en el Swagger las respuestas 201 de ajustes y transferencias, y
  el `type: string` de `observacion` en `CrearTransferenciaDto` (hoy sale como objeto).
- **Pruebas:** `panel/inventario/salidas.test.tsx`, «Ajustes y transferencias (SCRUM-113)».
- Pendiente para «Hecha»: probar con el backend real (el destino depende de
  `GET /inventario/ubicaciones`, simulado) y revisar a 1440 y 360 px (no hubo navegador en esta
  sesión).
