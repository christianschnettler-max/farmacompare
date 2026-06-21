// Catálogo de farmacias chilenas.
// "default: true" → viene preseleccionada.
// "buscarUrl(termino)" → URL de búsqueda en el sitio real (la usa el motor de navegador).
//
// Para agregar una farmacia: añade un objeto aquí. El motor de navegador (Electron)
// abrirá esa URL, esperará a que cargue y extraerá los productos visibles.

export const CATALOGO_FARMACIAS = [
  {
    id: "salcobrand",
    nombre: "Salcobrand",
    default: true,
    buscarUrl: (t) => `https://salcobrand.cl/search_result?query=${encodeURIComponent(t)}`,
  },
  {
    id: "cruzverde",
    nombre: "Cruz Verde",
    default: true,
    buscarUrl: (t) => `https://www.cruzverde.cl/search?query=${encodeURIComponent(t)}`,
  },
  {
    id: "ahumada",
    nombre: "Farmacias Ahumada",
    default: true,
    buscarUrl: (t) => `https://www.farmaciasahumada.cl/search?q=${encodeURIComponent(t)}`,
  },
  {
    id: "buho",
    nombre: "Búho",
    default: true,
    buscarUrl: (t) => `https://www.buho.cl/search?q=${encodeURIComponent(t)}`,
  },
  {
    id: "meki",
    nombre: "Meki",
    default: true,
    buscarUrl: (t) => `https://www.meki.cl/search?q=${encodeURIComponent(t)}`,
  },
  // ─── Otras farmacias disponibles (no preseleccionadas) ─────────────────────
  {
    id: "drsimi",
    nombre: "Dr. Simi",
    default: false,
    buscarUrl: (t) => `https://www.drsimi.cl/search?q=${encodeURIComponent(t)}`,
  },
  {
    id: "knop",
    nombre: "Farmacias Knop",
    default: false,
    buscarUrl: (t) => `https://www.knop.cl/?s=${encodeURIComponent(t)}`,
  },
  {
    id: "farmaloncos",
    nombre: "Farmaloncos",
    default: false,
    buscarUrl: (t) => `https://farmaloncos.cl/?s=${encodeURIComponent(t)}`,
  },
  {
    id: "redfarma",
    nombre: "Redfarma",
    default: false,
    buscarUrl: (t) => `https://www.redfarma.cl/catalogsearch/result/?q=${encodeURIComponent(t)}`,
  },
  {
    id: "liga",
    nombre: "Liga contra la Epilepsia",
    default: false,
    buscarUrl: (t) => `https://www.ligaepilepsia.cl/?post_type=product&s=${encodeURIComponent(t)}`,
  },
  {
    id: "galenica",
    nombre: "Farmacia Galénica",
    default: false,
    buscarUrl: (t) => `https://farmaciagalenica.cl/?post_type=product&s=${encodeURIComponent(t)}`,
  },
];

export const FARMACIAS_DEFAULT = CATALOGO_FARMACIAS.filter((f) => f.default).map((f) => f.id);
