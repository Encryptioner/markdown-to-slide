'use client';

import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { generateSlideStyles } from '@/utils/markdownParser';

interface PDFExportProps {
  onClose?: () => void;
}

const PDFExporter: React.FC<PDFExportProps> = ({ onClose }) => {
  const { slides, currentDocument } = useApp();
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const exportToPDF = async () => {
    if (slides.length === 0) return;

    setIsExporting(true);
    setExportProgress(0);

    try {
      // Dynamically import html2pdf.js to avoid SSR issues
      const html2pdf = (await import('html2pdf.js')).default;
      // Create a temporary container for all slides
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.left = '-9999px';
      container.style.top = '-9999px';
      container.style.width = '794px'; // A4 width in pixels at 96 DPI
      container.style.height = 'auto';
      container.style.backgroundColor = 'white';
      container.style.fontFamily = 'Arial, sans-serif';
      document.body.appendChild(container);

      // Create slides with proper styling
      slides.forEach((slide, index) => {
        setExportProgress((index + 1) / slides.length * 100);
        
        const slideDiv = document.createElement('div');
        slideDiv.style.width = '794px';
        slideDiv.style.minHeight = '1123px'; // A4 height in pixels
        slideDiv.style.padding = '60px';
        slideDiv.style.boxSizing = 'border-box';
        slideDiv.style.backgroundColor = 'white';
        slideDiv.style.display = 'flex';
        slideDiv.style.alignItems = 'center';
        slideDiv.style.justifyContent = 'center';
        slideDiv.style.pageBreakAfter = 'always';
        slideDiv.style.fontSize = '18px';
        slideDiv.style.lineHeight = '1.6';
        slideDiv.style.color = '#1f2937';
        
        // Apply custom slide styles if any
        const slideStyles = generateSlideStyles(slide.attributes);
        Object.assign(slideDiv.style, slideStyles);
        
        // Create content wrapper
        const contentWrapper = document.createElement('div');
        contentWrapper.style.width = '100%';
        contentWrapper.style.textAlign = 'center';
        
        // Clean up the slide content and add proper styling
        const cleanContent = slide.content
          .replace(/class="slide-content"/g, '')
          .replace(/<div[^>]*>/g, '<div>')
          .replace(/<h1[^>]*>/g, '<h1 style="font-size: 2.5rem; font-weight: bold; margin-bottom: 1.5rem; color: #0f172a;">')
          .replace(/<h2[^>]*>/g, '<h2 style="font-size: 2rem; font-weight: bold; margin-bottom: 1.25rem; color: #1e293b;">')
          .replace(/<h3[^>]*>/g, '<h3 style="font-size: 1.5rem; font-weight: 600; margin-bottom: 1rem; color: #334155;">')
          .replace(/<p[^>]*>/g, '<p style="font-size: 1.25rem; line-height: 1.7; margin-bottom: 1rem; color: #475569;">')
          .replace(/<ul[^>]*>/g, '<ul style="text-align: left; margin: 1rem 0; padding-left: 2rem; color: #475569;">')
          .replace(/<ol[^>]*>/g, '<ol style="text-align: left; margin: 1rem 0; padding-left: 2rem; color: #475569;">')
          .replace(/<li[^>]*>/g, '<li style="margin-bottom: 0.5rem;">');
        
        contentWrapper.innerHTML = cleanContent;
        slideDiv.appendChild(contentWrapper);
        container.appendChild(slideDiv);
      });

      // PDF options
      const options = {
        margin: 0,
        filename: `${currentDocument?.title || 'presentation'}.pdf`,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { 
          scale: 1,
          useCORS: true,
          letterRendering: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: 794,
          height: container.scrollHeight
        },
        jsPDF: { 
          unit: 'px', 
          format: [794, 1123], 
          orientation: 'portrait'
        }
      };

      // Generate PDF
      await html2pdf().set(options).from(container).save();
      
      // Cleanup
      document.body.removeChild(container);
      
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
      setExportProgress(0);
      onClose?.();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xl w-full max-w-sm sm:max-w-md">
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
              {Math.ceil(exportProgress * slides.length / 100)} / {slides.length} slides
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 space-y-2">
              <p><strong>Slides to export:</strong> {slides.length}</p>
              <p><strong>Format:</strong> PDF (A4)</p>
              <p><strong>Filename:</strong> {currentDocument?.title || 'presentation'}.pdf</p>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={exportToPDF}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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