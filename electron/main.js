import { app, BrowserWindow, shell, ipcMain } from "electron";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3001;
let mainWindow;

// Abrir la búsqueda de una farmacia en el navegador del sistema
ipcMain.handle("abrir-url", (_evt, url) => {
  if (typeof url === "string" && /^https?:\/\//.test(url)) {
    shell.openExternal(url);
    return true;
  }
  return false;
});

// Buscar el server.js del backend (empaquetado o en desarrollo)
function rutaBackend() {
  const candidatos = [
    path.join(process.resourcesPath || "", "backend", "server.js"),
    path.join(__dirname, "..", "backend", "server.js"),
  ];
  return candidatos.find((p) => existsSync(p));
}

// Iniciar el servidor Express dentro del proceso de Electron
async function iniciarBackend() {
  const serverPath = rutaBackend();
  if (!serverPath) {
    console.error("No se encontró el backend");
    return;
  }
  process.env.PORT = String(PORT);
  process.env.NODE_ENV = "production";
  process.env.FRONTEND_DIST = path.join(path.dirname(serverPath), "..", "frontend", "dist");

  const url = new URL(`file:///${serverPath.replace(/\\/g, "/")}`).href;
  try {
    await import(url);
    console.log("Backend iniciado:", serverPath);
  } catch (e) {
    console.error("Error iniciando backend:", e.message);
  }
}

// Esperar a que el servidor responda antes de abrir la ventana
function esperarServidor(timeout = 20000) {
  return new Promise((resolve) => {
    const inicio = Date.now();
    const intentar = () =>
      http
        .get(`http://localhost:${PORT}/api/health`, (r) => {
          if (r.statusCode === 200) resolve(true);
          else reintentar();
        })
        .on("error", reintentar);
    const reintentar = () =>
      Date.now() - inicio < timeout ? setTimeout(intentar, 400) : resolve(false);
    intentar();
  });
}

async function crearVentana() {
  if (mainWindow && !mainWindow.isDestroyed()) return;
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 380,
    minHeight: 600,
    title: "FarmaCompare Chile",
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.cjs"),
    },
  });

  // Abrir links externos en el navegador del sistema
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  await mainWindow.loadURL(`http://localhost:${PORT}`);
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    mainWindow.maximize();
  });
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  await iniciarBackend();
  await esperarServidor();
  await crearVentana();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (!mainWindow || mainWindow.isDestroyed()) crearVentana();
});
