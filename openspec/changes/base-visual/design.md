# Design

## Context

El repositorio tiene hoy el sistema de diseño (`sistema/`: tokens, tema, guía y logos), el documento de producto, la hoja de ruta y el andamiaje de OpenSpec. No hay aplicación, ni `package.json`, ni una línea de código. Por eso este cambio arranca de cero en lo que a código se refiere (para el motivo, ver proposal.md - Why).

Restricciones que condicionan el diseño:

- `sistema/tokens.json` es la única fuente de valores; ningún componente escribe un color, un tamaño de letra o un radio (spec, regla 2).
- El tema se regenera desde la fuente; no se edita a mano (spec, regla 3).
- El tema tiene que poder copiarse a otra aplicación de Aggility (README, "Cómo se usa en una app").
- Los componentes base se generan con la CLI oficial de shadcn, nunca a mano ni copiados de otro proyecto (config de OpenSpec).
- Nada del proceso puede depender de una herramienta: se alterna entre Hermes, opencode y Claude Code (config de OpenSpec).
- Sin base de datos ni autenticación: los datos son de ejemplo, en archivos (spec, sección 6).

Verificaciones hechas para este diseño, el 12/10/2026:

- Entorno: node v25.6.1 y npm 11.9.0. Cumplen los `engines` de todo lo que se fija (Next pide node >= 20.9.0, Vite `^20.19 || >= 22.12`, Playwright >= 20).
- El estilo `base-nova` existe en el registro y publica los 14 componentes de la sección 5.4 más `sidebar` (`https://ui.shadcn.com/r/styles/base-nova/<nombre>.json` responde para todos).
- El CLI 4.21.4 trata `base-nova` como **preset** (su default: `-d/--defaults` equivale a `--template=next --preset=base-nova`) y lo resuelve con la librería de componentes `base` (Base UI), íconos lucide.
- El paquete de Base UI que usa ese preset es **`@base-ui/react` 1.9.0**. `@base-ui-components/react` (1.0.0-rc.0) es el nombre viejo del paquete y no es el que corresponde.

## Goals / Non-Goals

**Goals:**

- Una aplicación que se pueda copiar: el tema, los componentes base y el armazón, sin nada atado a este repositorio.
- Un tema con origen verificable: generado, reproducible y con una verificación que detecte cualquier divergencia con la fuente.
- Ningún valor visual escrito a mano en el código de la aplicación.
- Una prueba visual revisable sin abrir el proyecto.

**Non-Goals:**

- No se decide acá el contenido de las pantallas de muestra ni los componentes propios (cambio `pantallas-muestra`).
- No se define la navegación real de ninguna herramienta: la barra lateral muestra las secciones de ejemplo de este proyecto.
- No se agrega capa de datos, estado global, ni internacionalización: los textos son español de Argentina, fijos.
- No se publica la aplicación en ningún lado.

## Decisions

### 1. Framework y estructura

Next.js con App Router, TypeScript estricto, todo en la raíz del repositorio (`src/app`, `src/components`, `scripts`, `tests`).

- **Alternativa descartada:** monorepo con el sistema publicado como paquete interno. La v1 es una app de referencia que se copia (README); un monorepo agrega herramientas y no cambia nada observable.
- **Lo exige:** sección 5.1 y el objetivo de la spec (sección 2).

### 2. Versiones exactas, sin rangos

Cada paquete se fija en su versión exacta (tabla más abajo), verificada contra el registro.

- **Alternativa descartada:** rangos `^`. Un archivo de tema que diverge del sistema sin que nadie lo note es justamente el problema que motiva este cambio; la app de referencia tiene que ser reproducible.
- **Lo exige:** CA-2 y la regla del config de OpenSpec ("No supongas versiones: verificalas con npm view").

### 3. El generador del tema

Un script propio, sin dependencias, que lee la fuente de valores y escribe el tema. Entra en `sistema/` porque es del sistema, no de la app.

- **Alternativa descartada A:** seguir manteniendo el tema a mano. Es lo que produjo que el tema publicado tuviera los colores de gráfico 2 a 5 con valores por defecto de otra paleta, sin los colores 6 a 8 y sin los estados bueno y atención: 18 desvíos contra la fuente, en el archivo que las apps copian.
- **Alternativa descartada B:** usar una herramienta de tokens del mercado (por ejemplo Style Dictionary). Una dependencia de build más para cuatro grupos de tokens y un formato intermedio.
- **Lo exige:** CA-2, regla 3.

### 4. El generador escribe dos archivos y la verificación compara los dos

El tema canónico queda en `sistema/` (es lo que otra app copia) y la app consume una copia propia. La verificación genera el tema en memoria y compara contra los dos archivos.

- **Alternativa descartada A:** que la app importe directamente el archivo del sistema. La app deja de ser copiable a otro repositorio, contra el propósito declarado en el README.
- **Alternativa descartada B:** enlazar el archivo (symlink). No viaja bien, no se copia y rompe en otros sistemas.
- **Lo exige:** CA-2 y el README. Riesgo asumido: un archivo duplicado; mitigado por la verificación (Riesgo 1).

### 5. Cómo se emiten los colores

Los colores salen con los nombres que ya usan las apps de Aggility (los de shadcn). Un valor que en la fuente se escribe como referencia a otro (`{foreground}`) se emite como referencia. Un valor igual en los dos modos se declara una sola vez.

- **Alternativa descartada:** repetir todos los colores en los dos bloques de modo. Duplica el archivo y abre la puerta a que el mismo color tenga dos valores distintos sin que nadie lo note.
- **Lo exige:** regla 2, CA-3.

### 6. Los estilos de texto se emiten como estilos del tema

Los 7 estilos de interfaz, los 2 de datos y el de marca se emiten como variables de texto de Tailwind v4 (tamaño, alto de línea, peso e interletrado), de modo que exista una clase por estilo (`text-page-title` y así).

- **Alternativa descartada A:** escribir los estilos en cada componente con valores literales. Lo prohíben CA-1 y la regla 2.
- **Alternativa descartada B:** usar la escala de texto por defecto de la herramienta. No coincide con los diez estilos de la fuente y dejaría la pantalla de fundamentos mostrando algo que la app no usa.
- **Lo exige:** CA-1, regla 2, sección 5.2.

### 7. El espacio no necesita tokens propios

La escala del sistema (4, 8, 12, 16, 24 y 32 px) coincide exactamente con la unidad por defecto de la herramienta (0.25 rem): 4 px = 1, 8 = 2, 12 = 3, 16 = 4, 24 = 6, 32 = 8. Se fija la unidad y se usan esas clases.

- **Alternativa descartada:** emitir tokens de espacio propios (`space-1` a `space-8`). Nombres redundantes y dos escalas que pueden separarse.
- **Lo exige:** regla 2, sección 5.2.

### 8. Los radios salen del radio base

Se emite el radio base desde `radius-lg` de la fuente y los otros tres por proporción (0,6 / 0,8 / 1 / 1,4), y una verificación comprueba que los cuatro resultados coinciden con la fuente (6, 8, 10 y 14 px).

- **Alternativa descartada:** emitir los cuatro radios como valores sueltos. Se pierde la integración con el radio base que esperan los componentes base, y la base y los derivados pueden separarse.
- **Lo exige:** regla 2, CA-2.

### 9. Modo claro y oscuro

`next-themes` 0.4.6, con la clase en el elemento raíz, modo inicial "sistema" y sin transición al cambiar.

- **Alternativa descartada:** escuchar el modo del sistema a mano y guardar una cookie. Es más código propio para algo resuelto, y es fácil que se vea un destello del modo equivocado en el primer pintado.
- **Lo exige:** CA-3.

### 10. Armazón de la aplicación

El bloque de barra lateral de la herramienta oficial (`sidebar`, que a su vez trae cajón, tooltip y separador), adaptado al tema. El cajón en pantallas angostas es el mismo componente en su modo angosto: no hay dos navegaciones.

- **Alternativa descartada:** construir el armazón a mano. Va contra la regla de que los componentes base salen de la herramienta oficial, y es más código para mantener.
- **Lo exige:** sección 5.3, CA-4.

### 11. Componentes base

Los 14 componentes de la sección 5.4 se generan con la CLI oficial en su versión fija, con el preset `base-nova`. La CLI se encarga de `components.json`, de la utilidad de composición de clases y de sus dependencias; las variables de estilo que escriba la CLI se reemplazan por el tema generado, como indica el README.

- **Alternativa descartada:** escribirlos a mano o copiarlos de Horace o de la app de gestión (spec, regla 4; config de OpenSpec).
- **Lo exige:** sección 5.4 y la regla del config.
- **Nota verificada:** el preset usa Base UI a través de `@base-ui/react`, no del paquete `@base-ui-components/react`.

### 12. Qué se prueba con qué

Vitest para lo que no necesita navegador: el generador del tema, la verificación de valores literales, la coincidencia de la pantalla de fundamentos con la fuente y los componentes por unidad. Playwright para lo que se ve y se toca: modo claro/oscuro, los 390 px, el foco de teclado y las capturas.

- **Alternativa descartada:** hacer todo con Playwright. Más lento, y para la verificación de valores literales (que es leer archivos) no aporta nada.
- **Lo exige:** CA-1, CA-2, CA-3, CA-4, CA-8, CA-10.

### 13. Capturas

Playwright, dos anchos (1280 y 390), el modo forzado por clase, un archivo por pantalla, modo y ancho. Las pantallas se descubren recorriendo las secciones del armazón, no una lista escrita a mano.

- **Alternativa descartada A:** una herramienta de capturas aparte. Una dependencia más cuando Playwright ya está instalado.
- **Alternativa descartada B:** mantener a mano la lista de pantallas a capturar. Se olvida, y el spec pide que una pantalla nueva quede cubierta sin darla de alta.
- **Lo exige:** CA-10.

### 14. Verificación de "ningún valor literal"

Una verificación recorre el código de la aplicación y falla ante un color literal (hexadecimal, rgb, hsl u oklch), un tamaño de letra o un radio literal, nombrando archivo y línea.

- **Alternativa descartada:** revisar el diff a ojo en cada cambio. No es rojo o verde y depende de que quien revise tenga el criterio del sistema en la cabeza.
- **Lo exige:** CA-1, regla 2, y la regla del apply ("Nunca uses un color, tamaño de letra o radio literal en src/").

### 15. Documentos que se corrigen en este cambio

El README deja de decir que el tema se copia a mano (ahora se genera) y `AGENTS.md` completa la sección "Estructura y comandos del proyecto", que quedó como pendiente.

- **Alternativa descartada:** dejarlo para después. El config de OpenSpec dice que si el código tiene razón y un documento quedó viejo, se corrige el documento en el mismo commit.
- **Lo exige:** regla 5, y `AGENTS.md` (última línea).

## Dependencias de runtime nuevas (aprobadas por Germán el 12/10/2026)

| Paquete | Versión exacta | Para qué | Alternativa considerada |
|---|---|---|---|
| `next` | 16.4.0 | El framework y la app (App Router). | Otro framework: el stack ya está decidido en el config. |
| `react` | 19.3.0 | Runtime de la interfaz. Lo pide `next` 16.4.0 (`^19.0.0`). | — |
| `react-dom` | 19.3.0 | Runtime de la interfaz en el navegador (pide `react` `^19.3.0`). | — |
| `@base-ui/react` | 1.9.0 | Base de los componentes base del preset `base-nova`. | Radix o React Aria (`--base radix`, `--base aria`): el estilo elegido en el config es `base-nova`. |
| `lucide-react` | 1.55.0 | Íconos, como pide la guía visual. | — |
| `next-themes` | 0.4.6 | Modo claro/oscuro con memoria del dispositivo (CA-3). | Implementarlo a mano (decisión 9). |
| `class-variance-authority` | 0.7.1 | Variantes de los componentes base. Lo trae el preset. | — |
| `clsx` | 2.1.1 | Composición de clases. Lo trae el preset. | — |
| `tailwind-merge` | 3.7.0 | Composición de clases sin conflictos. Lo trae el preset. | — |

No hay ninguna dependencia de datos ni de autenticación: los datos son de ejemplo y las pantallas de este cambio no usan datos.

Dependencias de desarrollo (no van a producción): `typescript`, `tailwindcss`, `@tailwindcss/postcss`, `shadcn` (la CLI), `eslint`, `eslint-config-next`, `prettier`, `vitest`, `vite`, `@vitejs/plugin-react`, `jsdom`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `@testing-library/dom`, `@playwright/test` y los `@types/*`.

## Versiones verificadas (12/10/2026)

| Paquete | Versión exacta | Dependencias entre pares que importan |
|---|---|---|
| `next` | 16.4.0 | `react` y `react-dom` `^19.0.0`; `engines.node` >= 20.9.0 |
| `react` | 19.3.0 | — |
| `react-dom` | 19.3.0 | `react` `^19.3.0` |
| `@base-ui/react` | 1.9.0 | `react`, `react-dom`, `@types/react` `^17 \|\| ^18 \|\| ^19`; `date-fns` y `@date-fns/tz` son opcionales (no se instalan) |
| `lucide-react` | 1.55.0 | `react` `^16.5.1 \|\| ^17 \|\| ^18 \|\| ^19` |
| `next-themes` | 0.4.6 | `react` y `react-dom` `^19` |
| `class-variance-authority` | 0.7.1 | — |
| `clsx` | 2.1.1 | — |
| `tailwind-merge` | 3.7.0 | — |
| `typescript` | 7.0.2 | Respaldo verificado: 6.0.3 (última 6.x) y 5.9.3 (última 5.x) |
| `tailwindcss` | 4.3.3 | — |
| `@tailwindcss/postcss` | 4.3.3 | — |
| `shadcn` (CLI, desarrollo) | 4.21.4 | Preset `base-nova` disponible; registra los 14 componentes y `sidebar` |
| `eslint` | 10.12.0 | — |
| `eslint-config-next` | 16.4.0 | `eslint` >= 9.0.0 (10.12.0 cumple), `typescript` >= 3.3.1 |
| `prettier` | 3.9.10 | — |
| `vitest` | 5.0.4 | `vite` `^6.4 \|\| ^7 \|\| ^8`, `@types/node` `^22 \|\| >=24` |
| `vite` | 8.3.4 | `engines.node` `^20.19 \|\| >= 22.12` |
| `@vitejs/plugin-react` | 6.1.2 | `vite` `^8.0.0` |
| `jsdom` | 30.1.2 | — |
| `@testing-library/dom` | 10.4.2 | — |
| `@testing-library/react` | 16.3.3 | `react`/`react-dom` `^19`, `@testing-library/dom` `^10.0.0` |
| `@testing-library/user-event` | 14.6.7 | `@testing-library/dom` >= 7.21.4 |
| `@testing-library/jest-dom` | 7.0.1 | `vitest` >= 0.32 |
| `@playwright/test` | 1.64.0 | `engines.node` >= 20 |
| `@types/react` | 19.3.0 | — |
| `@types/react-dom` | 19.3.0 | `@types/react` `^19.3.0` |
| `@types/node` | 26.6.5 | — |

Para `pantallas-muestra` (no se instala en este cambio, ya verificado): `recharts` 3.10.1, que declara `react-is` `^16.8 \|\| ^17 \|\| ^18 \|\| ^19` como dependencia entre pares y hay que instalarlo junto con él (`react-is` 19.3.0).

## Risks / Trade-offs

1. **El tema vive en dos archivos (el canónico y la copia de la app).** → La verificación genera el tema en memoria y compara contra los dos; editar cualquiera de los dos a mano pone la suite en rojo con el archivo y la línea.
2. **TypeScript 7.0.2 es la versión más nueva y cambia el compilador.** → La primera tarea de código corre `tsc --noEmit` y `npm run build`; si alguno falla, se fija la última 6.x verificada (6.0.3) y la razón queda anotada debajo de la tarea.
3. **Un cambio del preset `base-nova` entre versiones del CLI puede traer diferencias al regenerar componentes.** → El CLI se fija en 4.21.4 y regenerar es una tarea explícita; las capturas muestran si algo se movió.
4. **El modo elegido podría pisarse o verse un destello en el primer pintado.** → La verificación de CA-3 abre la app con el sistema en oscuro y sin elección guardada, y después con una elección guardada de claro.
5. **La verificación de valores literales puede marcar código generado por la CLI.** → Un literal se corrige con la herramienta oficial, nunca a mano. Las clases de tamaño que no son color, tamaño de letra ni radio (por ejemplo un tamaño de ícono) quedan fuera de CA-1.
6. **Un componente que falte de la lista de la sección 5.4.** → Queda anotado como bloqueo debajo de la tarea y se frena; no se escribe a mano (regla del apply).
7. **Las capturas dependen de que la tipografía cargue.** → El comando espera a que la tipografía esté lista antes de capturar y falla con un mensaje que lo dice, en lugar de dejar capturas con la fuente de reserva.

## Migration Plan

No hay aplicación previa: este cambio la crea. Rollback: revertir los commits del cambio. El único archivo que pasa a ser generado es `sistema/aggility-theme.css`, y su contenido tiene que quedar idéntico mientras la fuente de valores no cambie: la verificación de CA-2 lo comprueba en la primera tarea que lo regenera, y el diff lo muestra.

## Open Questions

- ¿La aplicación se publica en Vercel? Es el pendiente 1 de la spec (a confirmar). No cambia ninguna decisión de este cambio: publicar es un paso posterior.
- ¿Cómo se llama el archivo de la copia del tema dentro de la app? Es un detalle de nombre, no de comportamiento, y lo fija la tarea que lo crea.

## Decisiones confirmadas para los cambios siguientes

- **Colores fijos por fuente de datos** (spec, regla 6, que figuraba como *(a confirmar)*): confirmado por Germán el 12/10/2026 — Meta `chart-1`, Google Ads `chart-2`, Search Console `chart-3`, GA4 `chart-4`. Lo implementa `pantallas-muestra`, que es donde aparecen los gráficos.
- **`docs/referencia/spec-producto.md` no se toca**: la regla 6 y el pendiente 2 dicen lo mismo y la duplicación queda como está (decisión de Germán del 12/10/2026).
