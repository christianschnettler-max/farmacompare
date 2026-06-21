const { contextBridge, ipcRenderer } = require("electron");

// Expone funciones seguras al frontend (window.farmaApi)
contextBridge.exposeInMainWorld("farmaApi", {
  esEscritorio: true,
  // Abrir la búsqueda de una farmacia en el navegador del sistema
  abrirUrl: (url) => ipcRenderer.invoke("abrir-url", url),
});
