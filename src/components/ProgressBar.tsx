'use client';

import React from 'react';
import { Sun, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import { ProcessingProgress } from '@/types/youtube';

interface ProgressBarProps {
  progress: ProcessingProgress;
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  const isComplete = progress.percentage >= 100;
  const isError = progress.step === 'error';

  return (
    <div className="w-full my-4 animate-fadeIn">
      {/* Contenedor Bohemio de Progreso */}
      <div className="rounded-xl border border-boho-ochre-600/40 bg-boho-night-900/90 p-4 shadow-boho-card backdrop-blur-md">
        {/* Cabecera del Progreso */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            {isComplete ? (
              <CheckCircle2 className="w-4 h-4 text-boho-turquoise-400" />
            ) : isError ? (
              <AlertTriangle className="w-4 h-4 text-boho-terracotta-400" />
            ) : (
              <Sun className="w-4 h-4 text-boho-ochre-400 animate-[spin_6s_linear_infinite]" />
            )}
            <span className="font-cinzel text-xs uppercase tracking-wider font-semibold text-boho-ochre-300">
              {isComplete
                ? 'Confección Completa'
                : isError
                ? 'Incidencia en el Trayecto'
                : 'Alineación de Ondas y Procesamiento'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-cinzel text-xs font-bold">
            <span className={isComplete ? 'text-boho-turquoise-300' : 'text-boho-ochre-300'}>
              {Math.min(100, Math.max(0, Math.round(progress.percentage)))}%
            </span>
          </div>
        </div>

        {/* Carril de la barra con gradiente desértico */}
        <div className="relative h-3.5 w-full rounded-full bg-boho-sand-950 border border-boho-ochre-800/60 p-[2px] overflow-hidden shadow-inner">
          <div
            className={`h-full rounded-full transition-all duration-300 relative overflow-hidden ${
              isComplete
                ? 'bg-gradient-to-r from-boho-turquoise-600 via-boho-turquoise-400 to-boho-ochre-400'
                : isError
                ? 'bg-gradient-to-r from-boho-terracotta-700 to-boho-terracotta-500'
                : 'bg-gradient-to-r from-boho-ochre-600 via-boho-terracotta-500 to-boho-ochre-400'
            }`}
            style={{ width: `${Math.min(100, Math.max(3, progress.percentage))}%` }}
          >
            {/* Brillo solar en movimiento */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmerBoho_2s_infinite]" />
          </div>
        </div>

        {/* Mensaje de Fase Actual */}
        <div className="mt-2.5 flex items-center justify-between text-[11px] font-garamond">
          <span className="text-boho-sand-300 italic">
            {progress.message || 'Sincronizando flujos de la caravana...'}
          </span>
          {isComplete && (
            <span className="text-boho-turquoise-300 font-cinzel font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Listo para recepción
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
