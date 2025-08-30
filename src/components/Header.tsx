'use client';

import React, { useState } from 'react';

const Header: React.FC = () => {
  const [showMenu, setShowMenu] = useState(false);

  const loadExample = (exampleName: string) => {
    // This will be implemented when we add example loading functionality
    console.log('Load example:', exampleName);
    setShowMenu(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Markdown to Slides
          </h1>
          <p className="text-sm text-gray-600">
            Create professional presentations from Markdown
          </p>
        </div>
        
        <div className="hidden md:flex items-center space-x-4">
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded hover:bg-gray-50"
            >
              📖 Examples
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                <div className="py-2">
                  <button
                    onClick={() => loadExample('basic')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Basic Presentation
                  </button>
                  <button
                    onClick={() => loadExample('coding')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Coding Tools Presentation
                  </button>
                  <button
                    onClick={() => loadExample('automation')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Workflow Automation
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <a
            href="https://github.com/Encryptioner/markdown-to-slide"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 text-sm text-white bg-gray-900 rounded hover:bg-gray-800"
          >
            ⭐ Star on GitHub
          </a>
        </div>

        <button
          onClick={() => setShowMenu(!showMenu)}
          className="md:hidden p-2 text-gray-600 hover:text-gray-900"
        >
          ☰
        </button>
      </div>
    </header>
  );
};

export default Header;