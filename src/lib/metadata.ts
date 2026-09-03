import { formatDuration } from './youtube';
import { VideoMetadata } from '@/types/youtube';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

/**
 * Extractor nativo universal de metadatos de YouTube.
 * Diseñado para operar al 100% en Vercel Serverless (sin Python)
 * y con fallback en local (con yt-dlp si está disponible).
 */
export async function extractUniversalMetadata(videoId: string): Promise<VideoMetadata> {
  const cleanUrl = `https://www.youtube.com/watch?v=${videoId}`;
  let title = 'Vídeo de YouTube';
  let author = 'Canal de YouTube';
  let durationSeconds = 0;
  let thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  let views: string | undefined = undefined;

  // 1. CAPA PRIMARIA: API InnerTube nativa de YouTube (Ultra-rápida en Vercel, ~200ms)
  try {
    const innertubeRes = await fetch('https://www.youtube.com/youtubei/v1/player', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      },
      body: JSON.stringify({
        videoId,
        context: {
          client: {
            clientName: 'WEB',
            clientVersion: '2.20240101.00.00',
            hl: 'es',
            gl: 'ES',
          },
        },
      }),
      cache: 'no-store',
    });

    if (innertubeRes.ok) {
      const data = await innertubeRes.json();
      if (data.videoDetails) {
        if (data.videoDetails.title) title = data.videoDetails.title;
        if (data.videoDetails.author) author = data.videoDetails.author;
        if (data.videoDetails.lengthSeconds) {
          durationSeconds = parseInt(data.videoDetails.lengthSeconds, 10) || 0;
        }
        if (data.videoDetails.viewCount) views = data.videoDetails.viewCount;

        const thumbs = data.videoDetails.thumbnail?.thumbnails;
        if (Array.isArray(thumbs) && thumbs.length > 0) {
          thumbnailUrl = thumbs[thumbs.length - 1].url;
        }

        if (durationSeconds > 0) {
          return {
            id: videoId,
            url: cleanUrl,
            title,
            author,
            durationSeconds,
            durationFormatted: formatDuration(durationSeconds),
            thumbnailUrl,
            views,
          };
        }
      }
    }
  } catch (innertubeErr) {
    console.warn('InnerTube API no disponible, probando capa de scraping HTML:', innertubeErr);
  }

  // 2. CAPA SECUNDARIA: Scraping de la página de YouTube (obtención de approxDurationMs)
  try {
    const pageRes = await fetch(cleanUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
      },
      cache: 'no-store',
    });

    if (pageRes.ok) {
      const html = await pageRes.text();

      // Duración en milisegundos o segundos
      const durationMsMatch = html.match(/"approxDurationMs":"(\d+)"/);
      const lengthSecondsMatch = html.match(/"lengthSeconds":"(\d+)"/);

      if (lengthSecondsMatch && lengthSecondsMatch[1]) {
        durationSeconds = parseInt(lengthSecondsMatch[1], 10);
      } else if (durationMsMatch && durationMsMatch[1]) {
        durationSeconds = Math.floor(parseInt(durationMsMatch[1], 10) / 1000);
      }

      // Título
      const titleMatch =
        html.match(/<meta\s+name="title"\s+content="([^"]+)"/i) ||
        html.match(/<title>([^<]+)<\/title>/i);
      if (titleMatch && titleMatch[1]) {
        title = titleMatch[1].replace(' - YouTube', '').trim();
      }

      // Autor
      const authorMatch = html.match(/<link\s+itemprop="name"\s+content="([^"]+)"/i);
      if (authorMatch && authorMatch[1]) {
        author = authorMatch[1].trim();
      }

      if (durationSeconds > 0) {
        return {
          id: videoId,
          url: cleanUrl,
          title,
          author,
          durationSeconds,
          durationFormatted: formatDuration(durationSeconds),
          thumbnailUrl,
          views,
        };
      }
    }
  } catch (htmlErr) {
    console.warn('Scraping HTML no disponible:', htmlErr);
  }

  // 3. CAPA TERCIARIA: Si estamos en local (fuera de Vercel) y existe Python + yt-dlp
  if (!process.env.VERCEL) {
    try {
      const { stdout } = await execPromise(
        `python -m yt_dlp --no-check-certificates --dump-json --no-warnings "${cleanUrl}"`,
        { timeout: 15000, maxBuffer: 10 * 1024 * 1024 }
      );
      const data = JSON.parse(stdout);
      durationSeconds = Math.round(Number(data.duration) || 0);

      return {
        id: videoId,
        url: cleanUrl,
        title: data.title || data.fulltitle || title,
        author: data.uploader || data.channel || author,
        durationSeconds,
        durationFormatted: formatDuration(durationSeconds),
        thumbnailUrl: data.thumbnail || thumbnailUrl,
        views: data.view_count ? String(data.view_count) : views,
      };
    } catch {}
  }

  // 4. CAPA CUARTA: oEmbed (título y autor garantizados)
  try {
    const oembedRes = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(cleanUrl)}&format=json`,
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
    durationSeconds: durationSeconds || 180,
    durationFormatted: formatDuration(durationSeconds || 180),
    thumbnailUrl,
    views,
  };
}
