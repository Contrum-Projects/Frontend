# SCRUM-137 · E10-H5 · Pantalla Perfil profesional

**Orden:** 45 de 53 · **Puntos:** 2 · **Historia backend:** SCRUM-66 · **API:** Sí

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

Estado al 04-11-2026: **Sí**, sin rutas simuladas.

- `GET /api/perfil-profesional/yo`: el perfil, **404** si aún no lo completa, 403 sin el rol
  profesional. Ya lo usaba SCRUM-136 (`useMiPerfilProfesional`).
- `PUT /api/perfil-profesional/yo`: crea o reemplaza el perfil entero (`GuardarPerfilProfesionalDto`)
  y responde el perfil. 400 con un mensaje por cada dato que falta o no vale.
- El Swagger no declara la respuesta de ninguno de los dos: `PerfilProfesionalCuenta` está en
  `compartido/api/respuestas.ts`, copiada de `perfil-profesional.service.ts`.

## Notas de trabajo

**Decisiones (04-11-2026, con el usuario):**

- **Listas:** los nombres de las 7 modalidades y las 16 especialidades (en 4 grupos) vienen de la
  «Propuesta: modalidades de trabajo y especialidades del perfil profesional» del equipo. Los
  valores son los de `valores.ts` del backend. Están en `tienda/profesional/opcionesPerfil.ts`
  (un solo lugar para cambiarlos); el `satisfies` avisa si el Swagger cambia la lista. Siguen
  **por validar con la clienta**. Las opciones de Figma eran de ejemplo.
- **Red social (opcional):** se incluye aunque Figma no la tiene, porque el backend la acepta. Qué
  enlaces valen lo decide el backend: su 400 se muestra junto al campo. En el resumen es un
  enlace solo si empieza con `https://`, con `rel="noopener noreferrer"`.
- **Acceso:** «Perfil profesional» en el menú de Mi cuenta (escritorio) y en el menú del celular,
  solo con el rol profesional (criterio 3). Un cliente que abre la URL ve «Primero verifica tu
  cuenta» con el enlace a Verificación, y no se pide el perfil.
- **Al guardar:** vista de lectura con «Guardamos tu perfil profesional.» (recibe el foco), la fecha
  de actualización y «Editar perfil». Con el perfil ya guardado se entra a esa vista. Al editar,
  «Cancelar» vuelve sin cambios. La respuesta del PUT queda en la caché, así la invitación de
  SCRUM-136 desaparece.
- **Página propia** con h1 «Perfil profesional», como decidió SCRUM-136, aunque Figma la dibuja dentro
  de Verificación.
- **Orden de campos:** años y lugar de trabajo en la misma fila (escritorio, como Figma), luego
  modalidad, especialidades y red social. En celular el lugar de trabajo queda segundo y no al
  final como en Figma 2038:5397: es un solo orden de foco para ambas versiones.
- **Un solo botón «Guardar perfil»**, al final del formulario: la grilla lo sube arriba a la
  derecha en escritorio; en celular va al final y a todo el ancho.
- **Chip seleccionable** nuevo en `compartido/ui/chip.tsx`: radio o casilla real con estilo de
  píldora (Figma 2038:2817 y 2038:2821).
- **Validación en el navegador:** años obligatorios, entero de 0 a 40; una modalidad; al menos una
  especialidad; largos máximos (150 y 255). Los mensajes del 400 se asignan a su campo por cómo
  empiezan (`repartirErroresPerfil`).

**Textos sin Figma (por revisar):** «Primero verifica tu cuenta» / «El perfil profesional es para
cuentas verificadas.», «Enlace a tu perfil de Instagram, Facebook o TikTok.», «Guardamos tu perfil
profesional.», «Actualizado el …», los errores del formulario y los títulos de los grupos de
especialidades (de la propuesta).

**Para el backend (SCRUM-66):** declarar en el Swagger la respuesta `PerfilProfesionalCuenta` del GET
y del PUT. Cuando la clienta valide las listas, actualizar `opcionesPerfil.ts` junto con `valores.ts`.
