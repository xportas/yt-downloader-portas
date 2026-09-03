import { NextRequest, NextResponse } from 'next/server';
import { extractYouTubeVideoId } from '@/lib/youtube';
import { extractUniversalMetadata } from '@/lib/metadata';

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

    // Extracción universal y exacta compatible con Vercel Serverless
    const metadata = await extractUniversalMetadata(videoId);

    return NextResponse.json(metadata);
  } catch (error) {
    console.error('Error en /api/info:', error);
    return NextResponse.json(
      { error: 'Error al consultar los registros del vídeo. Verifique el enlace e inténtelo de nuevo.' },
      { status: 500 }
    );
  }
}
