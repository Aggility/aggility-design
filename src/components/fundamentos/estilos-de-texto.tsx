/**
 * Las clases del tema de cada estilo, escritas enteras.
 *
 * Tailwind arma las utilidades que ve escritas en el código: una clase compuesta al vuelo
 * (`text-${nombre}`) no existe en el CSS compilado, así que el estilo no se aplicaría. La lista no
 * puede quedar vieja sin que se note: el test de la pantalla mide, estilo por estilo, lo que el
 * navegador dibuja contra la fuente de valores, y nombra al que se quedó sin su clase.
 */
const CLASES: Record<string, string> = {
  "page-title": "text-page-title",
  "section-title": "text-section-title",
  "card-title": "text-card-title",
  body: "text-body",
  "body-strong": "text-body-strong",
  small: "text-small",
  label: "text-label",
  "kpi-value": "text-kpi-value",
  "kpi-delta": "text-kpi-delta",
  display: "text-display",
};

/** Un estilo de texto de la fuente de valores, con sus medidas y su texto de ejemplo. */
export type EstiloDeTexto = {
  name: string;
  fontSize: string;
  lineHeight: string;
  fontWeight: number;
  letterSpacing?: string;
  sample: string;
  usage: string;
};

/**
 * Los estilos de texto del tema: cada uno con su nombre, sus medidas al lado, el uso y el texto de
 * ejemplo de la fuente **aplicado** con la clase del tema (no una copia de sus valores).
 */
export function EstilosDeTexto({ estilos }: { estilos: EstiloDeTexto[] }) {
  return (
    <ul className="flex flex-col gap-4">
      {estilos.map((estilo) => (
        <li
          key={estilo.name}
          data-estilo={estilo.name}
          className="flex flex-col gap-2 border-b border-border pb-4"
        >
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className="text-body-strong">{estilo.name}</span>
            <span className="text-small text-muted-foreground">
              Tamaño <span data-medida="tamano" className="text-foreground">{estilo.fontSize}</span>
              {" · "}Línea <span data-medida="linea" className="text-foreground">{estilo.lineHeight}</span>
              {" · "}Peso <span data-medida="peso" className="text-foreground">{estilo.fontWeight}</span>
            </span>
          </div>

          <p data-muestra className={CLASES[estilo.name]}>
            {estilo.sample}
          </p>

          <span className="text-small text-muted-foreground">{estilo.usage}</span>
        </li>
      ))}
    </ul>
  );
}
