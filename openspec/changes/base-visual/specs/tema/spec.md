# Spec Delta

## Purpose

Define cómo los valores visuales de Aggility llegan a la aplicación y cómo se cambia entre modo claro y oscuro: un solo origen de valores, un tema generado por un comando que se verifica solo, y ningún valor escrito a mano en las pantallas.

## ADDED Requirements

### Requirement: Tema generado por un comando

El tema SHALL generarse desde la única fuente de valores del sistema de diseño mediante un comando, y SHALL ser reproducible: ejecutarlo dos veces sobre la misma fuente SHALL dejar exactamente el mismo contenido (CA-2, regla 3).

#### Scenario: Regenerar el tema no cambia nada

- **WHEN** se ejecuta el comando que genera el tema sin haber cambiado la fuente de valores
- **THEN** el contenido del tema queda igual y la verificación del proyecto queda en verde

#### Scenario: El tema editado a mano hace fallar la verificación

- **WHEN** alguien cambia un valor directamente en el tema publicado en lugar de la fuente de valores
- **THEN** la verificación falla e indica que el tema no coincide con lo que el comando genera

#### Scenario: La fuente de valores no se puede leer

- **WHEN** el comando no encuentra o no puede interpretar la fuente de valores
- **THEN** falla con un mensaje que nombra el archivo y no escribe un tema incompleto

### Requirement: Un cambio de la fuente llega al tema

Un valor nuevo o modificado en la fuente SHALL aparecer en el tema generado, en los dos modos, sin tocar componentes ni hojas de estilo a mano (CA-2, regla 3).

#### Scenario: Un valor nuevo aparece en el tema

- **WHEN** se agrega un valor a la fuente y se ejecuta el comando
- **THEN** el tema lo publica con el nombre que la fuente le da, disponible en claro y en oscuro

#### Scenario: Un color sin valor para uno de los dos modos

- **WHEN** la fuente trae un color al que le falta el valor de alguno de los dos modos
- **THEN** el comando falla y nombra el color y el modo que falta, en lugar de inventar un valor

### Requirement: Cobertura del tema

El tema SHALL publicar los cuatro grupos de la fuente de valores —colores, estilos de texto, escala de espacio y radios— con los nombres de cada grupo, de modo que una pantalla use cualquiera de ellos sin escribir valores propios (regla 2).

#### Scenario: Los cuatro grupos están disponibles

- **WHEN** una pantalla necesita un color, un estilo de texto, un espacio o un radio
- **THEN** existe una clase del tema para ese valor y su nombre coincide con el de la fuente

#### Scenario: Los colores de gráficos y los estados están disponibles

- **WHEN** una pantalla necesita una serie de gráfico o un estado (bueno, necesita atención, error)
- **THEN** el tema publica cada uno de ellos y ninguno queda afuera

#### Scenario: Los radios siguen a la base

- **WHEN** cambia el radio base en la fuente de valores
- **THEN** los cuatro radios del tema cambian en la misma proporción que la fuente define

### Requirement: Ningún valor visual literal

Ningún color, tamaño de letra ni radio en el código de la aplicación SHALL escribirse como valor literal: todos SHALL salir de las clases del tema, y una verificación SHALL fallar cuando aparezca uno (CA-1, regla 2).

#### Scenario: Un color literal rompe la verificación

- **WHEN** alguien escribe un color literal (hexadecimal, rgb, hsl u oklch) en el código de la aplicación
- **THEN** la verificación falla y nombra el archivo y la línea donde está

#### Scenario: Un tamaño de letra o un radio literal rompen la verificación

- **WHEN** alguien escribe un tamaño de letra o un radio literal en el código de la aplicación
- **THEN** la verificación falla y nombra el archivo y la línea donde está

#### Scenario: Falta un valor en el sistema

- **WHEN** una pantalla necesita un valor que la fuente de valores no tiene
- **THEN** no se escribe un literal: el trabajo se detiene y queda anotado como bloqueo (regla 2)

### Requirement: Modo claro y oscuro

Sin elección guardada, la aplicación SHALL mostrarse en el modo del sistema operativo. Cuando la persona elige un modo, la aplicación SHALL recordarlo en el dispositivo y SHALL respetarlo en las próximas visitas (CA-3).

#### Scenario: Sin elección guardada sigue al sistema

- **WHEN** no hay ninguna elección guardada y el sistema operativo está en oscuro
- **THEN** la aplicación se ve en oscuro

#### Scenario: La elección se recuerda

- **WHEN** la persona elige el modo claro y vuelve a cargar la aplicación
- **THEN** la aplicación se ve en claro, sin importar el modo del sistema operativo

#### Scenario: La elección no se pisa sola

- **WHEN** hay una elección guardada y el sistema operativo cambia de modo
- **THEN** la aplicación conserva el modo elegido

#### Scenario: El modo se aplica antes del primer pintado

- **WHEN** la aplicación se abre con una elección guardada de oscuro
- **THEN** el primer pintado ya es oscuro y no se ve un destello del modo claro

### Requirement: Tema copiable a otra aplicación

El tema generado SHALL ser un archivo autocontenido que otra aplicación de Aggility pueda copiar sin traer nada más de este proyecto, y SHALL declarar de dónde salió y con qué fecha (CA-2, regla 3).

#### Scenario: Copiar el tema a otra aplicación

- **WHEN** se copia el archivo del tema a otra aplicación, sin el resto de este proyecto
- **THEN** esa aplicación publica los mismos valores en claro y en oscuro

#### Scenario: El tema declara su origen

- **WHEN** se abre el tema generado
- **THEN** su encabezado dice que es generado, desde qué fuente y con qué fecha

### Requirement: Una sola tipografía

La aplicación SHALL usar una sola familia tipográfica, cargada por la propia aplicación y disponible antes del primer pintado, y SHALL limitarse a los pesos que la fuente de valores define (regla 2).

#### Scenario: La tipografía del sistema está disponible

- **WHEN** una pantalla se abre, con o sin conexión
- **THEN** el texto se ve con la familia del sistema y no con la de reserva

#### Scenario: El modo no cambia la tipografía

- **WHEN** se cambia entre claro y oscuro
- **THEN** la familia y los pesos son los mismos en los dos modos
