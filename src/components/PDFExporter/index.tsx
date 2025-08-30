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
      // Dynamic imports to avoid SSR issues
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      // Create PDF document
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [297, 210] // A4 landscape
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Remove the first page (jsPDF creates one by default)
      let isFirstPage = true;

      // Process each slide
      for (let slideIndex = 0; slideIndex < slides.length; slideIndex++) {
        setExportProgress((slideIndex / slides.length) * 90);
        
        const slide = slides[slideIndex];
        if (!slide.content || slide.content.trim() === '') {
          continue;
        }

        // Create slide element for rendering
        const slideElement = document.createElement('div');
        slideElement.style.cssText = `
          width: 1056px;
          height: 594px;
          padding: 60px;
          box-sizing: border-box;
          background: white;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          position: fixed;
          left: -9999px;
          top: 0;
          z-index: -1000;
        `;

        // Apply slide background
        const slideStyles = generateSlideStyles(slide.attributes);
        if (slideStyles.backgroundColor) {
          slideElement.style.backgroundColor = slideStyles.backgroundColor;
        }
        if (slideStyles.backgroundImage) {
          slideElement.style.backgroundImage = slideStyles.backgroundImage;
          slideElement.style.backgroundSize = 'cover';
          slideElement.style.backgroundPosition = 'center';
        }

        // Create content container
        const contentContainer = document.createElement('div');
        contentContainer.style.cssText = `
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          overflow: hidden;
        `;

        // Parse and style the content
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = slide.content;
        
        // Apply styles to elements
        tempDiv.querySelectorAll('h1').forEach(h1 => {
          h1.setAttribute('style', 'font-size: 3.5rem; font-weight: 800; margin: 2rem 0; color: #1f2937; text-align: center; line-height: 1.2;');
        });

        tempDiv.querySelectorAll('h2').forEach(h2 => {
          h2.setAttribute('style', 'font-size: 2.75rem; font-weight: 700; margin: 1.5rem 0; color: #374151; text-align: center; line-height: 1.3;');
        });

        tempDiv.querySelectorAll('h3').forEach(h3 => {
          h3.setAttribute('style', 'font-size: 2rem; font-weight: 600; margin: 1.25rem 0; color: #4b5563; text-align: center; line-height: 1.4;');
        });

        tempDiv.querySelectorAll('p').forEach(p => {
          p.setAttribute('style', 'font-size: 1.5rem; line-height: 1.6; margin: 1rem 0; color: #6b7280; text-align: center;');
        });

        tempDiv.querySelectorAll('ul, ol').forEach(list => {
          list.setAttribute('style', 'font-size: 1.25rem; line-height: 1.6; margin: 1rem auto; color: #6b7280; text-align: left; max-width: 80%;');
        });

        tempDiv.querySelectorAll('li').forEach(li => {
          li.setAttribute('style', 'margin: 0.5rem 0;');
        });

        tempDiv.querySelectorAll('code').forEach(code => {
          if (!code.parentElement?.tagName.toLowerCase().includes('pre')) {
            code.setAttribute('style', 'background: #f3f4f6; color: #dc2626; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-family: "JetBrains Mono", monospace; font-size: 1rem;');
          }
        });

        tempDiv.querySelectorAll('pre').forEach(pre => {
          pre.setAttribute('style', 'background: #1f2937; color: #e5e7eb; padding: 1.5rem; border-radius: 0.5rem; font-family: "JetBrains Mono", monospace; font-size: 1rem; margin: 1.5rem auto; max-width: 90%; text-align: left; white-space: pre-wrap;');
          const codeInPre = pre.querySelector('code');
          if (codeInPre) {
            codeInPre.setAttribute('style', 'background: transparent; color: inherit; padding: 0; border-radius: 0;');
          }
        });

        contentContainer.innerHTML = tempDiv.innerHTML;
        slideElement.appendChild(contentContainer);
        document.body.appendChild(slideElement);

        // Wait for fonts to load
        await new Promise(resolve => setTimeout(resolve, 100));

        // Capture slide as canvas
        const canvas = await html2canvas(slideElement, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: slideStyles.backgroundColor || '#ffffff',
          logging: false,
          width: 1056,
          height: 594
        });

        // Remove element from DOM
        document.body.removeChild(slideElement);

        // Add page to PDF (except for first slide)
        if (!isFirstPage) {
          pdf.addPage();
        }
        isFirstPage = false;

        // Add canvas to PDF
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight);
      }

      setExportProgress(95);

      // Save PDF
      pdf.save(`${currentDocument?.title || 'presentation'}.pdf`);
      
      setExportProgress(100);
      
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