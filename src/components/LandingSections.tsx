'use client';

import React, { useState } from 'react';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-lg mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left bg-gray-50 hover:bg-gray-100 rounded-t-lg transition-colors flex items-center justify-between"
        type="button"
      >
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <span className={`text-gray-500 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      {isOpen && (
        <div className="px-6 py-4 bg-white rounded-b-lg">
          {children}
        </div>
      )}
    </div>
  );
};

const LandingSections: React.FC = () => {
  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Marketing Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Transform Markdown into Beautiful Presentations
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Create professional presentation slides from your Markdown content in seconds. 
            No signup required, works offline, and exports to PDF for sharing.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✍️</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Write in Markdown</h3>
              <p className="text-gray-600">Use familiar Markdown syntax with live preview</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Beautiful Slides</h3>
              <p className="text-gray-600">Professional layouts with custom backgrounds</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📄</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Export & Share</h3>
              <p className="text-gray-600">Download as PDF or present fullscreen</p>
            </div>
          </div>
        </div>

        {/* Instructions Section */}
        <div className="mb-12" id="instructions">
          <CollapsibleSection title="📚 How to Use" defaultOpen={true}>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">1. Basic Slide Creation</h4>
                <p className="text-gray-600 mb-3">
                  Separate slides using three dashes (<code className="bg-gray-100 px-2 py-1 rounded text-sm">---</code>):
                </p>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{`# First Slide Title
Your content here

---

# Second Slide Title  
More content here`}
                </pre>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">2. Custom Backgrounds</h4>
                <p className="text-gray-600 mb-3">Add slide attributes using HTML comments:</p>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{`<!-- .slide: data-background-color="#3b82f6" -->
# Blue Background Slide

---

<!-- .slide: data-background-image="https://..." -->
# Image Background Slide`}
                </pre>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">3. Presentation Mode</h4>
                <ul className="list-disc pl-6 text-gray-600 space-y-1">
                  <li>Press <kbd className="bg-gray-200 px-2 py-1 rounded text-xs">F11</kbd> or click the fullscreen button</li>
                  <li>Use arrow keys or navigation buttons to move between slides</li>
                  <li>Press <kbd className="bg-gray-200 px-2 py-1 rounded text-xs">Escape</kbd> to exit fullscreen</li>
                </ul>
              </div>
            </div>
          </CollapsibleSection>
        </div>


        {/* Call to Action */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to create your first presentation?</h3>
          <p className="text-gray-600 mb-6">
            Start typing in the editor above or load one of our example presentations to get started.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingSections;