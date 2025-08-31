'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import Toolbar from './Toolbar';
import StoragePanel from './StoragePanel';

interface HistoryState {
  content: string;
  selectionStart: number;
  selectionEnd: number;
}

const MAX_HISTORY_SIZE = 50;

const Editor: React.FC = () => {
  const { markdown, setMarkdown, saveCurrentDocument } = useApp();
  const [showStorage, setShowStorage] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [history, setHistory] = useState<HistoryState[]>([{ content: markdown, selectionStart: 0, selectionEnd: 0 }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const historyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSave = () => {
    if (!saveTitle.trim()) {
      const defaultTitle = `Presentation ${new Date().toLocaleDateString()}`;
      setSaveTitle(defaultTitle);
    }
    setShowSaveDialog(true);
  };

  const confirmSave = () => {
    if (saveTitle.trim()) {
      saveCurrentDocument(saveTitle.trim());
      setShowSaveDialog(false);
      setSaveTitle('');
    }
  };

  const addToHistory = useCallback((content: string, selectionStart: number, selectionEnd: number) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push({ content, selectionStart, selectionEnd });
      
      // Limit history size
      if (newHistory.length > MAX_HISTORY_SIZE) {
        return newHistory.slice(-MAX_HISTORY_SIZE);
      }
      
      return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, MAX_HISTORY_SIZE - 1));
  }, [historyIndex]);

  const debouncedAddToHistory = useCallback((content: string) => {
    if (historyTimeoutRef.current) {
      clearTimeout(historyTimeoutRef.current);
    }
    
    historyTimeoutRef.current = setTimeout(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        addToHistory(content, textarea.selectionStart, textarea.selectionEnd);
      }
    }, 500);
  }, [addToHistory]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const prevState = history[newIndex];
      setMarkdown(prevState.content);
      setHistoryIndex(newIndex);
      
      setTimeout(() => {
        const textarea = textareaRef.current;
        if (textarea) {
          textarea.selectionStart = prevState.selectionStart;
          textarea.selectionEnd = prevState.selectionEnd;
        }
      }, 0);
    }
  }, [history, historyIndex, setMarkdown]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const nextState = history[newIndex];
      setMarkdown(nextState.content);
      setHistoryIndex(newIndex);
      
      setTimeout(() => {
        const textarea = textareaRef.current;
        if (textarea) {
          textarea.selectionStart = nextState.selectionStart;
          textarea.selectionEnd = nextState.selectionEnd;
        }
      }, 0);
    }
  }, [history, historyIndex, setMarkdown]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 's') {
        e.preventDefault();
        handleSave();
      } else if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
        e.preventDefault();
        redo();
      } else if (e.key === 'a') {
        // Allow default select all behavior
        return;
      } else if (e.key === 'b') {
        e.preventDefault();
        insertMarkdownSyntax('**', true);
      } else if (e.key === 'i') {
        e.preventDefault();
        insertMarkdownSyntax('*', true);
      } else if (e.key === 'k') {
        e.preventDefault();
        insertMarkdownSyntax('[]()', false);
        const textarea = textareaRef.current;
        if (textarea) {
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = textarea.selectionStart - 3;
          }, 0);
        }
      }
    }
    
    // Tab support for better UX
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const value = target.value;
      
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      setMarkdown(newValue);
      debouncedAddToHistory(newValue);
      
      // Restore cursor position
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  };

  const insertMarkdownSyntax = (syntax: string, wrap = false) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = markdown.substring(start, end);
    
    let newText: string;
    if (wrap && selectedText) {
      newText = markdown.substring(0, start) + syntax + selectedText + syntax + markdown.substring(end);
    } else {
      newText = markdown.substring(0, start) + syntax + markdown.substring(end);
    }
    
    setMarkdown(newText);
    debouncedAddToHistory(newText);
    
    setTimeout(() => {
      textarea.focus();
      if (wrap && selectedText) {
        textarea.selectionStart = start + syntax.length;
        textarea.selectionEnd = start + syntax.length + selectedText.length;
      } else {
        textarea.selectionStart = textarea.selectionEnd = start + syntax.length;
      }
    }, 0);
  };

  const handleMarkdownChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setMarkdown(newValue);
    debouncedAddToHistory(newValue);
  };

  return (
    <div className="w-full h-full flex flex-col bg-white border border-gray-200">
      <Toolbar
        onSave={handleSave}
        onToggleStorage={() => setShowStorage(!showStorage)}
        onInsertSyntax={insertMarkdownSyntax}
        onUndo={undo}
        onRedo={redo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        showStorage={showStorage}
      />
      
      <div className="flex-1 flex">
        <div className={`${showStorage ? 'w-2/3' : 'w-full'} h-full`}>
          <textarea
            ref={textareaRef}
            className="w-full h-full p-4 resize-none outline-none text-sm leading-relaxed markdown-editor"
            placeholder="# Your Presentation Title

Start writing your presentation here...

Use `---` to separate slides.

Keyboard shortcuts:
- Ctrl+S: Save
- Ctrl+Z: Undo
- Ctrl+Y: Redo
- Ctrl+B: Bold
- Ctrl+I: Italic
- Ctrl+K: Link

---

## Slide 2

You can use all standard Markdown formatting:

- **Bold text**
- *Italic text*
- `code`
- [links](https://example.com)

---

<!-- .slide: data-background-color=&quot;#ff6b6b&quot; -->

## Custom Background

This slide has a red background!"
            value={markdown}
            onChange={handleMarkdownChange}
            onKeyDown={handleKeyDown}
            spellCheck={false}
          />
        </div>
        
        {showStorage && (
          <StoragePanel onClose={() => setShowStorage(false)} />
        )}
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-2 sm:px-4">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xl max-w-xs sm:max-w-md w-full mx-2 sm:mx-4">
            <h3 className="text-lg font-semibold mb-4">Save Presentation</h3>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-md mb-4"
              placeholder="Enter presentation title..."
              value={saveTitle}
              onChange={(e) => setSaveTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && confirmSave()}
              autoFocus
            />
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors order-2 sm:order-1"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={confirmSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors order-1 sm:order-2"
                type="button"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Editor;
