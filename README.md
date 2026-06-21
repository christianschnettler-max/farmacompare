# 💊 FarmaCompare Chile

Compara precios de medicamentos en farmacias chilenas (Salcobrand, Cruz Verde, Ahumada, Búho, Meki) con asistente de IA integrado. PWA instalable, funciona en celular, tablet y escritorio.

---

## Arquitectura

```
farma-compare/
├── backend/          # Node.js + Express
│   ├── adapters/     # Un archivo por farmacia
│   │   ├── vtexAdapter.js   # Adapter genérico para farmacias VTEX
│   │   ├── mockAdapter.js   # Datos demo (fallback y farmacias sin confirmar)
│   │   └── index.js         # Registro de farmacias activas
│   ├── services/
│   │   ├── buscar.js        # Búsqueda paralela + caché 6h
│   │   ├── asistenteIA.js   # SDK Anthropic claude-sonnet-4-6
│   │   └── principioActivo.js # Normalización y agrupación
│   ├── routes/api.js        # GET /api/buscar, POST /api/chat, GET /api/health
│   └── server.js
├── frontend/         # React + Vite + Tailwind + PWA
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── Buscador.jsx
│   │   │   ├── ResultadosList.jsx
│   │   │   ├── TarjetaProducto.jsx
│   │   │   ├── SubirReceta.jsx   # OCR con Tesseract.js
│   │   │   ├── ChatIA.jsx
│   │   │   └── Disclaimer.jsx
│   │   └── services/
│   │       ├── api.js    # Llamadas al backend
│   │       └── ocr.js    # Tesseract.js (corre en el navegador)
│   └── vite.config.js    # PWA manifest + service worker
├── docker-compose.yml
└── README.md
```

---

## Instalación local

### Requisitos
- Node.js 20+
- npm 10+

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edita .env y agrega tu ANTHROPIC_API_KEY
npm run dev
# Corre en http://localhost:3001
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
# Corre en http://localhost:5173
```

El frontend tiene proxy configurado: las llamadas a `/api/*` van al backend en el puerto 3001.

---

## Variables de entorno (backend)

| Variable | Descripción | Requerida |
|----------|-------------|-----------|
| `ANTHROPIC_API_KEY` | API key de Anthropic para el asistente IA | Sí (para IA) |
| `PORT` | Puerto del servidor (default: 3001) | No |
| `CORS_ORIGIN` | Origen permitido (default: http://localhost:5173) | No |

---

## Con Docker Compose

```bash
# En la raíz del proyecto
cp backend/.env.example .env
# Edita .env con tu ANTHROPIC_API_KEY

docker-compose up --build
# Frontend en http://localhost
# Backend en http://localhost:3001
```

---

## Cómo agregar una nueva farmacia

**Caso 1 — Farmacia en VTEX** (lo más común en Chile):
```js
// backend/adapters/index.js — agregar una línea:
import { crearAdapterVTEX } from "./vtexAdapter.js";

crearAdapterVTEX({
  nombre: "NombreFarmacia",
  baseUrl: "https://www.farmacia.cl",  // URL base del sitio
  logo: "/logos/farmacia.png",
})
```

**Caso 2 — Farmacia con API propia**:
```js
// Crear backend/adapters/miFarmaciaAdapter.js
export function crearAdapterMiFarmacia(cfg) {
  return {
    nombre: cfg.nombre,
    logo: cfg.logo,
    async buscar(termino) {
      // Llamar a la API interna de la farmacia
      const res = await fetch(`${cfg.baseUrl}/search?q=${termino}`);
      const data = await res.json();
      return data.products.map(p => ({
        farmacia: cfg.nombre,
        nombreProducto: p.name,
        principioActivo: p.activeIngredient,
        precio: p.price,
        precioPromocion: p.salePrice || null,
        tipo: "desconocido",
        stock: p.available,
        url: p.url,
        imagen: p.imageUrl,
        laboratorio: p.brand,
      }));
    },
  };
}
```

**Caso 3 — Scraping HTML** (última opción):
```bash
npm install cheerio
# Ver backend/adapters/mockAdapter.js como base de referencia
```

---

## Estado de los adapters

| Farmacia | Estado | Plataforma | Notas |
|----------|--------|------------|-------|
| Salcobrand | 🟡 Mock fallback | VTEX | API protegida por Cloudflare desde IPs externas. Funciona en producción con IP de Chile. |
| Cruz Verde | 🟡 Mock fallback | SPA custom | No usa VTEX. Necesita investigar su API interna. |
| Farmacias Ahumada | 🟡 Mock fallback | Salesforce Commerce | Endpoint `/on/demandware.store/...`. Ver notas abajo. |
| Búho | 🟠 Mock (pendiente) | Sin confirmar | Verificar en devtools del navegador > Network. |
| Meki | 🟠 Mock (pendiente) | Sin confirmar | Verificar en devtools del navegador > Network. |

### Cómo confirmar la plataforma de una farmacia
1. Abre el sitio en Chrome
2. F12 → Network → XHR/Fetch
3. Busca un medicamento en el sitio
4. Observa las llamadas de red: si ves `/api/catalog_system/pub/` es VTEX; si ves `/on/demandware.store/` es Salesforce; si ves otra URL, crea un adapter custom con esa URL.

### Ahumada (Salesforce Commerce Cloud)
Endpoint de búsqueda encontrado:
```
GET https://www.farmaciasahumada.cl/on/demandware.store/Sites-ahumada-cl-Site/es_CL/Search-Show?q={termino}&format=page-element
```
Crear `backend/adapters/ahumadaAdapter.js` con cheerio para parsear el HTML de resultados.

---

## Tests

```bash
cd backend
npm test
```

Tests unitarios para:
- `crearAdapterMock`: estructura de datos, tipos válidos, precios positivos
- `normalizarPrincipioActivo`: sinónimos, agrupación, orden por precio
- `buscarEnTodas`: estructura de respuesta, ordenamiento

---

## Privacidad

- Las imágenes de recetas se procesan **localmente en el navegador** con Tesseract.js
- No se envían imágenes al servidor
- No se almacenan datos personales
- El historial de chat no se persiste entre sesiones

---

## Disclaimer legal

Esta aplicación es informativa. Los precios pueden variar. No reemplaza el consejo de un médico ni de un químico farmacéutico. Consulta siempre a un profesional de la salud.

En caso de emergencia: **SAMU 131**
