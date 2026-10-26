---
name: sincronizar-jira
description: Lleva a Jira los estados del tablero local del frontend (docs/historias/README.md), para que el equipo vea el avance. Opcional; solo cuando el usuario lo pide.
disable-model-invocation: true
allowed-tools: Read mcp__atlassian__searchJiraIssuesUsingJql mcp__atlassian__getJiraIssue
---

# Sincronizar con Jira

El tablero de trabajo es `docs/historias/README.md`; Jira solo se actualiza cuando el usuario lo
pide con este comando.

1. Lee la columna Estado de `docs/historias/README.md`.
2. Con el conector de Jira (cloudId `bc9de2c3-63ac-4379-8782-8b69ef593475`) busca el estado de
   las historias: `project = SCRUM AND labels = frontend ORDER BY key ASC`.
3. Equivalencias: Por hacer → «Por hacer», En curso → «En curso», En revisión → «En revisión»,
   Hecha → «Finalizado».
4. Muestra una tabla solo con las historias cuyo estado difiere (clave, Jira, tablero) y pregunta
   cuáles mover. Jira lo ve todo el equipo: no muevas nada sin confirmación.
5. Mueve las confirmadas con `transitionJiraIssue` (pide permiso en cada llamada). Si una
   transición no existe desde el estado actual, dilo y sigue con las demás.
6. Si el conector no responde, entrega la tabla para que el usuario las mueva a mano.
