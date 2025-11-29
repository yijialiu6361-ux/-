export interface WritingTaskAnalysis {
  topic: string;
  structure: string[];
  keywords: string[];
  sentences: string[];
  tone: string;
}

export interface GeneratedResult {
  basicMapUrl: string;
  advancedMapUrl: string;
  analysis: WritingTaskAnalysis;
}

export interface LoadingState {
  status: 'idle' | 'analyzing' | 'generating-basic' | 'generating-advanced' | 'complete' | 'error';
  message: string;
}
