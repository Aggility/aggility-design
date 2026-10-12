# Aggility — sistema de diseño

Fuente común del estilo visual de las herramientas de Aggility (panel de gestión, Horace, Marketing Hub y las que vengan).

- La referencia completa (colores en claro y oscuro, tipografía, espacios, radios, logos y reglas de uso) está en el artifact "Aggility" de Claude: https://claude.ai/artifact/2cdjdSXQcBmwwWbYSTXWbT
- `sistema/guia.md`: las reglas de uso (color, tipografía, espacio, gráficos, voz y logos). Es lo que tiene que leer un agente antes de diseñar una pantalla.
- `sistema/tokens.json`: los mismos valores, para herramientas y agentes.
- `sistema/aggility-theme.css`: el tema listo para una app Next.js con Tailwind v4 y shadcn/ui.

## Cómo se usa en una app

1. Copiar `sistema/aggility-theme.css` junto a `src/app/globals.css`.
2. En `globals.css`, después de los `@import` de Tailwind y shadcn: `@import "./aggility-theme.css";` y borrar los `:root`, `.dark` y `@theme inline` que generó shadcn.
3. Cargar Inter con `next/font/google` como variable `--font-inter` en `<html>`.
4. Modo oscuro con la clase `dark` en `<html>`; sin elección guardada, seguir al sistema operativo.

## Regla

Los valores se cambian en el sistema de diseño, no en cada app. Después se regenera este archivo y se vuelve a copiar.
