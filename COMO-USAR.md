# 💊 FarmaCompare — Cómo usar las 3 opciones

---

## ⚡ Opción 1: Script automático (más rápido para probar en tu PC)

**Lo que hace:** Con un doble clic, instala todo lo necesario y abre la app en tu navegador.

**Pasos:**
1. Instala Node.js desde **https://nodejs.org** (botón "LTS") si no lo tienes.
2. Copia el archivo `backend/.env.example`, renómbralo como `backend/.env` y pon tu API key de Anthropic.
3. Haz **doble clic** en `iniciar-farmacompare.bat`.
4. La primera vez descarga dependencias (~2 min). Las siguientes veces abre en segundos.
5. La app se abre sola en el navegador en `http://localhost:5173`.

**Para cerrar:** Cierra la ventana del .bat y las dos ventanas negras que aparecen.

---

## 🖥️ Opción 2: Instalador .exe (para instalar como cualquier programa)

**Lo que hace:** Crea un `FarmaCompare Chile Setup.exe` que cualquier persona instala con doble clic, sin necesidad de Node.js ni terminales. La app queda en el menú de inicio y el escritorio.

**Pasos para CREAR el instalador (solo tú, una vez):**
1. Instala Node.js desde **https://nodejs.org**.
2. Haz **doble clic** en `electron/crear-instalador-windows.bat`.
3. Espera ~5 minutos mientras compila todo.
4. El instalador aparece en la carpeta `electron/dist-electron/`.

**Para distribuir:** Comparte el archivo `FarmaCompare Chile Setup X.X.X.exe`. La otra persona solo hace doble clic para instalarlo.

> ⚠️ La API key de Anthropic va embebida en el `.env` antes de crear el instalador.
> No compartas el instalador públicamente si contiene tu API key personal.

---

## 🌐 Opción 3: Netlify (online, accesible desde cualquier lugar)

**Lo que hace:** La app queda en una URL pública (ej. `farmacompare.netlify.app`), gratis, sin necesidad de que tu computador esté encendido.

**Pasos:**

### 3.1 — Subir el código a GitHub
1. Crea una cuenta en **https://github.com** si no tienes.
2. Crea un repositorio nuevo (botón "New repository"), llámalo `farmacompare`.
3. En una terminal dentro de la carpeta `farma-compare`, ejecuta:
   ```bash
   git init
   git add .
   git commit -m "Primer commit"
   git remote add origin https://github.com/TU-USUARIO/farmacompare.git
   git push -u origin main
   ```

### 3.2 — Conectar con Netlify
1. Ve a **https://netlify.com** y crea una cuenta gratis (puedes entrar con GitHub).
2. Haz clic en **"Add new site"** → **"Import an existing project"**.
3. Elige GitHub y selecciona tu repositorio `farmacompare`.
4. Netlify detecta el `netlify.toml` automáticamente. No cambies nada.
5. Haz clic en **"Deploy site"**.

### 3.3 — Agregar tu API key
1. En Netlify, ve a **Site configuration → Environment variables**.
2. Haz clic en **"Add a variable"**.
3. Pon:
   - **Key:** `ANTHROPIC_API_KEY`
   - **Value:** tu clave de Anthropic (empieza con `sk-ant-...`)
4. Guarda y haz clic en **"Trigger deploy"** para redesplegar.

### 3.4 — ¡Listo!
Netlify te da una URL como `https://nombre-random.netlify.app`.
Puedes cambiarla a algo como `farmacompare-chile` en **Site configuration → Site details**.

---

## Comparación rápida

| | Script .bat | Instalador .exe | Netlify |
|---|---|---|---|
| Requiere Node.js | ✅ Sí | ❌ No (el usuario final) | ❌ No |
| Funciona sin internet | ✅ Sí (sin IA) | ✅ Sí (sin IA) | ❌ No |
| Accesible desde celular | ❌ No | ❌ No | ✅ Sí |
| Costo | Gratis | Gratis | Gratis |
| Dificultad para el usuario final | Media | Fácil | Muy fácil |
