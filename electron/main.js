import { app, BrowserWindow, shell } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let mainWindow;

function encontrarArchivo(nombreRelativo) {
  const candidatos = [
    path.join(process.resourcesPath || "", nombreRelativo),
    path.join(__dirname, "..", nombreRelativo),
    path.join(__dirname, nombreRelativo),
    path.join(app.getAppPath(), nombreRelativo),
  ];
  return candidatos.find(p => existsSync(p)) || null;
}

async function iniciarBackend() {
  const serverPath = encontrarArchivo(path.join("backend", "server.js"));
  if (!serverPath) { console.error("No se encontró el backend"); return; }
  try {
    await import(new URL(`file:///${serverPath.replace(/\\/g, "/")}`).href);
    console.log("Backend iniciado en:", serverPath);
  } catch (e) {
    console.error("Error backend:", e.message);
  }
}

async function crearVentana() {
  if (mainWindow && !mainWindow.isDestroyed()) return;

  mainWindow = new BrowserWindow({
    width: 1200, height: 800, minWidth: 380, minHeight: 600,
    title: "FarmaCompare Chile",
    webPreferences: { nodeIntegration: false, contextIsolation: true },
    show: false,
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  const frontendPath = encontrarArchivo(path.join("frontend", "dist", "index.html"));
  console.log("Frontend en:", frontendPath);

  if (frontendPath) {
    await mainWindow.loadFile(frontendPath);
  } else {
    mainWindow.loadURL("data:text/html,<h1>Error: no se encontraron los archivos de la app</h1>");
  }

  mainWindow.once("ready-to-show", () => { mainWindow.show(); mainWindow.maximize(); });
  mainWindow.on("closed", () => { mainWindow = null; });
}

app.whenReady().then(async () => {
  await iniciarBackend();
  await crearVentana();
});

app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
app.on("activate", () => { if (!mainWindow || mainWindow.isDestroyed()) crearVentana(); });
