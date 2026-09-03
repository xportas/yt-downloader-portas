import React from 'react';
import { Sun, Compass, Sparkles, Feather } from 'lucide-react';
import { BohoDivider, BohoSun } from './Ornaments';

export default function BohemianHeader() {
  return (
    <header className="relative text-center pt-8 pb-3 px-4 select-none">
      {/* Insignia Bohemia Solar Superior */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-boho-ochre-500/40 bg-boho-night-900/80 backdrop-blur-md text-boho-sand-200 shadow-boho-soft mb-3.5">
        <BohoSun className="w-4 h-4 animate-[spin_24s_linear_infinite]" />
        <span className="font-cinzel text-[11px] tracking-[0.25em] uppercase font-semibold text-boho-sand-200">
          Caravana de Ondas • Del Partenón al Nilo
        </span>
        <Feather className="w-3.5 h-3.5 text-boho-terracotta-400" />
      </div>

      {/* Título Principal Bohemio */}
      <div className="relative max-w-2xl mx-auto">
        <h1 className="font-cinzel text-4xl sm:text-5xl md:text-6xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-boho-sand-100 via-boho-ochre-300 to-boho-terracotta-400 drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)] uppercase">
          Portas El Pirateador
        </h1>
        <p className="mt-2 font-garamond text-lg sm:text-xl text-boho-sand-300 italic tracking-wide drop-shadow">
          Descargador y Conversor Bohemio de Vídeos de YouTube
        </p>
      </div>

      {/* Divisor Bohemio */}
      <div className="max-w-md mx-auto">
        <BohoDivider />
      </div>

      <p className="max-w-xl mx-auto text-xs sm:text-sm font-garamond text-boho-sand-300 leading-relaxed drop-shadow">
        Conecte su enlace predilecto para materializar cualquier contenido en su biblioteca
        con la calidez de las arenas milenarias y la máxima fidelidad sonora y visual.
      </p>
    </header>
  );
}
