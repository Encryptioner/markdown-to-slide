import { Document } from '@/types';

const STORAGE_KEY = 'markdown-slides-documents';

export function saveDocument(title: string, content: string): Document {
  const documents = getStoredDocuments();
  
  // Check if document with this title already exists
  const existingIndex = documents.findIndex(doc => doc.title === title);
  
  const now = new Date();
  
  if (existingIndex >= 0) {
    // Update existing document
    documents[existingIndex] = {
      ...documents[existingIndex],
      content,
      updatedAt: now
    };
  } else {
    // Create new document
    const newDocument: Document = {
      id: generateId(),
      title,
      content,
      createdAt: now,
      updatedAt: now
    };
    documents.push(newDocument);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
  return existingIndex >= 0 ? documents[existingIndex] : documents[documents.length - 1];
}

export function getStoredDocuments(): Document[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const documents = JSON.parse(stored);
    return documents.map((doc: any) => ({
      ...doc,
      createdAt: new Date(doc.createdAt),
      updatedAt: new Date(doc.updatedAt)
    }));
  } catch {
    return [];
  }
}

export function deleteDocument(id: string): void {
  const documents = getStoredDocuments();
  const filtered = documents.filter(doc => doc.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function getDocument(id: string): Document | undefined {
  const documents = getStoredDocuments();
  return documents.find(doc => doc.id === id);
}

export function renameDocument(id: string, newTitle: string): boolean {
  const documents = getStoredDocuments();
  const docIndex = documents.findIndex(doc => doc.id === id);
  
  if (docIndex === -1) return false;
  
  // Check if new title already exists
  const titleExists = documents.some(doc => doc.id !== id && doc.title === newTitle);
  if (titleExists) return false;
  
  documents[docIndex].title = newTitle;
  documents[docIndex].updatedAt = new Date();
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
  return true;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}