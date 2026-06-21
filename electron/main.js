import { app, BrowserWindow, shell } from "electron";
import { createServer } from "http";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const BACKEND_PORT = 3791; // puerto poco común para evitar conflictos

let mainWindow;
let backendProcess;

// ── Iniciar el servidor Express embebido ──────────────────────────────────────
function iniciarBackend() {
  return new Promise((resolve, reject) => {
    const serverPath = path.join(ROOT, "backend", "server.js");

    // En producción (app empaquetada), el backend está en resources/backend/
    const serverPathEmpaquetado = path.join(process.resourcesPath || ROOT, "backend", "server.js");
    const rutaFinal = existsSync(serverPathEmpaquetado) ? serverPathEmpaquetado : serverPath;

    backendProcess = spawn(process.execPath, [rutaFinal], {
      env: {
        ...process.env,
        PORT: String(BACKEND_PORT),
        CORS_ORIGIN: `http://localhost:${BACKEND_PORT}`,
        NODE_ENV: "production",
      },
      cwd: path.dirname(rutaFinal),
    });

    backendProcess.stdout.on("data", (d) => {
      const msg = d.toString();
      console.log("[backend]", msg);
      if (msg.includes("corriendo en")) resolve();
    });

    backendProcess.stderr.on("data", (d) => console.error("[backend-err]", d.toString()));
    backendProcess.on("error", reject);

    // Timeout de seguridad: si en 10s no arrancó, continuar igual
    setTimeout(resolve, 10000);
  });
}

// ── Crear ventana principal ───────────────────────────────────────────────────
async function crearVentana() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 380,
    minHeight: 600,
    title: "FarmaCompare Chile",
    icon: path.join(ROOT, "frontend", "public", "favicon.svg"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    show: false, // mostrar solo cuando cargue
  });

  // Abrir links externos en el navegador del sistema, no en Electron
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (!url.startsWith("http://localhost")) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  // Cargar el frontend compilado
  const frontendDist = path.join(ROOT, "frontend", "dist", "index.html");
  const frontendDistEmpaquetado = path.join(process.resourcesPath || ROOT, "frontend", "dist", "index.html");
  const rutaFrontend = existsSync(frontendDistEmpaquetado) ? frontendDistEmpaquetado : frontendDist;

  await mainWindow.loadFile(rutaFrontend);

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    mainWindow.maximize();
  });

  mainWindow.on("closed", () => { mainWindow = null; });
}

// ── Ciclo de vida de la app ───────────────────────────────────────────────────
app.whenReady().then(async () => {
  console.log("Iniciando FarmaCompare...");

  // Splash simple mientras carga el backend
  const splash = new BrowserWindow({
    width: 400,
    height: 250,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    webPreferences: { nodeIntegration: false },
  });
  splash.loadURL(`data:text/html,
    <html><body style="background:#1d4ed8;color:white;font-family:Arial;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;border-radius:16px">
      <div style="font-size:60px">💊</div>
      <div style="font-size:24px;font-weight:bold;margin-top:12px">FarmaCompare Chile</div>
      <div style="font-size:14px;margin-top:8px;opacity:0.8">Iniciando...</div>
    </body></html>`);

  try {
    await iniciarBackend();
  } catch (e) {
    console.warn("Backend no pudo iniciar:", e.message);
  }

  await crearVentana();
  splash.close();
});

app.on("window-all-closed", () => {
  if (backendProcess) backendProcess.kill();
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (!mainWindow) crearVentana();
});

app.on("before-quit", () => {
  if (backendProcess) backendProcess.kill();
});
