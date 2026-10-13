import fuente from "../../../sistema/tokens.json";

import { TablaDeColores, type ColorDeLaTabla } from "@/components/fundamentos/tabla-de-colores";

/** Los 42 colores de la fuente, con el valor de cada modo. */
const COLORES: ColorDeLaTabla[] = fuente.color.tokens.map((token) => ({
  name: token.name,
  usage: token.usage,
  claro: typeof token.value === "string" ? token.value : token.value.light,
  oscuro: typeof token.value === "string" ? token.value : token.value.dark,
}));

export default function Fundamentos() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <p className="text-body text-muted-foreground">
        Los colores del tema, con su nombre, su valor en el modo activo y para qué se usan. Salen de{" "}
        <code>sistema/tokens.json</code>: se cambia ahí y se regenera el tema, sin editar esta pantalla.
      </p>

      <TablaDeColores colores={COLORES} />
    </div>
  );
}
