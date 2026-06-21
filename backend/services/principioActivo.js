// Mapeo de sinónimos y nombres comerciales a principio activo normalizado
const SINONIMOS = {
  paracetamol: ["acetaminofen", "acetaminofén", "tapsin", "panadol", "calpol"],
  ibuprofeno: ["ibupirac", "brufen", "advil", "nurofen"],
  amoxicilina: ["amoxil", "flemoxin"],
  loratadina: ["claritin", "clarytine"],
  omeprazol: ["losec", "prilosec"],
  atorvastatina: ["lipitor", "zarator"],
  metformina: ["glucophage", "glafornil"],
  enalapril: ["renitec", "naprilene"],
  losartan: ["cozaar", "losartán"],
  clonazepam: ["rivotril", "clonapam"],
  sertralina: ["altruline", "zoloft"],
  fluoxetina: ["prozac", "fluxene"],
  alprazolam: ["tafil", "alplax"],
  diclofenaco: ["voltaren", "diclofénaco"],
  "ácido acetilsalicílico": ["aspirina", "aspirin", "acido acetilsalicilico"],
  cetirizina: ["zyrtec", "cetigen"],
  ranitidina: ["zantac"],
  metoclopramida: ["primperán"],
  tramadol: ["tramal"],
};

// Construir mapa inverso: sinónimo → nombre canónico
const MAPA_INVERSO = new Map();
for (const [canonical, synonyms] of Object.entries(SINONIMOS)) {
  MAPA_INVERSO.set(canonical, canonical);
  for (const s of synonyms) {
    MAPA_INVERSO.set(s.toLowerCase(), canonical);
  }
}

export function normalizarPrincipioActivo(nombre) {
  if (!nombre) return "desconocido";
  const n = nombre.toLowerCase().trim();
  // Buscar coincidencia exacta o parcial
  for (const [key, canonical] of MAPA_INVERSO.entries()) {
    if (n.includes(key)) return canonical;
  }
  // Limpiar: remover concentración y forma farmacéutica comunes
  return n
    .replace(/\d+\s*(mg|mcg|ml|g|%|ui|iu)/gi, "")
    .replace(/(comprimido|tableta|cápsula|jarabe|solución|inyectable|gel|crema|gota|parche)s?/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function agruparPorPrincipioActivo(resultados) {
  const grupos = new Map();

  for (const r of resultados) {
    const pa = normalizarPrincipioActivo(r.principioActivo || r.nombreProducto);
    if (!grupos.has(pa)) grupos.set(pa, []);
    grupos.get(pa).push(r);
  }

  // Retornar array de grupos ordenados por precio mínimo del grupo
  return Array.from(grupos.entries())
    .map(([principioActivo, productos]) => ({
      principioActivo,
      productos: productos.sort((a, b) => (a.precio || Infinity) - (b.precio || Infinity)),
      precioMinimo: Math.min(...productos.map((p) => p.precio || Infinity)),
      masBarato: productos.reduce((min, p) => (!min || (p.precio || Infinity) < (min.precio || Infinity) ? p : min), null),
    }))
    .sort((a, b) => a.precioMinimo - b.precioMinimo);
}
