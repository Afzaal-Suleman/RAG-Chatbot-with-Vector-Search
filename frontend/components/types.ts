export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
  timestamp?: string;
}

export interface ChatResponse {
  answer: string;
  confidence: "high" | "medium" | "low";
  sources: Source[];
  stats: {
    documentsSearched: number;
    bestMatchScore: number;
    contextLength: number;
  };
}

export interface AddDocumentResponse {
  id: number;
  textPreview: string;
  textLength: number;
  category: string;
  tags: string[];
  embeddingDimensions: number;
  timestamp: string;
}

export interface Source {
  id: number;
  text: string;
  score: number;
  timestamp?: string;
}

export interface Message {
  id: string;
  type: "question" | "answer" | "success" | "error";
  content: string;
  timestamp: string;
  confidence?: "high" | "medium" | "low";
  sources?: Source[];
}

// Component Props Types
export interface ChatInterfaceProps {
  onAskQuestion: (question: string) => Promise<void>;
  loading: boolean;
  currentAnswer?: string;
  currentResult?: ChatResponse;
}

export interface AddDocumentProps {
  onAddDocument: (text: string) => Promise<void>;
  loading: boolean;
  result?: ApiResponse<AddDocumentResponse>;
  error?: string;
}

export interface ChatHistoryProps {
  messages: Message[];
}

export interface ResultDisplayProps {
  result: ChatResponse;
  answer: string;
}