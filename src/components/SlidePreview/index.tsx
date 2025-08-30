'use client';

import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { generateSlideStyles } from '@/utils/markdownParser';
import PreviewControls from './PreviewControls';
import SlideNavigation from './SlideNavigation';
import PDFExporter from '../PDFExporter';

const SlidePreview: React.FC = () => {
  const { slides, currentSlide, setCurrentSlide, isFullscreen, setFullscreen } = useApp();
  const [showPDFExport, setShowPDFExport] = useState(false);

  const currentSlideData = slides[currentSlide];

  const handlePrevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleNextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handleKeyDown = React.useCallback((e: KeyboardEvent) => {
    if (isFullscreen) {
      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          handlePrevSlide();
          break;
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
          e.preventDefault();
          handleNextSlide();
          break;
        case 'Escape':
          e.preventDefault();
          setFullscreen(false);
          break;
        case 'Home':
          e.preventDefault();
          setCurrentSlide(0);
          break;
        case 'End':
          e.preventDefault();
          setCurrentSlide(slides.length - 1);
          break;
      }
    }
  }, [currentSlide, slides.length, isFullscreen, setCurrentSlide, setFullscreen, handlePrevSlide, handleNextSlide]);

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!currentSlideData) {
    return (
      <div className="w-full h-full bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <h2 className="text-xl font-semibold mb-2">No slides to preview</h2>
          <p>Start typing in the editor to see your slides here</p>
        </div>
      </div>
    );
  }

  const slideStyles = generateSlideStyles(currentSlideData.attributes);

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'w-full h-full'} flex flex-col`}>
      {!isFullscreen && (
        <PreviewControls 
          onFullscreen={() => setFullscreen(true)}
          onPrev={handlePrevSlide}
          onNext={handleNextSlide}
          currentSlide={currentSlide}
          totalSlides={slides.length}
          canGoPrev={currentSlide > 0}
          canGoNext={currentSlide < slides.length - 1}
        />
      )}
      
      <div className="flex-1 relative overflow-hidden">
        <div
          className={`w-full h-full flex items-center justify-center p-8 ${isFullscreen ? 'fullscreen-slide' : 'bg-white border'}`}
          style={slideStyles}
        >
          <div
            className={`max-w-4xl w-full ${isFullscreen ? 'text-center' : ''} slide-content`}
            dangerouslySetInnerHTML={{ __html: currentSlideData.content }}
          />
        </div>

        {/* Slide navigation dots for fullscreen */}
        {isFullscreen && (
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
            <SlideNavigation
              currentSlide={currentSlide}
              totalSlides={slides.length}
              onSlideSelect={setCurrentSlide}
            />
          </div>
        )}

        {/* Fullscreen controls */}
        {isFullscreen && (
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={() => setShowPDFExport(true)}
              className="p-2 bg-black bg-opacity-50 text-white rounded hover:bg-opacity-70"
              title="Export PDF"
            >
              📄
            </button>
            <button
              onClick={handlePrevSlide}
              disabled={currentSlide === 0}
              className="p-2 bg-black bg-opacity-50 text-white rounded hover:bg-opacity-70 disabled:opacity-30"
              title="Previous slide (←)"
            >
              ←
            </button>
            <button
              onClick={handleNextSlide}
              disabled={currentSlide === slides.length - 1}
              className="p-2 bg-black bg-opacity-50 text-white rounded hover:bg-opacity-70 disabled:opacity-30"
              title="Next slide (→)"
            >
              →
            </button>
            <button
              onClick={() => setFullscreen(false)}
              className="p-2 bg-black bg-opacity-50 text-white rounded hover:bg-opacity-70"
              title="Exit fullscreen (Esc)"
            >
              ✕
            </button>
          </div>
        )}

        {/* Slide counter in fullscreen */}
        {isFullscreen && (
          <div className="absolute bottom-6 right-6 text-white bg-black bg-opacity-50 px-3 py-1 rounded">
            {currentSlide + 1} / {slides.length}
          </div>
        )}
      </div>
      
      {/* PDF Export Modal for fullscreen mode */}
      {showPDFExport && (
        <PDFExporter onClose={() => setShowPDFExport(false)} />
      )}
    </div>
  );
};

export default SlidePreview;
