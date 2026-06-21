import { BrowserWindow } from "electron";

// ─── Recetas por farmacia ─────────────────────────────────────────────────────
// searchUrl: cómo construir la URL de búsqueda real del sitio.
// Para agregar una farmacia nueva, añade una entrada aquí con su id (igual al del
// catálogo del frontend) y su URL de búsqueda. El extractor genérico hace el resto.
const RECETAS = {
  salcobrand: { searchUrl: (t) => `https://salcobrand.cl/search_result?query=${encodeURIComponent(t)}` },
  cruzverde: { searchUrl: (t) => `https://www.cruzverde.cl/search?query=${encodeURIComponent(t)}` },
  ahumada: { searchUrl: (t) => `https://www.farmaciasahumada.cl/search?q=${encodeURIComponent(t)}` },
  buho: { searchUrl: (t) => `https://buho.cl/search?q=${encodeURIComponent(t)}` },
  meki: { searchUrl: (t) => `https://meki.cl/search?q=${encodeURIComponent(t)}` },
  drsimi: { searchUrl: (t) => `https://www.drsimi.cl/search?q=${encodeURIComponent(t)}` },
  knop: { searchUrl: (t) => `https://www.knop.cl/?s=${encodeURIComponent(t)}` },
  farmaloncos: { searchUrl: (t) => `https://farmaloncos.cl/?s=${encodeURIComponent(t)}` },
  redfarma: { searchUrl: (t) => `https://www.redfarma.cl/catalogsearch/result/?q=${encodeURIComponent(t)}` },
  liga: { searchUrl: (t) => `https://www.ligaepilepsia.cl/?post_type=product&s=${encodeURIComponent(t)}` },
  galenica: { searchUrl: (t) => `https://farmaciagalenica.cl/?post_type=product&s=${encodeURIComponent(t)}` },
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
  liga: "Liga contra la Epilepsia",
  galenica: "Farmacia Galénica",
};

// ─── Extractor genérico (corre DENTRO de la página real) ──────────────────────
// Estrategia: anclar en los PRECIOS visibles (todas las tarjetas tienen uno),
// y subir al contenedor para sacar nombre, link e imagen. Universal para
// cualquier sitio sin depender del formato de URL.
const SCRIPT_EXTRACTOR = `(() => {
  const out = [];
  const vistos = new Set();
  const precioRe = /\\$\\s?([\\d]{1,3}(?:[.,]\\d{3})+|\\d{3,6})/;

  function parsePrecio(txt) {
    const m = (txt || "").match(precioRe);
    if (!m) return null;
    const n = parseInt(m[1].replace(/[.,]/g, ""), 10);
    return (n >= 200 && n <= 2000000) ? n : null;
  }

  // Elementos hoja cuyo texto es un precio corto (evita contenedores enormes)
  const todos = Array.from(document.querySelectorAll("body *"));
  const conPrecio = todos.filter((el) => {
    const t = el.textContent || "";
    return el.children.length === 0 && t.length < 30 && precioRe.test(t);
  });

  for (const pEl of conPrecio) {
    const precio = parsePrecio(pEl.textContent);
    if (!precio) continue;

    // Subir hasta una "tarjeta" que tenga título e imagen
    let card = pEl;
    let img = null, titulo = "";
    for (let i = 0; i < 8 && card; i++) {
      card = card.parentElement;
      if (!card) break;
      if (!img) img = card.querySelector('img');
      const h = card.querySelector('h1,h2,h3,h4,h5,[class*="name"],[class*="title"],[class*="nombre"],[class*="Name"],[class*="Title"]');
      if (h && (h.textContent || "").trim().length > 3) titulo = (h.textContent || "").trim();
      if (titulo && card.querySelector('a[href]')) break;
      if ((card.textContent || "").length > 500) break; // contenedor demasiado grande
    }

    // Elegir el enlace CORRECTO del producto (no banners ni promos):
    // 1) un <a> ancestro del precio (tarjetas que envuelven todo en un link)
    // 2) dentro de la tarjeta, el <a> cuya dirección parezca de producto
    // 3) el <a> con más texto (suele ser el título del producto)
    let link = pEl.closest("a[href]");
    if (!link && card) {
      const links = Array.from(card.querySelectorAll("a[href]"));
      link =
        links.find((a) => /\\/product|\\/products\\/|\\.html|\\/p\\/|detalle|item/i.test(a.href)) ||
        links.sort((a, b) => (b.textContent || "").length - (a.textContent || "").length)[0] ||
        null;
    }

    if (!titulo && link) titulo = (link.textContent || "").trim();
    titulo = titulo.replace(/\\s+/g, " ").slice(0, 120);
    if (titulo.length < 4) continue;

    const clave = titulo.toLowerCase().slice(0, 45);
    if (vistos.has(clave)) continue;
    vistos.add(clave);

    out.push({
      nombreProducto: titulo,
      precio,
      url: link ? link.href : location.href,
      imagen: img ? (img.src || img.getAttribute("data-src") || null) : null,
    });
    if (out.length >= 8) break;
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

    // Esperar a que aparezcan precios (SPA puede tardar). Máx ~16s.
    let productos = [];
    const inicio = Date.now();
    while (Date.now() - inicio < 16000) {
      await new Promise((r) => setTimeout(r, 1500));
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
