'use client';

import React, { useState, useEffect } from 'react';
import { Search, Clipboard, X, Sun, Loader2, Sparkles } from 'lucide-react';
import { BohoCorner, BohoBead } from './Ornaments';
import { extractYouTubeVideoId } from '@/lib/youtube';

interface UrlInputFormProps {
  onSearch: (url: string) => Promise<void>;
  isLoading: boolean;
  initialUrl?: string;
  errorMessage?: string | null;
}

export default function UrlInputForm({
  onSearch,
  isLoading,
  initialUrl = '',
  errorMessage,
}: UrlInputFormProps) {
  const [url, setUrl] = useState(initialUrl);

  useEffect(() => {
    if (initialUrl) {
      setUrl(initialUrl);
    }
  }, [initialUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || isLoading) return;
    onSearch(url.trim());
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text);
        if (extractYouTubeVideoId(text)) {
          onSearch(text.trim());
        }
      }
    } catch {
      // Fallback portapapeles
    }
  };

  const handleClear = () => {
    setUrl('');
  };

  return (
    <div className="w-full relative">
      {/* Contenedor Bohemio con efecto Glassmorphism cálido */}
      <div className="relative rounded-2xl p-[1.5px] bg-gradient-to-r from-boho-ochre-500/60 via-boho-terracotta-500/60 to-boho-turquoise-600/40 shadow-boho-card">
        <div className="relative rounded-[15px] bg-boho-night-900/85 border border-boho-ochre-500/25 p-5 sm:p-7 backdrop-blur-md">
          {/* Esquinas ornamentales bohemias */}
          <BohoCorner position="top-left" />
          <BohoCorner position="top-right" />
          <BohoCorner position="bottom-left" />
          <BohoCorner position="bottom-right" />

          {/* Cuentas artesanales en las esquinas */}
          <BohoBead className="absolute top-3 left-3" />
          <BohoBead className="absolute top-3 right-3" />
          <BohoBead className="absolute bottom-3 left-3" />
          <BohoBead className="absolute bottom-3 right-3" />

          <div className="text-center mb-4">
            <span className="font-cinzel text-xs sm:text-sm tracking-[0.25em] uppercase font-semibold text-boho-ochre-300">
              — Paso I: Enlace del Viajero Digital —
            </span>
            <p className="font-garamond text-xs text-boho-sand-300/90 italic mt-0.5">
              Pegue la dirección del vídeo para iniciar la travesía de conversión
            </p>
          </div>

          <form onSubmit={handleSubmit} className="relative flex flex-col sm:flex-row gap-3 items-stretch">
            {/* Campo de Entrada Bohemio */}
            <div className="relative flex-1 group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-boho-ochre-400 group-focus-within:text-boho-terracotta-400 transition-colors">
                <Search className="w-5 h-5" />
              </div>

              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                disabled={isLoading}
                className="w-full pl-12 pr-20 py-3.5 bg-boho-sand-950/70 text-boho-sand-100 placeholder-boho-sand-600 font-garamond text-base sm:text-lg rounded-xl border border-boho-ochre-600/40 focus:border-boho-terracotta-400 focus:outline-none focus:ring-2 focus:ring-boho-terracotta-500/30 shadow-inner transition-all duration-200"
              />

              {/* Botones de acción rápida dentro del input */}
              <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center gap-1">
                {url ? (
                  <button
                    type="button"
                    onClick={handleClear}
                    title="Borrar enlace"
                    className="p-1.5 text-boho-sand-400 hover:text-boho-sand-100 hover:bg-boho-sand-900/60 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handlePaste}
                    title="Pegar desde el portapapeles"
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-cinzel text-boho-ochre-300 bg-boho-night-800/90 hover:bg-boho-night-700 border border-boho-ochre-500/30 rounded-lg transition-all shadow-sm"
                  >
                    <Clipboard className="w-3.5 h-3.5" />
                    <span className="hidden xs:inline">Pegar</span>
                  </button>
                )}
              </div>
            </div>

            {/* Botón de Envío Bohemio */}
            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="relative px-7 py-3.5 rounded-xl font-cinzel text-sm uppercase tracking-wider font-bold transition-all duration-300 select-none shadow-boho-terracotta disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden bg-gradient-to-r from-boho-ochre-500 via-boho-terracotta-500 to-boho-terracotta-600 text-white hover:from-boho-ochre-400 hover:via-boho-terracotta-400 hover:to-boho-terracotta-500 active:scale-[0.98] border border-boho-ochre-300/30"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Explorando...</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-4 h-4 text-boho-sand-100 group-hover:rotate-45 transition-transform" />
                    <span>Explorar</span>
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-white/15 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </button>
          </form>

          {/* Mensaje de Error Bohemio */}
          {errorMessage && (
            <div className="mt-4 p-3 rounded-xl border border-boho-terracotta-700 bg-boho-terracotta-950/85 text-boho-sand-100 text-xs sm:text-sm font-garamond text-center shadow-inner animate-fadeIn flex items-center justify-center gap-2">
              <span className="text-boho-ochre-400 font-bold">✧ Nota del Camino:</span>
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
