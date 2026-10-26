---
name: revisar
description: Revisa una rama o un pull request del frontend contra main - calidad, reglas del proyecto, fidelidad a Figma, accesibilidad, seguridad y criterios de aceptación. Úsala para revisar el PR de un compañero o tu propia rama antes del PR.
argument-hint: '[número de PR o nombre de rama; vacío = rama actual]'
disable-model-invocation: true
allowed-tools: Bash(git *) Bash(gh pr view *) Bash(gh pr diff *) Bash(gh pr checks *) Bash(pnpm verificar) Bash(pnpm test *) Read mcp__figma__get_screenshot mcp__figma__get_design_context
---

# Revisión de $ARGUMENTS

1. **Obtener el cambio.**
   - Número de PR: `gh pr view $ARGUMENTS` y `gh pr diff $ARGUMENTS`; estado de CI con
     `gh pr checks $ARGUMENTS`.
   - Nombre de rama: `git fetch origin <rama>` y `git diff origin/main...origin/<rama>`.
   - Vacío: la rama actual contra `origin/main`.
2. **Historia.** Saca la clave `SCRUM-<n>` del nombre de la rama o del título y lee
   `docs/historias/SCRUM-<n>.md` para tener los criterios de aceptación y la pantalla de Figma.
3. **Revisión en paralelo.** Lanza a la vez:
   - subagente **revisor-codigo** sobre el diff;
   - subagente **revisor-diseno** con la pantalla de Figma y los archivos de la interfaz;
   - subagente **auditor-seguridad** sobre el diff;
   - subagente **verificador-criterios** con la historia y la rama.
4. **Informe.** Junta los resultados en un solo informe, sin repetir hallazgos:
   - **Bloqueantes** (no se puede integrar), **Importantes**, **Sugerencias**.
   - Cada hallazgo con `archivo:línea`, el problema y la corrección propuesta.
   - Tabla de criterios de aceptación: cumple / no cumple / sin prueba.
   - Veredicto: aprobar, aprobar con cambios o pedir cambios.
5. No publiques comentarios en GitHub ni cambies código salvo que el usuario lo pida.
