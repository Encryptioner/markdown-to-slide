export interface Slide {
  id: string;
  content: string;
  attributes?: SlideAttributes;
}

export interface SlideAttributes {
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundVideo?: string;
  transition?: string;
  [key: string]: string | undefined;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MarkdownParseOptions {
  slides: Slide[];
  rawMarkdown: string;
}

export interface PresentationSettings {
  theme: 'light' | 'dark';
  autoAdvance: boolean;
  showSlideNumbers: boolean;
}

export interface ExportOptions {
  format: 'pdf';
  filename?: string;
  includeNotes?: boolean;
}