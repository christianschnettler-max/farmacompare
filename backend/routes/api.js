import express from "express";
import { buscarEnTodas } from "../services/buscar.js";

const router = express.Router();

// GET /api/buscar?q=paracetamol
router.get("/buscar", async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 2) {
    return res.status(400).json({ error: "El término debe tener al menos 2 caracteres" });
  }
  if (q.length > 100) {
    return res.status(400).json({ error: "Término demasiado largo" });
  }
  try {
    const resultado = await buscarEnTodas(q.trim());
    res.json(resultado);
  } catch (err) {
    console.error("[/buscar]", err);
    res.status(500).json({ error: "Error al buscar medicamentos" });
  }
});

// GET /api/health
router.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

export default router;
