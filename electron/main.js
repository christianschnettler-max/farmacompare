import { app, BrowserWindow, shell } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let mainWindow;

async function iniciarBackend() {
  const enProduccion = existsSync(path.join(process.resourcesPath || "", "backend", "server.js"));
  const backendPath = enProduccion
    ? path.join(process.resourcesPath, "backend", "server.js")
    : path.join(__dirname, "..", "backend", "server.js");

  try {
    await import(new URL(`file:///${backendPath.replace(/\\/g, "/")}`).href);
    console.log("Backend iniciado correctamente");
  } catch (e) {
    console.error("Error iniciando backend:", e.message);
  }
}

async function crearVentana() {
  if (mainWindow && !mainWindow.isDestroyed()) return;

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 380,
    minHeight: 600,
    title: "FarmaCompare Chile",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    show: false,
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  const enProduccion = existsSync(
    path.join(process.resourcesPath || "", "frontend", "dist", "index.html")
  );
  const frontendPath = enProduccion
    ? path.join(process.resourcesPath, "frontend", "dist", "index.html")
    : path.join(__dirname, "..", "frontend", "dist", "index.html");

  await mainWindow.loadFile(frontendPath).catch((e) => {
    console.error("Error cargando frontend:", e.message);
    mainWindow.loadURL("about:blank");
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    mainWindow.maximize();
  });

  mainWindow.on("closed", () => { mainWindow = null; });
}

app.whenReady().then(async () => {
  await iniciarBackend();
  await crearVentana();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (!mainWindow || mainWindow.isDestroyed()) crearVentana();
});
