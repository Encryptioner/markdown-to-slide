'use client';

import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { generateSlideStyles } from '@/utils/markdownParser';

interface PDFExportProps {
  onClose?: () => void;
}

const PDFExporter: React.FC<PDFExportProps> = ({ onClose }) => {
  const { slides, currentDocument, currentSlide, setCurrentSlide } = useApp();
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const exportToPDF = async () => {
    if (slides.length === 0) return;

    setIsExporting(true);
    setExportProgress(0);

    try {
      // Dynamically import html2pdf.js to avoid SSR issues
      const html2pdf = (await import('html2pdf.js')).default;
      
      // Find the slide preview container to capture actual rendered slides
      const slideViewer = document.querySelector('.slide-content');
      if (!slideViewer) {
        throw new Error('Could not find slide viewer. Please make sure slides are visible.');
      }
      
      // Create container for all PDF pages
      const pdfContainer = document.createElement('div');
      pdfContainer.style.cssText = `
        position: fixed;
        left: -9999px;
        top: 0;
        width: 794px;
        height: auto;
        background: white;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        z-index: -1000;
      `;
      document.body.appendChild(pdfContainer);
      
      // Store original slide index  
      const originalSlide = currentSlide;
      
      // Process each slide by temporarily switching to it
      for (let slideIndex = 0; slideIndex < slides.length; slideIndex++) {
        setExportProgress((slideIndex / slides.length) * 80); // 80% for processing slides
        
        const slide = slides[slideIndex];
        if (!slide.content || slide.content.trim() === '') {
          continue;
        }
        
        // Switch to this slide to render it properly
        setCurrentSlide(slideIndex);
        
        // Wait for slide to render
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Create a page for this slide
        const slidePage = document.createElement('div');
        slidePage.style.cssText = `
          width: 794px;
          height: 1123px;
          padding: 60px;
          box-sizing: border-box;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          page-break-after: ${slideIndex < slides.length - 1 ? 'always' : 'auto'};
          position: relative;
        `;
        
        // Apply custom slide background if any
        const slideStyles = generateSlideStyles(slide.attributes);
        if (slideStyles.backgroundColor) {
          slidePage.style.backgroundColor = slideStyles.backgroundColor;
        }
        if (slideStyles.backgroundImage) {
          slidePage.style.backgroundImage = slideStyles.backgroundImage;
          slidePage.style.backgroundSize = 'cover';
          slidePage.style.backgroundPosition = 'center';
          slidePage.style.backgroundRepeat = 'no-repeat';
        }
        
        // Create content container
        const contentDiv = document.createElement('div');
        contentDiv.style.cssText = `
          width: 100%;
          text-align: center;
          color: #1f2937;
        `;
        
        // Copy and style the slide content
        const processedContent = slide.content
          .replace(/<div class="slide-content"[^>]*>/, '')
          .replace(/<\/div>$/, '')
          .replace(/<h1[^>]*>/g, '<h1 style="font-size: 2.5rem; font-weight: 800; margin-bottom: 2rem; color: #0f172a; text-align: center; line-height: 1.2;">')
          .replace(/<h2[^>]*>/g, '<h2 style="font-size: 2rem; font-weight: 700; margin-bottom: 1.5rem; color: #1e293b; text-align: center; line-height: 1.3;">')
          .replace(/<h3[^>]*>/g, '<h3 style="font-size: 1.5rem; font-weight: 600; margin-bottom: 1rem; color: #334155; text-align: center; line-height: 1.4;">')
          .replace(/<p[^>]*>/g, '<p style="font-size: 1.25rem; line-height: 1.7; margin-bottom: 1rem; color: #475569; text-align: center;">')
          .replace(/<ul[^>]*>/g, '<ul style="text-align: left; margin: 1rem auto; padding-left: 2rem; color: #475569; display: inline-block; font-size: 1.125rem; line-height: 1.6;">')
          .replace(/<ol[^>]*>/g, '<ol style="text-align: left; margin: 1rem auto; padding-left: 2rem; color: #475569; display: inline-block; font-size: 1.125rem; line-height: 1.6;">')
          .replace(/<li[^>]*>/g, '<li style="margin-bottom: 0.5rem;">')
          .replace(/<code[^>]*>/g, '<code style="background: #f1f5f9; color: #dc2626; padding: 4px 8px; border-radius: 4px; font-family: \'JetBrains Mono\', monospace; font-size: 0.9em; border: 1px solid #e2e8f0;">')
          .replace(/<div class="code-wrapper">/g, '<div style="text-align: center; margin: 1.5rem 0;">')
          .replace(/<pre[^>]*>/g, '<pre style="background: #1e293b; color: #e2e8f0; padding: 1.5rem; border-radius: 8px; font-family: \'JetBrains Mono\', monospace; font-size: 0.875rem; line-height: 1.5; text-align: left; display: inline-block; max-width: 90%; overflow-x: auto; border: 1px solid #334155; white-space: pre-wrap;">')
          .replace(/<blockquote[^>]*>/g, '<blockquote style="border-left: 4px solid #3b82f6; background: #f8fafc; padding: 1rem 1.5rem; margin: 1.5rem auto; font-style: italic; border-radius: 4px; text-align: left; max-width: 80%; color: #475569; font-size: 1.125rem;">')
          .replace(/<a[^>]*>/g, '<a style="color: #2563eb; text-decoration: underline; font-weight: 500;">');
        
        contentDiv.innerHTML = processedContent;
        slidePage.appendChild(contentDiv);
        pdfContainer.appendChild(slidePage);
      }
      
      // Restore original slide
      setCurrentSlide(originalSlide);
      
      if (pdfContainer.children.length === 0) {
        throw new Error('No slides to export. Please add some content to your presentation.');
      }

      setExportProgress(85); // 85% - generating PDF

      // PDF generation options
      const options = {
        margin: 0,
        filename: `${currentDocument?.title || 'presentation'}.pdf`,
        image: { 
          type: 'jpeg', 
          quality: 0.95 
        },
        html2canvas: { 
          scale: 1.5,
          useCORS: true,
          letterRendering: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: 794,
          height: 1123,
          logging: false
        },
        jsPDF: { 
          unit: 'px',
          format: [794, 1123],
          orientation: 'portrait' as const
        },
        pagebreak: { 
          mode: ['css', 'legacy'] 
        }
      };

      // Generate the PDF
      await html2pdf().set(options).from(pdfContainer).save();
      
      setExportProgress(100);
      
      // Cleanup
      document.body.removeChild(pdfContainer);
      
    } catch (error) {
      console.error('PDF export failed:', error);
      alert(`Failed to export PDF: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    } finally {
      setIsExporting(false);
      setExportProgress(0);
      onClose?.();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 px-2 sm:px-4">
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xl w-full max-w-xs sm:max-w-sm md:max-w-md mx-2 sm:mx-4">
        <h3 className="text-lg font-semibold mb-4">Export to PDF</h3>
        
        {isExporting ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Generating PDF...</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${exportProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 text-center">
              Processing slide {Math.ceil(exportProgress * slides.length / 100)} of {slides.length}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 space-y-2">
              <p><strong>Slides to export:</strong> {slides.length}</p>
              <p><strong>Format:</strong> PDF (A4)</p>
              <p><strong>Filename:</strong> {currentDocument?.title || 'presentation'}.pdf</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors order-2 sm:order-1"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={exportToPDF}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors order-1 sm:order-2"
                type="button"
              >
                📄 Export PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFExporter;