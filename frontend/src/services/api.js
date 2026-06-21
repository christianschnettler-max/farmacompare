// Detecta si corre dentro de la app de escritorio
export const esAppEscritorio =
  typeof window !== "undefined" && window.farmaApi?.esEscritorio === true;

// Abre la búsqueda de una farmacia en el navegador.
// En escritorio usa el navegador del sistema; en web abre una pestaña nueva.
export function abrirFarmacia(url) {
  if (window.farmaApi?.abrirUrl) {
    window.farmaApi.abrirUrl(url);
  } else {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
