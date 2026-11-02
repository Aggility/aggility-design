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

Next.js (App Router) + TypeScript estricto, Tailwind v4 y los componentes base de shadcn (preset `base-nova`). Todo en la raíz del repositorio.

### Carpetas

- `sistema/`: el sistema de diseño. `tokens.json` (la única fuente de valores), `guia.md` (las reglas visuales), `aggility-theme.css` (el tema publicado, **generado**), `logos/` (los logos de la marca).
- `src/app/`: las pantallas (`/`, `/fundamentos`, `/clientes`, `/clientes/nuevo`, `/ingreso`, `/estados`), `layout.tsx` (el armazón: proveedor de modo, barra lateral y encabezado), `globals.css` (Tailwind, la importación del tema y la regla de foco) y `aggility-theme.css` (la copia del tema que consume la app, **generada**).
- `src/components/ui/`: los 16 componentes base que escribe la CLI de shadcn. **No se editan a mano**: se regeneran.
- `src/components/estructura/`: la barra lateral, el encabezado y las secciones.
- `src/components/tema/`: el proveedor de modo y su selector.
- `src/components/fundamentos/`: los bloques de la pantalla de fundamentos (colores, estilos de texto, espacio y radios, series y estados, logos).
- `src/components/estados/`: los estados del sistema (palabra, ícono y color), la insignia y los avisos.
- `src/hooks/` y `src/lib/`: el hook de pantalla angosta y la utilidad de clases, los dos de la CLI.
- `scripts/`: `generar-tema.mjs` (el comando `tema`) y `capturas.mjs` (el comando `capturas`).
- `tests/`: Vitest, un directorio por tema (`tema/`, `componentes/`, `capturas/`, `fundamentos/`).
- `e2e/`: Playwright, un archivo por comportamiento (estructura, 390 px, modo, teclado del armazón, fundamentos y humo).
- `docs/`: la spec de producto (`referencia/`) y las capturas versionadas (`capturas/`).

### Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | La app en desarrollo, en el 3000. |
| `npm run build` · `npm run start` | Compilar y servir la app compilada. |
| `npm run tema` | Regenera `sistema/aggility-theme.css` y la copia de la app desde `tokens.json`. El tema no se edita ni se copia a mano. |
| `npm run capturas` | Compila, levanta la app y deja las capturas (pantallas × 2 modos × 2 anchos) en `docs/capturas/`. |
| `npm test` | Vitest. |
| `npm run e2e` | Playwright: levanta su propio servidor en el 3202 y **no reutiliza** uno ajeno. |
| `npm run lint` | ESLint. |
| `npx tsc --noEmit` | El chequeo de tipos. |

Los cinco que tienen que estar en verde antes de dar una tarea por hecha: `npx tsc --noEmit`, `npm run lint`, `npm test`, `npm run e2e` y `npm run build`.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
