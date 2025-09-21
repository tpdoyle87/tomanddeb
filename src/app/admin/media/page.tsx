'use client';

import { useState, useEffect } from 'react';
import { MediaUploader } from '@/components/admin/MediaUploader';
import { 
  Upload, 
  Search, 
  Filter, 
  Grid, 
  List, 
  Download, 
  Trash2, 
  Edit3, 
  Copy, 
  Eye,
  Calendar,
  HardDrive
} from 'lucide-react';

interface MediaFile {
  id: string;
  url: string;
  publicId?: string;
  filename: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  alt?: string;
  caption?: string;
  provider: 'LOCAL' | 'S3' | 'CLOUDINARY';
  folder?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  post?: {
    id: string;
    title: string;
    slug: string;
  };
}

export default function MediaManagement() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [editingFile, setEditingFile] = useState<MediaFile | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSize, setTotalSize] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 25;

  useEffect(() => {
    fetchFiles(true);
  }, [searchTerm, filterType]);

  const fetchFiles = async (reset = false) => {
    if (reset) {
      setLoading(true);
      setCurrentPage(1);
      setFiles([]);
    } else {
      setLoadingMore(true);
    }
    
    try {
      const params = new URLSearchParams({
        page: reset ? '1' : currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(filterType !== 'ALL' && { type: filterType }),
      });

      const response = await fetch(`/api/admin/media?${params}`);
      if (response.ok) {
        const data = await response.json();
        
        // Process files to use WebP URLs when available
        const processedFiles = data.files.map((file: any) => ({
          ...file,
          displayUrl: file.webpUrl || file.url, // Use WebP if available
          originalUrl: file.url
        }));
        
        if (reset) {
          setFiles(processedFiles);
        } else {
          setFiles(prev => [...prev, ...processedFiles]);
        }
        
        setTotalPages(data.pagination.pages);
        setTotalSize(data.totalSize);
        setHasMore(data.pagination.page < data.pagination.pages);
        
        if (!reset) {
          setCurrentPage(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error('Failed to fetch media files:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchFiles(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleFileUploaded = (file: any) => {
    fetchFiles(true); // Refresh the list from beginning
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/media/${fileId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setFiles(prev => prev.filter(f => f.id !== fileId));
        setSelectedFiles(prev => prev.filter(id => id !== fileId));
      } else {
        throw new Error('Failed to delete file');
      }
    } catch (error) {
      console.error('Failed to delete file:', error);
      alert('Failed to delete file. Please try again.');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedFiles.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedFiles.length} files?`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/media/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileIds: selectedFiles }),
      });

      if (response.ok) {
        setFiles(prev => prev.filter(f => !selectedFiles.includes(f.id)));
        setSelectedFiles([]);
      } else {
        throw new Error('Failed to delete files');
      }
    } catch (error) {
      console.error('Failed to delete files:', error);
      alert('Failed to delete files. Please try again.');
    }
  };

  const handleUpdateFile = async (fileId: string, updates: Partial<MediaFile>) => {
    try {
      const response = await fetch(`/api/admin/media/${fileId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedFile = await response.json();
        setFiles(prev => prev.map(f => f.id === fileId ? updatedFile : f));
        setEditingFile(null);
      } else {
        throw new Error('Failed to update file');
      }
    } catch (error) {
      console.error('Failed to update file:', error);
      alert('Failed to update file. Please try again.');
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    // Show toast notification
    alert('URL copied to clipboard');
  };

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const selectAllFiles = () => {
    if (selectedFiles.length === files.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(files.map(f => f.id));
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return '🖼️';
    } else if (mimeType.startsWith('video/')) {
      return '🎥';
    } else if (mimeType.includes('pdf')) {
      return '📄';
    } else {
      return '📁';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-card-foreground">Media Library</h1>
          <p className="text-muted-foreground">
            Manage your uploaded images and files ({formatFileSize(totalSize)} total)
          </p>
        </div>
        <button
          onClick={() => setShowUploader(!showUploader)}
          className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <Upload size={20} className="mr-2" />
          Upload Files
        </button>
      </div>

      {/* Upload Section */}
      {showUploader && (
        <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-card-foreground">Upload New Files</h2>
            <button
              onClick={() => setShowUploader(false)}
              className="text-muted-foreground hover:text-card-foreground"
            >
              ×
            </button>
          </div>
          <MediaUploader
            onFileUploaded={handleFileUploaded}
            maxFiles={10}
            folder="uploads"
          />
        </div>
      )}

      {/* Controls */}
      <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type="text"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter size={20} className="text-muted-foreground" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="ALL">All Types</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
                <option value="document">Documents</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {selectedFiles.length > 0 && (
              <>
                <span className="text-sm text-muted-foreground">
                  {selectedFiles.length} selected
                </span>
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center px-3 py-2 text-red-600 border border-red-600 rounded hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={16} className="mr-1" />
                  Delete
                </button>
              </>
            )}
            
            <div className="flex items-center border border-border rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-card-foreground'}`}
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-card-foreground'}`}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {files.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedFiles.length === files.length}
                onChange={selectAllFiles}
                className="rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm text-card-foreground">Select all</span>
            </label>
          </div>
        )}
      </div>

      {/* Files Display */}
      <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading files...</p>
          </div>
        ) : files.length === 0 ? (
          <div className="p-8 text-center">
            <HardDrive className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-card-foreground mb-2">No files found</h3>
            <p className="text-muted-foreground mb-4">
              Upload your first files to get started
            </p>
            <button
              onClick={() => setShowUploader(true)}
              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              <Upload size={20} className="mr-2" />
              Upload Files
            </button>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className={`group relative bg-muted rounded-lg overflow-hidden hover:shadow-md transition-shadow ${
                      selectedFiles.includes(file.id) ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    {/* Selection Checkbox */}
                    <div className="absolute top-2 left-2 z-10">
                      <input
                        type="checkbox"
                        checked={selectedFiles.includes(file.id)}
                        onChange={() => toggleFileSelection(file.id)}
                        className="rounded border-border text-primary focus:ring-primary"
                      />
                    </div>

                    {/* File Preview */}
                    <div className="aspect-square relative">
                      {file.mimeType.startsWith('image/') ? (
                        <img
                          src={(file as any).displayUrl || file.url}
                          alt={file.alt || file.filename}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <span className="text-4xl">{getFileIcon(file.mimeType)}</span>
                        </div>
                      )}
                      
                      {/* Overlay Actions */}
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                        <button
                          onClick={() => window.open((file as any).originalUrl || file.url, '_blank')}
                          className="p-2 bg-white text-gray-800 rounded-full hover:bg-gray-200 transition-colors"
                          title="View Original"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => copyToClipboard((file as any).displayUrl || file.url)}
                          className="p-2 bg-white text-gray-800 rounded-full hover:bg-gray-200 transition-colors"
                          title="Copy WebP URL"
                        >
                          <Copy size={16} />
                        </button>
                        <button
                          onClick={() => setEditingFile(file)}
                          className="p-2 bg-white text-gray-800 rounded-full hover:bg-gray-200 transition-colors"
                          title="Edit"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteFile(file.id)}
                          className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* File Info */}
                    <div className="p-2">
                      <p className="text-xs font-medium text-card-foreground truncate" title={file.filename}>
                        {file.filename}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                      {file.width && file.height && (
                        <p className="text-xs text-muted-foreground">
                          {file.width} × {file.height}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedFiles.length === files.length}
                          onChange={selectAllFiles}
                          className="rounded border-border text-primary focus:ring-primary"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                        File
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                        Size
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                        Uploaded
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-card divide-y divide-border">
                    {files.map((file) => (
                      <tr key={file.id} className="hover:bg-muted/50">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedFiles.includes(file.id)}
                            onChange={() => toggleFileSelection(file.id)}
                            className="rounded border-border text-primary focus:ring-primary"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            {file.mimeType.startsWith('image/') ? (
                              <img
                                src={(file as any).displayUrl || file.url}
                                alt={file.alt || file.filename}
                                className="w-10 h-10 object-cover rounded"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                                <span className="text-lg">{getFileIcon(file.mimeType)}</span>
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium text-card-foreground">
                                {file.filename}
                              </p>
                              {file.alt && (
                                <p className="text-xs text-muted-foreground">{file.alt}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-card-foreground">
                          {file.mimeType}
                        </td>
                        <td className="px-6 py-4 text-sm text-card-foreground">
                          {formatFileSize(file.size)}
                        </td>
                        <td className="px-6 py-4 text-sm text-card-foreground">
                          <div className="flex items-center">
                            <Calendar size={14} className="text-muted-foreground mr-1" />
                            {formatDate(file.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => window.open((file as any).originalUrl || file.url, '_blank')}
                              className="text-primary hover:text-primary-dark"
                              title="View Original"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => copyToClipboard((file as any).displayUrl || file.url)}
                              className="text-secondary hover:text-secondary/90"
                              title="Copy WebP URL"
                            >
                              <Copy size={16} />
                            </button>
                            <button
                              onClick={() => setEditingFile(file)}
                              className="text-secondary hover:text-secondary/90"
                              title="Edit"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteFile(file.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Load More Button */}
            {hasMore && (
              <div className="px-6 py-4 border-t border-border text-center">
                {loadingMore ? (
                  <div className="inline-flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mr-2"></div>
                    <span className="text-sm text-muted-foreground">Loading more...</span>
                  </div>
                ) : (
                  <button
                    onClick={loadMore}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    Load More Images
                  </button>
                )}
                <div className="mt-2 text-sm text-muted-foreground">
                  Showing {files.length} of {totalPages * ITEMS_PER_PAGE} files
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit Modal */}
      {editingFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg p-6 max-w-lg w-full">
            <h2 className="text-xl font-semibold text-card-foreground mb-4">Edit File</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Alt Text
                </label>
                <input
                  type="text"
                  value={editingFile.alt || ''}
                  onChange={(e) => setEditingFile({ ...editingFile, alt: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Caption
                </label>
                <textarea
                  value={editingFile.caption || ''}
                  onChange={(e) => setEditingFile({ ...editingFile, caption: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setEditingFile(null)}
                className="px-4 py-2 text-secondary border border-secondary rounded hover:bg-secondary hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateFile(editingFile.id, {
                  alt: editingFile.alt,
                  caption: editingFile.caption,
                })}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}