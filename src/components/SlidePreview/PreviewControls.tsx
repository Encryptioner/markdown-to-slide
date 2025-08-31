'use client';

import React, { useState } from 'react';
import PDFExporter from '@/components/PDFExporter';

interface PreviewControlsProps {
  onFullscreen: () => void;
  onPrev: () => void;
  onNext: () => void;
  currentSlide: number;
  totalSlides: number;
  canGoPrev: boolean;
  canGoNext: boolean;
}

const PreviewControls: React.FC<PreviewControlsProps> = ({
  onFullscreen,
  onPrev,
  onNext,
  currentSlide,
  totalSlides,
  canGoPrev,
  canGoNext
}) => {
  const [showPDFExport, setShowPDFExport] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <button
            onClick={onPrev}
            disabled={!canGoPrev}
            className="px-3 py-1 text-sm rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Previous slide"
          >
            ← Prev
          </button>
          
          <span className="text-sm text-gray-600 min-w-[60px] text-center">
            {currentSlide + 1} / {totalSlides}
          </span>
          
          <button
            onClick={onNext}
            disabled={!canGoNext}
            className="px-3 py-1 text-sm rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Next slide"
          >
            Next →
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPDFExport(true)}
            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors cursor-pointer"
            title="Export to PDF"
          >
            📄 PDF
          </button>
          
          <button
            onClick={onFullscreen}
            className="px-4 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors cursor-pointer"
            title="Present (F11)"
          >
            🎬 Present
          </button>
        </div>
      </div>

      {showPDFExport && (
        <PDFExporter 
          onClose={() => setShowPDFExport(false)} 
        />
      )}
    </>
  );
};

export default PreviewControls;