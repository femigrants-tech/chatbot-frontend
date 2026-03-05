// Chat Message
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// Chat Request
export interface ChatRequest {
  message: string;
  chat_context: ChatMessage[];
}

// Chat Response
export interface ChatResponse {
  response: string;
  context_used: ContextItem[];
}

// Context Item (source document)
export interface ContextItem {
  text: string;
  score: number;
  file_id?: string;
  signed_url?: string;
  reference?: {
    file?: {
      id?: string;
      name?: string;
      signed_url?: string;
      status?: string;
      size?: number;
      created_on?: string;
      updated_on?: string;
      percent_done?: number;
      [key: string]: any;
    };
    [key: string]: any;
  };
  metadata: {
    file_name?: string;
    file_id?: string;
    pages?: number[];
    signed_url?: string;
    reference?: {
      file?: {
        id?: string;
        name?: string;
        signed_url?: string;
        status?: string;
        size?: number;
        created_on?: string;
        updated_on?: string;
        percent_done?: number;
        [key: string]: any;
      };
      [key: string]: any;
    };
    [key: string]: any;
  };
}

// File Object
export interface FileObject {
  id: string;
  name: string;
  status: "Available" | "Processing" | "Failed";
  size: number;
  metadata: Record<string, any>;
  created_on: string;
  percent_done: number;
  signed_url?: string;
}

// Signed URL Response
export interface SignedUrlResponse {
  file_id: string;
  file_name: string;
  signed_url: string;
  expires_in: string;
}

// File Upload Response
export interface FileUploadResponse {
  message: string;
  file_id: string;
  filename: string;
  status: string;
}

// Statistics
export interface Statistics {
  total_files: number;
  total_size_bytes: number;
  total_size_mb: number;
  status_breakdown: {
    Available: number;
    Processing: number;
    Failed: number;
  };
  metadata_keys_used: string[];
}

// Search Result
export interface SearchResult {
  rank: number;
  text: string;
  score: number;
  metadata: Record<string, any>;
  file_id: string;
}

// Message with timestamp and context
export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  contextUsed?: ContextItem[];
}

