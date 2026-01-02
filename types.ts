export enum ProcessingStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface ExtractedContent {
  rawText: string;
  markdown: string;
}

export interface ImageFile {
  file: File;
  previewUrl: string;
}
