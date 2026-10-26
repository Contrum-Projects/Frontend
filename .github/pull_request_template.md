## Historia

SCRUM-XX — <!-- título de docs/historias/SCRUM-XX.md -->

Historia backend: SCRUM-XX · Pantalla de Figma: <!-- nombre y nodos de docs/pantallas.md -->

## Qué cambia

<!-- 2 a 4 líneas: qué puede hacer ahora la persona que antes no podía. Rutas nuevas. -->

## Criterios de aceptación

<!-- Copia los criterios de la historia y marca cómo se comprueba cada uno -->

- [ ] Criterio 1 — prueba: `archivo.test.tsx › nombre del test`
- [ ] Criterio 2 — prueba: …

## Capturas

| Escritorio (1440) | Celular (360)    |
| ----------------- | ---------------- |
| <!-- captura -->  | <!-- captura --> |

## API

<!-- Endpoints que usa. Tipos agregados a compartido/api/respuestas.ts y qué debería documentar el backend.
     Endpoints simulados (docs/api-simulada.md), si quedó alguno. -->

## Lista de revisión

- [ ] `pnpm verificar` pasa en local
- [ ] Se ve como en Figma en escritorio y en celular; a 360 px no hay desplazamiento horizontal (RNF-25)
- [ ] Solo tokens y componentes de `compartido/ui` (sin colores ni tamaños sueltos)
- [ ] Estados de carga, vacío y error; mensajes del backend junto a cada campo
- [ ] El frontend no calcula precios ni decide permisos (RNF-03, RNF-04); sin tokens fuera de memoria
- [ ] Sin credenciales ni `.env.local` en el diff
- [ ] Revisado por otro integrante del equipo
