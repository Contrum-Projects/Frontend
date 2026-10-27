# SCRUM-97 · E1-H5 · Mis datos y direcciones

**Orden:** 6 de 53 · **Puntos:** 5 · **Historia backend:** SCRUM-23 · **API:** Parcial

**Necesita antes (frontend):** [SCRUM-94](SCRUM-94.md)  
**La necesitan después:** [SCRUM-126](SCRUM-126.md), [SCRUM-118](SCRUM-118.md), [SCRUM-129](SCRUM-129.md), [SCRUM-134](SCRUM-134.md), [SCRUM-139](SCRUM-139.md)

Como un Cliente, necesito pantallas para editar mis datos y administrar mis direcciones, con la finalidad de mantener mi cuenta al día.

**Historia backend:** SCRUM-23 · **Figma:** 10 Cuenta (Mis datos, Direcciones)

## Criterios de aceptación

1. **Editar datos.** El cliente abre «Mis datos». Cuando modifica y guarda. La pantalla muestra los datos actualizados.
2. **Direcciones.** El cliente abre «Direcciones». Cuando agrega, edita o elimina una y marca una como principal. La lista muestra una sola principal, con región y comuna elegidas de la lista oficial.
3. **RUT repetido.** El servidor informa que el RUT ya está en uso. Cuando el cliente guarda. La pantalla muestra el error junto al campo.
4. **Menú de cuenta.** El cliente está en escritorio o celular. Cuando navega entre pantallas de cuenta. Usa el menú lateral en escritorio o el enlace «Mi cuenta» en celular.

## Pantalla y ruta

| Pantalla                                     | Escritorio | Celular | Ruta            |
| -------------------------------------------- | ---------- | ------- | --------------- |
| 10 Mis datos (datos, direcciones, seguridad) | 2034:2270  | —       | `/cuenta/datos` |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 27-10-2026: **Sí** (`pnpm api:tipos` contra el backend con el PR #26).

Reales (ninguno declara su respuesta en el Swagger; tipos copiados del backend a
`compartido/api/respuestas.ts`: `DatosPersonales` y `DireccionCuenta`):

- `GET /api/cuentas/yo` y `PATCH /api/cuentas/yo` (solo lo enviado; `null` borra un opcional).
  Errores: 400 de validación, 403 RUT de profesional o con verificación en curso, 409 RUT en
  otra cuenta, 429 más de 10 ediciones por hora.
- `GET/POST /api/cuentas/yo/direcciones`, `PATCH/DELETE /api/cuentas/yo/direcciones/{id}` y
  `PATCH /api/cuentas/yo/direcciones/{id}/principal`. La comuna va por su código CUT.

- `GET /api/territorio/regiones` y `GET /api/territorio/regiones/{codigoCut}/comunas` (lista
  oficial, `UbicacionOficialDto` en el Swagger): regiones de norte a sur y comunas por nombre.
  Agregadas en el PR [Contrum-Projects/Backend#26](https://github.com/Contrum-Projects/Backend/pull/26),
  que también carga las 346 comunas del decreto N° 1.115 de 2018 en la semilla. **Hasta que se
  integre**, el backend de `main` no las tiene: hay que levantar el backend con esa rama y correr
  `pnpm db:seed`.

Sin rutas simuladas.

## Notas de trabajo

- **Título de la dirección:** calle y número («Av. Providencia 1234 · Principal»). Figma
  muestra «Casa» / «Trabajo», pero el backend no guarda un nombre para la dirección (acordado
  con el usuario).
- **Agregar y editar dirección:** en un diálogo (Figma no tiene este formulario). Región y
  comuna con selectores nativos (listas largas, cómodos en celular); al cambiar la región se
  vuelve a elegir la comuna. «Dejarla como principal» solo al agregar; al editar, la principal
  se cambia desde la tarjeta. «Eliminar dirección» va dentro del diálogo de edición, con
  confirmación. Después de cada cambio se vuelve a pedir la lista, porque el backend decide
  cuál queda como principal.
- **Datos personales:** se envían solo los campos que cambiaron. El correo se muestra sin poder
  editarlo, y «Correo confirmado» es siempre cierto con la sesión iniciada (el backend no deja
  ingresar sin confirmar). Un género fuera de la lista no se muestra, pero no se borra si no se
  toca. El 409 (RUT en otra cuenta) y el 403 del RUT van junto al campo RUT.
- **Reutilizado del registro:** las reglas de los datos personales (`camposPersonales` en
  `esquemaRegistro.ts`), `SelectorFecha`, la lista de géneros y el reparto de errores por campo.
- **Menú de cuenta (CA4):** escritorio con el menú lateral de SCRUM-95; en celular, «Mis
  pedidos · Mis datos» del menú del header (Figma 2060:2101). Mis datos no tiene versión de
  celular en Figma.
- **Textos sin Figma, para revisar con diseño:** «Aún no tienes direcciones.», «Guardamos tus
  cambios.», el diálogo («Agregar dirección» / «Editar dirección», «Guardar dirección»,
  «Dejarla como principal», «Eliminar dirección», «¿Eliminar esta dirección?») y el ejemplo
  «Depto., oficina, block» de la referencia.

- **Diferencias con Figma, para revisar con diseño:** las tarjetas de dirección usan
  `rounded-lg` (16 px); Figma tiene 12 px sin variable de radio. Los formularios explican el
  asterisco de los campos obligatorios, como el registro, aunque Figma no lo muestra en Mis datos.

**Preguntas abiertas:**

- **Género:** una vez elegido no se puede quitar (el `Select` no tiene opción vacía), aunque el
  backend acepta `null`. ¿Se agrega una opción para dejarlo sin especificar?

**Pendientes sugeridos (no aplicados):**

- Si en otra pestaña se cambia de cuenta, esta pestaña puede renovarse con la cookie de la otra
  cuenta sin vaciar la caché (hallazgo bajo de la auditoría; ya existía antes). Convendría vaciar
  la caché cuando cambia el `codigoPublico` de la sesión.

**Para el backend:**

- Revisar e integrar el PR #26 (regiones y comunas) y correr `pnpm db:seed` en cada base.
- Declarar en el Swagger las respuestas de `/api/cuentas/yo` y de las direcciones.
- Figma muestra un nombre para cada dirección («Casa», «Trabajo») que el modelo no tiene.
