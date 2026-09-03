'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { VideoMetadata } from '@/types/youtube';
import { Clock, Film, User, ExternalLink, Sparkles, Compass } from 'lucide-react';
import { BohoCorner, BohoBead } from './Ornaments';

interface VideoPreviewCardProps {
  metadata: VideoMetadata;
}

export default function VideoPreviewCard({ metadata }: VideoPreviewCardProps) {
  const [imgError, setImgError] = useState(false);
  const fallbackThumbnail = `https://img.youtube.com/vi/${metadata.id}/mqdefault.jpg`;

  return (
    <div className="w-full relative animate-fadeIn transition-all duration-500">
      {/* Marco Bohemio con Glassmorphism */}
      <div className="relative rounded-2xl p-[1.5px] bg-gradient-to-r from-boho-ochre-500/60 via-boho-terracotta-500/60 to-boho-turquoise-600/40 shadow-boho-card">
        <div className="relative rounded-[15px] bg-boho-night-900/85 border border-boho-ochre-500/25 p-5 sm:p-6 backdrop-blur-md">
          {/* Esquinas ornamentales bohemias */}
          <BohoCorner position="top-left" />
          <BohoCorner position="top-right" />
          <BohoCorner position="bottom-left" />
          <BohoCorner position="bottom-right" />

          {/* Cuentas artesanales */}
          <BohoBead className="absolute top-3 left-3" />
          <BohoBead className="absolute top-3 right-3" />
          <BohoBead className="absolute bottom-3 left-3" />
          <BohoBead className="absolute bottom-3 right-3" />

          {/* Indicador de paso */}
          <div className="text-center mb-3">
            <span className="font-cinzel text-xs tracking-[0.25em] uppercase font-semibold text-boho-ochre-300">
              — Paso II: Espejismo Audiovisual Detectado —
            </span>
          </div>

          <div className="flex flex-col md:flex-row gap-5 items-center">
            {/* Marco de Miniatura Estilo Tapiz / Lienzo Bohemio */}
            <div className="relative flex-shrink-0 w-full md:w-64 aspect-video rounded-xl border-2 border-boho-ochre-400/70 shadow-boho-soft overflow-hidden bg-black group">
              <Image
                src={imgError ? fallbackThumbnail : metadata.thumbnailUrl}
                alt={metadata.title}
                fill
                sizes="(max-width: 768px) 100vw, 256px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                onError={() => setImgError(true)}
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />

              {/* Insignia de Duración Flotante */}
              <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 px-3 py-1 rounded-full bg-boho-night-900/90 border border-boho-ochre-400 text-boho-ochre-300 font-cinzel text-xs font-bold shadow-md">
                <Clock className="w-3.5 h-3.5 text-boho-terracotta-400" />
                <span>{metadata.durationFormatted}</span>
              </div>
            </div>

            {/* Ficha Descriptiva Bohemia */}
            <div className="flex-1 flex flex-col justify-between w-full">
              <div>
                <div className="flex items-center gap-2 text-boho-ochre-400 text-xs font-cinzel tracking-wider uppercase mb-1.5">
                  <Compass className="w-3.5 h-3.5 text-boho-turquoise-400" />
                  <span>Pliego Encontrado</span>
                  <span className="text-boho-ochre-600">•</span>
                  <span className="text-boho-sand-400 font-garamond text-xs normal-case">
                    ID: {metadata.id}
                  </span>
                </div>

                <h2 className="font-cinzel text-lg sm:text-xl font-bold text-boho-sand-100 leading-snug drop-shadow line-clamp-2">
                  {metadata.title}
                </h2>

                <div className="mt-3 flex flex-wrap items-center gap-2.5 text-xs font-garamond text-boho-sand-300">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-boho-sand-900/70 border border-boho-ochre-700/50">
                    <User className="w-3.5 h-3.5 text-boho-ochre-400" />
                    <span className="font-semibold text-boho-sand-200">{metadata.author}</span>
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-boho-turquoise-950/70 border border-boho-turquoise-700/50 text-boho-turquoise-300">
                    <Sparkles className="w-3.5 h-3.5 text-boho-turquoise-400" />
                    <span>Fuente Verificada</span>
                  </div>

                  <a
                    href={metadata.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-boho-ochre-400 hover:text-boho-ochre-200 transition-colors ml-auto text-xs font-cinzel underline underline-offset-4"
                  >
                    <span>Ver en YouTube</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Barra inferior de duración */}
              <div className="mt-4 pt-3 border-t border-boho-ochre-800/40 flex items-center justify-between text-xs font-garamond text-boho-sand-400">
                <span className="italic">Duración exacta de la obra:</span>
                <span className="font-cinzel font-bold text-boho-ochre-300 text-sm tracking-wide">
                  {metadata.durationFormatted} ({metadata.durationSeconds} seg.)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
