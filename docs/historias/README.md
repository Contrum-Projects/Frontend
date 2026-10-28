# Tablero del frontend

Copia local de las 53 historias de frontend de Jira (proyecto SCRUM, etiqueta `frontend`), en
el orden del sprint 4 del documento «Orden de las historias por sprint». Cada fila enlaza a su
archivo con los criterios de aceptación completos, la pantalla de Figma, la ruta y la API.

Este archivo reemplaza el tablero de Jira mientras trabajas el frontend: los comandos
`/siguiente`, `/historia` y `/pr` leen y actualizan la columna **Estado**. Toma las historias
en orden: ninguna aparece antes de otra que necesita.

**Estados:** Por hacer → En curso → En revisión → Hecha. **API:** Sí (el endpoint está en
`esquema.d.ts`), Parcial, Revisar (puede que exista; confirmar) o No (usar la API simulada).
La columna API es del 26-10-2026; `/historia` la vuelve a comprobar antes de empezar.

Total: 53 historias, 185 puntos.

| #   | Historia                                                                                 | Pts | Estado      | API     | Backend  | Necesita antes       |
| --- | ---------------------------------------------------------------------------------------- | --- | ----------- | ------- | -------- | -------------------- |
| 1   | [SCRUM-106](SCRUM-106.md) · E2-H1 · Inicio y catálogo por categorías y marcas            | 8   | Hecha       | Sí      | SCRUM-32 | —                    |
| 2   | [SCRUM-94](SCRUM-94.md) · E1-H2 · Pantalla de inicio de sesión                           | 3   | Hecha       | Sí      | SCRUM-20 | SCRUM-106            |
| 3   | [SCRUM-93](SCRUM-93.md) · E1-H1 · Pantallas de registro y confirmación del correo        | 5   | Hecha       | Sí      | SCRUM-19 | SCRUM-94             |
| 4   | [SCRUM-96](SCRUM-96.md) · E1-H4 · Pantallas de recuperación de contraseña                | 3   | Hecha       | Sí      | SCRUM-22 | SCRUM-94             |
| 5   | [SCRUM-95](SCRUM-95.md) · E1-H3 · Cerrar sesión en el dispositivo o en todos             | 2   | Hecha       | Sí      | SCRUM-21 | SCRUM-94             |
| 6   | [SCRUM-97](SCRUM-97.md) · E1-H5 · Mis datos y direcciones                                | 5   | Hecha       | Sí      | SCRUM-23 | SCRUM-94             |
| 7   | [SCRUM-99](SCRUM-99.md) · E13-H2 · Menú y rutas del panel según el rol                   | 5   | Hecha       | Sí      | SCRUM-25 | SCRUM-94             |
| 8   | [SCRUM-98](SCRUM-98.md) · E13-H1 · Pantalla Personal del panel                           | 3   | Hecha       | Sí      | SCRUM-24 | SCRUM-99             |
| 9   | [SCRUM-103](SCRUM-103.md) · E3-H4 · Pantalla de marcas y categorías                      | 3   | Hecha       | Sí      | SCRUM-29 | SCRUM-99             |
| 10  | [SCRUM-100](SCRUM-100.md) · E3-H1 · Panel de productos: listado y formulario             | 8   | Hecha       | Parcial | SCRUM-26 | SCRUM-99             |
| 11  | [SCRUM-101](SCRUM-101.md) · E3-H2 · Tabla de formatos en el producto                     | 5   | Hecha       | Sí      | SCRUM-27 | SCRUM-100            |
| 12  | [SCRUM-102](SCRUM-102.md) · E3-H3 · Fotos por formato en el panel                        | 5   | Hecha       | Sí      | SCRUM-28 | SCRUM-101            |
| 13  | [SCRUM-104](SCRUM-104.md) · E3-H5 · Precios minorista y mayorista en el panel            | 3   | Hecha       | Sí      | SCRUM-30 | SCRUM-101            |
| 14  | [SCRUM-105](SCRUM-105.md) · E3-H6 · Pantalla Pack nuevo                                  | 5   | En curso    | Parcial | SCRUM-31 | SCRUM-102, SCRUM-104 |
| 15  | [SCRUM-107](SCRUM-107.md) · E2-H2 · Búsqueda y filtros del catálogo                      | 5   | Por hacer   | Revisar | SCRUM-33 | SCRUM-106            |
| 16  | [SCRUM-108](SCRUM-108.md) · E2-H3 · Ficha de producto y de pack                          | 5   | Por hacer   | No      | SCRUM-34 | SCRUM-106            |
| 17  | [SCRUM-109](SCRUM-109.md) · E2-H4 · Vista de precio profesional                          | 3   | Por hacer   | Revisar | SCRUM-35 | SCRUM-108            |
| 18  | [SCRUM-110](SCRUM-110.md) · E11-H1 · Pantalla Proveedores                                | 2   | Por hacer   | Sí      | SCRUM-36 | SCRUM-99             |
| 19  | [SCRUM-111](SCRUM-111.md) · E11-H2 · Entradas de inventario                              | 5   | Por hacer   | No      | SCRUM-37 | SCRUM-101, SCRUM-110 |
| 20  | [SCRUM-112](SCRUM-112.md) · E11-H3 · Registrar salidas que no son venta                  | 3   | Por hacer   | No      | SCRUM-38 | SCRUM-111            |
| 21  | [SCRUM-113](SCRUM-113.md) · E11-H4 · Ajustes y transferencias de stock                   | 2   | Por hacer   | No      | SCRUM-39 | SCRUM-112            |
| 22  | [SCRUM-114](SCRUM-114.md) · E11-H5 · Inventario: stock y movimientos                     | 5   | Por hacer   | No      | SCRUM-40 | SCRUM-111            |
| 23  | [SCRUM-115](SCRUM-115.md) · E11-H6 · Avisos de stock bajo en el panel                    | 2   | Por hacer   | No      | SCRUM-41 | SCRUM-114            |
| 24  | [SCRUM-116](SCRUM-116.md) · E5-H1 · Pantalla del carrito                                 | 5   | Por hacer   | No      | SCRUM-43 | SCRUM-108            |
| 25  | [SCRUM-117](SCRUM-117.md) · E5-H2 · Carrito del visitante en el navegador                | 3   | Por hacer   | No      | SCRUM-44 | SCRUM-116            |
| 26  | [SCRUM-119](SCRUM-119.md) · E5-H4 · Aviso del mínimo de 3 unidades del peluquero         | 2   | Por hacer   | No      | SCRUM-46 | SCRUM-109, SCRUM-116 |
| 27  | [SCRUM-126](SCRUM-126.md) · E9-H2 · Pantalla Datos de facturación                        | 3   | Por hacer   | No      | SCRUM-54 | SCRUM-97             |
| 28  | [SCRUM-118](SCRUM-118.md) · E5-H3 · Pantalla de checkout                                 | 5   | Por hacer   | No      | SCRUM-45 | SCRUM-97, SCRUM-116  |
| 29  | [SCRUM-122](SCRUM-122.md) · E7-H1 · Elegir despacho o retiro en el checkout              | 2   | Por hacer   | No      | SCRUM-50 | SCRUM-118            |
| 30  | [SCRUM-123](SCRUM-123.md) · E7-H2 · Cotización del despacho y dirección                  | 3   | Por hacer   | No      | SCRUM-51 | SCRUM-122            |
| 31  | [SCRUM-125](SCRUM-125.md) · E9-H1 · Interruptor «Necesito factura» en el checkout        | 2   | Por hacer   | No      | SCRUM-53 | SCRUM-118, SCRUM-126 |
| 32  | [SCRUM-120](SCRUM-120.md) · E6-H1 · Botón de pago y regreso desde Mercado Pago           | 3   | Por hacer   | No      | SCRUM-47 | SCRUM-118            |
| 33  | [SCRUM-121](SCRUM-121.md) · E6-H2 · Pantalla de resultado del pago                       | 3   | Por hacer   | No      | SCRUM-48 | SCRUM-120            |
| 34  | [SCRUM-129](SCRUM-129.md) · E8-H1 · Mis pedidos y detalle del pedido                     | 3   | Por hacer   | No      | SCRUM-57 | SCRUM-97             |
| 35  | [SCRUM-124](SCRUM-124.md) · E7-H3 · Seguimiento del despacho en el pedido                | 2   | Por hacer   | No      | SCRUM-52 | SCRUM-129            |
| 36  | [SCRUM-128](SCRUM-128.md) · E9-H4 · Descargar el comprobante o la factura                | 1   | Por hacer   | No      | SCRUM-56 | SCRUM-129            |
| 37  | [SCRUM-130](SCRUM-130.md) · E8-H2 · Panel de pedidos: cambio de estado                   | 5   | Por hacer   | No      | SCRUM-58 | SCRUM-99             |
| 38  | [SCRUM-131](SCRUM-131.md) · E8-H3 · Cancelar un pedido pendiente de pago desde el panel  | 1   | Por hacer   | No      | SCRUM-59 | SCRUM-130            |
| 39  | [SCRUM-127](SCRUM-127.md) · E9-H3 · Facturas por emitir y registro de la factura         | 5   | Por hacer   | No      | SCRUM-55 | SCRUM-130            |
| 40  | [SCRUM-132](SCRUM-132.md) · E4-H1 · Sugerencia de IA en el producto nuevo                | 3   | Por hacer   | No      | SCRUM-60 | SCRUM-100            |
| 41  | [SCRUM-133](SCRUM-133.md) · E4-H2 · Aceptar, editar o descartar la sugerencia            | 2   | Por hacer   | No      | SCRUM-61 | SCRUM-132            |
| 42  | [SCRUM-134](SCRUM-134.md) · E10-H1 · Formulario y estados de la verificación profesional | 5   | Por hacer   | No      | SCRUM-62 | SCRUM-97             |
| 43  | [SCRUM-135](SCRUM-135.md) · E10-H3 · Panel de verificaciones: revisión manual            | 5   | Por hacer   | No      | SCRUM-64 | SCRUM-99             |
| 44  | [SCRUM-136](SCRUM-136.md) · E10-H4 · Cuenta profesional activa en la tienda              | 2   | Por hacer   | No      | SCRUM-65 | SCRUM-109, SCRUM-134 |
| 45  | [SCRUM-137](SCRUM-137.md) · E10-H5 · Pantalla Perfil profesional                         | 2   | Por hacer   | No      | SCRUM-66 | SCRUM-136            |
| 46  | [SCRUM-138](SCRUM-138.md) · E12-H1 · Formulario de suscripción a ofertas                 | 2   | Por hacer   | No      | SCRUM-68 | SCRUM-106            |
| 47  | [SCRUM-139](SCRUM-139.md) · E12-H2 · Pantalla Ofertas por correo y baja                  | 2   | Por hacer   | No      | SCRUM-69 | SCRUM-97             |
| 48  | [SCRUM-140](SCRUM-140.md) · E12-H3 · Panel de campañas: redactar, segmentar y enviar     | 8   | Por hacer   | No      | SCRUM-70 | SCRUM-99             |
| 49  | [SCRUM-141](SCRUM-141.md) · E12-H5 · Tarjeta del saludo de cumpleaños                    | 1   | Por hacer   | No      | SCRUM-72 | SCRUM-140            |
| 50  | [SCRUM-143](SCRUM-143.md) · E14-H2 · Reporte de ventas                                   | 3   | Por hacer   | No      | SCRUM-75 | SCRUM-99             |
| 51  | [SCRUM-142](SCRUM-142.md) · E14-H1 · Reporte de objetivos OE1 a OE3                      | 3   | Por hacer   | No      | SCRUM-74 | SCRUM-143            |
| 52  | [SCRUM-144](SCRUM-144.md) · E14-H3 · Reporte de carritos y campañas                      | 3   | Por hacer   | No      | SCRUM-76 | SCRUM-143            |
| 53  | [SCRUM-145](SCRUM-145.md) · E14-H4 · Reporte de formatos con stock bajo                  | 1   | Por hacer   | No      | SCRUM-77 | SCRUM-115, SCRUM-143 |

## Pendientes que bloquean historias

- **Listas por definir:** modalidades y especialidades del perfil profesional (SCRUM-137) y la
  oferta del saludo de cumpleaños (SCRUM-141).

## Volver a Jira

Si el equipo quiere el tablero de Jira al día, `/sincronizar-jira` mueve en Jira las
historias cuyo estado cambió aquí (pide confirmación antes de cada cambio).
