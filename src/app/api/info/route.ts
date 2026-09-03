import { NextRequest, NextResponse } from 'next/server';
import { extractYouTubeVideoId } from '@/lib/youtube';
import { getRealVideoMetadata } from '@/lib/ytdlp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { error: 'Debe proporcionar un enlace de YouTube válido.' },
        { status: 400 }
      );
    }

    const videoId = extractYouTubeVideoId(url);
    if (!videoId) {
      return NextResponse.json(
        { error: 'El enlace proporcionado no corresponde a un vídeo de YouTube reconocido.' },
        { status: 400 }
      );
    }

    // Obtener metadatos reales y duración exacta mediante yt-dlp
    const metadata = await getRealVideoMetadata(url, videoId);

    return NextResponse.json(metadata);
  } catch (error) {
    console.error('Error en /api/info:', error);
    return NextResponse.json(
      { error: 'Error al consultar los registros del vídeo. Verifique el enlace e inténtelo de nuevo.' },
      { status: 500 }
    );
  }
}
