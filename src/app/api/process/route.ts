import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { AVAILABLE_FORMATS } from '@/lib/youtube';
import { downloadRealMedia } from '@/lib/ytdlp';
import { cleanOldDownloads } from '@/lib/cleanup';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoId, title, formatId } = body;

    if (!videoId || !formatId) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos (videoId o formatId).' },
        { status: 400 }
      );
    }

    const selectedFormat = AVAILABLE_FORMATS.find((f) => f.id === formatId);
    if (!selectedFormat) {
      return NextResponse.json(
        { error: 'El formato seleccionado no existe en el catálogo.' },
        { status: 400 }
      );
    }

    const downloadsDir = path.join(process.cwd(), 'downloads');
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }

    // Limpieza automática de descargas con más de 30 minutos de antigüedad
    cleanOldDownloads(downloadsDir);

    // Ejecución real de descarga y conversión con FFmpeg
    const result = await downloadRealMedia(
      videoId,
      title || `video_${videoId}`,
      formatId,
      downloadsDir
    );

    const baseFile = path.basename(result.filePath);
    const downloadUrl = `/api/download?fileId=${encodeURIComponent(baseFile)}&filename=${encodeURIComponent(result.fileName)}`;

    return NextResponse.json({
      success: true,
      status: 'ready',
      downloadUrl,
      fileName: result.fileName,
      fileSizeBytes: result.fileSizeBytes,
      format: selectedFormat,
    });
  } catch (error: any) {
    console.error('Error en /api/process:', error);
    return NextResponse.json(
      { error: error?.message || 'Fallo al procesar el archivo multimedia en el servidor.' },
      { status: 500 }
    );
  }
}
