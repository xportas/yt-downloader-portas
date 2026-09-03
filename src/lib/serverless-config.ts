/**
 * CONFIGURACIÓN DE ARQUITECTURA SERVERLESS (VERCEL)
 * 
 * En entornos Vercel Serverless:
 * - Límite de tiempo (Timeout): 10s (Hobby) / 15s-60s (Pro).
 * - Tamaño de lambda: 50MB (zip) / 250MB (descomprimido).
 * - Tareas pesadas como unión de flujos 4K/1080p con FFmpeg requieren recursos dedicados.
 * 
 * Este archivo centraliza la configuración de fallback y la conexión
 * con un procesador externo opcional (AWS Lambda, Railway, Modal, Fly.io)
 * cuando la aplicación se escala a producción intensiva.
 */

export interface ServerlessArchitectureConfig {
  /**
   * URL del microservicio externo FFmpeg / yt-dlp (opcional).
   * Si está configurada, Next.js orquestará el trabajo enviando un webhook
   * y obteniendo el stream o enlace S3 pre-firmado.
   */
  externalWorkerUrl?: string;
  workerApiKey?: string;

  /**
   * Duración máxima de simulación en segundos si no hay worker externo
   */
  simulationDurationSeconds: number;

  /**
   * Habilita el modo de simulación de streaming de chunks
   * para demostración interactiva sin dependencias externas pesadas.
   */
  enableChunkStreamingSimulation: boolean;
}

export const SERVERLESS_CONFIG: ServerlessArchitectureConfig = {
  externalWorkerUrl: process.env.EXTERNAL_DOWNLOAD_WORKER_URL,
  workerApiKey: process.env.EXTERNAL_DOWNLOAD_WORKER_KEY,
  simulationDurationSeconds: 4,
  enableChunkStreamingSimulation: true,
};
