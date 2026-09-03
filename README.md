# Portas El Pirata - Descargador de YouTube Victoriano 🏴‍☠️📜

Aplicación web completa, elegante y lista para producción para la descarga y conversión selecta de vídeos de YouTube, desarrollada con **Next.js 14 (App Router)**, **Tailwind CSS** y optimizada específicamente para despliegues **Serverless en Vercel**.

Toda la interfaz cuenta con una estética victoriana clásica refinada (oro viejo, caoba, burdeos, pergamino y marcos con filigranas de latón), utilizando la imagen de fondo estática `portas-bg.jpg`.

---

## 🏛️ Características Principales

### 1. Flujo Estricto de Usuario en 6 Pasos
- **Paso 1:** Campo de entrada (Input text) estilizado como placa grabada con detección automática y soporte para enlaces cortos, normales y Shorts de YouTube.
- **Paso 2:** Sección dinámica de vista previa con miniatura en marco dorado, título completo, autor y duración exacta calculada.
- **Paso 3:** Selector de formatos con la matriz estricta solicitada:
  1. `Vídeo - 4K / 2K Ultra HD (MP4/WebM - Requiere procesamiento en servidor)`
  2. `Vídeo - 1080p Full HD (MP4 - Requiere procesamiento en servidor)`
  3. `Vídeo - 720p / 480p (MP4 - Descarga directa ligera)`
  4. `Audio - Alta Calidad (320 kbps MP3 - Requiere conversión)`
  5. `Audio - Nativo Original (M4A AAC - Extracción rápida)`
- **Paso 4:** Botón de acción principal "Iniciar Preparación".
- **Paso 5:** Barra de progreso visual ornamentada en latón con porcentaje en vivo y descripción de fases (extracción, transcodificación FFmpeg, empaquetado).
- **Paso 6:** Metamorfosis visual inmediata a botón verde esmeralda y oro "Descargar Archivo", que inicia la descarga local directa al almacenamiento del usuario.

### 2. Estética Victoriana Clásica ("Victorian Style")
- **Fondo:** Capa estática utilizando `portas-bg.jpg` con viñeta oscura y calidez sepia.
- **Tipografías:** Fuentes nobles de Google Fonts (*Cinzel* para títulos y números solemnes, *EB Garamond* para textos descriptivos).
- **Bordes y Ornamentos:** Filigranas doradas, esquinas con volutas barrocas, tornillos de latón en relieve, divisores heráldicos y sombras profundas.
- **Contenedores:** Efecto pergamino y placas de bronce repujado con transiciones suaves en hover y estados activos.

---

## ⚙️ Arquitectura Serverless y Despliegue en Vercel

### Limitaciones de Vercel Serverless
Las Serverless Functions de Vercel imponen:
- **Límite de Tiempo (Timeout):** 10s (Plan Hobby gratuito) o hasta 60s (Pro).
- **Límite de Tamaño de Paquete:** 50 MB comprimido / 250 MB descomprimido.

Un binario estático de FFmpeg pesa ~80 MB y unir pistas de vídeo 4K con audio puede demorar más de 30-60s, lo que en un entorno serverless monolítico provocaría un error `FUNCTION_INVOCATION_TIMEOUT`.

### Nuestra Solución Desacoplada
1. **Orquestador Ultraligero en Next.js (Vercel):**
   - `/api/info`: Obtención instantánea de metadatos de YouTube mediante la API ligera oEmbed y scrapers optimizados sin riesgo de timeout ni sobrecarga de memoria.
   - `/api/process`: Emite respuestas de procesamiento y control de estado.
   - `/api/download`: Entrega el flujo de descarga con cabeceras estándar `Content-Disposition`.
2. **Conexión con Worker Externo para Producción Pesada:**
   Si se configuran las variables de entorno:
   - `EXTERNAL_DOWNLOAD_WORKER_URL`: Endpoint de un microservicio con FFmpeg y `yt-dlp` (en AWS Lambda con capa FFmpeg, Modal, Railway o Fly.io).
   - `EXTERNAL_DOWNLOAD_WORKER_KEY`: Clave de seguridad Bearer.
   El orquestador en Vercel delega la transcodificación pesada y devuelve una URL pre-firmada de descarga desde S3/Cloudflare R2, evitando cualquier caída de Vercel.

---

## 🚀 Instalación y Ejecución Local

1. **Clonar e instalar dependencias:**
   ```bash
   npm install
   ```

2. **Iniciar servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   Abrir en el navegador: [http://localhost:3000](http://localhost:3000).

3. **Compilar para producción:**
   ```bash
   npm run build
   npm run start
   ```

---

## ☁️ Despliegue en Vercel

1. Sube el repositorio a GitHub o GitLab.
2. Importa el proyecto en tu panel de control de [Vercel](https://vercel.com).
3. Vercel detectará automáticamente Next.js. Haz clic en **Deploy**.
4. (Opcional) Si dispones de un worker de transcodificación FFmpeg externo, añade `EXTERNAL_DOWNLOAD_WORKER_URL` en *Settings -> Environment Variables*.
