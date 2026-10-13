/**
 * Las clases del tema de cada medida, escritas enteras.
 *
 * Tailwind arma las utilidades que ve escritas en el código: una clase compuesta al vuelo no
 * existiría en el CSS compilado. El test de la pantalla es el que cuida que la lista no quede
 * vieja, porque mide lo que el navegador dibuja contra la fuente de valores y nombra la medida que
 * se quedó sin su clase.
 *
 * El espacio no tiene tokens propios (decisión 7 de `design.md`): la escala de la fuente coincide
 * con la unidad por defecto de la herramienta, así que `space-4` se dibuja con `gap-4`. Los radios
 * sí salen del tema, que los deriva del radio base (decisión 8).
 */
const CLASES_DE_ESPACIO: Record<string, string> = {
  "space-1": "gap-1",
  "space-2": "gap-2",
  "space-3": "gap-3",
  "space-4": "gap-4",
  "space-6": "gap-6",
  "space-8": "gap-8",
};

const CLASES_DE_RADIO: Record<string, string> = {
  "radius-sm": "rounded-sm",
  "radius-md": "rounded-md",
  "radius-lg": "rounded-lg",
  "radius-xl": "rounded-xl",
};

/** Una medida de la fuente de valores: su nombre, su valor en píxeles y para qué se usa. */
export type MedidaDeLaEscala = { name: string; value: string; usage: string };

/**
 * La escala de espacio y los radios del tema, cada uno con su nombre, su medida y un ejemplo
 * visible: la separación entre dos cuadros para el espacio, y los cuatro radios sobre cajas del
 * mismo tamaño, que es lo que permite compararlos.
 */
export function EspacioYRadios({
  espacios,
  radios,
}: {
  espacios: MedidaDeLaEscala[];
  radios: MedidaDeLaEscala[];
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h3 className="text-card-title">Escala de espacio</h3>

        <ul className="flex flex-col gap-3">
          {espacios.map((espacio) => (
            <li
              key={espacio.name}
              data-espacio={espacio.name}
              className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border pb-3"
            >
              <span className="w-24 text-body-strong">{espacio.name}</span>
              <span data-medida className="w-16 text-small text-foreground">{espacio.value}</span>
              <span className="text-small text-muted-foreground">{espacio.usage}</span>
              <span data-ejemplo className={`ml-auto flex items-center ${CLASES_DE_ESPACIO[espacio.name]}`}>
                <span className="size-3 rounded-sm bg-primary" />
                <span className="size-3 rounded-sm bg-primary" />
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-card-title">Radios</h3>

        <ul className="flex flex-wrap items-start gap-6">
          {radios.map((radio) => (
            <li key={radio.name} data-radio={radio.name} className="flex flex-col gap-2">
              <span
                data-ejemplo
                className={`size-16 border border-border bg-card ${CLASES_DE_RADIO[radio.name]}`}
              />
              <span className="text-body-strong">{radio.name}</span>
              <span data-medida className="text-small text-muted-foreground">{radio.value}</span>
              <span className="max-w-40 text-small text-muted-foreground">{radio.usage}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
