import React, { useCallback, useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, Clipboard } from 'lucide-react';

interface DropZoneProps {
  onImageSelected: (file: File) => void;
  isProcessing: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({ onImageSelected, isProcessing }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (isProcessing) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        onImageSelected(file);
      }
    }
  }, [onImageSelected, isProcessing]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (isProcessing) return;
    
    const files = e.target.files;
    if (files && files.length > 0) {
      onImageSelected(files[0]);
    }
  }, [onImageSelected, isProcessing]);

  // Handle paste events globally when this component is mounted
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (isProcessing) return;

      const items = e.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            const blob = items[i].getAsFile();
            if (blob) {
              onImageSelected(blob);
              break;
            }
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [onImageSelected, isProcessing]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative group cursor-pointer
        border-2 border-dashed rounded-xl transition-all duration-300 ease-in-out
        flex flex-col items-center justify-center p-10 text-center
        min-h-[300px]
        ${isDragging 
          ? 'border-indigo-500 bg-indigo-50/50 scale-[1.02]' 
          : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
        }
        ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
      `}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={isProcessing}
      />
      
      <div className="w-16 h-16 mb-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform duration-300">
        <Upload className="w-8 h-8" />
      </div>

      <h3 className="text-xl font-semibold text-slate-800 mb-2">
        Upload or Paste Image
      </h3>
      
      <p className="text-slate-500 max-w-sm mb-6">
        Drag & drop an image here, click to browse, or simply press <kbd className="px-2 py-1 bg-slate-200 rounded text-xs font-mono text-slate-700">Ctrl + V</kbd> to paste from clipboard.
      </p>

      <div className="flex gap-4 text-sm text-slate-400">
        <span className="flex items-center gap-1">
          <ImageIcon className="w-4 h-4" /> Supports JPG, PNG, WEBP
        </span>
        <span className="flex items-center gap-1">
          <Clipboard className="w-4 h-4" /> Clipboard Ready
        </span>
      </div>
    </div>
  );
};