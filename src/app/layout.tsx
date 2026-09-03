import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PORTAS EL PIRATEADOR | Descargador Boho de YouTube',
  description:
    'Explorador audiovisual de estética bohemia para la preparación y descarga selecta de vídeos de YouTube.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;800;900&family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen relative flex flex-col justify-between selection:bg-boho-terracotta-500 selection:text-white">
        {/* Capas del Fondo Estático Luminoso para ver portas-bg.jpg */}
        <div className="boho-background-layer" />
        <div className="boho-overlay-layer" />

        <div className="relative z-10 flex-1 flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
