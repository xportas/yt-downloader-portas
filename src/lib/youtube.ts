import { FormatOption } from '@/types/youtube';

/**
 * Matriz estricta de formatos solicitada:
 * 1. Vídeo - 4K / 2K Ultra HD (MP4/WebM - Requiere procesamiento en servidor)
 * 2. Vídeo - 1080p Full HD (MP4 - Requiere procesamiento en servidor)
 * 3. Vídeo - 720p / 480p (MP4 - Descarga directa ligera)
 * 4. Audio - Alta Calidad (320 kbps MP3 - Requiere conversión)
 * 5. Audio - Nativo Original (M4A AAC - Extracción rápida)
 */
export const AVAILABLE_FORMATS: FormatOption[] = [
  {
    id: 'video-4k',
    label: 'Vídeo - 4K / 2K Ultra HD',
    category: 'video',
    resolutionOrBitrate: '2160p / 1440p',
    extension: 'mp4',
    serverProcessing: true,
    badge: 'Máxima Fidelidad',
    description: 'MP4/WebM - Requiere procesamiento y muxing en servidor',
    estimatedSizePrefix: '~180 - 450 MB',
  },
  {
    id: 'video-1080p',
    label: 'Vídeo - 1080p Full HD',
    category: 'video',
    resolutionOrBitrate: '1080p (1920x1080)',
    extension: 'mp4',
    serverProcessing: true,
    badge: 'Estándar Dorado',
    description: 'MP4 - Requiere ensamblado de pista audiovisual en servidor',
    estimatedSizePrefix: '~80 - 160 MB',
  },
  {
    id: 'video-720p',
    label: 'Vídeo - 720p / 480p',
    category: 'video',
    resolutionOrBitrate: '720p (1280x720)',
    extension: 'mp4',
    serverProcessing: false,
    badge: 'Descarga Inmediata',
    description: 'MP4 - Descarga directa ligera y eficiente',
    estimatedSizePrefix: '~35 - 70 MB',
  },
  {
    id: 'audio-mp3',
    label: 'Audio - Alta Calidad (320 kbps MP3)',
    category: 'audio',
    resolutionOrBitrate: '320 kbps CBR',
    extension: 'mp3',
    serverProcessing: true,
    badge: 'Acústica Selecta',
    description: 'MP3 320 kbps - Requiere conversión de audio en servidor',
    estimatedSizePrefix: '~8 - 18 MB',
  },
  {
    id: 'audio-m4a',
    label: 'Audio - Nativo Original (M4A AAC)',
    category: 'audio',
    resolutionOrBitrate: '128-256 kbps AAC',
    extension: 'm4a',
    serverProcessing: false,
    badge: 'Extracción Pura',
    description: 'M4A AAC - Extracción rápida directa sin pérdida',
    estimatedSizePrefix: '~4 - 10 MB',
  },
];

/**
 * Extrae el ID de vídeo de YouTube soportando múltiples formatos de enlace:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 */
export function extractYouTubeVideoId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // youtube.com/watch?v=XXXX
  const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch && watchMatch[1]) return watchMatch[1];

  // youtu.be/XXXX
  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch && shortMatch[1]) return shortMatch[1];

  // youtube.com/shorts/XXXX
  const shortsMatch = trimmed.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (shortsMatch && shortsMatch[1]) return shortsMatch[1];

  // youtube.com/embed/XXXX
  const embedMatch = trimmed.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch && embedMatch[1]) return embedMatch[1];

  // Si el usuario pega directamente los 11 caracteres del ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * Convierte una duración en segundos al formato solemne clásico:
 * Ej: 125s -> "02:05", 3665s -> "1 hr 01 min 05 seg"
 */
export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    const formattedMins = mins < 10 ? `0${mins}` : `${mins}`;
    const formattedSecs = secs < 10 ? `0${secs}` : `${secs}`;
    return `${hrs}h ${formattedMins}m ${formattedSecs}s`;
  }

  const formattedMins = mins < 10 ? `0${mins}` : `${mins}`;
  const formattedSecs = secs < 10 ? `0${secs}` : `${secs}`;
  return `${formattedMins}:${formattedSecs}`;
}

/**
 * Sanitiza nombres de archivo para descarga en el sistema operativo
 */
export function sanitizeFilename(title: string, extension: string): string {
  const clean = title
    .replace(/[<>:"/\\|?*]+/g, '')
    .trim()
    .replace(/\s+/g, '_');
  return `${clean || 'youtube_video'}.${extension}`;
}
