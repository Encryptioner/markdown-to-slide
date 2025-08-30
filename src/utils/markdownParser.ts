import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { Slide, SlideAttributes } from '@/types';

export async function parseMarkdownToSlides(markdown: string): Promise<Slide[]> {
  if (!markdown.trim()) {
    return [{ id: '1', content: '<div class="slide-content"><h1>Welcome to Markdown to Slides</h1><p>Start writing your presentation in Markdown format.</p></div>' }];
  }

  const slides = markdown.split(/^---$/gm);
  
  const slidePromises = slides.map(async (slideContent, index) => {
    const trimmedContent = slideContent.trim();
    if (!trimmedContent) return null;

    // Extract slide attributes from comments
    const attributes = extractSlideAttributes(trimmedContent);
    
    // Remove attribute comments from content
    const cleanContent = trimmedContent.replace(/<!--\s*\.slide:.*?-->/g, '').trim();
    
    // Convert markdown to HTML
    const htmlContent = await marked.parse(cleanContent);
    
    // Wrap code blocks for proper centering
    const wrappedContent = htmlContent.replace(
      /<pre><code[^>]*>([\s\S]*?)<\/code><\/pre>/g,
      '<div class="code-wrapper"><pre><code>$1</code></pre></div>'
    );
    
    // Sanitize HTML
    const sanitizedContent = DOMPurify.sanitize(wrappedContent);
    
    return {
      id: (index + 1).toString(),
      content: `<div class="slide-content">${sanitizedContent}</div>`,
      attributes
    };
  });

  const processedSlides = await Promise.all(slidePromises);
  return processedSlides.filter(Boolean) as Slide[];
}

function extractSlideAttributes(content: string): SlideAttributes | undefined {
  const attributePattern = /<!--\s*\.slide:\s*(.+?)\s*-->/g;
  const matches = [...content.matchAll(attributePattern)];
  
  if (matches.length === 0) return undefined;
  
  const attributes: SlideAttributes = {};
  
  matches.forEach(match => {
    const attributeString = match[1];
    const pairs = attributeString.split(/\s+/);
    
    pairs.forEach(pair => {
      const [key, value] = pair.split('=');
      if (key && value) {
        const cleanKey = key.replace('data-', '');
        const cleanValue = value.replace(/["']/g, '');
        
        if (cleanKey === 'background-color') {
          attributes.backgroundColor = cleanValue;
        } else if (cleanKey === 'background-image') {
          attributes.backgroundImage = cleanValue;
        } else if (cleanKey === 'background-video') {
          attributes.backgroundVideo = cleanValue;
        } else {
          attributes[cleanKey] = cleanValue;
        }
      }
    });
  });
  
  return Object.keys(attributes).length > 0 ? attributes : undefined;
}

export function generateSlideStyles(attributes?: SlideAttributes): React.CSSProperties {
  if (!attributes) return {};
  
  const styles: React.CSSProperties = {};
  
  if (attributes.backgroundColor) {
    styles.backgroundColor = attributes.backgroundColor;
  }
  
  if (attributes.backgroundImage) {
    styles.backgroundImage = `url(${attributes.backgroundImage})`;
    styles.backgroundSize = 'cover';
    styles.backgroundPosition = 'center';
    styles.backgroundRepeat = 'no-repeat';
  }
  
  return styles;
}