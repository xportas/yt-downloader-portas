import React from 'react';

/**
 * Sol Bohemio / Emblema Celestial Radiante
 */
export function BohoSun({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`text-boho-ochre-400 ${className}`}
    >
      <circle cx="12" cy="12" r="4" fill="currentColor" fillOpacity="0.25" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

/**
 * Esquina Ornamental Bohemia estilo Mandala / Mosaico Solar
 */
export function BohoCorner({
  position,
  className = '',
}: {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
}) {
  const rotationClass = {
    'top-left': '',
    'top-right': 'rotate-90',
    'bottom-right': 'rotate-180',
    'bottom-left': '-rotate-90',
  }[position];

  return (
    <div
      className={`absolute w-7 h-7 pointer-events-none text-boho-ochre-400/70 transition-opacity duration-300 ${
        position === 'top-left' ? 'top-1.5 left-1.5' : ''
      } ${position === 'top-right' ? 'top-1.5 right-1.5' : ''} ${
        position === 'bottom-left' ? 'bottom-1.5 left-1.5' : ''
      } ${position === 'bottom-right' ? 'bottom-1.5 right-1.5' : ''} ${rotationClass} ${className}`}
    >
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
        <path d="M2 2 L14 2 C10 6 6 10 2 14 Z" fill="currentColor" fillOpacity="0.15" />
        <path d="M2 2 C8 2 14 8 14 14" strokeDasharray="1 2" />
        <circle cx="5" cy="5" r="1.5" fill="currentColor" />
        <path d="M18 2 C16 4 14 7 14 11" opacity="0.6" />
        <path d="M2 18 C4 16 7 14 11 14" opacity="0.6" />
      </svg>
    </div>
  );
}

/**
 * Cuenta de Turquesa del Nilo y Terracota (estilo amuleto artesanal)
 */
export function BohoBead({ className = '' }: { className?: string }) {
  return (
    <div
      className={`w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-boho-turquoise-700 via-boho-turquoise-400 to-boho-ochre-300 shadow-sm border border-boho-ochre-400/40 ${className}`}
    />
  );
}

/**
 * Divisor Bohemio / Macramé con motivos solares y hojas botánicas
 */
export function BohoDivider({
  label,
  className = '',
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-center my-5 gap-3 ${className}`}>
      <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-boho-ochre-500/40 to-boho-terracotta-500/80" />
      <div className="flex items-center gap-2 text-boho-ochre-400">
        <span className="text-[10px] text-boho-terracotta-400">✧</span>
        <BohoBead />
        {label ? (
          <span className="font-cinzel text-xs uppercase tracking-[0.25em] text-boho-sand-200 px-2 font-semibold">
            {label}
          </span>
        ) : (
          <div className="flex items-center gap-1">
            <span className="text-xs">☼</span>
          </div>
        )}
        <BohoBead />
        <span className="text-[10px] text-boho-terracotta-400">✧</span>
      </div>
      <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent via-boho-ochre-500/40 to-boho-terracotta-500/80" />
    </div>
  );
}
