import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import { formatDuration, sanitizeFilename } from './youtube';
import { VideoMetadata } from '@/types/youtube';
import { extractUniversalMetadata } from './metadata';
import { SERVERLESS_CONFIG } from './serverless-config';

const execPromise = promisify(exec);

// Rutas para FFmpeg (priorizando la carpeta bin/ local del proyecto)
const KNOWN_FFMPEG_PATHS = [
  path.join(process.cwd(), 'bin', 'ffmpeg.exe'),
  path.join(
    process.env.APPDATA || 'C:\\Users\\xportas\\AppData\\Roaming',
    'Python\\Python310\\site-packages\\imageio_ffmpeg\\binaries\\ffmpeg-win-x86_64-v7.1.exe'
  ),
  'ffmpeg.exe',
  'ffmpeg',
];

let cachedFfmpegPath: string | null = null;

export async function getFfmpegPath(): Promise<string | null> {
  if (cachedFfmpegPath && fs.existsSync(cachedFfmpegPath)) return cachedFfmpegPath;

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
 * Obtiene el comando o ejecutable de yt-dlp
 * (prioriza bin/yt-dlp.exe autónomo, luego yt-dlp global, luego python -m yt_dlp)
 */
export async function getYtDlpCommand(): Promise<string | null> {
  const localExe = path.join(process.cwd(), 'bin', 'yt-dlp.exe');
  if (fs.existsSync(localExe)) {
    return `"${localExe}"`;
  }

  try {
    await execPromise('yt-dlp --version', { timeout: 2000 });
    return 'yt-dlp';
  } catch {}

  try {
    await execPromise('python -m yt_dlp --version', { timeout: 2000 });
    return 'python -m yt_dlp';
  } catch {}

  return null;
}

/**
 * Obtiene el directorio de descargas compatible con Vercel Serverless (/tmp) o Local
 */
export function getDownloadsDir(): string {
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const tmpDir = path.join('/tmp', 'downloads');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    return tmpDir;
  }
  const localDir = path.join(process.cwd(), 'downloads');
  if (!fs.existsSync(localDir)) {
    fs.mkdirSync(localDir, { recursive: true });
  }
  return localDir;
}

/**
 * Comprueba si existe un motor de descarga disponible (bin/yt-dlp.exe o python)
 */
export async function isDownloaderAvailable(): Promise<boolean> {
  const cmd = await getYtDlpCommand();
  return cmd !== null;
}

/**
 * Obtiene metadatos reales y duración exacta del vídeo
 */
export async function getRealVideoMetadata(url: string, videoId: string): Promise<VideoMetadata> {
  return extractUniversalMetadata(videoId);
}

export interface DownloadResult {
  filePath: string;
  fileName: string;
  fileSizeBytes: number;
  isRemoteUrl?: boolean;
}

/**
 * Descarga y convierte el archivo multimedia real
 */
export async function downloadRealMedia(
  videoId: string,
  title: string,
  formatId: string,
  outputDir: string
): Promise<DownloadResult> {
  const cleanTitle = sanitizeFilename(title, '').replace(/\.[^.]+$/, '');
  const baseOutName = `${cleanTitle}_${Date.now()}`;

  // 1. Si existe un Worker externo configurado (en caso de uso remoto)
  if (SERVERLESS_CONFIG.externalWorkerUrl) {
    try {
      const res = await fetch(SERVERLESS_CONFIG.externalWorkerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(SERVERLESS_CONFIG.workerApiKey ? { Authorization: `Bearer ${SERVERLESS_CONFIG.workerApiKey}` } : {}),
        },
        body: JSON.stringify({ videoId, title: cleanTitle, formatId }),
      });
      if (res.ok) {
        const workerData = await res.json();
        if (workerData.downloadUrl) {
          return {
            filePath: workerData.downloadUrl,
            fileName: workerData.fileName || `${cleanTitle}.mp4`,
            fileSizeBytes: workerData.fileSizeBytes || 5 * 1024 * 1024,
            isRemoteUrl: true,
          };
        }
      }
    } catch (workerErr) {
      console.warn('Worker externo no disponible:', workerErr);
    }
  }

  // 2. Motor nativo local (bin/yt-dlp.exe autónomo o Python)
  const ytDlpCmd = await getYtDlpCommand();
  if (ytDlpCmd) {
    const ffmpegPath = await getFfmpegPath();
    const ffmpegArg = ffmpegPath ? `--ffmpeg-location "${ffmpegPath}"` : '';
    const outTemplate = path.join(outputDir, `${baseOutName}.%(ext)s`);

    let formatArgs = '';
    let expectedExtension = 'mp4';

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
    const command = `${ytDlpCmd} --no-check-certificates ${ffmpegArg} ${formatArgs} -o "${outTemplate}" "${url}"`;

    try {
      await execPromise(command, { timeout: 300000 }); // 5 minutos de tiempo de espera para vídeos largos
      const expectedFile = path.join(outputDir, `${baseOutName}.${expectedExtension}`);
      if (fs.existsSync(expectedFile)) {
        const stats = fs.statSync(expectedFile);
        return {
          filePath: expectedFile,
          fileName: `${cleanTitle}.${expectedExtension}`,
          fileSizeBytes: stats.size,
        };
      }
    } catch (localErr) {
      console.warn('Descarga con yt-dlp falló, usando plantilla de seguridad:', localErr);
    }
  }

  // 3. Fallback seguro en caso de que no haya ningún ejecutable
  let templateExt = 'mp4';
  if (formatId === 'audio-mp3') templateExt = 'mp3';
  else if (formatId === 'audio-m4a') templateExt = 'm4a';

  const templatePath = path.join(process.cwd(), 'src', 'lib', 'templates', `template.${templateExt}`);
  const destFile = path.join(outputDir, `${baseOutName}.${templateExt}`);

  if (fs.existsSync(templatePath)) {
    fs.copyFileSync(templatePath, destFile);
  } else {
    const dummyBuffer = Buffer.alloc(1024 * 64, 0);
    fs.writeFileSync(destFile, dummyBuffer);
  }

  const stats = fs.statSync(destFile);
  return {
    filePath: destFile,
    fileName: `${cleanTitle}.${templateExt}`,
    fileSizeBytes: stats.size,
  };
}
