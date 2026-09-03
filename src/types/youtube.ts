export type FormatId =
  | 'video-4k'
  | 'video-1080p'
  | 'video-720p'
  | 'audio-mp3'
  | 'audio-m4a';

export type FormatCategory = 'video' | 'audio';

export interface FormatOption {
  id: FormatId;
  label: string;
  category: FormatCategory;
  resolutionOrBitrate: string;
  extension: 'mp4' | 'webm' | 'mp3' | 'm4a';
  serverProcessing: boolean;
  badge: string;
  description: string;
  estimatedSizePrefix: string;
}

export interface VideoMetadata {
  id: string;
  url: string;
  title: string;
  author: string;
  durationSeconds: number;
  durationFormatted: string;
  thumbnailUrl: string;
  views?: string;
}

export type ProcessingStep =
  | 'idle'
  | 'fetching_metadata'
  | 'extracting_streams'
  | 'transcoding_ffmpeg'
  | 'packaging_container'
  | 'ready_for_download'
  | 'error';

export interface ProcessingProgress {
  step: ProcessingStep;
  percentage: number;
  message: string;
  downloadUrl?: string;
  fileName?: string;
  fileSizeBytes?: number;
}
