import fetch from "node-fetch";
import { crearAdapterMock } from "./mockAdapter.js";

const TIMEOUT_MS = 10000;

export function crearAdapterVTEX(cfg) {
  const mockFallback = crearAdapterMock({ nombre: cfg.nombre, logo: cfg.logo });

  return {
    nombre: cfg.nombre,
    logo: cfg.logo || null,
    async buscar(termino) {
      const url = `${cfg.baseUrl}/api/catalog_system/pub/products/search/${encodeURIComponent(termino)}?_from=0&_to=9`;
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
      try {
        const res = await fetch(url, {
          signal: ctrl.signal,
          headers: {
            "User-Agent": "ComparadorMedicamentosChile/1.0 (+info@farmacompare.cl)",
            Accept: "application/json",
          },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const contentType = res.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) throw new Error("Respuesta no JSON (posible CAPTCHA o bloqueo)");
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error("Respuesta inesperada");
        return data.map((p) => normalizar(p, cfg)).filter(Boolean);
      } catch (err) {
        console.warn(`[${cfg.nombre}] fallo VTEX (${err.message}), usando datos demo`);
        // Fallback a mock para que la app siempre devuelva algo
        const mockData = await mockFallback.buscar(termino);
        return mockData.map((d) => ({ ...d, esMock: true }));
      } finally {
        clearTimeout(t);
      }
    },
  };
}

function normalizar(p, cfg) {
  const item = p.items?.[0];
  const seller = item?.sellers?.[0]?.commertialOffer;
  if (!seller || !seller.Price) return null;

  const precio = seller.Price;
  const precioSinDescuento = seller.PriceWithoutDiscount || precio;

  return {
    farmacia: cfg.nombre,
    logo: cfg.logo || null,
    nombreProducto: p.productName || "Sin nombre",
    principioActivo: extraerPrincipioActivo(p),
    precio,
    precioPromocion: precioSinDescuento > precio ? precio : null,
    precioOriginal: precioSinDescuento > precio ? precioSinDescuento : null,
    tipo: clasificarTipo(p),
    stock: (seller.AvailableQuantity ?? 0) > 0,
    url: `${cfg.baseUrl}/${p.linkText}/p`,
    imagen: item?.images?.[0]?.imageUrl || null,
    laboratorio: p.brand || null,
    descripcion: p.description || null,
  };
}

function clasificarTipo(p) {
  const txt = `${p.productName} ${JSON.stringify(p.specificationGroups || "")}`.toLowerCase();
  if (txt.includes("bioequivalente") || txt.includes("bioequiv")) return "bioequivalente";
  const marca = (p.brand || "").toLowerCase();
  if (!marca || marca.includes("generico") || marca.includes("genérico") || marca.includes("generic")) return "generico";
  return "marca";
}

function extraerPrincipioActivo(p) {
  const allSpecs = (p.specificationGroups || []).flatMap((g) => g.specifications || []);
  const pa = allSpecs.find((s) => /principio\s*activo|active\s*ingredient|principio/i.test(s.name || ""));
  if (pa?.values?.[0]) return pa.values[0];

  // fallback: extraer del nombre del producto antes de la primera coma o paréntesis
  const nombre = p.productName || "";
  const match = nombre.match(/^([^,(]+)/);
  return match ? match[1].trim() : nombre;
}
