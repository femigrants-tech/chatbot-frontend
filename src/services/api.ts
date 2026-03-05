import axios from 'axios';
import type { ChatMessage, ChatResponse, FileUploadResponse, FileObject, Statistics, SignedUrlResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const AI_MODEL = import.meta.env.VITE_AI_MODEL || 'gemini-2.5-flash';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const chatAPI = {
  // Send chat message
  sendMessage: async (message: string, chatContext: ChatMessage[], model?: string): Promise<ChatResponse> => {
    const response = await api.post<ChatResponse>('/chat', {
      message,
      chat_context: chatContext, // IMPORTANT: Use this exact name
      model: model || AI_MODEL, // Use specified model or default (gemini-2.5-flash)
    });
    return response.data;
  },
};

export const filesAPI = {
  // Upload file
  uploadFile: async (file: File, metadata?: Record<string, any>): Promise<FileUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }
    const response = await api.post<FileUploadResponse>('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // List all files
  listFiles: async (filterMetadata?: Record<string, any>): Promise<{ files: FileObject[]; total: number }> => {
    const params = filterMetadata 
      ? { filter_metadata: JSON.stringify(filterMetadata) }
      : {};
    const response = await api.get<{ files: FileObject[]; total: number }>('/files', { params });
    return response.data;
  },

  // Get file details
  getFile: async (fileId: string, includeUrl = false): Promise<FileObject> => {
    const response = await api.get<FileObject>(`/files/${fileId}`, {
      params: { include_url: includeUrl },
    });
    return response.data;
  },

  // Delete file
  deleteFile: async (fileId: string): Promise<{ message: string; file_id: string }> => {
    const response = await api.delete<{ message: string; file_id: string }>(`/files/${fileId}`);
    return response.data;
  },

  // Bulk delete
  bulkDelete: async (fileIds: string[]): Promise<any> => {
    const response = await api.post('/files/bulk-delete', { file_ids: fileIds });
    return response.data;
  },

  // Get statistics
  getStatistics: async (): Promise<Statistics> => {
    const response = await api.get<Statistics>('/files/statistics');
    return response.data;
  },

  // Get files by status
  getFilesByStatus: async (status: string): Promise<{ files: FileObject[]; total: number }> => {
    const response = await api.get<{ files: FileObject[]; total: number }>(`/files/by-status/${status}`);
    return response.data;
  },

  // Get signed URL for viewing a document
  getViewUrl: async (fileId: string): Promise<SignedUrlResponse> => {
    const response = await api.get<SignedUrlResponse>(`/files/${fileId}/view-url`);
    return response.data;
  },
};

export const documentsAPI = {
  // Search documents
  search: async (query: string, topK = 5, filterMetadata?: Record<string, any>): Promise<any> => {
    const response = await api.post('/documents/search', {
      query,
      top_k: topK,
      filter_metadata: filterMetadata,
    });
    return response.data;
  },

  // Preview document
  preview: async (fileId: string, maxLength = 500): Promise<any> => {
    const response = await api.get(`/documents/preview/${fileId}`, {
      params: { max_length: maxLength },
    });
    return response.data;
  },
};

export default api;

