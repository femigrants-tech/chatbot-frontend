import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { chatAPI, filesAPI } from '../services/api';
import { useChat } from '../context/ChatContext';
import type { ContextItem } from '../types';

const ChatPage: React.FC = () => {
  const { messages, addMessage, clearMessages, isLoading, setIsLoading } = useChat();
  const [input, setInput] = useState('');
  const [aiModel] = useState(import.meta.env.VITE_AI_MODEL || 'gemini-2.5-flash');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Function to convert plain URLs to markdown links
  const convertUrlsToMarkdown = (text: string): string => {
    // Handle patterns like "Learn More: URL" or "Resource: URL"
    // Each occurrence gets its own line with spacing after
    const result = text.replace(/([^:\n]+):\s*(https?:\/\/[^\s<>\]()]+)/g, (_match, label, url) => {
      return `${label}: [${url}](${url})\n\n`;
    });
    
    // Clean up excessive line breaks (more than 2 consecutive)
    return result.replace(/\n{3,}/g, '\n\n').trim();
  };

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

      // Call API with Gemini 2.5 Flash model
      const response = await chatAPI.sendMessage(input, chatContext, aiModel);

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
        content: 'Sorry, there was an error processing your request. Please make sure the backend is running and files are uploaded.',
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

  const exampleQuestions = [
    "What is your mission?",
    "What is your history?",
    "Do you accept donations?",
    "What is your board of directors?",
  ];

  // View document function with error handling
  const viewDocument = async (context: ContextItem) => {
    try {
      console.log('Context item:', context);
      
      const signedUrl = 
        context.signed_url || 
        context.metadata?.signed_url || 
        context.reference?.file?.signed_url ||
        context.metadata?.reference?.file?.signed_url;
      
      if (signedUrl) {
        console.log('Found signed URL, opening document:', signedUrl);
        window.open(signedUrl, '_blank');
        return;
      }
      
      const fileId = context.file_id || context.metadata?.file_id;
      
      if (fileId) {
        console.log('Fetching fresh URL for file_id:', fileId);
        try {
          const response = await filesAPI.getViewUrl(fileId);
          console.log('Got signed URL response:', response);
          window.open(response.signed_url, '_blank');
        } catch (apiError: any) {
          console.error('API Error getting view URL:', apiError);
          console.error('Error details:', {
            status: apiError.response?.status,
            statusText: apiError.response?.statusText,
            data: apiError.response?.data,
            message: apiError.message
          });
          
          if (apiError.response?.status === 404) {
            alert('Backend endpoint /files/{file_id}/view-url not found. The backend may need to be updated to support this feature.');
          } else {
            alert(`Unable to fetch document URL. Error: ${apiError.response?.data?.detail || apiError.message || 'Unknown error'}`);
          }
        }
      } else {
        console.error('No file ID or signed URL found in context:', context);
        alert('Unable to view document: No file ID or signed URL available. Please check the console for details.');
      }
    } catch (error: any) {
      console.error('Unexpected error opening document:', error);
      alert('Unexpected error: ' + (error.message || 'Unknown error'));
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-5rem)] bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Welcome Screen */}
      {!isChatOpen && (
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] p-8">
          <div className="text-center max-w-4xl animate-fadeIn">
            {/* Hero Section */}
            <div className="mb-12">
              <div className="relative inline-block mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-2xl opacity-50 animate-pulse-slow"></div>
                <div className="relative inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 rounded-full shadow-2xl transform hover:scale-110 transition-transform duration-300">
                  <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent font-['Poppins']">
                Femibot AI Assistant
              </h1>
              <p className="text-2xl text-gray-700 mb-3 font-medium">Your intelligent guide to Femigrants resources</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full border border-purple-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-purple-700">Powered by {aiModel}</span>
              </div>
            </div>
            
            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <div className="relative glass p-8 rounded-2xl border border-white/40 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl mb-4 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Ask Questions</h3>
                  <p className="text-gray-600 leading-relaxed">Get instant, accurate answers about immigration topics powered by advanced AI</p>
                </div>
              </div>
              
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <div className="relative glass p-8 rounded-2xl border border-white/40 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl mb-4 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Document Search</h3>
                  <p className="text-gray-600 leading-relaxed">Search through uploaded resources with intelligent context understanding</p>
                </div>
              </div>
              
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-rose-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <div className="relative glass p-8 rounded-2xl border border-white/40 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl mb-4 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Smart AI</h3>
                  <p className="text-gray-600 leading-relaxed">Contextual responses with sources and references for transparency</p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => setIsChatOpen(true)}
              className="group relative inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 text-white text-lg font-bold rounded-2xl shadow-2xl hover:shadow-purple-500/50 transform hover:scale-105 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <svg className="w-7 h-7 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="relative z-10">Start Chatting</span>
              <svg className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Chat Window - Enhanced Design */}
      {isChatOpen && (
        <div className="relative z-10 h-[calc(100vh-5rem)] flex items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-6xl h-full flex flex-col animate-scaleIn">
            <div className="glass rounded-3xl shadow-2xl overflow-hidden h-full flex flex-col border border-white/40">
              {/* Header - Enhanced */}
              <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 text-white p-6 shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 opacity-90"></div>
                <div className="relative flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                      <h1 className="text-xl font-bold">Femibot AI Assistant</h1>
                      <p className="text-sm text-white/90 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                        Online • Ready to help
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={clearMessages}
                      className="group flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-105"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Clear
                    </button>
                    <button
                      onClick={() => setIsChatOpen(false)}
                      className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2.5 rounded-xl transition-all duration-300 hover:scale-105"
                      title="Minimize"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages - Enhanced */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-gray-50 to-white">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center animate-fadeIn">
                    <div className="mb-8">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mb-4">
                        <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Hello! How can I help you today?</h3>
                      <p className="text-gray-600 mb-6">Ask me anything about Femigrants resources</p>
                    </div>
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-gray-700 mb-3">Try asking:</p>
                      <div className="grid gap-3">
                        {exampleQuestions.map((question, idx) => (
                          <button
                            key={idx}
                            onClick={() => setInput(question)}
                            className="group text-left px-6 py-4 bg-white hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 border-2 border-gray-200 hover:border-purple-300 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
                          >
                            <div className="flex items-start gap-3">
                              <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-gray-700 font-medium group-hover:text-purple-700 transition-colors">{question}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slideIn`}
                  >
                    <div
                      className={`max-w-3xl rounded-2xl p-5 shadow-lg transform transition-all duration-300 hover:scale-[1.02] ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                          : 'glass border border-white/40'
                      }`}
                    >
                      {msg.role === 'user' ? (
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                            <p className="text-xs mt-3 text-white/80 flex items-center gap-2">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {msg.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="prose prose-sm max-w-none">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                ul: ({node, ...props}) => <ul className="list-disc ml-5 space-y-2 text-gray-800" {...props} />,
                                ol: ({node, ...props}) => <ol className="list-decimal ml-5 space-y-2 text-gray-800" {...props} />,
                                li: ({node, ...props}) => <li className="text-gray-800 leading-relaxed" {...props} />,
                                p: ({node, ...props}) => <p className="mb-3 text-gray-800 leading-relaxed" {...props} />,
                                strong: ({node, ...props}) => <strong className="font-bold text-gray-900" {...props} />,
                                em: ({node, ...props}) => <em className="italic text-gray-700" {...props} />,
                                h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-3 text-gray-900" {...props} />,
                                h2: ({node, ...props}) => <h2 className="text-xl font-bold mb-3 text-gray-900" {...props} />,
                                h3: ({node, ...props}) => <h3 className="text-lg font-bold mb-2 text-gray-900" {...props} />,
                                code: ({node, ...props}) => <code className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm font-mono" {...props} />,
                                a: ({node, ...props}) => (
                                  <a 
                                    className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-800 underline font-semibold transition-colors mx-1 my-1 break-all" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    {...props} 
                                  >
                                    {props.children}
                                    <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                  </a>
                                ),
                              }}
                            >
                              {convertUrlsToMarkdown(msg.content)}
                            </ReactMarkdown>
                          </div>
                          
                          {/* Sources - Enhanced Design */}
                          {msg.role === 'assistant' && msg.contextUsed && msg.contextUsed.length > 0 && (
                            <div className="mt-6 pt-6 border-t border-gray-200">
                              <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg">
                                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900">Sources</p>
                                  <p className="text-xs text-gray-600">{msg.contextUsed.length} document{msg.contextUsed.length !== 1 ? 's' : ''} referenced</p>
                                </div>
                              </div>
                              <div className="space-y-3">
                                {msg.contextUsed.map((ctx, i) => (
                                  <div key={i} className="group relative bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300 hover:border-purple-300">
                                    <div className="flex justify-between items-start gap-3">
                                      <div className="flex-1">
                                        <div className="flex items-start gap-2 mb-2">
                                          <svg className="w-4 h-4 text-purple-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                          </svg>
                                          <p className="font-semibold text-gray-900 text-sm">
                                            {ctx.metadata?.file_name || ctx.metadata?.filename || 'Unknown Document'}
                                          </p>
                                        </div>
                                        <div className="flex flex-wrap gap-3 text-xs">
                                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full font-semibold">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {(ctx.score * 100).toFixed(1)}% match
                                          </span>
                                          {ctx.metadata?.pages && ctx.metadata.pages.length > 0 && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full font-semibold">
                                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                              </svg>
                                              Page {ctx.metadata.pages.join(', ')}
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-xs text-gray-600 mt-3 line-clamp-2 leading-relaxed">
                                          {ctx.text.substring(0, 120)}...
                                        </p>
                                      </div>
                                      <button
                                        onClick={() => viewDocument(ctx)}
                                        className="flex-shrink-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2.5 rounded-lg text-xs font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-1.5"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        View
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <p className="text-xs mt-4 text-gray-500 flex items-center gap-2">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {msg.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start animate-fadeIn">
                    <div className="glass border border-white/40 rounded-2xl p-6 shadow-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex space-x-2">
                          <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce"></div>
                          <div className="w-3 h-3 bg-pink-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-sm text-gray-600 font-medium">Femibot is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input - Enhanced */}
              <div className="border-t border-gray-200 p-6 bg-white/80 backdrop-blur-sm">
                <div className="flex gap-3 max-w-7xl mx-auto">
                  <div className="flex-1 relative">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
                      className="w-full bg-white border-2 border-gray-200 focus:border-purple-400 rounded-2xl p-4 pr-12 resize-none focus:outline-none focus:ring-4 focus:ring-purple-100 text-gray-900 placeholder-gray-400 transition-all duration-300 shadow-sm"
                      rows={2}
                      disabled={isLoading}
                    />
                    <div className="absolute right-4 bottom-4 text-xs text-gray-400">
                      {input.length} / 2000
                    </div>
                  </div>
                  <button
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                    className="relative group bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-bold disabled:hover:shadow-none transform hover:scale-105 disabled:hover:scale-100 flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </>
                    ) : (
                      <>
                        <span>Send</span>
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 text-center mt-3">
                  AI can make mistakes. Please verify important information.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Chat Button - Enhanced */}
      {!isChatOpen && messages.length > 0 && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-8 right-8 group"
          title="Open Chat"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity animate-pulse-slow"></div>
          <div className="relative w-20 h-20 bg-gradient-to-br from-purple-600 via-pink-600 to-purple-700 text-white rounded-full shadow-2xl hover:shadow-purple-500/50 hover:scale-110 transition-all duration-300 flex items-center justify-center">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            {messages.filter(m => m.role === 'assistant').length > 0 && (
              <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center border-4 border-white shadow-lg animate-bounce">
                {messages.filter(m => m.role === 'assistant').length}
              </span>
            )}
          </div>
        </button>
      )}
    </div>
  );
};

export default ChatPage;
