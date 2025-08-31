'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ListIcon } from "@phosphor-icons/react";
import { useApp } from '@/contexts/AppContext';
import { basePublicPath } from '@/utils/constants';

const Header: React.FC = () => {
  const { setMarkdown, setCurrentSlide } = useApp();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        mobileMenuRef.current && 
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadExample = async (exampleName: string) => {
    let exampleContent = '';
    
    switch (exampleName) {
      case 'basic':
        exampleContent = `# Welcome to Markdown to Slides

Transform your Markdown content into professional presentation slides!

---

## Getting Started

1. **Write** your content in Markdown
2. **Preview** your slides in real-time  
3. **Present** in fullscreen mode
4. **Export** as PDF for sharing

---

## Markdown Features

You can use all standard Markdown formatting:

- **Bold text** and *italic text*
- \`inline code\` and code blocks
- [Links](https://github.com)
- > Blockquotes for emphasis

---

<!-- .slide: data-background-color="#3b82f6" -->

## Custom Backgrounds

Add custom backgrounds using slide attributes:

\`\`\`markdown
<!-- .slide: data-background-color="#3b82f6" -->
# Blue Background Slide
\`\`\`

---

## Thank You!

Start creating your own presentations with **Markdown to Slides**`;
        break;
        
      case 'coding':
        try {
          const response = await fetch(`${basePublicPath}/markdowns/Hands on Coding of Basic Application Tools.md`);
          if (response.ok) {
            exampleContent = await response.text();
          }
        } catch (error) {
          console.error('Failed to load coding example:', error);
          exampleContent = '# Error loading example\n\nFailed to load the coding tools presentation example.';
        }
        break;
        
      case 'automation':
        try {
          const response = await fetch(`${basePublicPath}/markdowns/Automation of Daily Workflow Presentation.md`);
          if (response.ok) {
            exampleContent = await response.text();
          }
        } catch (error) {
          console.error('Failed to load automation example:', error);
          exampleContent = '# Error loading example\n\nFailed to load the workflow automation presentation example.';
        }
        break;
      case 'emoji':
        try {
          const response = await fetch(`${basePublicPath}/markdowns/Test Emoji.md`);
          if (response.ok) {
            exampleContent = await response.text();
          }
        } catch (error) {
          console.error('Failed to load emoji example:', error);
          exampleContent = '# Error loading example\n\nFailed to load the test emoji presentation example.';
        }
        break;
    }

    if (exampleContent) {
      await setMarkdown(exampleContent);
      setCurrentSlide(0); // Reset to first slide
    }
    
    setShowMenu(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div>
          <div className="flex items-center gap-3">
            <div className="text-2xl">📊</div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Markdown to Slides
              </h1>
              <p className="text-sm text-gray-600">
                Create professional presentations from Markdown
              </p>
            </div>
          </div>
          <button 
            onClick={() => document.getElementById('instructions')?.scrollIntoView({ behavior: 'smooth' })}
            className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline cursor-pointer"
          >
            How to use →
          </button>
        </div>
        
        <div className="hidden md:flex items-center space-x-4">
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded hover:bg-gray-50 cursor-pointer"
            >
              📖 Examples
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                <div className="py-2">
                  <button
                    onClick={() => loadExample('basic')}
                    className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors cursor-pointer"
                    type="button"
                  >
                    Basic Presentation
                  </button>
                  <button
                    onClick={() => loadExample('coding')}
                    className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors cursor-pointer"
                    type="button"
                  >
                    Coding Tools Presentation
                  </button>
                  <button
                    onClick={() => loadExample('automation')}
                    className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors cursor-pointer"
                    type="button"
                  >
                    Workflow Automation
                  </button>
                  <button
                    onClick={() => loadExample('emoji')}
                    className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors cursor-pointer"
                    type="button"
                  >
                    Test Emoji
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <a
            href="https://github.com/Encryptioner/markdown-to-slide"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 text-sm text-white bg-gray-900 rounded hover:bg-gray-800 cursor-pointer"
          >
            ⭐ Star on GitHub
          </a>
        </div>

        <div className="md:hidden relative" ref={mobileMenuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded cursor-pointer"
            type="button"
            aria-label="Toggle menu"
            aria-expanded={showMenu}
          >
            <ListIcon className="size-6" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
              <div className="py-2">
                <div className="px-4 py-3 text-sm font-medium text-gray-700 border-b border-gray-100">
                  Examples
                </div>
                <button
                  onClick={() => loadExample('basic')}
                  className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors cursor-pointer"
                  type="button"
                >
                  Basic Presentation
                </button>
                <button
                  onClick={() => loadExample('coding')}
                  className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors cursor-pointer"
                  type="button"
                >
                  Coding Tools Presentation
                </button>
                <button
                  onClick={() => loadExample('automation')}
                  className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors cursor-pointer"
                  type="button"
                >
                  Workflow Automation
                </button>
                <button
                  onClick={() => loadExample('emoji')}
                  className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors cursor-pointer"
                  type="button"
                >
                  Test Emoji
                </button>
                <div className="border-t border-gray-100 mt-2 pt-2">
                  <a
                    href="https://github.com/Encryptioner/markdown-to-slide"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-3 text-sm text-white bg-gray-900 rounded mx-2 text-center hover:bg-gray-800 focus:bg-gray-800 focus:outline-none transition-colors touch-manipulation"
                    onClick={() => setShowMenu(false)}
                  >
                    ⭐ Star on GitHub
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;