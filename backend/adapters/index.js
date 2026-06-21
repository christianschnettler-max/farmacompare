import { crearAdapterVTEX } from "./vtexAdapter.js";
import { crearAdapterMock } from "./mockAdapter.js";

// ─── Farmacias confirmadas VTEX ──────────────────────────────────────────────
// Para añadir una nueva farmacia VTEX: agrega una línea crearAdapterVTEX({ ... })

const salcobrand = crearAdapterVTEX({
  nombre: "Salcobrand",
  baseUrl: "https://salcobrand.cl",
  logo: "/logos/salcobrand.png",
});

const cruzVerde = crearAdapterVTEX({
  nombre: "Cruz Verde",
  baseUrl: "https://www.cruzverde.cl",
  logo: "/logos/cruzverde.png",
});

const ahumada = crearAdapterVTEX({
  nombre: "Farmacias Ahumada",
  baseUrl: "https://www.farmaciasahumada.cl",
  logo: "/logos/ahumada.png",
});

// ─── Farmacias pendientes de confirmar plataforma ────────────────────────────
// TODO: Verificar si Búho/Meki usan VTEX u otra plataforma.
// Si usan VTEX: reemplaza crearAdapterMock por crearAdapterVTEX con su baseUrl.
// Si usan otra API: crea un adapter propio en adapters/buhoAdapter.js, etc.
// Ver README.md sección "Cómo agregar una farmacia" para instrucciones.

const buho = crearAdapterMock({
  nombre: "Búho",
  logo: "/logos/buho.png",
  // baseUrl: "https://www.buho.cl", // descomentar si se confirma VTEX
});

const meki = crearAdapterMock({
  nombre: "Meki",
  logo: "/logos/meki.png",
  // baseUrl: "https://www.meki.cl", // descomentar si se confirma VTEX
});

export const farmacias = [salcobrand, cruzVerde, ahumada, buho, meki];
