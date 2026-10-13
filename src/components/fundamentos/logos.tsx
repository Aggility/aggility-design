import Image, { type StaticImageData } from "next/image";

import iso01 from "../../../sistema/logos/iso-01.png";
import iso02 from "../../../sistema/logos/iso-02.png";
import logoFullNegativo from "../../../sistema/logos/logo-full-negativo.webp";
import logoFullPositivo from "../../../sistema/logos/logo-full-positivo.webp";
import logoFullWhite from "../../../sistema/logos/logo-full-white.webp";
import logoLeyendaNegativo from "../../../sistema/logos/logo-leyenda-full-negativo.webp";
import logoLeyendaPositivo from "../../../sistema/logos/logo-leyenda-full-positivo.webp";
import { cn } from "@/lib/utils";

/** Un logo de la carpeta del sistema, con la regla de uso que le da la guía. */
type LogoDeLaGuia = {
  /** El nombre del archivo en `sistema/logos/`, que es lo que el test compara con la carpeta. */
  archivo: string;
  nombre: string;
  alt: string;
  /** El fondo de marca sobre el que va: la paleta `brand-*` es fija en los dos modos. */
  fondo: string;
  uso: string;
  /** Los isotipos van en un espacio cuadrado; el resto, en un marco ancho. */
  cuadrado?: boolean;
  imagen: StaticImageData;
};

/**
 * Los logos de Aggility con la regla de uso de cada uno (guía visual: Logos).
 *
 * Van como imágenes, sin recolorear ni redibujar: se muestran tal como están en `sistema/logos/`.
 * El fondo de cada marco es de la paleta de marca, que la guía fija igual en los dos modos, así que
 * la pareja logo-fondo se ve igual en claro y en oscuro.
 */
const LOGOS: LogoDeLaGuia[] = [
  {
    archivo: "logo-full-positivo.webp",
    nombre: "Logo completo",
    alt: "Logo de Aggility",
    fondo: "bg-brand-tint",
    uso: "Fondo claro: el texto va en brand-ink y el check en brand-blue.",
    imagen: logoFullPositivo,
  },
  {
    archivo: "logo-leyenda-full-positivo.webp",
    nombre: "Logo con la leyenda",
    alt: "Logo de Aggility con la leyenda Digital Partner",
    fondo: "bg-brand-tint",
    uso: "Fondo claro, con la leyenda «Digital Partner».",
    imagen: logoLeyendaPositivo,
  },
  {
    archivo: "logo-full-negativo.webp",
    nombre: "Logo en negativo",
    alt: "Logo de Aggility en negativo",
    fondo: "bg-brand-ink",
    uso: "Fondo oscuro: el texto va en blanco y el check en brand-blue.",
    imagen: logoFullNegativo,
  },
  {
    archivo: "logo-full-white.webp",
    nombre: "Logo en una tinta",
    alt: "Logo de Aggility en una sola tinta blanca",
    fondo: "bg-brand-ink",
    uso: "Una sola tinta blanca, para fondos oscuros.",
    imagen: logoFullWhite,
  },
  {
    archivo: "logo-leyenda-full-negativo.webp",
    nombre: "Logo con la leyenda, en negativo",
    alt: "Logo de Aggility en negativo con la leyenda Digital Partner",
    fondo: "bg-brand-ink",
    uso: "Fondo oscuro, con la leyenda «Digital Partner».",
    imagen: logoLeyendaNegativo,
  },
  {
    archivo: "iso-01.png",
    nombre: "Isotipo, check en brand-tint",
    alt: "Isotipo de Aggility con el check en brand-tint",
    fondo: "bg-brand-blue",
    uso: "Espacio cuadrado: las dos g con el check, para favicon y avatar.",
    cuadrado: true,
    imagen: iso01,
  },
  {
    archivo: "iso-02.png",
    nombre: "Isotipo, check en brand-blue",
    alt: "Isotipo de Aggility con el check en brand-blue",
    fondo: "bg-brand-blue",
    uso: "Espacio cuadrado: el isotipo va sobre fondo oscuro o sobre brand-blue.",
    cuadrado: true,
    imagen: iso02,
  },
];

export function Logos() {
  return (
    <ul className="flex flex-wrap items-start gap-6">
      {LOGOS.map((logo) => (
        <li key={logo.archivo} data-logo={logo.archivo} className="flex w-56 flex-col gap-2">
          <span
            data-fondo
            className={cn(
              "flex items-center justify-center rounded-md",
              logo.cuadrado ? "size-16 p-2" : "h-16 px-4 py-3",
              logo.fondo,
            )}
          >
            <Image
              src={logo.imagen}
              alt={logo.alt}
              // La pantalla es la referencia visual y se fotografía entera (`npm run capturas`):
              // con la carga diferida de `next/image`, los logos de abajo llegarían vacíos.
              loading="eager"
              className={logo.cuadrado ? "size-full object-contain" : "h-6 w-auto"}
            />
          </span>

          <span className="text-body-strong">{logo.nombre}</span>
          <span className="text-small text-muted-foreground">{logo.uso}</span>
        </li>
      ))}
    </ul>
  );
}
