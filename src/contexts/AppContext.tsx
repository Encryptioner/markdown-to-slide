'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Slide, Document, PresentationSettings } from '@/types';
import { parseMarkdownToSlides } from '@/utils/markdownParser';
import { saveDocument, getStoredDocuments, deleteDocument, renameDocument } from '@/utils/storage';

interface AppContextType {
  markdown: string;
  slides: Slide[];
  currentSlide: number;
  isFullscreen: boolean;
  documents: Document[];
  currentDocument: Document | null;
  settings: PresentationSettings;
  
  // Actions
  setMarkdown: (markdown: string) => void;
  setCurrentSlide: (index: number) => void;
  setFullscreen: (fullscreen: boolean) => void;
  saveCurrentDocument: (title: string) => void;
  loadDocument: (document: Document) => void;
  deleteStoredDocument: (id: string) => void;
  renameStoredDocument: (id: string, newTitle: string) => boolean;
  refreshDocuments: () => void;
  updateSettings: (settings: Partial<PresentationSettings>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [markdown, setMarkdownState] = useState('# Welcome to Markdown to Slides\n\nStart writing your presentation here.\n\n---\n\n## Slide 2\n\nThis is your second slide.');
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [settings, setSettings] = useState<PresentationSettings>({
    theme: 'light',
    autoAdvance: false,
    showSlideNumbers: true
  });

  const setMarkdown = useCallback(async (newMarkdown: string) => {
    setMarkdownState(newMarkdown);
    const newSlides = await parseMarkdownToSlides(newMarkdown);
    setSlides(newSlides);
    
    // Reset to first slide if current slide index is out of bounds
    if (currentSlide >= newSlides.length) {
      setCurrentSlide(0);
    }
  }, [currentSlide]);

  const setFullscreen = useCallback((fullscreen: boolean) => {
    setIsFullscreen(fullscreen);
    
    if (typeof document !== 'undefined') {
      if (fullscreen) {
        // Use a timeout to ensure the document is ready
        setTimeout(() => {
          const element = document.documentElement;
          if (element.requestFullscreen) {
            element.requestFullscreen().catch((err) => {
              console.log('Fullscreen request failed:', err);
            });
          } else if ((element as unknown as { webkitRequestFullscreen?: () => void }).webkitRequestFullscreen) {
            (element as unknown as { webkitRequestFullscreen: () => void }).webkitRequestFullscreen();
          } else if ((element as unknown as { msRequestFullscreen?: () => void }).msRequestFullscreen) {
            (element as unknown as { msRequestFullscreen: () => void }).msRequestFullscreen();
          }
        }, 100);
      } else {
        // Only exit fullscreen if we're actually in fullscreen mode
        if (document.fullscreenElement || 
            (document as unknown as { webkitFullscreenElement?: Element }).webkitFullscreenElement || 
            (document as unknown as { msFullscreenElement?: Element }).msFullscreenElement) {
          if (document.exitFullscreen) {
            document.exitFullscreen().catch((err) => {
              console.log('Exit fullscreen failed:', err);
            });
          } else if ((document as unknown as { webkitExitFullscreen?: () => void }).webkitExitFullscreen) {
            (document as unknown as { webkitExitFullscreen: () => void }).webkitExitFullscreen();
          } else if ((document as unknown as { msExitFullscreen?: () => void }).msExitFullscreen) {
            (document as unknown as { msExitFullscreen: () => void }).msExitFullscreen();
          }
        }
      }
    }
  }, []);

  const refreshDocuments = useCallback(() => {
    setDocuments(getStoredDocuments().sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    ));
  }, []);

  const saveCurrentDocument = useCallback((title: string) => {
    const savedDoc = saveDocument(title, markdown);
    setCurrentDocument(savedDoc);
    refreshDocuments();
  }, [markdown, refreshDocuments]);

  const loadDocument = useCallback((document: Document) => {
    setCurrentDocument(document);
    setMarkdown(document.content);
  }, [setMarkdown]);

  const deleteStoredDocument = useCallback((id: string) => {
    deleteDocument(id);
    if (currentDocument?.id === id) {
      setCurrentDocument(null);
    }
    refreshDocuments();
  }, [currentDocument, refreshDocuments]);

  const renameStoredDocument = useCallback((id: string, newTitle: string) => {
    const success = renameDocument(id, newTitle);
    if (success) {
      if (currentDocument?.id === id) {
        setCurrentDocument(prev => prev ? { ...prev, title: newTitle } : null);
      }
      refreshDocuments();
    }
    return success;
  }, [currentDocument, refreshDocuments]);

  const updateSettings = useCallback((newSettings: Partial<PresentationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Initialize slides and documents on mount
  React.useEffect(() => {
    const initializeSlides = async () => {
      const initialSlides = await parseMarkdownToSlides(markdown);
      setSlides(initialSlides);
    };
    
    initializeSlides();
    refreshDocuments();
  }, [markdown, refreshDocuments]);

  const value: AppContextType = {
    markdown,
    slides,
    currentSlide,
    isFullscreen,
    documents,
    currentDocument,
    settings,
    setMarkdown,
    setCurrentSlide,
    setFullscreen,
    saveCurrentDocument,
    loadDocument,
    deleteStoredDocument,
    renameStoredDocument,
    refreshDocuments,
    updateSettings
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}