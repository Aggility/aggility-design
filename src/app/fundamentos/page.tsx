import fuente from "../../../sistema/tokens.json";

import { EstilosDeTexto, type EstiloDeTexto } from "@/components/fundamentos/estilos-de-texto";
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
    </div>
  );
}
