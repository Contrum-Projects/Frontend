---
name: siguiente
description: Muestra el avance del tablero local del frontend (docs/historias/README.md) y propone la próxima historia a tomar según el orden y sus dependencias. Úsala cuando el usuario pregunte "qué sigue", "qué historia tomo" o "cómo vamos".
disable-model-invocation: true
allowed-tools: Read Bash(git branch *) Bash(git log *) Bash(gh pr list *)
---

# Qué sigue

1. Lee `docs/historias/README.md`.
2. **Avance:** historias y puntos por estado (Por hacer, En curso, En revisión, Hecha) sobre el
   total (53 historias, 185 puntos).
3. **En curso:** si hay alguna, nómbrala con su rama (`git branch --list 'SCRUM-*'`) y recomienda
   terminarla antes de tomar otra (una historia a la vez).
4. **Revisa estados:** si `gh` funciona, `gh pr list --state all --search "SCRUM-"` para ver PRs
   integrados de historias que el tablero aún muestra «En revisión», y ofrece pasarlas a «Hecha».
   No cambies el tablero sin que el usuario lo confirme.
5. **Próxima:** la primera fila «Por hacer», en el orden del tablero, cuyas historias de
   «Necesita antes» estén «Hecha» o «En revisión». Muestra su título, puntos, el estado de la API
   (si es «No», que se hará con la API simulada) y el comando `/historia SCRUM-<n>`.
6. Si la próxima en orden está bloqueada, di por qué y propone también la primera que sí se
   puede tomar.
