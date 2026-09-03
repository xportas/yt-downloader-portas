import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import { formatDuration, sanitizeFilename } from './youtube';
import { VideoMetadata } from '@/types/youtube';

const execPromise = promisify(exec);

// Rutas conocidas en Windows para FFmpeg
const KNOWN_FFMPEG_PATHS = [
  path.join(
    process.env.APPDATA || 'C:\\Users\\xportas\\AppData\\Roaming',
    'Python\\Python310\\site-packages\\imageio_ffmpeg\\binaries\\ffmpeg-win-x86_64-v7.1.exe'
  ),
  'ffmpeg.exe',
  'ffmpeg',
];

let cachedFfmpegPath: string | null = null;

export async function getFfmpegPath(): Promise<string | null> {
  if (cachedFfmpegPath) return cachedFfmpegPath;

  for (const candidate of KNOWN_FFMPEG_PATHS) {
    if (fs.existsSync(candidate)) {
      cachedFfmpegPath = candidate;
      return candidate;
    }
  }

  try {
    const { stdout } = await execPromise('python -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())"');
    const detected = stdout.trim();
    if (fs.existsSync(detected)) {
      cachedFfmpegPath = detected;
      return detected;
    }
  } catch {}

  return null;
}

/**
 * Obtiene metadatos reales y duración exacta del vídeo mediante yt-dlp
 */
export async function getRealVideoMetadata(url: string, videoId: string): Promise<VideoMetadata> {
  const cleanUrl = `https://www.youtube.com/watch?v=${videoId}`;

  try {
    const { stdout } = await execPromise(
      `python -m yt_dlp --no-check-certificates --dump-json --no-warnings "${cleanUrl}"`,
      { timeout: 20000, maxBuffer: 15 * 1024 * 1024 }
    );

    const data = JSON.parse(stdout);
    const durationSeconds = Math.round(Number(data.duration) || 0);

    return {
      id: videoId,
      url: cleanUrl,
      title: data.title || data.fulltitle || 'Vídeo de YouTube',
      author: data.uploader || data.channel || 'Canal de YouTube',
      durationSeconds,
      durationFormatted: formatDuration(durationSeconds),
      thumbnailUrl: data.thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      views: data.view_count ? String(data.view_count) : undefined,
    };
  } catch (err) {
    console.warn('Fallback oEmbed para metadatos:', err);

    let title = 'Vídeo de YouTube';
    let author = 'Canal Oficial';
    let durationSeconds = 180;

    try {
      const oembedRes = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
        { cache: 'no-store' }
      );
      if (oembedRes.ok) {
        const oembed = await oembedRes.json();
        if (oembed.title) title = oembed.title;
        if (oembed.author_name) author = oembed.author_name;
      }
    } catch {}

    return {
      id: videoId,
      url: cleanUrl,
      title,
      author,
      durationSeconds,
      durationFormatted: formatDuration(durationSeconds),
      thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    };
  }
}

export interface DownloadResult {
  filePath: string;
  fileName: string;
  fileSizeBytes: number;
}

/**
 * Descarga y convierte el archivo real usando yt-dlp y FFmpeg
 * Garantizando compatibilidad nativa absoluta con Windows Media Player (H.264 + AAC en MP4)
 */
export async function downloadRealMedia(
  videoId: string,
  title: string,
  formatId: string,
  outputDir: string
): Promise<DownloadResult> {
  const ffmpegPath = await getFfmpegPath();
  const ffmpegArg = ffmpegPath ? `--ffmpeg-location "${ffmpegPath}"` : '';
  const cleanTitle = sanitizeFilename(title, '').replace(/\.[^.]+$/, '');
  const baseOutName = `${cleanTitle}_${Date.now()}`;
  const outTemplate = path.join(outputDir, `${baseOutName}.%(ext)s`);

  let formatArgs = '';
  let expectedExtension = 'mp4';

  // Forzamos codificación H.264 + AAC para máxima compatibilidad con el Reproductor de Windows
  switch (formatId) {
    case 'video-4k':
      formatArgs = `-f "bestvideo[height>=1440][vcodec^=avc1]+bestaudio[acodec^=mp4a]/bestvideo[height>=1440]+bestaudio/best" --recode-video mp4 --postprocessor-args "VideoConvertor:-c:v libx264 -c:a aac"`;
      expectedExtension = 'mp4';
      break;

    case 'video-1080p':
      formatArgs = `-f "bestvideo[height<=1080][vcodec^=avc1]+bestaudio[acodec^=mp4a]/bestvideo[height<=1080]+bestaudio/best" --recode-video mp4 --postprocessor-args "VideoConvertor:-c:v libx264 -c:a aac"`;
      expectedExtension = 'mp4';
      break;

    case 'video-720p':
      formatArgs = `-f "bestvideo[height<=720][vcodec^=avc1]+bestaudio[acodec^=mp4a]/bestvideo[height<=720]+bestaudio/best" --recode-video mp4 --postprocessor-args "VideoConvertor:-c:v libx264 -c:a aac"`;
      expectedExtension = 'mp4';
      break;

    case 'audio-mp3':
      formatArgs = `-x --audio-format mp3 --audio-quality 0`;
      expectedExtension = 'mp3';
      break;

    case 'audio-m4a':
      formatArgs = `-x --audio-format m4a`;
      expectedExtension = 'm4a';
      break;

    default:
      formatArgs = `-f "bestvideo[vcodec^=avc1]+bestaudio[acodec^=mp4a]/best" --recode-video mp4 --postprocessor-args "VideoConvertor:-c:v libx264 -c:a aac"`;
      expectedExtension = 'mp4';
  }

  const url = `https://www.youtube.com/watch?v=${videoId}`;
  const command = `python -m yt_dlp --no-check-certificates ${ffmpegArg} ${formatArgs} -o "${outTemplate}" "${url}"`;

  try {
    await execPromise(command, { timeout: 120000 });
  } catch (error: any) {
    console.error('Error durante la descarga con yt-dlp:', error);
    throw new Error(`Error al procesar el archivo multimedia: ${error?.message || error}`);
  }

  // Comprobar archivo producido
  const expectedFile = path.join(outputDir, `${baseOutName}.${expectedExtension}`);
  if (fs.existsSync(expectedFile)) {
    const stats = fs.statSync(expectedFile);
    return {
      filePath: expectedFile,
      fileName: `${cleanTitle}.${expectedExtension}`,
      fileSizeBytes: stats.size,
    };
  }

  // Comprobación de fallback si la extensión difiere
  const files = fs.readdirSync(outputDir);
  const found = files.find((f) => f.startsWith(baseOutName));
  if (found) {
    const fullPath = path.join(outputDir, found);
    const stats = fs.statSync(fullPath);
    const actualExt = path.extname(found).replace('.', '');
    return {
      filePath: fullPath,
      fileName: `${cleanTitle}.${actualExt}`,
      fileSizeBytes: stats.size,
    };
  }

  throw new Error('No se pudo encontrar el archivo descargado en el servidor.');
}
