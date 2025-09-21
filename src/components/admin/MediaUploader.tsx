'use client';

import { useState, useRef, DragEvent } from 'react';
import { Upload, X, Image as ImageIcon, File, Check } from 'lucide-react';

interface UploadedFile {
  id: string;
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  width?: number;
  height?: number;
}

interface MediaUploaderProps {
  onFileUploaded?: (file: UploadedFile) => void;
  onMultipleFilesUploaded?: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxSizePerFile?: number; // in bytes
  acceptedTypes?: string[];
  folder?: string;
  className?: string;
}

export function MediaUploader({
  onFileUploaded,
  onMultipleFilesUploaded,
  maxFiles = 10,
  maxSizePerFile = 10 * 1024 * 1024, // 10MB default
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  folder = 'uploads',
  className = '',
}: MediaUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `File type ${file.type} is not supported`;
    }
    if (file.size > maxSizePerFile) {
      return `File size must be less than ${formatFileSize(maxSizePerFile)}`;
    }
    return null;
  };

  const uploadFile = async (file: File): Promise<UploadedFile | null> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    try {
      console.log(`Uploading ${file.name} (${formatFileSize(file.size)})...`);
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const result = await response.json();
      if (result.success && result.image) {
        // Map the response to match expected format
        return {
          id: result.image.id,
          url: result.image.webpUrl || result.image.url, // Use WebP URL for display if available
          filename: result.image.filename,
          size: file.size,
          mimeType: file.type,
          width: result.image.width,
          height: result.image.height,
        };
      }
      return null;
    } catch (error) {
      console.error('File upload failed:', error);
      alert(error instanceof Error ? error.message : 'Upload failed');
      return null;
    }
  };

  const handleFiles = async (files: FileList) => {
    if (files.length === 0) return;

    const validFiles: File[] = [];
    const errors: string[] = [];

    // Validate files
    for (let i = 0; i < Math.min(files.length, maxFiles); i++) {
      const file = files[i];
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    }

    if (errors.length > 0) {
      alert('Some files could not be uploaded:\n' + errors.join('\n'));
    }

    if (validFiles.length === 0) return;

    setUploading(true);
    const uploadedFiles: UploadedFile[] = [];

    // Upload files sequentially
    for (const file of validFiles) {
      try {
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
        
        // Simulate progress (in real app, you'd track actual progress)
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: Math.min((prev[file.name] || 0) + 10, 90)
          }));
        }, 100);

        const uploadedFile = await uploadFile(file);
        
        clearInterval(progressInterval);
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));

        if (uploadedFile) {
          uploadedFiles.push(uploadedFile);
          
          // Call single file callback if provided
          if (onFileUploaded) {
            onFileUploaded(uploadedFile);
          }
        }

        // Remove progress after a delay
        setTimeout(() => {
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[file.name];
            return newProgress;
          });
        }, 2000);

      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[file.name];
          return newProgress;
        });
      }
    }

    // Call multiple files callback if provided
    if (onMultipleFilesUploaded && uploadedFiles.length > 0) {
      onMultipleFilesUploaded(uploadedFiles);
    }

    setUploadedFiles(prev => [...prev, ...uploadedFiles]);
    setUploading(false);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    // You could show a toast notification here
    alert('URL copied to clipboard');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          isDragOver
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary hover:bg-primary/5'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFilePicker}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          className="hidden"
        />
        
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        
        <div className="space-y-2">
          <p className="text-lg font-medium text-card-foreground">
            Drop files here or click to upload
          </p>
          <p className="text-sm text-muted-foreground">
            Supports: {acceptedTypes.map(type => type.split('/')[1]).join(', ')}
          </p>
          <p className="text-sm text-muted-foreground">
            Max {maxFiles} files, {formatFileSize(maxSizePerFile)} each
          </p>
        </div>

        {uploading && (
          <div className="mt-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Uploading...</p>
          </div>
        )}
      </div>

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2">
          {Object.entries(uploadProgress).map(([filename, progress]) => (
            <div key={filename} className="bg-card rounded-lg p-3 border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-card-foreground truncate">
                  {filename}
                </span>
                <span className="text-xs text-muted-foreground">
                  {progress}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-card-foreground">Uploaded Files</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="bg-card rounded-lg p-4 border border-border group hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {file.mimeType.startsWith('image/') ? (
                      <ImageIcon size={20} className="text-primary flex-shrink-0" />
                    ) : (
                      <File size={20} className="text-muted-foreground flex-shrink-0" />
                    )}
                    <span className="text-sm font-medium text-card-foreground truncate">
                      {file.filename}
                    </span>
                  </div>
                  <button
                    onClick={() => removeFile(file.id)}
                    className="text-muted-foreground hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={16} />
                  </button>
                </div>

                {file.mimeType.startsWith('image/') && (
                  <div className="mb-3">
                    <img
                      src={file.url}
                      alt={file.filename}
                      className="w-full h-32 object-cover rounded"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatFileSize(file.size)}</span>
                    {file.width && file.height && (
                      <span>{file.width} × {file.height}</span>
                    )}
                  </div>
                  
                  <button
                    onClick={() => copyToClipboard(file.url)}
                    className="w-full px-3 py-1 text-xs bg-primary text-white rounded hover:bg-primary-dark transition-colors"
                  >
                    Copy URL
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}