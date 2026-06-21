import Tesseract from "tesseract.js";

export async function extraerTextoDeImagen(archivo, onProgress) {
  const result = await Tesseract.recognize(archivo, "spa", {
    logger: (m) => {
      if (m.status === "recognizing text" && onProgress) {
        onProgress(Math.round(m.progress * 100));
      }
    },
  });
  return result.data.text;
}

// Extrae nombres de medicamentos del texto OCR
// Busca patrones como: "Nombre 500mg", "Nombre comprimidos", etc.
export function extraerMedicamentosDeTexto(texto) {
  if (!texto) return [];

  const lineas = texto.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const medicamentos = new Set();

  for (const linea of lineas) {
    // Ignorar líneas muy cortas o que parezcan metadatos
    if (linea.length < 4) continue;
    if (/^\d+$/.test(linea)) continue;
    if (/^(rut|fecha|nombre del paciente|médico|doctor|dr\.|dra\.)/i.test(linea)) continue;

    // Buscar patrón: palabra(s) seguidas de concentración y/o forma farmacéutica
    const match = linea.match(
      /([A-Za-záéíóúÁÉÍÓÚüÜñÑ][A-Za-záéíóúÁÉÍÓÚüÜñÑ\s\-]{2,})\s+(\d+\s*(?:mg|mcg|g|ml|%|ui|iu)(?:\s*\/\s*\d+\s*(?:mg|mcg|g|ml|%))?)/i
    );
    if (match) {
      const nombre = match[1].trim();
      const dosis = match[2].trim();
      medicamentos.add(`${nombre} ${dosis}`);
    }
  }

  // Si no se encontraron con el patrón estricto, intentar extraer palabras capitalizadas
  if (medicamentos.size === 0) {
    for (const linea of lineas) {
      if (/[A-ZÁÉÍÓÚ][a-záéíóú]{3,}/.test(linea) && /\d/.test(linea)) {
        medicamentos.add(linea.slice(0, 60));
      }
    }
  }

  return Array.from(medicamentos).slice(0, 10); // máx 10 medicamentos
}
