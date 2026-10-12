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

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
