import React, { useState } from 'react';
import { Sparkles, Trash2, Github, AlertCircle } from 'lucide-react';
import { DropZone } from './components/DropZone';
import { ResultPanel } from './components/ResultPanel';
import { LoadingSpinner } from './components/LoadingSpinner';
import { processImageWithGemini } from './services/gemini';
import { ExtractedContent, ImageFile, ProcessingStatus } from './types';

const App: React.FC = () => {
  const [status, setStatus] = useState<ProcessingStatus>(ProcessingStatus.IDLE);
  const [currentImage, setCurrentImage] = useState<ImageFile | null>(null);
  const [result, setResult] = useState<ExtractedContent | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelected = async (file: File) => {
    // Cleanup previous image URL if exists
    if (currentImage) {
      URL.revokeObjectURL(currentImage.previewUrl);
    }

    const previewUrl = URL.createObjectURL(file);
    setCurrentImage({ file, previewUrl });
    setStatus(ProcessingStatus.PROCESSING);
    setError(null);
    setResult(null);

    try {
      const content = await processImageWithGemini(file);
      setResult(content);
      setStatus(ProcessingStatus.SUCCESS);
    } catch (err: any) {
      setStatus(ProcessingStatus.ERROR);
      setError(err.message || "Failed to process image. Please try again.");
    }
  };

  const handleReset = () => {
    if (currentImage) {
      URL.revokeObjectURL(currentImage.previewUrl);
    }
    setCurrentImage(null);
    setResult(null);
    setStatus(ProcessingStatus.IDLE);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              Latex Lens
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-sm text-slate-500">
              Powered by Gemini 2.5 Flash
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-8rem)] min-h-[600px]">
          
          {/* Left Column: Input / Image Preview */}
          <div className="flex flex-col gap-4 h-full">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1 flex items-center justify-between px-4 h-14">
              <span className="font-semibold text-slate-700">Source Image</span>
              {currentImage && (
                <button
                  onClick={handleReset}
                  className="text-slate-400 hover:text-red-500 transition-colors p-1"
                  title="Clear Image"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="flex-1 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 relative">
              {currentImage ? (
                <div className="w-full h-full flex items-center justify-center bg-slate-900/5 p-4">
                  <img
                    src={currentImage.previewUrl}
                    alt="Preview"
                    className="max-w-full max-h-full object-contain rounded shadow-lg"
                  />
                </div>
              ) : (
                <div className="w-full h-full p-4 flex flex-col justify-center">
                   <DropZone 
                    onImageSelected={handleImageSelected} 
                    isProcessing={status === ProcessingStatus.PROCESSING} 
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Output */}
          <div className="flex flex-col gap-4 h-full">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1 flex items-center justify-between px-4 h-14">
              <span className="font-semibold text-slate-700">Extracted LaTeX</span>
            </div>

            <div className="flex-1 relative">
              {status === ProcessingStatus.IDLE && (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                  <Sparkles className="w-12 h-12 mb-4 text-slate-300" />
                  <p className="text-center">Upload an image to see the AI extracted content here</p>
                </div>
              )}

              {status === ProcessingStatus.PROCESSING && (
                <div className="h-full flex items-center justify-center bg-white rounded-xl border border-slate-200 shadow-sm">
                  <LoadingSpinner />
                </div>
              )}

              {status === ProcessingStatus.ERROR && (
                <div className="h-full flex flex-col items-center justify-center bg-red-50 rounded-xl border border-red-200 p-8 text-center animate-in fade-in">
                  <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                  <h3 className="text-lg font-semibold text-red-800 mb-2">Processing Failed</h3>
                  <p className="text-red-600 max-w-xs">{error}</p>
                  <button 
                    onClick={handleReset}
                    className="mt-6 px-4 py-2 bg-white text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors font-medium shadow-sm"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {status === ProcessingStatus.SUCCESS && result && (
                <ResultPanel content={result} />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;