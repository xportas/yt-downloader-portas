import fs from 'fs';
import path from 'path';
import { getDownloadsDir } from './ytdlp';

/**
 * Tiempo de retención por defecto: 30 minutos (en milisegundos)
 */
export const RETENTION_TIME_MS = 30 * 60 * 1000;

/**
 * Limpia archivos en el directorio de descargas con más de 30 minutos de antigüedad.
 * @param downloadsDir Ruta absoluta del directorio de descargas
 * @param maxAgeMs Antigüedad máxima en milisegundos (por defecto 30 minutos)
 */
export function cleanOldDownloads(
  downloadsDir: string = getDownloadsDir(),
  maxAgeMs: number = RETENTION_TIME_MS
): { deletedCount: number; deletedFiles: string[] } {
  const deletedFiles: string[] = [];

  try {
    if (!fs.existsSync(downloadsDir)) {
      return { deletedCount: 0, deletedFiles };
    }

    const now = Date.now();
    const files = fs.readdirSync(downloadsDir);

    for (const file of files) {
      // Ignorar archivos ocultos o de control si los hubiera
      if (file.startsWith('.')) continue;

      const filePath = path.join(downloadsDir, file);

      try {
        const stats = fs.statSync(filePath);
        if (!stats.isFile()) continue;

        const fileAge = now - stats.mtimeMs;
        if (fileAge > maxAgeMs) {
          fs.unlinkSync(filePath);
          deletedFiles.push(file);
        }
      } catch (fileErr) {
        console.warn(`No se pudo verificar o eliminar el archivo ${file}:`, fileErr);
      }
    }
  } catch (err) {
    console.error('Error al ejecutar la limpieza de descargas antiguas:', err);
  }

  return {
    deletedCount: deletedFiles.length,
    deletedFiles,
  };
}
