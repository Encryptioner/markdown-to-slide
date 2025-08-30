'use client';

import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import Toolbar from './Toolbar';
import StoragePanel from './StoragePanel';

const Editor: React.FC = () => {
  const { markdown, setMarkdown, saveCurrentDocument, loadDocument } = useApp();
  const [showStorage, setShowStorage] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    }
    
    // Tab support for better UX
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const value = target.value;
      
      setMarkdown(value.substring(0, start) + '  ' + value.substring(end));
      
      // Restore cursor position
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  };

  const insertMarkdownSyntax = (syntax: string, wrap = false) => {
    const textarea = document.getElementById('markdown-editor') as HTMLTextAreaElement;
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

  return (
    <div className="w-full h-full flex flex-col border-r lg:border-r border-b lg:border-b-0 border-gray-200 bg-white">
      <Toolbar
        onSave={handleSave}
        onToggleStorage={() => setShowStorage(!showStorage)}
        onInsertSyntax={insertMarkdownSyntax}
        showStorage={showStorage}
      />
      
      <div className="flex-1 flex">
        <div className={`${showStorage ? 'w-2/3' : 'w-full'} h-full`}>
          <textarea
            id="markdown-editor"
            className="w-full h-full p-4 resize-none outline-none text-sm leading-relaxed markdown-editor"
            placeholder="# Your Presentation Title

Start writing your presentation here...

Use `---` to separate slides.

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
            onChange={(e) => setMarkdown(e.target.value)}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
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
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={confirmSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
