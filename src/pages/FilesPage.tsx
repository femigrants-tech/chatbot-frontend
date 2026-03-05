import React, { useState, useEffect } from 'react';
import { filesAPI } from '../services/api';
import type { FileObject, Statistics } from '../types';

const FilesPage: React.FC = () => {
  const [files, setFiles] = useState<FileObject[]>([]);
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

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
      alert('Failed to load files. Please make sure the backend is running.');
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
        category: 'general',
      });
      alert('File uploaded successfully!');
      loadFiles();
      loadStats();
      event.target.value = '';
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file. Please check the backend connection.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    setDeletingFileId(fileId);
    try {
      await filesAPI.deleteFile(fileId);
      alert('File deleted successfully!');
      loadFiles();
      loadStats();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete file');
    } finally {
      setDeletingFileId(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedFiles.size === 0) return;
    if (!confirm(`Delete ${selectedFiles.size} files?`)) return;

    setBulkDeleting(true);
    try {
      await filesAPI.bulkDelete(Array.from(selectedFiles));
      setSelectedFiles(new Set());
      alert('Files deleted successfully!');
      loadFiles();
      loadStats();
    } catch (error) {
      console.error('Bulk delete error:', error);
      alert('Failed to delete files');
    } finally {
      setBulkDeleting(false);
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

  const viewDocument = async (file: FileObject) => {
    try {
      console.log('Attempting to view file:', file);
      
      const signedUrl = file.signed_url;
      
      if (signedUrl) {
        console.log('Found signed URL, opening document:', signedUrl);
        window.open(signedUrl, '_blank');
        return;
      }
      
      console.log('No signed URL found, fetching fresh one for file_id:', file.id);
      try {
        const response = await filesAPI.getViewUrl(file.id);
        console.log('Got signed URL response:', response);
        window.open(response.signed_url, '_blank');
      } catch (apiError: any) {
        console.error('API Error getting view URL:', apiError);
        
        if (apiError.response?.status === 404) {
          alert('Unable to view document. The backend endpoint is not available. The signed URL might be in the file metadata - check console for details.\n\nFile ID: ' + file.id);
        } else {
          alert(`Unable to fetch document URL. Error: ${apiError.response?.data?.detail || apiError.message || 'Unknown error'}`);
        }
      }
    } catch (error: any) {
      console.error('Unexpected error opening document:', error);
      alert('Unexpected error: ' + (error.message || 'Unknown error'));
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      Available: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200',
      Processing: 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700 border border-yellow-200',
      Failed: 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border border-red-200',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'Available') {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    } else if (status === 'Processing') {
      return (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      );
    } else {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    }
  };

  // Filter files based on search and status
  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || file.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-8">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fadeIn">
          <div className="flex items-center gap-4 mb-3">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative p-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-xl">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold gradient-text font-['Poppins']">File Management</h1>
              <p className="text-gray-600 font-medium">Upload and manage your knowledge base</p>
            </div>
          </div>
        </div>

        {/* Statistics - Enhanced Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-slideIn">
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <div className="relative glass p-6 rounded-2xl border border-white/40 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-600 text-sm font-semibold">Total Files</p>
                  <div className="p-2 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{stats.total_files}</p>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <div className="relative glass p-6 rounded-2xl border border-white/40 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-600 text-sm font-semibold">Storage Used</p>
                  <div className="p-2 bg-gradient-to-br from-blue-100 to-cyan-200 rounded-lg">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{stats.total_size_mb.toFixed(2)} MB</p>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <div className="relative glass p-6 rounded-2xl border border-white/40 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-600 text-sm font-semibold">Available</p>
                  <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-200 rounded-lg">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {stats.status_breakdown.Available || 0}
                </p>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <div className="relative glass p-6 rounded-2xl border border-white/40 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-600 text-sm font-semibold">Processing</p>
                  <div className="p-2 bg-gradient-to-br from-yellow-100 to-orange-200 rounded-lg">
                    <svg className="w-5 h-5 text-yellow-600 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  {stats.status_breakdown.Processing || 0}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Upload Section - Enhanced */}
        <div className="glass rounded-2xl border border-white/40 shadow-xl p-8 mb-8 animate-slideIn">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Upload New File</h2>
              <p className="text-sm text-gray-600">Add documents to your knowledge base</p>
            </div>
          </div>
          
          <div className="relative">
            <input
              type="file"
              onChange={handleUpload}
              disabled={uploading}
              id="file-upload"
              className="hidden"
              accept=".pdf,.txt,.docx,.doc"
            />
            <label
              htmlFor="file-upload"
              className={`flex items-center justify-center gap-3 border-2 border-dashed rounded-2xl p-8 transition-all duration-300 cursor-pointer ${
                uploading
                  ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                  : 'border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50 hover:border-purple-500 hover:shadow-lg hover:scale-[1.02]'
              }`}
            >
              {uploading ? (
                <>
                  <svg className="animate-spin h-8 w-8 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-lg font-semibold text-purple-600">Uploading your file...</span>
                </>
              ) : (
                <>
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <div className="text-center">
                    <span className="text-lg font-semibold text-gray-900 block mb-1">Click to upload or drag and drop</span>
                    <span className="text-sm text-gray-600">PDF, TXT, DOCX, DOC (max. 50MB)</span>
                  </div>
                </>
              )}
            </label>
          </div>
        </div>

        {/* Search and Filter Bar - Enhanced */}
        <div className="glass rounded-2xl border border-white/40 shadow-xl p-6 mb-8 animate-slideIn">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all duration-300 bg-white"
              />
            </div>
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="appearance-none w-full md:w-48 px-4 py-3 pr-10 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all duration-300 bg-white font-medium"
              >
                <option value="all">All Status</option>
                <option value="Available">Available</option>
                <option value="Processing">Processing</option>
                <option value="Failed">Failed</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Bar - Enhanced */}
        <div className="glass rounded-2xl border border-white/40 shadow-xl p-6 mb-8 flex flex-col md:flex-row justify-between items-center gap-4 animate-slideIn">
          <div className="flex items-center gap-3">
            {selectedFiles.size > 0 ? (
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full border border-purple-200">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-800 font-bold">
                  {selectedFiles.size} file{selectedFiles.size !== 1 ? 's' : ''} selected
                </span>
              </div>
            ) : (
              <span className="text-gray-600 font-medium">
                {filteredFiles.length} file{filteredFiles.length !== 1 ? 's' : ''} displayed
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleBulkDelete}
              disabled={selectedFiles.size === 0 || bulkDeleting}
              className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold disabled:hover:shadow-none transform hover:scale-105 disabled:hover:scale-100"
            >
              {bulkDeleting ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Deleting...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Selected
                </>
              )}
            </button>
            <button
              onClick={loadFiles}
              disabled={loading}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 transition-all duration-300 font-semibold transform hover:scale-105 disabled:hover:scale-100"
            >
              <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Files Grid - Enhanced */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 animate-fadeIn">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-xl opacity-50"></div>
              <svg className="relative animate-spin h-16 w-16 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="mt-6 text-lg text-gray-700 font-semibold">Loading files...</p>
          </div>
        ) : filteredFiles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slideIn">
            {filteredFiles.map((file) => (
              <div key={file.id} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <div className="relative glass rounded-2xl border border-white/40 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={selectedFiles.has(file.id)}
                        onChange={() => toggleFileSelection(file.id)}
                        className="mt-1 w-5 h-5 rounded border-2 border-purple-300 text-purple-600 focus:ring-purple-500 focus:ring-2 cursor-pointer transition-all"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-3">
                          <div className="flex-shrink-0 p-2.5 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 truncate mb-2" title={file.name}>
                              {file.name}
                            </h3>
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full ${getStatusBadge(file.status)}`}>
                              {getStatusIcon(file.status)}
                              {file.status}
                            </div>
                          </div>
                        </div>

                        {file.status === 'Processing' && file.percent_done > 0 && (
                          <div className="mb-4">
                            <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
                              <span>Processing...</span>
                              <span>{(file.percent_done * 100).toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${file.percent_done * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        )}

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                            </svg>
                            <span className="font-semibold">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {new Date(file.created_on).toLocaleDateString()} • {new Date(file.created_on).toLocaleTimeString()}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => viewDocument(file)}
                            disabled={deletingFileId === file.id}
                            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2.5 rounded-xl hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 transition-all duration-300 text-sm font-semibold transform hover:scale-105 disabled:hover:scale-100"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </button>
                          <button
                            onClick={() => alert(`File ID: ${file.id}\nName: ${file.name}\nStatus: ${file.status}\nSize: ${(file.size / 1024 / 1024).toFixed(2)} MB\nCreated: ${new Date(file.created_on).toLocaleString()}`)}
                            disabled={deletingFileId === file.id}
                            className="flex items-center justify-center gap-1 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 px-4 py-2.5 rounded-xl hover:shadow-md disabled:opacity-50 transition-all duration-300 text-sm font-semibold border border-blue-200"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(file.id)}
                            disabled={deletingFileId === file.id}
                            className="flex items-center justify-center gap-1 bg-gradient-to-r from-red-100 to-rose-100 text-red-700 px-4 py-2.5 rounded-xl hover:shadow-md disabled:opacity-50 transition-all duration-300 text-sm font-semibold border border-red-200"
                          >
                            {deletingFileId === file.id ? (
                              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass rounded-2xl border border-white/40 shadow-xl p-16 text-center animate-fadeIn">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mb-6">
              <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {files.length === 0 ? 'No files uploaded yet' : 'No files match your search'}
            </h3>
            <p className="text-gray-600">
              {files.length === 0 ? 'Upload your first file to get started!' : 'Try a different search term or filter'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilesPage;
