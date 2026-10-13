import { ESTADOS, type NombreDeEstado } from "@/components/estados/estados";
import { InsigniaDeEstado } from "@/components/estados/insignia-de-estado";

/** Una serie de gráfico de la fuente de valores: su nombre y para qué se usa. */
export type SerieDeGrafico = { name: string; usage: string };

/** El nombre del token de cada estado, tal como lo escribe la fuente (`success`, `warning`, …). */
export function tokenDeEstado(estado: NombreDeEstado): string {
  return ESTADOS[estado].clase.replace(/^text-/, "");
}

/**
 * Las series de gráfico y los estados (guía: Gráficos y Color).
 *
 * Las series salen de la fuente de valores, en su orden, y su color lo resuelve el tema
 * (`var(--chart-N)`), así que el modo activo manda sin que este componente lo sepa. El orden no se
 * saltea: la lista es la de la fuente, tal cual.
 *
 * Los estados van con la insignia del sistema —palabra e ícono además del color— y nunca con el
 * color de una serie: la guía lo prohíbe en las dos direcciones y el test lo comprueba.
 */
export function SeriesYEstados({ series }: { series: SerieDeGrafico[] }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h3 className="text-card-title">Series de gráfico, en orden</h3>
        <p className="text-body text-muted-foreground">
          Las series toman estos colores en este orden, sin saltear ninguno. Cada entidad conserva
          su color aunque cambie el filtro.
        </p>

        <ul className="flex flex-col gap-3">
          {series.map((serie) => (
            <li
              key={serie.name}
              data-serie={serie.name}
              className="flex items-center gap-4 border-b border-border pb-3"
            >
              <span
                data-muestra
                aria-hidden="true"
                className="size-10 shrink-0 rounded-md border border-border"
                style={{ backgroundColor: `var(--${serie.name})` }}
              />
              <span className="w-20 shrink-0 text-body-strong">{serie.name}</span>
              <span className="text-small text-muted-foreground">{serie.usage}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-card-title">Estados</h3>
        <p className="text-body text-muted-foreground">
          Los estados son de texto e íconos: siempre con una palabra o un ícono, nunca sólo el color,
          y nunca el color de una serie.
        </p>

        <ul className="flex flex-wrap items-center gap-4">
          {(Object.keys(ESTADOS) as NombreDeEstado[]).map((estado) => (
            <li key={estado} data-estado={tokenDeEstado(estado)} className="flex items-center">
              <InsigniaDeEstado estado={estado} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
