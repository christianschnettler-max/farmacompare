const { contextBridge, ipcRenderer } = require("electron");

// Expone funciones seguras al frontend (window.farmaApi)
contextBridge.exposeInMainWorld("farmaApi", {
  // Indica al frontend que está corriendo dentro de la app de escritorio
  esEscritorio: true,
  // Buscar precios reales abriendo navegadores ocultos
  buscarPrecios: (medicamentos, farmaciaIds) =>
    ipcRenderer.invoke("buscar-precios", { medicamentos, farmaciaIds }),
});
