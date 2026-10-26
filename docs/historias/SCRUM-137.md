# SCRUM-137 · E10-H5 · Pantalla Perfil profesional

**Orden:** 45 de 53 · **Puntos:** 2 · **Historia backend:** SCRUM-66 · **API:** No

**Necesita antes (frontend):** [SCRUM-136](SCRUM-136.md)  
**La necesitan después:** ninguna

Como un Peluquero verificado, necesito completar mi perfil profesional, con la finalidad de que la tienda conozca mi actividad.

**Historia backend:** SCRUM-66 · **Figma:** 08 Verificación profesional (perfil)

## Criterios de aceptación

1. **Guardar perfil.** El peluquero ingresa años de experiencia, modalidad, especialidades y, si quiere, lugar de trabajo. Cuando guarda. La pantalla confirma y muestra el perfil.
2. **Datos faltantes.** Falta un dato obligatorio. Cuando guarda. La pantalla señala el campo.
3. **Sin verificación.** La cuenta no está verificada. Cuando abre su cuenta. La opción de perfil profesional no aparece.

**Nota:** las listas de modalidades y especialidades siguen por definir.

## Pantalla y ruta

| Pantalla               | Escritorio | Celular   | Ruta                         |
| ---------------------- | ---------- | --------- | ---------------------------- |
| 08c Perfil profesional | 2038:2666  | 2038:5397 | `/cuenta/perfil-profesional` |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 26-10-2026 (`compartido/api/esquema.d.ts` de `main`): **No**. Aún no existe en el Swagger.

Si falta el endpoint, avanza con la API simulada (`docs/api-simulada.md`) y anota aquí qué
formato de respuesta acordaste con quien hace la historia backend.

## Notas de trabajo

<!-- Decisiones, preguntas abiertas y lo que quedó pendiente. Lo completa /historia. -->
