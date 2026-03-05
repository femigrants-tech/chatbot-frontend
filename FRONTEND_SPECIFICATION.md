# Frontend Specification - Femigrants RAG Chatbot

Complete specification for building a modern chatbot frontend that integrates with the Femigrants RAG Backend.

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Backend Summary](#backend-summary)
3. [Required Pages](#required-pages)
4. [API Integration Guide](#api-integration-guide)
5. [Data Structures](#data-structures)
6. [UI/UX Requirements](#uiux-requirements)
7. [Implementation Steps](#implementation-steps)
8. [Example Code](#example-code)

---

## 📋 Project Overview

### What You're Building
A two-page web application with:
1. **`/chat`** - AI chatbot interface with RAG (Retrieval-Augmented Generation)
2. **`/files`** - File management dashboard

### Technology Stack (Recommended)
- **Frontend Framework**: React, Next.js, Vue, or vanilla JavaScript
- **Styling**: Tailwind CSS, Material-UI, or CSS-in-JS
- **State Management**: React Context, Redux, or Zustand
- **HTTP Client**: Fetch API or Axios

### Backend Base URL
```
http://localhost:8000
```

### CORS Configuration
✅ Backend is configured to accept requests from `http://localhost:3000`

---

## 🎯 Backend Summary

### What the Backend Provides

#### **RAG Chat System**
- Answers questions using uploaded documents as context
- Maintains conversation history
- Returns relevant document snippets with each response

#### **File Management**
- Upload files (PDF, TXT, DOCX, etc.) with optional metadata
- View, delete, and preview files
- Bulk operations
- Real-time processing status
- Statistics and analytics

#### **Document Retrieval**
- Semantic search across all documents
- Preview document content
- Filter by metadata

---

## 📄 Required Pages

### Page 1: `/chat` - Chat Interface

**Purpose**: Interactive chatbot for asking questions about uploaded documents

**Key Features**:
- ✅ Message input box
- ✅ Chat history display (user messages + AI responses)
- ✅ Show which documents were used for each response
- ✅ Loading states during API calls
- ✅ Error handling
- ✅ Clear conversation button
- ✅ Example questions/prompts
- ✅ Context highlighting (show relevant snippets)

**Layout**:
```
┌─────────────────────────────────────────┐
│  Femibot AI Assistant     [Clear]    │
├─────────────────────────────────────────┤
│                                         │
│  User: What is machine learning?       │
│                                         │
│  AI: Machine learning is...            │
│  📄 Sources: document1.pdf (Score: 0.9)│
│                                         │
│  User: Tell me more                    │
│                                         │
│  AI: [Thinking...]                     │
│                                         │
├─────────────────────────────────────────┤
│ Type your message...          [Send]   │
└─────────────────────────────────────────┘
```

---

### Page 2: `/files` - File Management

**Purpose**: Upload and manage knowledge base files

**Key Features**:
- ✅ File upload with drag-and-drop
- ✅ Metadata input (JSON or form fields)
- ✅ File list with status indicators
- ✅ Search/filter files
- ✅ View file details and preview
- ✅ Delete single or multiple files
- ✅ Statistics dashboard
- ✅ Processing status indicators

**Layout**:
```
┌─────────────────────────────────────────┐
│  File Management           📊 Stats     │
├─────────────────────────────────────────┤
│  📤 Upload Files                        │
│  [Drag & Drop or Click]                │
│  Category: [______]  Author: [______]  │
│                           [Upload]      │
├─────────────────────────────────────────┤
│  📚 Knowledge Base (15 files, 50 MB)   │
│  [Search...] [Filter ▼] [Bulk Delete] │
├─────────────────────────────────────────┤
│  ┌───────────────┐ ┌───────────────┐   │
│  │ 📄 doc1.pdf   │ │ 📄 doc2.txt   │   │
│  │ ✅ Available  │ │ ⏳ Processing │   │
│  │ 2.5 MB        │ │ 1.2 MB        │   │
│  │ [View][Delete]│ │ [View][Delete]│   │
│  └───────────────┘ └───────────────┘   │
└─────────────────────────────────────────┘
```

---

## 🔌 API Integration Guide

### 1. Chat Endpoint

**Endpoint**: `POST /chat`

**Purpose**: Send a message and get AI response with context

**Request Body**:
```typescript
{
  message: string;              // REQUIRED: User's question/message
  chat_context: Array<{         // OPTIONAL: Previous conversation
    role: "user" | "assistant";
    content: string;
  }>;
}
```

**Response**:
```typescript
{
  response: string;             // AI's response text
  context_used: Array<{         // Documents used for the response
    text: string;               // Relevant text snippet
    score: number;              // Relevance score (0-1)
    metadata: object;           // Document metadata
  }>;
}
```

**Important Notes**:
- ⚠️ **CRITICAL**: The parameter name is `chat_context` (not `history` or `messages`)
- Include last 5-10 messages in `chat_context` for best results
- Always alternate roles: user → assistant → user → assistant

**Example Request**:
```javascript
const response = await fetch('http://localhost:8000/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "What is machine learning?",
    chat_context: [
      { role: "user", content: "Tell me about AI" },
      { role: "assistant", content: "AI is artificial intelligence..." }
    ]
  })
});

const data = await response.json();
// data.response - AI response
// data.context_used - Source documents
```

---

### 2. File Upload

**Endpoint**: `POST /files/upload`

**Purpose**: Upload a file to the knowledge base

**Request Type**: `multipart/form-data`

**Form Fields**:
- `file` (required): File to upload
- `metadata` (optional): JSON string with metadata

**Example**:
```javascript
const formData = new FormData();
formData.append('file', fileObject);
formData.append('metadata', JSON.stringify({
  category: "documentation",
  author: "John Doe",
  date: "2025-01-15"
}));

const response = await fetch('http://localhost:8000/files/upload', {
  method: 'POST',
  body: formData
});

const result = await response.json();
// result.file_id - Unique file identifier
// result.status - "Processing"
```

---

### 3. List Files

**Endpoint**: `GET /files`

**Purpose**: Get all uploaded files

**Query Parameters**:
- `filter_metadata` (optional): JSON string to filter by metadata

**Response**:
```typescript
{
  files: Array<{
    id: string;                 // Unique file ID
    name: string;               // Original filename
    status: string;             // "Available" | "Processing" | "Failed"
    size: number;               // Size in bytes
    metadata: object;           // Custom metadata
    created_on: string;         // ISO timestamp
    percent_done: number;       // Processing progress (0-1)
  }>;
  total: number;                // Total file count
}
```

**Example**:
```javascript
// Get all files
const response = await fetch('http://localhost:8000/files');
const data = await response.json();

// Filter by metadata
const filtered = await fetch(
  'http://localhost:8000/files?filter_metadata=' + 
  encodeURIComponent(JSON.stringify({ category: "research" }))
);
```

---

### 4. Get File Details

**Endpoint**: `GET /files/{file_id}`

**Purpose**: Get detailed information about a specific file

**Query Parameters**:
- `include_url` (optional): Set to `true` to get download URL

**Response**:
```typescript
{
  id: string;
  name: string;
  status: string;
  size: number;
  metadata: object;
  created_on: string;
  updated_on: string;
  percent_done: number;
  signed_url: string | null;    // Download URL (expires in 1 hour)
  error_message: string | null;
}
```

---

### 5. Delete File

**Endpoint**: `DELETE /files/{file_id}`

**Purpose**: Delete a single file

**Response**:
```typescript
{
  message: string;
  file_id: string;
}
```

---

### 6. Bulk Delete Files

**Endpoint**: `POST /files/bulk-delete`

**Purpose**: Delete multiple files at once

**Request Body**:
```typescript
{
  file_ids: string[];           // Array of file IDs to delete
}
```

**Response**:
```typescript
{
  message: string;
  results: {
    success: string[];          // Successfully deleted IDs
    failed: Array<{             // Failed deletions
      file_id: string;
      error: string;
    }>;
  };
}
```

---

### 7. Get Statistics

**Endpoint**: `GET /files/statistics`

**Purpose**: Get knowledge base statistics

**Response**:
```typescript
{
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
```

---

### 8. Search Documents

**Endpoint**: `POST /documents/search`

**Purpose**: Search for relevant documents (useful for showing related docs)

**Request Body**:
```typescript
{
  query: string;                // Search query
  filter_metadata?: object;     // Optional filter
  top_k?: number;               // Number of results (default: 5)
}
```

**Response**:
```typescript
{
  query: string;
  results: Array<{
    rank: number;
    text: string;
    score: number;
    metadata: object;
    file_id: string;
  }>;
  total_results: number;
}
```

---

### 9. Preview Document

**Endpoint**: `GET /documents/preview/{file_id}`

**Purpose**: Get a preview of document content

**Query Parameters**:
- `max_length` (optional): Max preview length (default: 500)

**Response**:
```typescript
{
  file_id: string;
  name: string;
  status: string;
  size: number;
  metadata: object;
  created_on: string;
  preview: string;              // First N characters of content
  signed_url: string | null;
}
```

---

### 10. Get Files by Status

**Endpoint**: `GET /files/by-status/{status}`

**Purpose**: Filter files by processing status

**Status Options**: `Available`, `Processing`, `Failed`

**Response**: Same as "List Files"

---

## 📊 Data Structures

### TypeScript Interfaces

```typescript
// Chat Message
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// Chat Request
interface ChatRequest {
  message: string;
  chat_context: ChatMessage[];
}

// Chat Response
interface ChatResponse {
  response: string;
  context_used: ContextItem[];
}

// Context Item (source document)
interface ContextItem {
  text: string;
  score: number;
  metadata: Record<string, any>;
}

// File Object
interface FileObject {
  id: string;
  name: string;
  status: "Available" | "Processing" | "Failed";
  size: number;
  metadata: Record<string, any>;
  created_on: string;
  percent_done: number;
}

// File Upload Response
interface FileUploadResponse {
  message: string;
  file_id: string;
  filename: string;
  status: string;
}

// Statistics
interface Statistics {
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
interface SearchResult {
  rank: number;
  text: string;
  score: number;
  metadata: Record<string, any>;
  file_id: string;
}
```

---

## 🎨 UI/UX Requirements

### Chat Page (`/chat`)

#### **1. Message Display**
- User messages: Right-aligned, blue background
- AI messages: Left-aligned, gray background
- Timestamps for each message
- Loading indicator while waiting for response

#### **2. Context Display**
Each AI response should show:
- 📄 **Sources Used**: List of documents with relevance scores
- Example: "Sources: document1.pdf (92% relevant), guide.txt (85% relevant)"
- Clickable to view full document details

#### **3. Input Area**
- Text input (multiline)
- Send button (or Enter to send)
- Character counter (optional)
- Disable during loading

#### **4. Features**
- Clear conversation button
- Copy message button
- Scroll to bottom on new message
- Example questions (if no conversation yet)

#### **5. Error Handling**
- Show error messages if API fails
- Retry button for failed messages
- Warning if no files are uploaded

---

### Files Page (`/files`)

#### **1. Upload Section**
- Drag and drop area
- File input button
- Metadata form fields:
  - Category (dropdown or text)
  - Author (text)
  - Date (date picker)
  - Custom fields (JSON or key-value pairs)
- Upload progress bar
- Success/error notifications

#### **2. File List**
Display for each file:
- 📄 File icon (based on type)
- File name
- Status badge (Available ✅ / Processing ⏳ / Failed ❌)
- File size
- Upload date
- Metadata tags
- Action buttons: View, Delete

#### **3. Filters**
- Search by filename
- Filter by status
- Filter by metadata
- Sort by: date, name, size

#### **4. Statistics Dashboard** (collapsible)
- Total files
- Total storage used
- Status breakdown (pie chart or bars)
- Recent uploads

#### **5. Bulk Actions**
- Select multiple files (checkboxes)
- Bulk delete button
- Select all / Deselect all

---

## 🔨 Implementation Steps

### Step 1: Project Setup

```bash
# Using React + Vite (recommended)
npm create vite@latest femigrants-frontend -- --template react-ts
cd femigrants-frontend
npm install

# Install dependencies
npm install axios react-router-dom
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

---

### Step 2: Create API Service

Create `src/services/api.ts`:

```typescript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const chatAPI = {
  // Send chat message
  sendMessage: async (message: string, chatContext: ChatMessage[]) => {
    const response = await api.post('/chat', {
      message,
      chat_context: chatContext, // IMPORTANT: Use this exact name
    });
    return response.data;
  },
};

export const filesAPI = {
  // Upload file
  uploadFile: async (file: File, metadata?: Record<string, any>) => {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }
    const response = await api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // List all files
  listFiles: async (filterMetadata?: Record<string, any>) => {
    const params = filterMetadata 
      ? { filter_metadata: JSON.stringify(filterMetadata) }
      : {};
    const response = await api.get('/files', { params });
    return response.data;
  },

  // Get file details
  getFile: async (fileId: string, includeUrl = false) => {
    const response = await api.get(`/files/${fileId}`, {
      params: { include_url: includeUrl },
    });
    return response.data;
  },

  // Delete file
  deleteFile: async (fileId: string) => {
    const response = await api.delete(`/files/${fileId}`);
    return response.data;
  },

  // Bulk delete
  bulkDelete: async (fileIds: string[]) => {
    const response = await api.post('/files/bulk-delete', { file_ids: fileIds });
    return response.data;
  },

  // Get statistics
  getStatistics: async () => {
    const response = await api.get('/files/statistics');
    return response.data;
  },

  // Get files by status
  getFilesByStatus: async (status: string) => {
    const response = await api.get(`/files/by-status/${status}`);
    return response.data;
  },
};

export const documentsAPI = {
  // Search documents
  search: async (query: string, topK = 5, filterMetadata?: Record<string, any>) => {
    const response = await api.post('/documents/search', {
      query,
      top_k: topK,
      filter_metadata: filterMetadata,
    });
    return response.data;
  },

  // Preview document
  preview: async (fileId: string, maxLength = 500) => {
    const response = await api.get(`/documents/preview/${fileId}`, {
      params: { max_length: maxLength },
    });
    return response.data;
  },
};

export default api;
```

---

### Step 3: Create Chat Context/State

Create `src/context/ChatContext.tsx`:

```typescript
import React, { createContext, useContext, useState } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  contextUsed?: any[];
}

interface ChatContextType {
  messages: Message[];
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <ChatContext.Provider value={{ 
      messages, 
      addMessage, 
      clearMessages, 
      isLoading, 
      setIsLoading 
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
};
```

---

### Step 4: Create Chat Page

Create `src/pages/ChatPage.tsx`:

```typescript
import React, { useState, useRef, useEffect } from 'react';
import { chatAPI } from '../services/api';
import { useChat } from '../context/ChatContext';

const ChatPage: React.FC = () => {
  const { messages, addMessage, clearMessages, isLoading, setIsLoading } = useChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      role: 'user' as const,
      content: input,
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setInput('');
    setIsLoading(true);

    try {
      // Prepare chat context (last 10 messages)
      const chatContext = messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      // Call API
      const response = await chatAPI.sendMessage(input, chatContext);

      // Add AI response
      addMessage({
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
        contextUsed: response.context_used,
      });
    } catch (error) {
      console.error('Chat error:', error);
      addMessage({
        role: 'assistant',
        content: 'Sorry, there was an error processing your request.',
        timestamp: new Date(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="bg-purple-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Femibot AI Assistant</h1>
        <button 
          onClick={clearMessages}
          className="bg-purple-700 px-4 py-2 rounded hover:bg-purple-800"
        >
          Clear Chat
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-lg mb-4">👋 Hello! How can I help you today?</p>
            <div className="space-y-2">
              <p className="text-sm">Try asking:</p>
              <button className="block mx-auto text-blue-600 hover:underline">
                "Do you accept donations?"
              </button>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-2xl rounded-lg p-4 ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              
              {/* Show sources for AI messages */}
              {msg.role === 'assistant' && msg.contextUsed && msg.contextUsed.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200 text-sm">
                  <p className="font-semibold text-gray-700 mb-2">📄 Sources:</p>
                  {msg.contextUsed.map((ctx, i) => (
                    <div key={i} className="text-gray-600 text-xs">
                      • Score: {(ctx.score * 100).toFixed(0)}% relevant
                    </div>
                  ))}
                </div>
              )}
              
              <p className="text-xs opacity-70 mt-2">
                {msg.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4 bg-white">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 border rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-purple-600"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
```

---

### Step 5: Create Files Page

Create `src/pages/FilesPage.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import { filesAPI } from '../services/api';

const FilesPage: React.FC = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadFiles();
    loadStats();
  }, []);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const data = await filesAPI.listFiles();
      setFiles(data.files);
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await filesAPI.getStatistics();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await filesAPI.uploadFile(file, {
        uploaded_at: new Date().toISOString(),
      });
      alert('File uploaded successfully!');
      loadFiles();
      loadStats();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      await filesAPI.deleteFile(fileId);
      loadFiles();
      loadStats();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete file');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedFiles.size === 0) return;
    if (!confirm(`Delete ${selectedFiles.size} files?`)) return;

    try {
      await filesAPI.bulkDelete(Array.from(selectedFiles));
      setSelectedFiles(new Set());
      loadFiles();
      loadStats();
    } catch (error) {
      console.error('Bulk delete error:', error);
    }
  };

  const toggleFileSelection = (fileId: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(fileId)) {
      newSelected.delete(fileId);
    } else {
      newSelected.add(fileId);
    }
    setSelectedFiles(newSelected);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      Available: 'bg-green-100 text-green-800',
      Processing: 'bg-yellow-100 text-yellow-800',
      Failed: 'bg-red-100 text-red-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">File Management</h1>
          <p className="text-gray-600">Upload and manage your knowledge base</p>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-600 text-sm">Total Files</p>
              <p className="text-2xl font-bold text-purple-600">{stats.total_files}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-600 text-sm">Storage Used</p>
              <p className="text-2xl font-bold text-purple-600">{stats.total_size_mb} MB</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-600 text-sm">Available</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.status_breakdown.Available || 0}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-600 text-sm">Processing</p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.status_breakdown.Processing || 0}
              </p>
            </div>
          </div>
        )}

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">📤 Upload New File</h2>
          <div className="flex items-center gap-4">
            <input
              type="file"
              onChange={handleUpload}
              disabled={uploading}
              className="flex-1 border rounded p-2"
            />
            {uploading && <span className="text-purple-600">Uploading...</span>}
          </div>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-lg shadow p-4 mb-6 flex justify-between items-center">
          <div>
            {selectedFiles.size > 0 && (
              <span className="text-gray-700">
                {selectedFiles.size} file(s) selected
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleBulkDelete}
              disabled={selectedFiles.size === 0}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:bg-gray-300"
            >
              Delete Selected
            </button>
            <button
              onClick={loadFiles}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Files Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading files...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((file) => (
              <div key={file.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedFiles.has(file.id)}
                    onChange={() => toggleFileSelection(file.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 truncate">
                      📄 {file.name}
                    </h3>
                    <span className={`inline-block px-2 py-1 text-xs rounded mt-2 ${getStatusBadge(file.status)}`}>
                      {file.status}
                    </span>
                    <p className="text-sm text-gray-600 mt-2">
                      Size: {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(file.created_on).toLocaleDateString()}
                    </p>
                    
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => alert(`View file: ${file.id}`)}
                        className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDelete(file.id)}
                        className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {files.length === 0 && !loading && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 text-lg">No files uploaded yet</p>
            <p className="text-gray-400 text-sm mt-2">Upload your first file to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilesPage;
```

---

### Step 6: Setup Routing

Create `src/App.tsx`:

```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ChatProvider } from './context/ChatContext';
import ChatPage from './pages/ChatPage';
import FilesPage from './pages/FilesPage';
import Navigation from './components/Navigation';

function App() {
  return (
    <BrowserRouter>
      <ChatProvider>
        <div className="min-h-screen">
          <Navigation />
          <Routes>
            <Route path="/" element={<Navigate to="/chat" replace />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/files" element={<FilesPage />} />
          </Routes>
        </div>
      </ChatProvider>
    </BrowserRouter>
  );
}

export default App;
```

Create `src/components/Navigation.tsx`:

```typescript
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex space-x-8">
            <Link
              to="/chat"
              className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                isActive('/chat')
                  ? 'border-purple-500 text-gray-900'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              💬 Chat
            </Link>
            <Link
              to="/files"
              className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                isActive('/files')
                  ? 'border-purple-500 text-gray-900'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              📁 Files
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
```

---

## ✅ Checklist for Frontend Developer

### Setup
- [ ] Initialize project with React/Vue/Next.js
- [ ] Install required dependencies
- [ ] Set up Tailwind CSS or preferred styling
- [ ] Configure API base URL

### Chat Page (`/chat`)
- [ ] Create chat message display component
- [ ] Implement message input with send button
- [ ] Add loading state while waiting for AI response
- [ ] Display conversation history
- [ ] Show source documents with relevance scores
- [ ] Implement clear conversation functionality
- [ ] Add example questions/prompts
- [ ] Handle errors gracefully
- [ ] Auto-scroll to bottom on new messages
- [ ] Support Enter key to send, Shift+Enter for new line

### Files Page (`/files`)
- [ ] Create file upload component with drag-and-drop
- [ ] Add metadata input fields (category, author, date)
- [ ] Display file list in grid/table format
- [ ] Show file status with color-coded badges
- [ ] Implement single file delete
- [ ] Add bulk delete functionality
- [ ] Create statistics dashboard
- [ ] Add file preview/view functionality
- [ ] Implement search/filter functionality
- [ ] Show upload progress
- [ ] Handle file processing states
- [ ] Refresh file list periodically or manually

### API Integration
- [ ] Create API service layer
- [ ] Implement all required endpoints
- [ ] **CRITICAL**: Use `chat_context` parameter (not `history`)
- [ ] Handle authentication if needed
- [ ] Implement error handling
- [ ] Add retry logic for failed requests
- [ ] Show loading states
- [ ] Handle CORS properly

### State Management
- [ ] Set up context for chat messages
- [ ] Manage file list state
- [ ] Track loading states
- [ ] Handle selected files for bulk operations

### UI/UX
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Loading indicators
- [ ] Error messages
- [ ] Success notifications
- [ ] Confirmation dialogs for destructive actions
- [ ] Keyboard shortcuts (Enter to send, etc.)
- [ ] Accessibility (ARIA labels, keyboard navigation)

### Testing
- [ ] Test chat with various queries
- [ ] Test file upload with different file types
- [ ] Test bulk delete
- [ ] Test error scenarios
- [ ] Test on different browsers
- [ ] Test mobile responsiveness

---

## 🔑 Critical Data Points for Backend

### Required in Requests

#### Chat Request
```typescript
{
  message: string,              // ✅ REQUIRED
  chat_context: Array<{         // ⚠️ MUST BE NAMED "chat_context"
    role: "user" | "assistant",
    content: string
  }>
}
```

#### File Upload
```typescript
{
  file: File,                   // ✅ REQUIRED
  metadata: string              // Optional JSON string
}
```

#### Bulk Delete
```typescript
{
  file_ids: string[]            // ✅ REQUIRED
}
```

#### Document Search
```typescript
{
  query: string,                // ✅ REQUIRED
  top_k: number,                // Optional (default: 5)
  filter_metadata: object       // Optional
}
```

---

## 🎨 Design Resources

### Color Palette (Suggested)
- Primary: `#667eea` (Purple)
- Secondary: `#764ba2` (Dark Purple)
- Success: `#10b981` (Green)
- Warning: `#f59e0b` (Yellow)
- Error: `#ef4444` (Red)
- Background: `#f9fafb` (Light Gray)

### Icons
- Use emoji or icon library (Heroicons, Font Awesome, Material Icons)
- 💬 Chat
- 📁 Files
- 📄 Document
- ✅ Available
- ⏳ Processing
- ❌ Failed
- 🔄 Refresh
- 🗑️ Delete
- 👁️ View
- 📤 Upload
- 📊 Statistics

---

## 📚 Example: Complete Chat Flow

```typescript
// 1. User types message
const userInput = "What is machine learning?";

// 2. Add to UI immediately
addMessage({ role: 'user', content: userInput });

// 3. Get conversation history (last 10 messages)
const chatContext = messages.slice(-10).map(m => ({
  role: m.role,
  content: m.content
}));

// 4. Call API
const response = await fetch('http://localhost:8000/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: userInput,
    chat_context: chatContext  // IMPORTANT: This exact name
  })
});

const data = await response.json();

// 5. Add AI response to UI
addMessage({
  role: 'assistant',
  content: data.response,
  contextUsed: data.context_used
});

// 6. Display sources
data.context_used.forEach(ctx => {
  console.log(`Source: ${ctx.score * 100}% relevant`);
  console.log(`Text: ${ctx.text.substring(0, 100)}...`);
});
```

---

## 🚀 Ready to Build!

You now have everything you need:
- ✅ Complete API documentation
- ✅ TypeScript interfaces
- ✅ Example React components
- ✅ API service layer
- ✅ UI/UX guidelines
- ✅ Implementation checklist

### Start Building:
1. Set up your project
2. Create the API service
3. Build the Chat page
4. Build the Files page
5. Test everything
6. Deploy!

### Questions?
- Check `API_DOCUMENTATION.md` for detailed API specs
- See `QUICK_START.md` for backend testing examples
- Review `test_endpoints.py` to understand API behavior

---

**Happy Coding! 🎉**

If you need any clarifications or run into issues, refer to the backend documentation or test the endpoints using `test_endpoints.py`.

