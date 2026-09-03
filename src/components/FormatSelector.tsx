'use client';

import React from 'react';
import { FormatId, FormatOption } from '@/types/youtube';
import { AVAILABLE_FORMATS } from '@/lib/youtube';
import { Video, Music, Cpu, Zap, Check, ShieldCheck, Sun } from 'lucide-react';
import { BohoCorner, BohoBead } from './Ornaments';

interface FormatSelectorProps {
  selectedFormatId: FormatId;
  onSelectFormat: (formatId: FormatId) => void;
  disabled?: boolean;
}

export default function FormatSelector({
  selectedFormatId,
  onSelectFormat,
  disabled = false,
}: FormatSelectorProps) {
  return (
    <div className="w-full relative animate-fadeIn transition-all duration-500">
      {/* Marco Bohemio */}
      <div className="relative rounded-2xl p-[1.5px] bg-gradient-to-r from-boho-ochre-500/60 via-boho-terracotta-500/60 to-boho-turquoise-600/40 shadow-boho-card">
        <div className="relative rounded-[15px] bg-boho-night-900/85 border border-boho-ochre-500/25 p-5 sm:p-7 backdrop-blur-md">
          <BohoCorner position="top-left" />
          <BohoCorner position="top-right" />
          <BohoCorner position="bottom-left" />
          <BohoCorner position="bottom-right" />

          <BohoBead className="absolute top-3 left-3" />
          <BohoBead className="absolute top-3 right-3" />
          <BohoBead className="absolute bottom-3 left-3" />
          <BohoBead className="absolute bottom-3 right-3" />

          <div className="text-center mb-5">
            <span className="font-cinzel text-xs sm:text-sm tracking-[0.25em] uppercase font-semibold text-boho-ochre-300">
              — Paso III: Matriz de Formato y Resolución —
            </span>
            <p className="font-garamond text-xs text-boho-sand-300/90 italic mt-0.5">
              Elija la manifestación artesanal deseada para su archivo
            </p>
          </div>

          {/* Opciones de la Matriz Estricta */}
          <div className="grid grid-cols-1 gap-3">
            {AVAILABLE_FORMATS.map((format: FormatOption) => {
              const isSelected = selectedFormatId === format.id;
              const isVideo = format.category === 'video';

              return (
                <button
                  key={format.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => onSelectFormat(format.id)}
                  className={`group relative text-left p-4 rounded-xl border transition-all duration-300 select-none overflow-hidden ${
                    isSelected
                      ? 'border-boho-terracotta-400 bg-gradient-to-r from-boho-night-800 via-boho-terracotta-950/60 to-boho-night-800 shadow-boho-glow ring-1 ring-boho-terracotta-400/60'
                      : 'border-boho-ochre-800/40 bg-boho-sand-950/60 hover:bg-boho-night-800/80 hover:border-boho-ochre-600/50'
                  } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer active:scale-[0.99]'}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    {/* Icono y Título */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Sello de Selección Bohemio */}
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all ${
                          isSelected
                            ? 'border-boho-terracotta-400 bg-gradient-to-tr from-boho-terracotta-600 to-boho-ochre-500 text-white shadow-sm'
                            : 'border-boho-ochre-700/60 bg-boho-night-950 text-transparent group-hover:border-boho-ochre-400'
                        }`}
                      >
                        <Check className={`w-4 h-4 stroke-[3] ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
                      </div>

                      {/* Icono de Tipo */}
                      <div
                        className={`p-2.5 rounded-lg border ${
                          isVideo
                            ? 'border-boho-ochre-700/50 bg-boho-ochre-950/60 text-boho-ochre-300'
                            : 'border-boho-turquoise-700/50 bg-boho-turquoise-950/60 text-boho-turquoise-300'
                        }`}
                      >
                        {isVideo ? <Video className="w-4 h-4" /> : <Music className="w-4 h-4" />}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3
                            className={`font-cinzel text-sm sm:text-base font-bold tracking-wide transition-colors ${
                              isSelected ? 'text-boho-ochre-200' : 'text-boho-sand-100 group-hover:text-boho-ochre-300'
                            }`}
                          >
                            {format.label}
                          </h3>
                        </div>
                        <p className="font-garamond text-xs text-boho-sand-300/90 mt-0.5">
                          {format.description}
                        </p>
                      </div>
                    </div>

                    {/* Insignia de Requerimiento de Servidor / Descarga Directa */}
                    <div className="flex-shrink-0 flex flex-col items-end gap-1 text-right">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-cinzel font-semibold tracking-wider uppercase border ${
                          format.serverProcessing
                            ? 'bg-boho-terracotta-950/80 border-boho-terracotta-700/70 text-boho-terracotta-300'
                            : 'bg-boho-sage-950/80 border-boho-sage-700/70 text-boho-sage-300'
                        }`}
                      >
                        {format.serverProcessing ? (
                          <>
                            <Cpu className="w-3 h-3 text-boho-terracotta-400" />
                            <span>Servidor</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-3 h-3 text-boho-sage-400" />
                            <span>Directa</span>
                          </>
                        )}
                      </span>

                      <span className="font-garamond text-[11px] text-boho-sand-400 italic hidden sm:inline">
                        {format.estimatedSizePrefix}
                      </span>
                    </div>
                  </div>

                  {/* Resplandor lateral suave */}
                  {isSelected && (
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-boho-ochre-400 via-boho-terracotta-500 to-boho-turquoise-500" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-5 pt-3 border-t border-boho-ochre-800/40 flex items-center justify-between text-[11px] font-garamond text-boho-sand-400">
            <span className="flex items-center gap-1">
              <Sun className="w-3.5 h-3.5 text-boho-ochre-400" />
              Empaquetado puro sin pérdida en códecs universales H.264 / AAC / Opus
            </span>
            <span className="text-boho-ochre-400 font-cinzel">Estándar Nomad Boho</span>
          </div>
        </div>
      </div>
    </div>
  );
}
