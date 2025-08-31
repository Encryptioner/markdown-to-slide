'use client';

import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { basePublicPath } from '@/utils/constants';

interface PDFExportProps {
  onClose?: () => void;
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
  layout: {
    fillColor: () => string;
    paddingLeft: () => number;
    paddingRight: () => number;
    paddingTop: () => number;
    paddingBottom: () => number;
    hLineWidth: () => number;
    vLineWidth: () => number;
  };
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

const PDFExporter: React.FC<PDFExportProps> = ({ onClose }) => {
  const { slides, currentDocument } = useApp();
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  // Helper function to detect if a character is an emoji using modern Unicode property escapes
  const isEmojiChar = (char: string): boolean => {
    try {
      // Modern approach using Unicode property escapes (ES2018+)
      return /\p{Extended_Pictographic}/u.test(char) || /\p{Emoji}/u.test(char);
    } catch {
      // Comprehensive fallback for older environments - covers all major emoji ranges
      return /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F018}-\u{1F270}]|[\u{25AA}-\u{25AB}]|[\u{25B6}]|[\u{25C0}]|[\u{25FB}-\u{25FE}]|[\u{2B05}-\u{2B07}]|[\u{2B1B}-\u{2B1C}]|[\u{2B50}]|[\u{2B55}]|[\u{203C}]|[\u{2049}]|[\u{00A9}]|[\u{00AE}]|[\u{2122}]|[\u{2139}]|[\u{3030}]|[\u{303D}]|[\u{3297}]|[\u{3299}]|[\u{1F004}]|[\u{1F0CF}]|[\u{1F170}-\u{1F171}]|[\u{1F17E}-\u{1F17F}]|[\u{1F18E}]|[\u{1F191}-\u{1F19A}]|[\u{1F201}-\u{1F202}]|[\u{1F21A}]|[\u{1F22F}]|[\u{1F232}-\u{1F23A}]|[\u{1F250}-\u{1F251}]|[\u{231A}-\u{231B}]|[\u{2328}]|[\u{23CF}]|[\u{23E9}-\u{23F3}]|[\u{23F8}-\u{23FA}]|[\u{24C2}]|[\u{25AA}-\u{25AB}]|[\u{25B6}]|[\u{25C0}]|[\u{25FB}-\u{25FE}]|[\u{2934}-\u{2935}]|[\u{2B05}-\u{2B07}]|[\u{2B1B}-\u{2B1C}]|[\u{2B50}]|[\u{2B55}]/u.test(char);
    }
  };

  // Helper function to split text into emoji and non-emoji parts
  const splitTextWithEmoji = (text: string): Array<{ text: string; isEmoji: boolean }> => {
    const parts: Array<{ text: string; isEmoji: boolean }> = [];
    let currentText = '';
    let currentIsEmoji = false;
    let isFirstChar = true;

    // Split the text by characters, handling surrogate pairs properly
    for (const char of text) {
      const charIsEmoji = isEmojiChar(char);
      
      if (isFirstChar) {
        currentText = char;
        currentIsEmoji = charIsEmoji;
        isFirstChar = false;
      } else if (charIsEmoji === currentIsEmoji) {
        // Same type, add to current part
        currentText += char;
      } else {
        // Different type, save current part and start new one
        if (currentText.trim()) {
          parts.push({
            text: currentText,
            isEmoji: currentIsEmoji
          });
        }
        currentText = char;
        currentIsEmoji = charIsEmoji;
      }
    }
    
    // Add the last part
    if (currentText.trim()) {
      parts.push({
        text: currentText,
        isEmoji: currentIsEmoji
      });
    }
    
    return parts.filter(part => part.text.length > 0);
  };

  // Helper function to create mixed text content with proper font assignments
  const createMixedTextContent = (text: string, baseStyle: string, alignment?: 'left' | 'center' | 'right', margin?: [number, number, number, number], availableFonts?: Record<string, Record<string, string>>): ContentText => {
    const parts = splitTextWithEmoji(text);
    
    if (parts.length === 1 && !parts[0].isEmoji) {
      // No emoji, return simple text
      return {
        text: text,
        style: baseStyle,
        alignment: alignment,
        margin: margin
      } as ContentText;
    }
    
    // Determine the best emoji font to use
    const emojiFont = availableFonts?.NotoEmoji ? 'NotoEmoji' : 'OpenSansEmoji';
    
    // Mixed content with emojis
    const textParts = parts.map(part => ({
      text: part.text,
      style: baseStyle,
      font: part.isEmoji ? emojiFont : 'Roboto'
    }));
    
    return {
      text: textParts,
      style: baseStyle,
      alignment: alignment,
      margin: margin
    } as ContentText;
  };

  // Helper function to convert HTML to pdfMake content
  const convertHtmlToPdfMake = (htmlString: string, availableFonts: Record<string, Record<string, string>>): Content[] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const content: Content[] = [];
    
    const processNode = (node: Node): Content | Content[] | null => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        return text ? { text: text, style: 'normal' } as ContentText : null;
      }
      
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        const tagName = element.tagName.toLowerCase();
        
        switch (tagName) {
          case 'h1':
            return createMixedTextContent(
              element.textContent || '',
              'header1',
              'center',
              [0, 20, 0, 10],
              availableFonts
            );
            
          case 'h2':
            return createMixedTextContent(
              element.textContent || '',
              'header2',
              'center',
              [0, 15, 0, 8],
              availableFonts
            );
            
          case 'h3':
            return createMixedTextContent(
              element.textContent || '',
              'header3',
              'center',
              [0, 12, 0, 6],
              availableFonts
            );
            
          case 'p':
            const pContent: ContentText[] = [];
            Array.from(element.childNodes).forEach(child => {
              const childContent = processNode(child);
              if (childContent && !Array.isArray(childContent)) {
                pContent.push(childContent as ContentText);
              }
            });
            if (pContent.length > 0) {
              return {
                text: pContent,
                style: 'paragraph',
                margin: [0, 5, 0, 5],
                alignment: 'center'
              } as ContentText;
            }
            return createMixedTextContent(
              element.textContent || '',
              'paragraph',
              'center',
              [0, 5, 0, 5],
              availableFonts
            );
            
          case 'a':
            const href = element.getAttribute('href');
            if (href) {
              const linkContent = createMixedTextContent(
                element.textContent || href,
                'link',
                undefined,
                undefined,
                availableFonts
              );
              linkContent.link = href;
              return linkContent;
            }
            break;
            
          case 'ul':
            const ulItems: ContentText[] = [];
            Array.from(element.children).forEach(li => {
              if (li.tagName.toLowerCase() === 'li') {
                ulItems.push(createMixedTextContent(
                  li.textContent || '',
                  'paragraph',
                  'center',
                  [0, 5, 0, 5],
                  availableFonts
                ));
              }
            });
            return ulItems;
            
          case 'ol':
            const olItems: ContentText[] = [];
            Array.from(element.children).forEach(li => {
              if (li.tagName.toLowerCase() === 'li') {
                olItems.push(createMixedTextContent(
                  li.textContent || '',
                  'paragraph',
                  'center',
                  [0, 5, 0, 5],
                  availableFonts
                ));
              }
            });
            return olItems;
            
          case 'code':
            const isInPre = element.closest('pre');
            return createMixedTextContent(
              element.textContent || '',
              isInPre ? 'codeBlock' : 'inlineCode',
              undefined,
              undefined,
              availableFonts
            );
            
          case 'pre':
            const codeContent = element.querySelector('code')?.textContent || element.textContent || '';
            // Create a centered wrapper with left-aligned code content using proper table structure
            return {
              table: {
                widths: ['*'],
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
                paddingTop: () => 12,
                paddingBottom: () => 12,
                hLineWidth: () => 0,
                vLineWidth: () => 0
              },
              alignment: 'center',
              margin: [80, 15, 80, 15]
            } as ContentTable;
            
          case 'strong':
          case 'b':
            const boldContent = createMixedTextContent(
              element.textContent || '',
              'normal',
              undefined,
              undefined,
              availableFonts
            );
            boldContent.bold = true;
            return boldContent;
            
          case 'em':
          case 'i':
            const italicContent = createMixedTextContent(
              element.textContent || '',
              'normal',
              undefined,
              undefined,
              availableFonts
            );
            italicContent.italics = true;
            return italicContent;
            
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
      
      // Fetch and configure fonts with error handling
      const fontPromises = [
        fetch(`${basePublicPath}/fonts/Roboto/Roboto-Regular.ttf`).then(res => res.arrayBuffer()),
        fetch(`${basePublicPath}/fonts/Roboto/Roboto-Medium.ttf`).then(res => res.arrayBuffer()),
        fetch(`${basePublicPath}/fonts/Roboto/Roboto-Italic.ttf`).then(res => res.arrayBuffer()),
        fetch(`${basePublicPath}/fonts/Roboto/Roboto-MediumItalic.ttf`).then(res => res.arrayBuffer()),
        fetch(`${basePublicPath}/fonts/OpenSansEmoji/OpenSansEmoji.ttf`).then(res => res.arrayBuffer()),
      ];

      // Try to load NotoEmoji, fall back to null if it fails
      let notoEmojiFont = null;
      try {
        notoEmojiFont = await fetch(`${basePublicPath}/fonts/NotoEmoji/NotoEmoji-Regular.ttf`).then(res => res.arrayBuffer());
      } catch (error) {
        console.warn('Failed to load NotoEmoji font, using OpenSansEmoji as fallback', error);
      }

      const [
        robotoRegular,
        robotoMedium,
        robotoItalic,
        robotoMediumItalic,
        openSansEmoji,
      ] = await Promise.all(fontPromises);

      const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
      };

      // Build VFS with conditional NotoEmoji
      const vfsConfig: Record<string, string> = {
        'Roboto-Regular.ttf': arrayBufferToBase64(robotoRegular),
        'Roboto-Medium.ttf': arrayBufferToBase64(robotoMedium),
        'Roboto-Italic.ttf': arrayBufferToBase64(robotoItalic),
        'Roboto-MediumItalic.ttf': arrayBufferToBase64(robotoMediumItalic),
        'OpenSansEmoji.ttf': arrayBufferToBase64(openSansEmoji),
      };
      
      if (notoEmojiFont) {
        vfsConfig['NotoEmoji-Regular.ttf'] = arrayBufferToBase64(notoEmojiFont);
      }
      
      pdfMake.vfs = vfsConfig;

      // Build fonts configuration with conditional NotoEmoji
      const fontConfig: Record<string, Record<string, string>> = {
        Roboto: {
          normal: 'Roboto-Regular.ttf',
          bold: 'Roboto-Medium.ttf',
          italics: 'Roboto-Italic.ttf',
          bolditalics: 'Roboto-MediumItalic.ttf'
        },
        OpenSansEmoji: {
          normal: 'OpenSansEmoji.ttf',
          bold: 'OpenSansEmoji.ttf',
          italics: 'OpenSansEmoji.ttf',
          bolditalics: 'OpenSansEmoji.ttf'
        },
      };
      
      if (notoEmojiFont) {
        fontConfig.NotoEmoji = {
          normal: 'NotoEmoji-Regular.ttf',
          bold: 'NotoEmoji-Regular.ttf',
          italics: 'NotoEmoji-Regular.ttf',
          bolditalics: 'NotoEmoji-Regular.ttf'
        };
      }
      
      pdfMake.fonts = fontConfig;

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
          fontSize: 12,
          font: 'Roboto'
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
        const slideContent = convertHtmlToPdfMake(slide.content, fontConfig);
        
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
                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors cursor-pointer order-2 sm:order-1"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={exportToPDF}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors cursor-pointer order-1 sm:order-2"
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
