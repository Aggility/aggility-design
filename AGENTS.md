# AGENTS.md — Sistema de diseño Aggility

Este proyecto se trabaja con OpenSpec. Leé esto antes de cualquier tarea.

## Dónde está cada cosa
- `docs/referencia/spec-producto.md`: qué se construye, reglas y criterios de aceptación. Manda sobre todo lo demás. No lo modifiques.
- `sistema/guia.md`: las reglas visuales de Aggility. Leela antes de diseñar o maquetar cualquier cosa.
- `sistema/tokens.json`: la única fuente de valores. `sistema/aggility-theme.css` se genera desde ahí.
- `docs/roadmap.md`: el orden de los cambios.
- `openspec/config.yaml`: contexto y reglas de cada artefacto y del apply.
- `openspec/changes/<cambio>/`: el cambio en curso.

## Comandos de OpenSpec
- Hermes: `/openspec-propose`, `/openspec-apply-change`, `/openspec-archive-change`, `/openspec-explore`.
- opencode: `/opsx-propose`, `/opsx-apply`, `/opsx-archive`, `/opsx-explore`.
- Claude Code: `/opsx:propose`, `/opsx:apply`, `/opsx:archive`, `/opsx:explore`.

## Reglas
- Las reglas de trabajo están en `openspec/config.yaml`. Valen aunque no estés usando un comando de OpenSpec.
- Si dos documentos se contradicen, frená y avisá antes de decidir.
- No toques archivos de entorno ni credenciales. Nunca push ni deploy sin pedido de Germán.

## Estructura y comandos del proyecto
Se completan en la primera tarea del cambio `base-visual`, con lo que exista de verdad.
