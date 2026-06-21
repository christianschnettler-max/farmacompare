import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import apiRouter from "./routes/api.js";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "2mb" }));
app.use(rateLimit({ windowMs: 60000, max: 100, standardHeaders: true, legacyHeaders: false }));
app.use("/api", apiRouter);

const frontendDist = process.env.FRONTEND_DIST || join(__dirname, "..", "frontend", "dist");
app.use(express.static(frontendDist));
app.get("*", (_req, res) => res.sendFile(join(frontendDist, "index.html")));

app.listen(PORT, () => console.log(`✅ FarmaCompare corriendo en http://localhost:${PORT}`));
