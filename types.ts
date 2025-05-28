export interface UploadProgress {
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
  progress?: number;
  error?: string;
}

export interface ResumeStats {
  highMatchCount: number;
  mediumMatchCount: number;
  totalJobsCount: number;
}

export interface SearchFilters {
  query: string;
  level: string;
}
