# Spec Delta

## Purpose

Una pantalla que muestra el sistema aplicado —colores, texto, espacio, radios, gráficos, estados y logos— para que Germán lo revise de una vez y para que un agente copie de ahí en lugar de inventar un diseño.

## ADDED Requirements

### Requirement: Colores con nombre y valor

La pantalla SHALL mostrar cada color del tema con su nombre, su valor y para qué se usa, y SHALL mostrar los valores de claro y de oscuro según el modo activo (sección 5.2, regla 1).

#### Scenario: Los colores se ven con su nombre y su valor

- **WHEN** la persona abre la pantalla de fundamentos
- **THEN** ve cada color del tema con su nombre, su valor y una muestra del color

#### Scenario: El modo activo manda

- **WHEN** la persona cambia el modo
- **THEN** los valores que se muestran son los del modo activo, y se puede seguir viendo qué color es

#### Scenario: Un color de marca con un solo valor

- **WHEN** la persona mira un color de marca, que tiene un solo valor para los dos modos
- **THEN** lo ve con ese mismo valor en claro y en oscuro, junto a los que sí cambian de modo

### Requirement: Estilos de texto

La pantalla SHALL mostrar cada estilo de texto del tema con su nombre, su tamaño, su alto de línea, su peso y para qué se usa, aplicado sobre texto real (sección 5.2).

#### Scenario: Cada estilo se ve aplicado

- **WHEN** la persona recorre la pantalla
- **THEN** cada estilo de texto se ve aplicado en un texto de ejemplo y con sus medidas al lado

#### Scenario: Una sola tipografía

- **WHEN** se recorren los estilos de texto
- **THEN** todos usan la misma familia tipográfica y ninguno muestra un peso distinto de los que la fuente de valores define

### Requirement: Escala de espacio y radios

La pantalla SHALL mostrar la escala de espacio y los radios del tema con su nombre, su medida y un ejemplo visible de cada uno (sección 5.2, regla 2).

#### Scenario: El espacio se ve

- **WHEN** la persona recorre la escala de espacio
- **THEN** ve cada medida con su nombre y un ejemplo que la muestra

#### Scenario: Los radios se ven

- **WHEN** la persona recorre los radios
- **THEN** ve cada radio con su medida sobre un elemento del mismo tamaño, para poder compararlos

### Requirement: Colores de gráficos y estados

La pantalla SHALL mostrar las series de gráfico en el orden de la fuente de valores, sin saltear ninguna, y SHALL mostrar los estados siempre acompañados de una palabra, un signo o un ícono (guía visual: Gráficos y Color).

#### Scenario: Las series se ven en orden

- **WHEN** la persona mira las series de gráfico
- **THEN** se ven una detrás de la otra en el orden de la fuente de valores, cada una con su nombre

#### Scenario: Los estados llevan palabra o signo

- **WHEN** la persona mira los estados
- **THEN** cada estado se ve con una palabra, un signo o un ícono que lo explica además del color

#### Scenario: Un estado usado como serie

- **WHEN** una serie de gráfico usa el color de un estado
- **THEN** la pantalla no lo hace así: los estados son de texto e íconos, nunca el color de una serie (guía visual: Color)

### Requirement: Logos con su regla de uso

La pantalla SHALL mostrar los logos de Aggility con la regla de uso de cada uno —cuál va sobre fondo claro, cuál sobre fondo oscuro y cuál en un espacio cuadrado— y SHALL mostrarlos como imágenes, sin recolorearlos ni redibujarlos (guía visual: Logos).

#### Scenario: Cada logo con su fondo

- **WHEN** la persona mira los logos
- **THEN** cada uno se ve sobre el fondo que le corresponde, en los dos modos

#### Scenario: El isotipo en un espacio cuadrado

- **WHEN** la persona mira el isotipo
- **THEN** se ve sobre el fondo que la guía indica y no se usa el logo completo en su lugar

### Requirement: Lo que se muestra sale de la fuente de valores

Los valores que la pantalla muestra SHALL coincidir con los de la fuente: un valor que cambia en la fuente SHALL verse cambiado en la pantalla sin editar la pantalla (CA-2, regla 2).

#### Scenario: Un valor nuevo se ve en la pantalla

- **WHEN** se cambia un valor en la fuente de valores y se regenera el tema
- **THEN** la pantalla muestra el valor nuevo con su nombre

#### Scenario: La pantalla quedó con un valor viejo

- **WHEN** un valor que la pantalla muestra no coincide con el de la fuente de valores
- **THEN** la verificación falla y nombra el valor que quedó desactualizado
