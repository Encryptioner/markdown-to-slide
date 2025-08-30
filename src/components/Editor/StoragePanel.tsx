'use client';

import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Document } from '@/types';

interface StoragePanelProps {
  onClose: () => void;
}

const StoragePanel: React.FC<StoragePanelProps> = ({ onClose }) => {
  const { documents, loadDocument, deleteStoredDocument, refreshDocuments } = useApp();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  React.useEffect(() => {
    refreshDocuments();
  }, [refreshDocuments]);

  const handleLoadDocument = (document: Document) => {
    loadDocument(document);
    onClose();
  };

  const handleDeleteDocument = (id: string) => {
    deleteStoredDocument(id);
    setConfirmDelete(null);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="w-1/3 h-full border-l border-gray-200 bg-gray-50 flex flex-col">
      <div className="p-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">Saved Presentations</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-lg leading-none"
          title="Close"
        >
          ×
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {documents.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p className="mb-2">No saved presentations</p>
            <p className="text-sm">Use the Save button to store your presentations locally</p>
          </div>
        ) : (
          <div className="p-2">
            {documents.map((document) => (
              <div
                key={document.id}
                className="mb-2 p-3 bg-white rounded border hover:border-blue-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4
                    className="font-medium text-gray-800 cursor-pointer hover:text-blue-600 flex-1 mr-2"
                    onClick={() => handleLoadDocument(document)}
                    title="Click to load"
                  >
                    {document.title}
                  </h4>
                  <button
                    onClick={() => setConfirmDelete(document.id)}
                    className="text-red-500 hover:text-red-700 text-sm leading-none"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
                
                <div className="text-xs text-gray-500 space-y-1">
                  <p>Created: {formatDate(document.createdAt)}</p>
                  <p>Updated: {formatDate(document.updatedAt)}</p>
                </div>
                
                <div className="mt-2 text-xs text-gray-400 line-clamp-2">
                  {document.content.substring(0, 100)}
                  {document.content.length > 100 && '...'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {confirmDelete && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg shadow-xl max-w-xs w-full mx-4">
            <h4 className="font-semibold mb-2">Delete Presentation</h4>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete this presentation? This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteDocument(confirmDelete)}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoragePanel;