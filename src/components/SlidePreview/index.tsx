'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import { trackEvent } from '@/lib/googleAnalytics';
import { generateSlideStyles } from '@/utils/markdownParser';
import PreviewControls from './PreviewControls';
import SlideNavigation from './SlideNavigation';
import PDFExporter from '../PDFExporter';

const SlidePreview: React.FC = () => {
  const { slides, currentSlide, setCurrentSlide, isFullscreen, setFullscreen } = useApp();
  const [showPDFExport, setShowPDFExport] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  // Track the highest slide index reached during fullscreen (for slides_viewed on exit)
  const maxSlideReachedRef = useRef(currentSlide);

  // Theme detection
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkTheme(mediaQuery.matches);

    const handleThemeChange = (e: MediaQueryListEvent) => {
      setIsDarkTheme(e.matches);
    };

    mediaQuery.addEventListener('change', handleThemeChange);
    return () => mediaQuery.removeEventListener('change', handleThemeChange);
  }, []);

  const currentSlideData = slides[currentSlide];

  // Keep track of furthest slide reached during fullscreen
  useEffect(() => {
    if (isFullscreen && currentSlide > maxSlideReachedRef.current) {
      maxSlideReachedRef.current = currentSlide;
    }
  }, [currentSlide, isFullscreen]);

  // Reset tracker and fire fullscreen_entered when entering fullscreen
  const handleEnterFullscreen = React.useCallback(() => {
    maxSlideReachedRef.current = currentSlide;
    setFullscreen(true);
    trackEvent({ name: "fullscreen_entered", params: { slide_count: slides.length } });
  }, [currentSlide, slides.length, setFullscreen]);

  // Fire fullscreen_exited with slides_viewed when exiting
  const handleExitFullscreen = React.useCallback(() => {
    const slidesViewed = maxSlideReachedRef.current + 1; // 1-based count of slides reached
    setFullscreen(false);
    trackEvent({ name: "fullscreen_exited", params: { slides_viewed: slidesViewed, total_slides: slides.length } });
  }, [slides.length, setFullscreen]);

  const handlePrevSlide = React.useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
      trackEvent({ name: "slide_navigated", params: { method: "button", slide_index: currentSlide - 1 } });
    }
  }, [currentSlide, setCurrentSlide]);

  const handleNextSlide = React.useCallback(() => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
      trackEvent({ name: "slide_navigated", params: { method: "button", slide_index: currentSlide + 1 } });
    }
  }, [currentSlide, slides.length, setCurrentSlide]);

  const handleKeyDown = React.useCallback((e: KeyboardEvent) => {
    if (isFullscreen) {
      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          if (currentSlide > 0) {
            setCurrentSlide(currentSlide - 1);
            trackEvent({ name: "slide_navigated", params: { method: "arrow_key", slide_index: currentSlide - 1 } });
          }
          break;
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          if (currentSlide < slides.length - 1) {
            setCurrentSlide(currentSlide + 1);
            trackEvent({ name: "slide_navigated", params: { method: "arrow_key", slide_index: currentSlide + 1 } });
          }
          break;
        case ' ':
          e.preventDefault();
          if (currentSlide < slides.length - 1) {
            setCurrentSlide(currentSlide + 1);
            trackEvent({ name: "slide_navigated", params: { method: "spacebar", slide_index: currentSlide + 1 } });
          }
          break;
        case 'Escape':
          e.preventDefault();
          handleExitFullscreen();
          break;
        case 'Home':
          e.preventDefault();
          setCurrentSlide(0);
          trackEvent({ name: "slide_navigated", params: { method: "home_end", slide_index: 0 } });
          break;
        case 'End':
          e.preventDefault();
          setCurrentSlide(slides.length - 1);
          trackEvent({ name: "slide_navigated", params: { method: "home_end", slide_index: slides.length - 1 } });
          break;
      }
    }
  }, [slides.length, currentSlide, isFullscreen, setCurrentSlide, handleExitFullscreen]);

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
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'w-full h-full border border-gray-200'} flex flex-col`}>
      {!isFullscreen && (
        <PreviewControls
          onFullscreen={handleEnterFullscreen}
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
          className={`w-full ${isFullscreen ? 'h-full' : 'min-h-full'} flex items-center justify-center p-4 sm:p-8 ${isFullscreen ? (isDarkTheme ? 'fullscreen-slide bg-black text-white' : 'bg-white text-black') : 'bg-white border'}`}
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
              onClick={() => {
                const newTheme = !isDarkTheme;
                setIsDarkTheme(newTheme);
                trackEvent({ name: "theme_toggled", params: { theme: newTheme ? "dark" : "light" } });
              }}
              className={`p-3 ${isDarkTheme ? 'bg-white bg-opacity-90 text-black border border-gray-300' : 'bg-gray-900 bg-opacity-90 text-white border border-gray-700'} rounded-lg hover:bg-opacity-100 shadow-lg transition-all duration-200 cursor-pointer`}
              title="Toggle theme"
            >
              <span className="text-lg">{isDarkTheme ? '☀️' : '🌙'}</span>
            </button>
            <button
              onClick={() => setShowPDFExport(true)}
              className={`px-4 py-3 ${isDarkTheme ? 'bg-white bg-opacity-90 text-black border border-gray-300' : 'bg-gray-900 bg-opacity-90 text-white border border-gray-700'} rounded-lg hover:bg-opacity-100 shadow-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium cursor-pointer`}
              title="Export PDF"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
              </svg>
              PDF
            </button>
            <button
              onClick={handlePrevSlide}
              disabled={currentSlide === 0}
              className={`p-3 ${isDarkTheme ? 'bg-white bg-opacity-90 text-black border border-gray-300' : 'bg-gray-900 bg-opacity-90 text-white border border-gray-700'} rounded-lg hover:bg-opacity-100 shadow-lg transition-all duration-200 disabled:opacity-30 cursor-pointer`}
              title="Previous slide (←)"
            >
              <span className="text-lg">←</span>
            </button>
            <button
              onClick={handleNextSlide}
              disabled={currentSlide === slides.length - 1}
              className={`p-3 ${isDarkTheme ? 'bg-white bg-opacity-90 text-black border border-gray-300' : 'bg-gray-900 bg-opacity-90 text-white border border-gray-700'} rounded-lg hover:bg-opacity-100 shadow-lg transition-all duration-200 disabled:opacity-30 cursor-pointer`}
              title="Next slide (→)"
            >
              <span className="text-lg">→</span>
            </button>

            <button
              onClick={handleExitFullscreen}
              className={`p-3 ${isDarkTheme ? 'bg-white bg-opacity-90 text-black border border-gray-300' : 'bg-gray-900 bg-opacity-90 text-white border border-gray-700'} rounded-lg hover:bg-opacity-100 shadow-lg transition-all duration-200 cursor-pointer`}
              title="Exit fullscreen (Esc)"
            >
              <span className="text-lg">✕</span>
            </button>
          </div>
        )}

        {/* Slide counter in fullscreen */}
        {isFullscreen && (
          <div className={`absolute bottom-6 right-6 ${isDarkTheme ? 'text-black bg-white bg-opacity-90 border border-gray-300' : 'text-white bg-gray-900 bg-opacity-90 border border-gray-700'} px-4 py-2 rounded-lg font-medium shadow-lg`}>
            {currentSlide + 1} / {slides.length}
          </div>
        )}
      </div>
      
      {/* PDF Export Modal */}
      {showPDFExport && (
        <PDFExporter 
          onClose={() => setShowPDFExport(false)} 
        />
      )}
    </div>
  );
};

export default SlidePreview;
