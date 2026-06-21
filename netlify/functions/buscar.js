// Netlify Function: /api/buscar?q=paracetamol
import { buscarEnTodas } from "../../backend/services/buscar.js";

export default async (req, context) => {
  const url = new URL(req.url);
  const q = url.searchParams.get("q");

  if (!q || q.trim().length < 2) {
    return Response.json({ error: "El término debe tener al menos 2 caracteres" }, { status: 400 });
  }
  if (q.length > 100) {
    return Response.json({ error: "Término demasiado largo" }, { status: 400 });
  }

  try {
    const resultado = await buscarEnTodas(q.trim());
    return Response.json(resultado, {
      headers: { "Cache-Control": "public, max-age=21600" }, // 6 horas
    });
  } catch (err) {
    console.error("[buscar]", err);
    return Response.json({ error: "Error al buscar medicamentos" }, { status: 500 });
  }
};

export const config = { path: "/api/buscar" };
