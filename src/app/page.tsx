'use client';

import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import VictorianHeader from '@/components/VictorianHeader';
import UrlInputForm from '@/components/UrlInputForm';
import VideoPreviewCard from '@/components/VideoPreviewCard';
import FormatSelector from '@/components/FormatSelector';
import ProgressBar from '@/components/ProgressBar';
import VictorianFooter from '@/components/VictorianFooter';
import { BohoCorner, BohoBead } from '@/components/Ornaments';
import { FormatId, VideoMetadata, ProcessingProgress, ProcessingStep } from '@/types/youtube';
import { extractYouTubeVideoId } from '@/lib/youtube';
import {
  Sun,
  Flame,
  RotateCcw,
  Sparkles,
  Cpu,
  CheckCircle2,
  FileDown,
  Compass
} from 'lucide-react';

export default function HomePage() {
  // Estados de la aplicación
  const [url, setUrl] = useState<string>('');
  const [isLoadingMetadata, setIsLoadingMetadata] = useState<boolean>(false);
  const [metadataError, setMetadataError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);

  // Formato seleccionado (por defecto 1080p Full HD)
  const [selectedFormatId, setSelectedFormatId] = useState<FormatId>('video-1080p');

  // Estado del proceso de preparación / descarga
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isReadyForDownload, setIsReadyForDownload] = useState<boolean>(false);
  const [downloadPayload, setDownloadPayload] = useState<{
    downloadUrl: string;
    fileName: string;
  } | null>(null);

  // Progreso visual y técnico
  const [progress, setProgress] = useState<ProcessingProgress>({
    step: 'idle',
    percentage: 0,
    message: '',
  });

  /**
   * Paso 1 y 2: Inspección y obtención de metadatos del vídeo
   */
  const handleSearch = async (inputUrl: string) => {
    const videoId = extractYouTubeVideoId(inputUrl);
    if (!videoId) {
      setMetadataError('Por favor, inserte un enlace de YouTube válido (watch?v=, youtu.be/ o shorts/).');
      return;
    }

    setUrl(inputUrl);
    setIsLoadingMetadata(true);
    setMetadataError(null);
    setIsReadyForDownload(false);
    setDownloadPayload(null);
    setProgress({ step: 'idle', percentage: 0, message: '' });

    try {
      const response = await fetch(`/api/info?url=${encodeURIComponent(inputUrl)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'No se pudieron recuperar los registros del vídeo.');
      }

      setMetadata(data);
    } catch (err: any) {
      setMetadataError(err.message || 'Error al conectar con los archivos de YouTube.');
    } finally {
      setIsLoadingMetadata(false);
    }
  };

  /**
   * Enlace de ejemplo rápido
   */
  const loadExampleVideo = () => {
    const sampleUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    handleSearch(sampleUrl);
  };

  /**
   * Paso 4 y 5: Iniciar Preparación y Progreso en Servidor
   */
  const handleStartPreparation = async () => {
    if (!metadata || isProcessing) return;

    setIsProcessing(true);
    setIsReadyForDownload(false);
    setDownloadPayload(null);

    // Etapas progresivas bohemias
    const stages = [
      { step: 'fetching_metadata' as ProcessingStep, pct: 15, msg: 'Conectando con las corrientes de transmisión...' },
      { step: 'extracting_streams' as ProcessingStep, pct: 42, msg: 'Extrayendo pistas aisladas de vídeo y audio...' },
      { step: 'transcoding_ffmpeg' as ProcessingStep, pct: 78, msg: 'Tejiendo el contenedor en alta definición (FFmpeg)...' },
      { step: 'packaging_container' as ProcessingStep, pct: 95, msg: 'Sellando el archivo artesanal para su descarga...' },
    ];

    let currentStageIndex = 0;
    setProgress({
      step: stages[0].step,
      percentage: stages[0].pct,
      message: stages[0].msg,
    });

    const progressTimer = setInterval(() => {
      currentStageIndex += 1;
      if (currentStageIndex < stages.length) {
        setProgress({
          step: stages[currentStageIndex].step,
          percentage: stages[currentStageIndex].pct,
          message: stages[currentStageIndex].msg,
        });
      }
    }, 700);

    try {
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: metadata.id,
          title: metadata.title,
          formatId: selectedFormatId,
        }),
      });

      const result = await response.json();
      clearInterval(progressTimer);

      if (!response.ok) {
        throw new Error(result.error || 'Fallo durante el procesamiento en el servidor.');
      }

      setProgress({
        step: 'ready_for_download',
        percentage: 100,
        message: '¡Confección concluida con éxito! Archivo listo para su recepción.',
        downloadUrl: result.downloadUrl,
        fileName: result.fileName,
      });

      setDownloadPayload({
        downloadUrl: result.downloadUrl,
        fileName: result.fileName,
      });

      setIsProcessing(false);
      setIsReadyForDownload(true);

      // Salva de confeti bohemio en tonos terracota, turquesa y sol
      confetti({
        particleCount: 65,
        spread: 70,
        origin: { y: 0.75 },
        colors: ['#df9b28', '#d35432', '#2db3c6', '#faf7f2', '#ebb451'],
      });
    } catch (err: any) {
      clearInterval(progressTimer);
      setIsProcessing(false);
      setProgress({
        step: 'error',
        percentage: 100,
        message: err.message || 'Ocurrió un error inesperado al procesar.',
      });
    }
  };

  /**
   * Paso 6: Descarga directa del archivo al almacenamiento local
   */
  const handleDownloadFile = () => {
    if (!downloadPayload?.downloadUrl) return;

    const downloadLink = document.createElement('a');
    downloadLink.href = downloadPayload.downloadUrl;
    downloadLink.download = downloadPayload.fileName || 'video_portas_el_pirateador.mp4';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  /**
   * Reiniciar para procesar otro vídeo
   */
  const handleReset = () => {
    setMetadata(null);
    setUrl('');
    setIsReadyForDownload(false);
    setDownloadPayload(null);
    setProgress({ step: 'idle', percentage: 0, message: '' });
  };

  return (
    <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 flex flex-col justify-between">
      <div>
        {/* Cabecera Bohemia */}
        <VictorianHeader />

        {/* Contenedor Central */}
        <div className="mt-6 flex flex-col gap-6">
          {/* PASO 1: Formulario de Entrada */}
          <UrlInputForm
            onSearch={handleSearch}
            isLoading={isLoadingMetadata}
            initialUrl={url}
            errorMessage={metadataError}
          />

          {/* Botón de Enlace de Ejemplo si no hay vídeo cargado */}
          {!metadata && !isLoadingMetadata && (
            <div className="text-center">
              <button
                type="button"
                onClick={loadExampleVideo}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-boho-ochre-500/40 bg-boho-night-900/80 hover:bg-boho-night-800 text-xs font-garamond text-boho-ochre-300 hover:text-boho-sand-100 transition-all shadow-boho-soft backdrop-blur-sm"
              >
                <Sun className="w-3.5 h-3.5 text-boho-ochre-400" />
                <span>¿Desea una prueba instantánea? Cargar pliego de demostración</span>
              </button>
            </div>
          )}

          {/* PASO 2: Vista Previa Dinámica */}
          {metadata && <VideoPreviewCard metadata={metadata} />}

          {/* PASO 3: Selector de la Matriz de Formato */}
          {metadata && (
            <FormatSelector
              selectedFormatId={selectedFormatId}
              onSelectFormat={(id) => {
                setSelectedFormatId(id);
                if (isReadyForDownload) {
                  setIsReadyForDownload(false);
                  setProgress({ step: 'idle', percentage: 0, message: '' });
                }
              }}
              disabled={isProcessing}
            />
          )}

          {/* PASO 5: Barra de Progreso Bohemia */}
          {(isProcessing || progress.percentage > 0) && (
            <ProgressBar progress={progress} />
          )}

          {/* PASO 4 & 6: Botón de Acción Principal y Metamorfosis Visual */}
          {metadata && (
            <div className="w-full relative">
              <div className="relative rounded-2xl p-[1.5px] bg-gradient-to-r from-boho-ochre-500/60 via-boho-terracotta-500/60 to-boho-turquoise-600/40 shadow-boho-card">
                <div className="relative rounded-[15px] bg-boho-night-900/85 border border-boho-ochre-500/25 p-5 sm:p-6 backdrop-blur-md text-center">
                  <BohoCorner position="top-left" />
                  <BohoCorner position="top-right" />
                  <BohoCorner position="bottom-left" />
                  <BohoCorner position="bottom-right" />

                  <BohoBead className="absolute top-3 left-3" />
                  <BohoBead className="absolute top-3 right-3" />
                  <BohoBead className="absolute bottom-3 left-3" />
                  <BohoBead className="absolute bottom-3 right-3" />

                  {/* Estado A: Transformación al Botón de Descarga Directa (Paso 6) */}
                  {isReadyForDownload ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-boho-turquoise-950/80 border border-boho-turquoise-600/60 text-boho-turquoise-300 text-xs font-cinzel font-semibold animate-bounce">
                        <CheckCircle2 className="w-3.5 h-3.5 text-boho-turquoise-400" />
                        <span>¡Obra preparada y lista en el oasis!</span>
                      </div>

                      <button
                        type="button"
                        onClick={handleDownloadFile}
                        className="w-full sm:w-auto min-w-[280px] px-8 py-4 rounded-xl font-cinzel text-base uppercase tracking-widest font-bold transition-all duration-300 select-none shadow-[0_10px_25px_rgba(45,179,198,0.45)] group overflow-hidden bg-gradient-to-r from-boho-turquoise-600 via-boho-turquoise-500 to-boho-ochre-500 text-white hover:from-boho-turquoise-500 hover:via-boho-turquoise-400 hover:to-boho-ochre-400 active:scale-[0.98] border-2 border-boho-ochre-300/80"
                      >
                        <span className="flex items-center justify-center gap-3">
                          <FileDown className="w-5 h-5 text-white animate-pulse" />
                          <span>Descargar Archivo</span>
                        </span>
                      </button>

                      <p className="font-garamond text-xs text-boho-sand-300 italic">
                        El archivo ({downloadPayload?.fileName}) se descargará directamente en su almacenamiento local.
                      </p>

                      <button
                        type="button"
                        onClick={handleReset}
                        className="mt-2 inline-flex items-center gap-1.5 text-xs font-cinzel text-boho-ochre-400 hover:text-boho-sand-100 transition-colors uppercase tracking-wider"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Procesar un nuevo pliego o formato</span>
                      </button>
                    </div>
                  ) : (
                    /* Estado B: Botón de Acción Principal "Iniciar Preparación" (Paso 4 y 5) */
                    <div className="flex flex-col items-center gap-2">
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={handleStartPreparation}
                        className={`w-full sm:w-auto min-w-[280px] px-8 py-4 rounded-xl font-cinzel text-base uppercase tracking-widest font-bold transition-all duration-300 select-none shadow-boho-terracotta group overflow-hidden border border-boho-ochre-300/40 ${
                          isProcessing
                            ? 'bg-boho-night-800 text-boho-ochre-400/60 cursor-wait'
                            : 'bg-gradient-to-r from-boho-ochre-500 via-boho-terracotta-500 to-boho-terracotta-600 text-white hover:from-boho-ochre-400 hover:via-boho-terracotta-400 hover:to-boho-terracotta-500 active:scale-[0.98]'
                        }`}
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2.5">
                          {isProcessing ? (
                            <>
                              <Cpu className="w-5 h-5 animate-pulse text-boho-ochre-400" />
                              <span>Procesando en Servidor...</span>
                            </>
                          ) : (
                            <>
                              <Sun className="w-5 h-5 text-white group-hover:rotate-45 transition-transform" />
                              <span>Iniciar Preparación</span>
                            </>
                          )}
                        </span>
                      </button>

                      <p className="font-garamond text-xs text-boho-sand-400 italic mt-1">
                        {isProcessing
                          ? 'Los engranajes del desierto están alineando las frecuencias de datos...'
                          : 'Pulse para poner en marcha los engranajes de descarga y transcodificación'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pie de Página Bohemio */}
      <VictorianFooter />
    </main>
  );
}
