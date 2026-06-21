import { BrowserWindow } from "electron";

// ─── Recetas por farmacia ─────────────────────────────────────────────────────
// searchUrl: cómo construir la URL de búsqueda real del sitio.
// Para agregar una farmacia nueva, añade una entrada aquí con su id (igual al del
// catálogo del frontend) y su URL de búsqueda. El extractor genérico hace el resto.
const RECETAS = {
  salcobrand: { searchUrl: (t) => `https://salcobrand.cl/search_result?query=${encodeURIComponent(t)}` },
  cruzverde: { searchUrl: (t) => `https://www.cruzverde.cl/search?query=${encodeURIComponent(t)}` },
  ahumada: { searchUrl: (t) => `https://www.farmaciasahumada.cl/search?q=${encodeURIComponent(t)}` },
  buho: { searchUrl: (t) => `https://www.buho.cl/search?q=${encodeURIComponent(t)}` },
  meki: { searchUrl: (t) => `https://www.meki.cl/search?q=${encodeURIComponent(t)}` },
  drsimi: { searchUrl: (t) => `https://www.drsimi.cl/search?q=${encodeURIComponent(t)}` },
  knop: { searchUrl: (t) => `https://www.knop.cl/?s=${encodeURIComponent(t)}` },
  farmaloncos: { searchUrl: (t) => `https://farmaloncos.cl/?s=${encodeURIComponent(t)}` },
  redfarma: { searchUrl: (t) => `https://www.redfarma.cl/catalogsearch/result/?q=${encodeURIComponent(t)}` },
};

const NOMBRES = {
  salcobrand: "Salcobrand",
  cruzverde: "Cruz Verde",
  ahumada: "Farmacias Ahumada",
  buho: "Búho",
  meki: "Meki",
  drsimi: "Dr. Simi",
  knop: "Farmacias Knop",
  farmaloncos: "Farmaloncos",
  redfarma: "Redfarma",
};

// ─── Extractor genérico (corre DENTRO de la página real) ──────────────────────
// Busca tarjetas de producto detectando precios visibles y su contexto.
// Devuelve hasta 6 productos por farmacia.
const SCRIPT_EXTRACTOR = `(() => {
  const out = [];
  const vistos = new Set();
  const precioRe = /\\$\\s?([\\d]{1,3}(?:[.,]\\d{3})+|\\d{3,6})/;

  function parsePrecio(txt) {
    const m = (txt || "").match(precioRe);
    if (!m) return null;
    const n = parseInt(m[1].replace(/[.,]/g, ""), 10);
    return (n >= 100 && n <= 2000000) ? n : null;
  }

  // Candidatos: cualquier enlace a una página de producto
  const anchors = Array.from(document.querySelectorAll('a[href]'));
  for (const a of anchors) {
    const href = a.href || "";
    // Heurística: links de producto suelen contener /producto, /product, /p/, o terminar en /p
    if (!/produc|\\/p\\/|\\/p$|item|detalle/i.test(href)) continue;

    // Subir a un contenedor que tenga precio
    let cont = a;
    for (let i = 0; i < 5 && cont; i++) {
      const txt = cont.textContent || "";
      if (precioRe.test(txt)) break;
      cont = cont.parentElement;
    }
    if (!cont) continue;
    const texto = cont.textContent || "";
    const precio = parsePrecio(texto);
    if (!precio) continue;

    // Nombre: el texto del link, o el heading más cercano
    let nombre = (a.textContent || "").trim();
    if (nombre.length < 4) {
      const h = cont.querySelector('h1,h2,h3,h4,[class*="name"],[class*="title"]');
      if (h) nombre = (h.textContent || "").trim();
    }
    nombre = nombre.replace(/\\s+/g, " ").slice(0, 120);
    if (nombre.length < 4) continue;

    const clave = nombre.toLowerCase() + "|" + precio;
    if (vistos.has(clave)) continue;
    vistos.add(clave);

    const img = cont.querySelector('img');
    out.push({
      nombreProducto: nombre,
      precio,
      url: href,
      imagen: img ? (img.src || img.getAttribute('data-src') || null) : null,
    });
    if (out.length >= 6) break;
  }
  return out;
})()`;

// ─── Buscar en UNA farmacia abriendo su página real ───────────────────────────
async function buscarEnFarmacia(id, termino) {
  const receta = RECETAS[id];
  if (!receta) return { id, nombre: id, productos: [], error: "Farmacia no configurada" };

  const win = new BrowserWindow({
    width: 1280,
    height: 900,
    show: false,
    webPreferences: { offscreen: false, images: false, javascript: true },
  });

  try {
    await win.loadURL(receta.searchUrl(termino), {
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    });

    // Esperar a que aparezcan precios (SPA puede tardar). Máx ~12s.
    let productos = [];
    const inicio = Date.now();
    while (Date.now() - inicio < 12000) {
      await new Promise((r) => setTimeout(r, 1200));
      try {
        productos = await win.webContents.executeJavaScript(SCRIPT_EXTRACTOR, true);
      } catch {
        productos = [];
      }
      if (productos && productos.length > 0) break;
    }

    return {
      id,
      nombre: NOMBRES[id] || id,
      productos: (productos || []).map((p) => normalizar(p, id)),
    };
  } catch (err) {
    return { id, nombre: NOMBRES[id] || id, productos: [], error: err.message };
  } finally {
    win.destroy();
  }
}

function clasificarTipo(nombre) {
  const n = (nombre || "").toLowerCase();
  if (/bioequiv/.test(n)) return "bioequivalente";
  if (/gen[eé]rico/.test(n)) return "generico";
  return "desconocido";
}

function normalizar(p, id) {
  return {
    farmacia: NOMBRES[id] || id,
    nombreProducto: p.nombreProducto,
    principioActivo: p.nombreProducto?.match(/^([^\d,(]+)/)?.[1]?.trim() || p.nombreProducto,
    precio: p.precio,
    precioPromocion: null,
    tipo: clasificarTipo(p.nombreProducto),
    stock: "desconocido",
    url: p.url,
    imagen: p.imagen,
    laboratorio: null,
  };
}

// ─── API pública: buscar varios medicamentos en varias farmacias ──────────────
export async function buscarPrecios(medicamentos, farmaciaIds) {
  const resultadoPorMedicamento = [];

  for (const med of medicamentos) {
    // Buscar este medicamento en todas las farmacias EN PARALELO
    const porFarmacia = await Promise.allSettled(
      farmaciaIds.map((id) => buscarEnFarmacia(id, med))
    );

    const productos = [];
    const farmaciasSinResultado = [];
    for (const r of porFarmacia) {
      if (r.status === "fulfilled") {
        if (r.value.productos.length > 0) productos.push(...r.value.productos);
        else farmaciasSinResultado.push(r.value.nombre);
      }
    }
    productos.sort((a, b) => (a.precio || Infinity) - (b.precio || Infinity));

    resultadoPorMedicamento.push({
      medicamento: med,
      resultados: productos,
      farmaciasSinResultado,
    });
  }

  return { porMedicamento: resultadoPorMedicamento };
}
