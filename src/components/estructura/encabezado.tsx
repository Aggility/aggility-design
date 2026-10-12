"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { BotonDeMenu } from "@/components/estructura/barra-lateral";
import { seccionDeLaRuta } from "@/components/estructura/secciones";
import { SelectorDeModo } from "@/components/tema/selector-de-modo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * El encabezado de la pantalla: el título de la sección actual, su acción principal cuando
 * la pantalla tiene una y el selector de modo.
 */
export function Encabezado() {
  const seccion = seccionDeLaRuta(usePathname());

  return (
    <header className="flex min-h-16 items-center justify-between gap-4 border-b border-border px-6 py-3">
      <div className="flex min-w-0 items-center gap-2">
        <BotonDeMenu />
        <h1 className="text-page-title">{seccion?.titulo ?? "Aggility"}</h1>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {seccion?.accion ? (
          // Un enlace con el aspecto de botón: navega, así que su rol es enlace, no botón.
          <Link href={seccion.accion.href} className={cn(buttonVariants())}>
            {seccion.accion.etiqueta}
          </Link>
        ) : null}
        <SelectorDeModo />
      </div>
    </header>
  );
}
