# SCRUM-170 · Sesión iniciada visible en la tienda y Chilexpress destacado al pagar

**Orden:** 59 de 59 · **Puntos:** sin estimar · **Historia backend:** ninguna (solo frontend) · **API:** Sí

**Necesita antes (frontend):** [SCRUM-106](SCRUM-106.md), [SCRUM-122](SCRUM-122.md)  
**La necesitan después:** ninguna

Observaciones de los profesores (21-11-2026): con la sesión iniciada no se nota en la pantalla con
qué cuenta se está, y al pagar no queda claro que el despacho lo hace Chilexpress.

## Criterios de aceptación (frontend)

1. **Sesión en el header.** Con sesión iniciada, el comprador ve «Hola, <nombre>» y un menú con su
   nombre completo («Cuenta profesional» si corresponde), Mis pedidos, Mis datos, Perfil
   profesional (solo profesionales) y Cerrar sesión. En celular, el ícono con el punto de marca
   abre el mismo menú. El personal sigue viendo «Panel».
2. **Aviso al ingresar.** Al iniciar sesión aparece un aviso breve: «Hola, <nombre>. Iniciaste
   sesión.»
3. **Chilexpress.** En el checkout, «Despacho a domicilio» lleva la etiqueta Chilexpress y el
   texto «Lo enviamos con Chilexpress»; el resumen del checkout y el del carrito dicen
   «Despacho Chilexpress».

## API

Sin cambios: usa la sesión (`POST /api/cuentas/sesion`) y la cotización de despacho que ya existen.

## Notas de trabajo

- 21-11-2026: rama `SCRUM-170-sesion-visible-chilexpress`, sin Figma (sigue los componentes del
  header y del checkout).
