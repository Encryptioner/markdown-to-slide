'use client';

import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';

interface PDFExportProps {
  onClose?: () => void;
  isFullscreenTheme?: boolean;
}

// Define types for pdfmake content
interface ContentText {
  text: string | ContentText[];
  style?: string;
  bold?: boolean;
  italics?: boolean;
  fontSize?: number;
  color?: string;
  alignment?: 'left' | 'center' | 'right';
  margin?: [number, number, number, number];
  link?: string;
  decoration?: string;
  preserveLeadingSpaces?: boolean;
}

interface ContentList {
  ul?: ContentText[];
  ol?: ContentText[];
  style?: string;
  margin?: [number, number, number, number];
  alignment?: 'left' | 'center' | 'right';
}

interface ContentCanvas {
  canvas: {
    type: string;
    x: number;
    y: number;
    w: number;
    h: number;
    color: string;
  }[];
}

interface ContentTable {
  table: {
    widths: string[];
    body: ContentText[][];
  };
  layout: string;
  alignment: 'left' | 'center' | 'right';
  margin?: [number, number, number, number];
}

interface PageBreak {
  text: string;
  pageBreak: 'before';
}

type Content = ContentText | ContentList | ContentCanvas | ContentTable | PageBreak;

interface DocumentDefinition {
  pageSize: {
    width: number;
    height: number;
  };
  pageMargins: [number, number, number, number];
  content: Content[];
  styles: {
    [key: string]: {
      fontSize?: number;
      bold?: boolean;
      color?: string;
      alignment?: 'left' | 'center' | 'right';
      lineHeight?: number;
      margin?: [number, number, number, number];
      decoration?: string;
      background?: string;
      font?: string;
    };
  };
  defaultStyle: {
    fontSize?: number;
    font?: string;
  };
}

const PDFExporter: React.FC<PDFExportProps> = ({ onClose, isFullscreenTheme = false }) => {
  const { slides, currentDocument } = useApp();
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  // Helper function to convert HTML to pdfMake content
  const convertHtmlToPdfMake = (htmlString: string): Content[] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const content: Content[] = [];
    
    const processNode = (node: Node): Content | Content[] | null => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        return text ? { text, style: 'normal' } as ContentText : null;
      }
      
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        const tagName = element.tagName.toLowerCase();
        
        switch (tagName) {
          case 'h1':
            return {
              text: element.textContent || '',
              style: 'header1',
              margin: [0, 20, 0, 10],
              alignment: 'center'
            } as ContentText;
            
          case 'h2':
            return {
              text: element.textContent || '',
              style: 'header2',
              margin: [0, 15, 0, 8],
              alignment: 'center'
            } as ContentText;
            
          case 'h3':
            return {
              text: element.textContent || '',
              style: 'header3',
              margin: [0, 12, 0, 6],
              alignment: 'center'
            } as ContentText;
            
          case 'p':
            const pContent: ContentText[] = [];
            Array.from(element.childNodes).forEach(child => {
              const childContent = processNode(child);
              if (childContent && !Array.isArray(childContent)) {
                pContent.push(childContent as ContentText);
              }
            });
            return {
              text: pContent.length > 0 ? pContent : element.textContent || '',
              style: 'paragraph',
              margin: [0, 5, 0, 5],
              alignment: 'center'
            } as ContentText;
            
          case 'a':
            const href = element.getAttribute('href');
            if (href) {
              return {
                text: element.textContent || href,
                link: href,
                style: 'link'
              } as ContentText;
            }
            break;
            
          case 'ul':
            const ulItems: ContentText[] = [];
            Array.from(element.children).forEach(li => {
              if (li.tagName.toLowerCase() === 'li') {
                ulItems.push({
                  text: li.textContent || '',
                  style: 'listItem'
                });
              }
            });
            return {
              ul: ulItems,
              style: 'list',
              margin: [0, 10, 0, 10],
              alignment: 'center'
            } as ContentList;
            
          case 'ol':
            const olItems: ContentText[] = [];
            Array.from(element.children).forEach(li => {
              if (li.tagName.toLowerCase() === 'li') {
                olItems.push({
                  text: li.textContent || '',
                  style: 'listItem'
                });
              }
            });
            return {
              ol: olItems,
              style: 'list',
              margin: [0, 10, 0, 10],
              alignment: 'center'
            } as ContentList;
            
          case 'code':
            const isInPre = element.closest('pre');
            return {
              text: element.textContent || '',
              style: isInPre ? 'codeBlock' : 'inlineCode'
            } as ContentText;
            
          case 'pre':
            const codeContent = element.querySelector('code')?.textContent || element.textContent || '';
            // Create a centered wrapper with left-aligned code content
            return {
              table: {
                widths: ['auto'],
                body: [[
                  {
                    text: codeContent,
                    style: 'codeBlock',
                    preserveLeadingSpaces: true,
                    alignment: 'left'
                  }
                ]]
              },
              layout: {
                fillColor: () => '#1e293b',
                paddingLeft: () => 15,
                paddingRight: () => 15,
                paddingTop: () => 10,
                paddingBottom: () => 10,
                hLineWidth: () => 0,
                vLineWidth: () => 0
              },
              alignment: 'center',
              margin: [50, 15, 50, 15]
            } as ContentTable;
            
          case 'strong':
          case 'b':
            return {
              text: element.textContent || '',
              fontSize: 13,
              color: '#1f2937'
            } as ContentText;
            
          case 'em':
          case 'i':
            return {
              text: element.textContent || '',
              italics: true
            } as ContentText;
            
          case 'br':
            return { text: '\n' } as ContentText;
            
          case 'div':
            const divContent: Content[] = [];
            Array.from(element.childNodes).forEach(child => {
              const childContent = processNode(child);
              if (childContent) {
                if (Array.isArray(childContent)) {
                  divContent.push(...childContent);
                } else {
                  divContent.push(childContent);
                }
              }
            });
            return divContent;
            
          default:
            // For unknown elements, process children
            const unknownContent: Content[] = [];
            Array.from(element.childNodes).forEach(child => {
              const childContent = processNode(child);
              if (childContent) {
                if (Array.isArray(childContent)) {
                  unknownContent.push(...childContent);
                } else {
                  unknownContent.push(childContent);
                }
              }
            });
            return unknownContent;
        }
      }
      
      return null;
    };
    
    Array.from(doc.body.childNodes).forEach(node => {
      const result = processNode(node);
      if (result) {
        if (Array.isArray(result)) {
          content.push(...result);
        } else {
          content.push(result);
        }
      }
    });
    
    return content;
  };

  const exportToPDF = async () => {
    if (slides.length === 0) return;

    setIsExporting(true);
    setExportProgress(0);

    try {
      // Dynamic import to avoid SSR issues
      const pdfMake = (await import('pdfmake/build/pdfmake')).default;
      const pdfFonts = await import('pdfmake/build/vfs_fonts');
      
      // Configure fonts with proper error handling
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fontsVfs = (pdfFonts as any).pdfMake?.vfs || (pdfFonts as any).vfs || {};
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (pdfMake as any).vfs = fontsVfs;
      } catch (fontError) {
        console.warn('Could not load PDF fonts, using default fonts:', fontError);
        // Continue without custom fonts
      }

      // Define colors based on theme - Always use light theme for PDF export
      const isDarkTheme = false; // Force light theme for PDF export
      const colors = isDarkTheme ? {
        header1: '#ffffff',
        header2: '#ffffff', 
        header3: '#ffffff',
        paragraph: '#e2e8f0',
        normal: '#ffffff',
        link: '#60a5fa',
        list: '#e2e8f0',
        listItem: '#e2e8f0',
        inlineCode: '#fbbf24',
        codeBlockText: '#e2e8f0',
        codeBlockBg: 'rgba(0, 0, 0, 0.3)',
        pageBackground: '#000000'
      } : {
        header1: '#0f172a',
        header2: '#1e293b',
        header3: '#334155',
        paragraph: '#475569',
        normal: '#374151',
        link: '#2563eb',
        list: '#374151',
        listItem: '#374151',
        inlineCode: '#dc2626',
        codeBlockText: '#e2e8f0',
        codeBlockBg: '#1e293b',
        pageBackground: '#ffffff'
      };

      // Define PDF document structure (using default fonts to avoid font provider errors)
      const docDefinition: DocumentDefinition = {
        pageSize: {
          width: 842, // A4 landscape width in points
          height: 595  // A4 landscape height in points
        },
        pageMargins: [40, 40, 40, 40],
        content: [],
        styles: {
          header1: {
            fontSize: 28,
            color: colors.header1,
            alignment: 'center'
          },
          header2: {
            fontSize: 22,
            color: colors.header2,
            alignment: 'center'
          },
          header3: {
            fontSize: 18,
            color: colors.header3,
            alignment: 'center'
          },
          paragraph: {
            fontSize: 12,
            color: colors.paragraph,
            alignment: 'center',
            lineHeight: 1.4
          },
          normal: {
            fontSize: 12,
            color: colors.normal
          },
          link: {
            fontSize: 12,
            color: colors.link,
            decoration: 'underline'
          },
          list: {
            fontSize: 12,
            color: colors.list
          },
          listItem: {
            fontSize: 12,
            color: colors.listItem,
            margin: [0, 3, 0, 3]
          },
          inlineCode: {
            fontSize: 11,
            color: colors.inlineCode,
            background: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : '#f1f5f9'
          },
          codeBlock: {
            fontSize: 11,
            color: colors.codeBlockText,
            background: colors.codeBlockBg,
            alignment: 'left',
            margin: [0, 15, 0, 15]
          }
        },
        defaultStyle: {
          fontSize: 12
        }
      };

      // Process each slide
      for (let slideIndex = 0; slideIndex < slides.length; slideIndex++) {
        setExportProgress((slideIndex / slides.length) * 90);
        
        const slide = slides[slideIndex];
        if (!slide.content || slide.content.trim() === '') {
          continue;
        }

        // Convert HTML to pdfMake content
        const slideContent = convertHtmlToPdfMake(slide.content);
        
        // Calculate content height and scale if needed (basic implementation)
        const maxPageHeight = 515; // Available height minus margins
        const estimatedHeight = slideContent.length * 20; // Rough estimate
        
        if (estimatedHeight > maxPageHeight) {
          // Scale down content to fit
          const scale = maxPageHeight / estimatedHeight;
          slideContent.forEach((content) => {
            if ('fontSize' in content && typeof content.fontSize === 'number') {
              (content as ContentText).fontSize = Math.max(8, content.fontSize * scale);
            }
          });
        }
        
        // Add page break for slides after the first
        if (slideIndex > 0) {
          docDefinition.content.push({ text: '', pageBreak: 'before' } as PageBreak);
        }
        
        // Add dark background for theme if enabled
        if (isDarkTheme) {
          docDefinition.content.push({
            canvas: [{
              type: 'rect',
              x: -40,
              y: -40,
              w: 842, // Full page width
              h: 595, // Full page height
              color: colors.pageBackground
            }]
          } as ContentCanvas);
        }
        
        // Add slide background color if specified
        if (slide.attributes?.backgroundColor && !isDarkTheme) {
          docDefinition.content.push({
            canvas: [{
              type: 'rect',
              x: 0,
              y: 0,
              w: 762, // Page width minus margins
              h: 515, // Page height minus margins
              color: slide.attributes.backgroundColor
            }]
          } as ContentCanvas);
        }
        
        docDefinition.content.push(...slideContent);
      }

      setExportProgress(95);

      // Generate and download PDF
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdfDoc = (pdfMake as any).createPdf(docDefinition);
      pdfDoc.download(`${currentDocument?.title || 'presentation'}.pdf`);
      
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
            <p className="text-sm text-gray-600">Generating PDF with selectable text...</p>
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
              <p><strong>Format:</strong> PDF (A4) with selectable text</p>
              <p><strong>Features:</strong> ✓ Text selection ✓ Clickable links</p>
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