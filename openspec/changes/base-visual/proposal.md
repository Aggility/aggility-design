# Proposal

## Why

Cada herramienta de Aggility se ve distinta y, sin una referencia concreta, un agente que construye una pantalla la inventa: el primer diseño de la app de gestión y del Marketing Hub se descartó por eso. El sistema visual ya existe (`sistema/`), pero nunca se vio aplicado en pantallas reales, y su tema publicado ya divergió una vez de los tokens. Este cambio arma la base que se copia al construir cualquier herramienta de Aggility, empezando por el Marketing Hub.

## What Changes

- Se crea la aplicación Next.js de referencia en la raíz del repositorio: App Router, TypeScript estricto, Tailwind v4 y componentes base generados con la herramienta oficial de shadcn (preset `base-nova`).
- El tema deja de mantenerse a mano: un comando lo genera desde `sistema/tokens.json`, y una verificación falla si el archivo publicado no coincide con lo que ese comando produce (CA-2, regla 3). El generador cubre colores, estilos de texto, espacio y radios.
- Una verificación recorre el código de la aplicación y falla ante cualquier color, tamaño de letra o radio literal (CA-1, regla 2).
- Modo claro y oscuro con selector en el encabezado: sin elección guardada sigue al sistema operativo, la elección se recuerda en el dispositivo y se aplica antes del primer pintado (CA-3).
- Se arma el armazón de la aplicación: barra lateral con secciones agrupadas, encabezado con el título de la sección, y cajón con botón de menú en pantallas angostas, sin desplazamiento horizontal a 390 px (CA-4, sección 5.3).
- Quedan disponibles los 14 componentes base de la sección 5.4, usables con teclado y con el anillo de foco del sistema (CA-8, sección 5.4).
- Una pantalla de fundamentos muestra el sistema aplicado: colores con nombre y valor en cada modo, estilos de texto, espacio y radios, colores de gráficos y estados, y los logos (sección 5.2).
- Un comando genera la captura de cada pantalla en claro y oscuro, a 1280 y 390 px, versionadas en `docs/capturas/` (CA-10).
- README y AGENTS.md quedan con la estructura y los comandos que existen de verdad: el tema ya no se copia a mano y la sección "Estructura y comandos del proyecto" de `AGENTS.md` deja de ser un pendiente.

### Criterios de aceptación y reglas que cubre

- **CA-1** (ningún valor literal, comprobado por una verificación), **CA-2** (el tema se regenera y una verificación falla si no coincide), **CA-3** (modo claro y oscuro), **CA-4** (390 px sin desplazamiento horizontal, barra lateral en cajón), **CA-8** (teclado y anillo de foco), **CA-10** (capturas por comando en `docs/capturas/`).
- **Regla 2** (los tokens son la única fuente de valores), **regla 3** (el tema se regenera, no se edita a mano), **regla 4** (no se copia código de Horace ni de la app de gestión), **regla 5** (textos en español de Argentina con voseo, números con punto de miles y coma decimal, siempre con su período).
- Secciones 5.1 a 5.4 de la spec: tema, fundamentos, estructura de la app y componentes base.

## Fuera de alcance

- Los componentes propios (tarjeta de KPI, gráficos, tabla con filtros, selector de rango de fechas, encabezado de página, estado vacío, insignia de estado) y las 5 pantallas de muestra: van en el cambio 2, `pantallas-muestra` (CA-5, CA-6, CA-7, CA-9).
- Publicar el tema y los componentes como registro de shadcn: cambio 3, `registro-shadcn`.
- Conexión a datos reales y autenticación real: fuera del alcance de la v1 (spec, sección 6). La pantalla de ingreso va en `pantallas-muestra`.
- Adoptar el tema en Horace o en la app de gestión: se hace en cada repo (spec, sección 6).
- Recharts y los gráficos: el stack los prevé, pero este cambio no los usa. Su versión ya quedó verificada para `pantallas-muestra`.
- Publicar la app en Vercel: es un pendiente *(a confirmar)* de la spec (sección 9) y no cambia este cambio.

## Capabilities

### New Capabilities

- `tema`: cómo los valores del sistema llegan a la aplicación, el comando que genera el tema, la ausencia de valores literales y el cambio entre modo claro y oscuro.
- `estructura-app`: el armazón que comparten las pantallas (barra lateral, encabezado, cajón en pantallas angostas) y su uso con teclado.
- `componentes-base`: el inventario de componentes base disponibles, su apariencia según el tema y su operación con teclado.
- `pantalla-fundamentos`: la pantalla que muestra el sistema aplicado, para revisarlo y copiar de ahí.
- `capturas`: el comando que deja la prueba visual de cada pantalla, en los dos modos y los dos anchos.

### Modified Capabilities

Ninguna: es el primer cambio del proyecto y `openspec/specs/` todavía no tiene capacidades.

## Impact

- Código nuevo: `package.json` y configuración en la raíz (TypeScript, Tailwind, tests, lint), `src/app/`, `src/components/`, `scripts/`, `tests/`.
- Sistema de diseño: `sistema/` gana el generador del tema; `sistema/aggility-theme.css` pasa a ser un archivo generado y verificado, y se suma la copia que consume la app.
- Directorio nuevo versionado: `docs/capturas/` (hoy existe vacío y no se versiona).
- Dependencias de runtime nuevas, para aprobar: `next`, `react`, `react-dom`, `@base-ui/react`, `lucide-react`, `next-themes`, `class-variance-authority`, `clsx` y `tailwind-merge`. Sin base de datos ni autenticación.
- Documentación: `README.md` y `AGENTS.md`.
