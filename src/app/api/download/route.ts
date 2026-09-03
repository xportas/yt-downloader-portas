import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { cleanOldDownloads } from '@/lib/cleanup';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const fileId = searchParams.get('fileId');
    const filename = searchParams.get('filename') || 'video_portas_el_pirateador.mp4';

    if (!fileId) {
      return NextResponse.json(
        { error: 'Identificador de archivo no especificado.' },
        { status: 400 }
      );
    }

    // Sanitización estricta contra Path Traversal
    const safeBaseName = path.basename(fileId);
    const downloadsDir = path.join(process.cwd(), 'downloads');
    
    // Purgar archivos con más de 30 minutos
    cleanOldDownloads(downloadsDir);

    const targetFile = path.join(downloadsDir, safeBaseName);

    if (!fs.existsSync(targetFile)) {
      return NextResponse.json(
        { error: 'El archivo solicitado ya no reside en el servidor o ha expirado.' },
        { status: 404 }
      );
    }

    const fileStat = fs.statSync(targetFile);
    const ext = path.extname(targetFile).toLowerCase();

    let contentType = 'video/mp4';
    if (ext === '.mp3') contentType = 'audio/mpeg';
    else if (ext === '.m4a') contentType = 'audio/mp4';
    else if (ext === '.webm') contentType = 'video/webm';

    // Leer el buffer del archivo multimedia binario real
    const fileBuffer = fs.readFileSync(targetFile);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        'Content-Length': fileStat.size.toString(),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error en /api/download:', error);
    return NextResponse.json(
      { error: 'Error al transferir el archivo multimedia.' },
      { status: 500 }
    );
  }
}
