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
      container.style.cssText = `
        position: fixed;
        left: -9999px;
        top: 0;
        width: 210mm;
        background-color: white;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        z-index: -1000;
      `;
      document.body.appendChild(container);

      // Process each slide
      for (let index = 0; index < slides.length; index++) {
        const slide = slides[index];
        setExportProgress((index + 1) / slides.length * 60); // First 60% for processing
        
        if (!slide.content || slide.content.trim() === '') {
          continue; // Skip empty slides
        }
        
        const slideDiv = document.createElement('div');
        slideDiv.style.cssText = `
          width: 210mm;
          min-height: 297mm;
          padding: 20mm;
          box-sizing: border-box;
          background-color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          page-break-after: ${index < slides.length - 1 ? 'always' : 'auto'};
          position: relative;
          overflow: hidden;
        `;
        
        // Apply custom slide styles if any
        const slideStyles = generateSlideStyles(slide.attributes);
        if (slideStyles.backgroundColor) {
          slideDiv.style.backgroundColor = slideStyles.backgroundColor;
        }
        if (slideStyles.backgroundImage) {
          slideDiv.style.backgroundImage = slideStyles.backgroundImage;
          slideDiv.style.backgroundSize = 'cover';
          slideDiv.style.backgroundPosition = 'center';
          slideDiv.style.backgroundRepeat = 'no-repeat';
        }
        
        // Create content wrapper
        const contentWrapper = document.createElement('div');
        contentWrapper.style.cssText = `
          width: 100%;
          max-width: 100%;
          text-align: center;
          color: #1f2937;
        `;
        
        // Process the slide content with proper styling
        const processedContent = slide.content
          .replace(/<div class="slide-content">[\s\S]*?>(.*?)<\/div>/, '$1')
          .replace(/<div class="slide-content">(.*?)<\/div>/g, '$1')
          .replace(/<h1[^>]*>/g, '<h1 style="font-size: 48px; font-weight: 800; margin-bottom: 32px; color: #0f172a; text-align: center; line-height: 1.2;">')
          .replace(/<h2[^>]*>/g, '<h2 style="font-size: 36px; font-weight: 700; margin-bottom: 24px; color: #1e293b; text-align: center; line-height: 1.3;">')
          .replace(/<h3[^>]*>/g, '<h3 style="font-size: 28px; font-weight: 600; margin-bottom: 20px; color: #334155; text-align: center; line-height: 1.4;">')
          .replace(/<p[^>]*>/g, '<p style="font-size: 20px; line-height: 1.7; margin-bottom: 16px; color: #475569; text-align: center;">')
          .replace(/<ul[^>]*>/g, '<ul style="text-align: left; margin: 16px auto; padding-left: 32px; color: #475569; display: inline-block; font-size: 18px; line-height: 1.6;">')
          .replace(/<ol[^>]*>/g, '<ol style="text-align: left; margin: 16px auto; padding-left: 32px; color: #475569; display: inline-block; font-size: 18px; line-height: 1.6;">')
          .replace(/<li[^>]*>/g, '<li style="margin-bottom: 8px;">')
          .replace(/<code[^>]*>/g, '<code style="background-color: #f1f5f9; color: #dc2626; padding: 4px 8px; border-radius: 4px; font-family: \'JetBrains Mono\', monospace; font-size: 16px; border: 1px solid #e2e8f0;">')
          .replace(/<div class="code-wrapper"><pre><code>/g, '<div style="text-align: center; margin: 24px 0;"><pre style="background-color: #1e293b; color: #e2e8f0; padding: 24px; border-radius: 8px; font-family: \'JetBrains Mono\', monospace; font-size: 14px; line-height: 1.5; text-align: left; display: inline-block; max-width: 100%; overflow-x: auto; border: 1px solid #334155; white-space: pre-wrap;"><code>')
          .replace(/<\/code><\/pre><\/div>/g, '</code></pre></div>')
          .replace(/<pre><code[^>]*>/g, '<div style="text-align: center; margin: 24px 0;"><pre style="background-color: #1e293b; color: #e2e8f0; padding: 24px; border-radius: 8px; font-family: \'JetBrains Mono\', monospace; font-size: 14px; line-height: 1.5; text-align: left; display: inline-block; max-width: 100%; overflow-x: auto; border: 1px solid #334155; white-space: pre-wrap;"><code>')
          .replace(/<\/code><\/pre>/g, '</code></pre></div>')
          .replace(/<blockquote[^>]*>/g, '<blockquote style="border-left: 4px solid #3b82f6; background-color: #f8fafc; padding: 16px 24px; margin: 24px auto; font-style: italic; border-radius: 4px; text-align: left; max-width: 80%; color: #475569; font-size: 18px;">')
          .replace(/<a[^>]*>/g, '<a style="color: #2563eb; text-decoration: underline; font-weight: 500;">');
        
        contentWrapper.innerHTML = processedContent;
        slideDiv.appendChild(contentWrapper);
        container.appendChild(slideDiv);
      }

      if (container.children.length === 0) {
        throw new Error('No slides to export. Please add some content to your presentation.');
      }

      setExportProgress(70); // 70% - starting PDF generation

      // PDF options optimized for presentation slides
      const options = {
        margin: 0,
        filename: `${currentDocument?.title || 'presentation'}.pdf`,
        image: { 
          type: 'jpeg', 
          quality: 0.98 
        },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          letterRendering: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          windowWidth: 794,
          windowHeight: 1123
        },
        jsPDF: { 
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait' as const
        },
        pagebreak: { 
          mode: ['css', 'legacy'],
          before: '.slide-page-break'
        }
      };

      setExportProgress(85); // 85% - generating PDF

      // Generate PDF
      await html2pdf().set(options).from(container).save();
      
      setExportProgress(100); // 100% - complete
      
      // Cleanup
      document.body.removeChild(container);
      
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