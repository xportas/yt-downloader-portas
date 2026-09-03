import React from 'react';
import { BohoDivider } from './Ornaments';

export default function BohemianFooter() {
  return (
    <footer className="w-full max-w-4xl mx-auto mt-10 pb-8 px-4 text-center font-garamond select-none">
      <BohoDivider />

      <div className="text-xs text-boho-sand-300 flex flex-wrap items-center justify-center gap-2 drop-shadow">
        <span>© PORTAS EL PIRATEADOR • Espíritu Bohemio.</span>
        <span>•</span>
        <span>Herramienta selecta de descarga y conversión de vídeo</span>
        <span>•</span>
        <span className="text-boho-ochre-400 font-cinzel">Alta Fidelidad Audiovisual</span>
      </div>
    </footer>
  );
}
