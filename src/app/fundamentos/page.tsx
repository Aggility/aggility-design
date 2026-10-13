import fuente from "../../../sistema/tokens.json";

import { EspacioYRadios, type MedidaDeLaEscala } from "@/components/fundamentos/espacio-y-radios";
import { EstilosDeTexto, type EstiloDeTexto } from "@/components/fundamentos/estilos-de-texto";
import { SeriesYEstados, type SerieDeGrafico } from "@/components/fundamentos/series-y-estados";
import { TablaDeColores, type ColorDeLaTabla } from "@/components/fundamentos/tabla-de-colores";

/** Los 42 colores de la fuente, con el valor de cada modo. */
const COLORES: ColorDeLaTabla[] = fuente.color.tokens.map((token) => ({
  name: token.name,
  usage: token.usage,
  claro: typeof token.value === "string" ? token.value : token.value.light,
  oscuro: typeof token.value === "string" ? token.value : token.value.dark,
}));

/** Los 10 estilos de texto de la fuente, con sus medidas y su texto de ejemplo. */
const ESTILOS: EstiloDeTexto[] = fuente.type.groups.flatMap((grupo) => grupo.styles);

/** La escala de espacio y los cuatro radios del tema, con su medida y su uso. */
const ESPACIOS: MedidaDeLaEscala[] = fuente.spacing.tokens;
const RADIOS: MedidaDeLaEscala[] = fuente.radius.tokens;

/** Las series de gráfico de la fuente, en su orden, sin saltear ninguna. */
const SERIES: SerieDeGrafico[] = fuente.color.tokens
  .filter((token) => /^chart-/.test(token.name))
  .map((token) => ({ name: token.name, usage: token.usage }));

export default function Fundamentos() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <p className="text-body text-muted-foreground">
        El sistema aplicado, con los valores de <code>sistema/tokens.json</code>: se cambia ahí y se
        regenera el tema, sin editar esta pantalla.
      </p>

      <section className="flex flex-col gap-4">
        <h2 className="text-section-title">Colores</h2>
        <p className="text-body text-muted-foreground">
          Cada color con su nombre, su valor en el modo activo y para qué se usa.
        </p>

        <TablaDeColores colores={COLORES} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-section-title">Estilos de texto</h2>
        <p className="text-body text-muted-foreground">
          Cada estilo con su nombre, su tamaño, su alto de línea y su peso, aplicado sobre el texto
          de ejemplo de la fuente. Una sola tipografía para todo el sistema.
        </p>

        <EstilosDeTexto estilos={ESTILOS} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-section-title">Espacio y radios</h2>
        <p className="text-body text-muted-foreground">
          La escala de espacio, medida en la separación de un ejemplo, y los cuatro radios sobre
          cajas del mismo tamaño, para poder compararlos.
        </p>

        <EspacioYRadios espacios={ESPACIOS} radios={RADIOS} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-section-title">Series y estados</h2>
        <p className="text-body text-muted-foreground">
          Los colores de gráfico, en su orden, y los estados con su palabra y su ícono.
        </p>

        <SeriesYEstados series={SERIES} />
      </section>
    </div>
  );
}
