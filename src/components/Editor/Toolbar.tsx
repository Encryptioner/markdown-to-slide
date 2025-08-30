'use client';

import React from 'react';

interface ToolbarProps {
  onSave: () => void;
  onToggleStorage: () => void;
  onInsertSyntax: (syntax: string, wrap?: boolean) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  showStorage: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onSave,
  onToggleStorage,
  onInsertSyntax,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  showStorage
}) => {
  const tools = [
    { label: 'H1', action: () => onInsertSyntax('# '), title: 'Heading 1' },
    { label: 'H2', action: () => onInsertSyntax('## '), title: 'Heading 2' },
    { label: 'H3', action: () => onInsertSyntax('### '), title: 'Heading 3' },
    { label: 'B', action: () => onInsertSyntax('**', true), title: 'Bold', className: 'font-bold' },
    { label: 'I', action: () => onInsertSyntax('*', true), title: 'Italic', className: 'italic' },
    { label: '`', action: () => onInsertSyntax('`', true), title: 'Code', className: 'font-mono' },
    { label: 'Link', action: () => onInsertSyntax('[](url)'), title: 'Link' },
    { label: '•', action: () => onInsertSyntax('- '), title: 'Bullet List' },
    { label: '1.', action: () => onInsertSyntax('1. '), title: 'Numbered List' },
    { label: '---', action: () => onInsertSyntax('\n\n---\n\n'), title: 'New Slide' },
  ];

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
      <div className="flex items-center gap-1 overflow-x-auto">
        {tools.map((tool, index) => (
          <button
            key={index}
            onClick={tool.action}
            className={`px-2 md:px-3 py-1 text-xs md:text-sm rounded hover:bg-gray-200 transition-colors whitespace-nowrap ${tool.className || ''}`}
            title={tool.title}
          >
            {tool.label}
          </button>
        ))}
      </div>
      
      <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
        {onUndo && (
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`px-2 md:px-3 py-1 text-xs md:text-sm rounded transition-colors ${
              canUndo ? 'hover:bg-gray-200' : 'opacity-50 cursor-not-allowed'
            }`}
            title="Undo (Ctrl+Z)"
          >
            ↶
          </button>
        )}
        
        {onRedo && (
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`px-2 md:px-3 py-1 text-xs md:text-sm rounded transition-colors ${
              canRedo ? 'hover:bg-gray-200' : 'opacity-50 cursor-not-allowed'
            }`}
            title="Redo (Ctrl+Y)"
          >
            ↷
          </button>
        )}
        
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        
        <button
          onClick={onToggleStorage}
          className={`px-2 md:px-3 py-1 text-xs md:text-sm rounded transition-colors ${
            showStorage ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'
          }`}
          title="Toggle Storage Panel"
        >
          <span className="hidden sm:inline">📁 Files</span>
          <span className="sm:hidden">📁</span>
        </button>
        
        <button
          onClick={onSave}
          className="px-2 md:px-4 py-1 text-xs md:text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          title="Save (Ctrl+S)"
        >
          <span className="hidden sm:inline">💾 Save</span>
          <span className="sm:hidden">💾</span>
        </button>
      </div>
    </div>
  );
};

export default Toolbar;