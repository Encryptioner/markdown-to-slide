'use client';

import React from 'react';
import { trackEvent } from '@/lib/googleAnalytics';

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
  type ToolbarAction = "h1" | "h2" | "h3" | "bold" | "italic" | "code" | "link" | "bullet_list" | "numbered_list" | "new_slide";

  const handleToolbarAction = (action: ToolbarAction, insertFn: () => void) => {
    insertFn();
    trackEvent({ name: "toolbar_action_used", params: { action } });
  };

  const tools: Array<{ label: string; action: ToolbarAction; insertFn: () => void; title: string; className?: string }> = [
    { label: 'H1', action: 'h1', insertFn: () => onInsertSyntax('# '), title: 'Heading 1' },
    { label: 'H2', action: 'h2', insertFn: () => onInsertSyntax('## '), title: 'Heading 2' },
    { label: 'H3', action: 'h3', insertFn: () => onInsertSyntax('### '), title: 'Heading 3' },
    { label: 'B', action: 'bold', insertFn: () => onInsertSyntax('**', true), title: 'Bold', className: 'font-bold' },
    { label: 'I', action: 'italic', insertFn: () => onInsertSyntax('*', true), title: 'Italic', className: 'italic' },
    { label: '`', action: 'code', insertFn: () => onInsertSyntax('`', true), title: 'Code', className: 'font-mono' },
    { label: 'Link', action: 'link', insertFn: () => onInsertSyntax('[](url)'), title: 'Link' },
    { label: '•', action: 'bullet_list', insertFn: () => onInsertSyntax('- '), title: 'Bullet List' },
    { label: '1.', action: 'numbered_list', insertFn: () => onInsertSyntax('1. '), title: 'Numbered List' },
    { label: '---', action: 'new_slide', insertFn: () => onInsertSyntax('\n\n---\n\n'), title: 'New Slide' },
  ];

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
      <div className="flex items-center gap-1 overflow-x-auto">
        {tools.map((tool, index) => (
          <button
            key={index}
            onClick={() => handleToolbarAction(tool.action, tool.insertFn)}
            className={`px-2 md:px-3 py-1 text-xs md:text-sm rounded hover:bg-gray-200 transition-colors whitespace-nowrap cursor-pointer ${tool.className || ''}`}
            title={tool.title}
          >
            {tool.label}
          </button>
        ))}
      </div>
      
      <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
        {onUndo && (
          <button
            onClick={() => { onUndo(); trackEvent({ name: "history_action", params: { action: "undo" } }); }}
            disabled={!canUndo}
            className={`px-2 md:px-3 py-1 text-xs md:text-sm rounded transition-colors ${
              canUndo ? 'hover:bg-gray-200 cursor-pointer' : 'opacity-50 cursor-not-allowed'
            }`}
            title="Undo (Ctrl+Z)"
          >
            ↶
          </button>
        )}

        {onRedo && (
          <button
            onClick={() => { onRedo(); trackEvent({ name: "history_action", params: { action: "redo" } }); }}
            disabled={!canRedo}
            className={`px-2 md:px-3 py-1 text-xs md:text-sm rounded transition-colors ${
              canRedo ? 'hover:bg-gray-200 cursor-pointer' : 'opacity-50 cursor-not-allowed'
            }`}
            title="Redo (Ctrl+Y)"
          >
            ↷
          </button>
        )}
        
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        
        <button
          onClick={() => {
            const willOpen = !showStorage;
            onToggleStorage();
            trackEvent({ name: "storage_panel_toggled", params: { opened: willOpen } });
          }}
          className={`px-2 md:px-3 py-1 text-xs md:text-sm rounded transition-colors cursor-pointer ${
            showStorage ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'
          }`}
          title="Toggle Storage Panel"
        >
          <span className="hidden sm:inline">📁 Files</span>
          <span className="sm:hidden">📁</span>
        </button>
        
        <button
          onClick={onSave}
          className="px-2 md:px-4 py-1 text-xs md:text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors cursor-pointer"
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