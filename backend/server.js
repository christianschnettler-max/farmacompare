import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import apiRouter from "./routes/api.js";

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middlewares ──────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "2mb" })); // para imágenes OCR en base64

// Rate limiting global: 100 req/min por IP
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Demasiadas solicitudes, intenta en un momento" },
  })
);

// Rate limiting estricto para el chat IA: 20 req/min por IP
app.use(
  "/api/chat",
  rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    message: { error: "Límite de mensajes alcanzado, espera un momento" },
  })
);

// ── Rutas ────────────────────────────────────────────────────────────────────
app.use("/api", apiRouter);

// ── Inicio ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ FarmaCompare backend corriendo en http://localhost:${PORT}`);
});
