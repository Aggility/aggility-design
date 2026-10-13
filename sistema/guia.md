Sistema visual común a todas las herramientas de Aggility: el panel de gestión, Horace, el Marketing Hub y las que vengan. Azul de marca sobre neutros con un leve tono azul, modo claro y oscuro, una sola tipografía.

## Cómo usarlo en una app

- Las apps son Next.js con Tailwind y componentes de shadcn/ui (estilo base-nova, Base UI). Los nombres de los colores son los de shadcn (`background`, `primary`, `muted-foreground`…), así que el tema se aplica copiando las variables a `globals.css`: modo claro en `:root`, oscuro en `.dark`.
- Sin elección guardada, el modo sigue al sistema operativo. La elección se guarda en el dispositivo.
- Íconos: `lucide-react`, trazo de 2px, a 16px en botones y filas y a 20px en la barra lateral. Sin emoji en la interfaz.
- Gráficos: Recharts, coloreados con `chart-1` a `chart-8` y el texto de ejes en `muted-foreground`.

## Voz

- Español de Argentina, con voseo: "Sincronizá", "Elegí la cuenta", "Agendá tu Diagnóstico Estratégico".
- Botones con verbo y lo que pasa: "Guardar cliente", "Sincronizar ahora". El aviso después confirma: "Cliente guardado".
- Errores que dicen qué pasó y cómo seguir: "La cuenta de Meta no respondió. Probá sincronizar de nuevo en unos minutos." Sin disculpas ni signos de exclamación.
- Números con formato argentino: punto de miles, coma decimal (`$ 1.240`, `12,4 %`), y siempre con su período ("últimos 30 días").

## Color

- `background` es el fondo de página; `card` las tarjetas y tablas; `card-2` las filas en hover y los mosaicos dentro de una tarjeta.
- Texto en `foreground`; lo secundario (bajadas, fechas, unidades) en `muted-foreground`.
- `primary` con disciplina: un botón primario por vista, el ítem activo de la navegación y la serie principal de un gráfico. Si está en todos lados deja de significar.
- Texto sobre `primary` en `primary-foreground`. En claro es blanco y da 3,4:1: botones de 14px semibold o más, nunca texto chico. En claro, los enlaces van en `foreground` subrayado, no en `primary`.
- `primary-soft` para el fondo del ítem activo de la barra lateral y de insignias, con el texto en `foreground`.
- `destructive` solo para errores y acciones que borran, siempre con una palabra o un ícono.
- Estados: `success` (bueno o favorable), `warning` (necesita atención) y `destructive` (error). Son de texto e íconos y siempre van con una palabra, un signo o un ícono: "+12,4 %" en `success`, "Token por vencer" con ícono en `warning`. Nunca se usan como color de una serie.
- Los colores `brand-*` son la paleta del logo, fija en los dos modos. Son para piezas de marca (presentaciones, portadas, redes); en la interfaz se usan los tokens semánticos.

## Tipografía

- Inter en todo. Pesos 400, 500 y 600; nada más pesado.
- En pantallas: `page-title` una vez por vista, `section-title` y `card-title` para agrupar, `body` para el resto, `small` y `label` para notas y rótulos.
- Los valores de KPI van en `kpi-value` con cifras tabulares (`font-variant-numeric: tabular-nums`), y su variación en `kpi-delta`.
- `display` solo en piezas de marca.
- Los componentes base de shadcn (botón, campo, menú, tabla) traen su propia escala de texto (`text-sm`, `text-xs`, `text-base`) y no se editan. Los estilos de arriba son los de las pantallas y los componentes propios.

## Espacio y forma

- Escala de 4px: `space-2` dentro de un grupo, `space-4` y `space-6` para rellenar tarjetas, `space-8` entre secciones. Margen lateral mínimo de `space-4` en celular.
- Radios: `radius-md` en botones y campos, `radius-lg` en tarjetas y diálogos, `radius-sm` en insignias.
- Bordes antes que sombras: tarjetas con borde `border` de 1px y sin sombra. La sombra queda para lo que flota (menús, diálogos).
- Filas con líneas finas antes que tarjetas: una tarjeta es un objeto acotado (un KPI, un gráfico), no un contenedor para todo.

## Estados y foco

- Foco de teclado: anillo sólido de 2px en `ring`, separado 2px del elemento con el color de fondo. Lo pone una regla global (`:focus-visible`) en el CSS de cada app, porque el halo que traen los componentes de shadcn (`ring` al 50%) no llega a 3:1 sobre fondo claro. Los componentes no se editan.
- `border` e `input` no llegan a 3:1 contra el fondo: un campo se reconoce también por su etiqueta y por el foco, nunca solo por el borde.
- Esqueletos de carga en `muted`; estados vacíos con una línea que dice qué va a aparecer y la acción para empezar.

## Gráficos

- Las series usan `chart-1` a `chart-8` en ese orden, sin saltear. `chart-1` es el azul de marca y va siempre a la serie principal.
- El color sigue a la entidad, no a su posición: si un filtro saca una serie, las demás conservan su color. Para comparar fuentes, cada fuente tiene su color fijo en toda la app (por ejemplo Meta `chart-1`, Google Ads `chart-2`, Search Console `chart-3`, GA4 `chart-4`).
- Más de 8 series: las menores se agrupan en "Otros". En dispersión o mapas, solo las 3 primeras.
- Con 2 series o más, leyenda siempre; con 4 o menos, además el nombre de la serie junto a la línea o la barra.
- En claro, `chart-3`, `chart-4` y `chart-5` no llegan a 3:1 sobre `card`: esas series llevan rótulo o el gráfico ofrece la tabla.
- Texto del gráfico (ejes, valores, leyenda) en `foreground` y `muted-foreground`, nunca en el color de la serie. Grilla en `border`.
- Un solo eje vertical por gráfico: dos medidas de escala distinta (gasto y conversiones) van en dos gráficos.
- Líneas de 2px, barras con esquinas de 4px y 2px de separación entre barras.

## Logos

- Fondo claro: `logo-full-positivo` (texto en `brand-ink`, check en `brand-blue`).
- Fondo oscuro: `logo-full-negativo` (texto blanco, check en `brand-blue`). Una sola tinta blanca: `logo-full-white`.
- Con la leyenda "Digital Partner": `logo-leyenda-full-positivo` y `logo-leyenda-full-negativo`.
- Isotipo (las dos g con el check), para favicon, avatar y espacios cuadrados: `iso-02` (check en `brand-blue`) e `iso-01` (check en `brand-tint`). Los dos son blancos: van sobre fondo oscuro o sobre `brand-blue`.
- Los logos son imágenes: no se recolorean ni se redibujan.
