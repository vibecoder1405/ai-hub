
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';

interface FileUploaderProps {
  onFileUpload?: (fileUrl: string) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      
      // Simulate file upload - in a real app, this would be an API call
      if (onFileUpload) {
        // Create a fake URL for demo purposes
        // In a real app, this would be the URL returned from your file upload API
        const fakeUrl = URL.createObjectURL(droppedFile);
        onFileUpload(fakeUrl);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Simulate file upload - in a real app, this would be an API call
      if (onFileUpload) {
        // Create a fake URL for demo purposes
        const fakeUrl = URL.createObjectURL(selectedFile);
        onFileUpload(fakeUrl);
      }
    }
  };

  const handleClearFile = () => {
    setFile(null);
    if (onFileUpload) {
      onFileUpload('');
    }
  };

  return (
    <div className="w-full">
      {!file ? (
        <div
          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
            isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/20'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-6 w-6 text-muted-foreground mb-2" />
          <p className="text-sm font-medium mb-1">Drag and drop file here</p>
          <p className="text-xs text-muted-foreground mb-2">or</p>
          <Button
            variant="outline"
            size="sm"
            className="relative"
            onClick={() => document.getElementById('fileInput')?.click()}
          >
            Browse Files
            <input
              id="fileInput"
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileChange}
            />
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between border rounded-lg p-3">
          <div className="flex items-center space-x-2 truncate">
            <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
              <Upload className="h-4 w-4 text-primary" />
            </div>
            <div className="truncate">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={handleClearFile}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
