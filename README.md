# Aggility — sistema de diseño

Fuente común del estilo visual de las herramientas de Aggility (panel de gestión, Horace, Marketing Hub y las que vengan).

- La referencia completa (colores en claro y oscuro, tipografía, espacios, radios, logos y reglas de uso) está en el artifact "Aggility" de Claude: https://claude.ai/artifact/2cdjdSXQcBmwwWbYSTXWbT
- `sistema/guia.md`: las reglas de uso (color, tipografía, espacio, gráficos, voz y logos). Es lo que tiene que leer un agente antes de diseñar una pantalla.
- `sistema/tokens.json`: los mismos valores, para herramientas y agentes. **Es la única fuente**: los valores se cambian acá y en ningún otro lado.
- `sistema/aggility-theme.css`: el tema listo para una app Next.js con Tailwind v4 y shadcn/ui. **Generado**: no se escribe ni se edita a mano.

## Cómo se usa en una app

El tema no se arma ni se copia a mano: se genera desde `sistema/tokens.json` con un comando.

```bash
npm install
npm run tema
```

`npm run tema` escribe los dos archivos del tema, con el mismo contenido:

- `sistema/aggility-theme.css`: el tema publicado, el que copia otra app de Aggility. Declara en su encabezado que es generado, desde qué fuente y con qué fecha.
- `src/app/aggility-theme.css`: la copia que consume esta app, importada desde `src/app/globals.css`.

Ninguno de los dos se toca a mano. Si uno deja de coincidir con lo que el comando genera, `npm test` falla y dice el archivo y la línea.

Después, en la app:

1. En `src/app/globals.css`, después de los `@import` de Tailwind y shadcn: `@import "./aggility-theme.css";`, y borrar los `:root`, `.dark` y `@theme inline` que haya generado la CLI de shadcn.
2. Cargar Inter con `next/font/google` como variable `--font-inter`, sólo con los pesos 400, 500 y 600, y poner esa variable en `<html>`.
3. Modo oscuro con la clase `dark` en `<html>`; sin elección guardada, seguir al sistema operativo.

En otra app de Aggility: copiar `sistema/aggility-theme.css` al lado de su `globals.css` y hacer los tres pasos de arriba con ese archivo.

## Regla

Los valores se cambian en `sistema/tokens.json`, nunca en el tema ni en las pantallas. Después se corre `npm run tema` y se commitea el tema regenerado.
