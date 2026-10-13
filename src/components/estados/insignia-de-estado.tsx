import { Badge } from "@/components/ui/badge";
import { ESTADOS, type NombreDeEstado } from "@/components/estados/estados";
import { cn } from "@/lib/utils";

/**
 * La insignia de un estado: el ícono y la palabra, además del color.
 *
 * Se le puede pasar un texto propio (por ejemplo "+12,4 %") y la palabra del estado queda
 * como nombre accesible, así el estado nunca se comunica sólo por color.
 */
export function InsigniaDeEstado({
  estado,
  children,
}: {
  estado: NombreDeEstado;
  children?: React.ReactNode;
}) {
  const { palabra, Icono, clase } = ESTADOS[estado];

  return (
    <Badge variant="outline" className={cn("gap-1.5", clase)}>
      <Icono aria-hidden="true" />
      {children ?? palabra}
      <span className="sr-only">{palabra}</span>
    </Badge>
  );
}
