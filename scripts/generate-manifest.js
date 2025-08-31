// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

// Get the base path from environment or default to empty for development
const basePath = process.env.NODE_ENV === 'production' ? '/markdown-to-slide' : '';

const manifest = {
  "name": "Markdown to Slides",
  "short_name": "MD To Slides",
  "description": "Transform your Markdown content into professional presentation slides",
  "start_url": `${basePath}/`,
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": `${basePath}/icons/icon-192x192.svg`,
      "sizes": "192x192",
      "type": "image/svg+xml"
    },
    {
      "src": `${basePath}/icons/icon-512x512.svg`,
      "sizes": "512x512",
      "type": "image/svg+xml"
    }
  ],
  "categories": ["productivity", "business", "education"],
  "orientation": "landscape-primary",
  "scope": `${basePath}/`,
  "lang": "en"
};

// Ensure public directory exists
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Write manifest.json
const manifestPath = path.join(publicDir, 'manifest.json');
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

console.log(`Generated manifest.json for ${process.env.NODE_ENV || 'development'} environment`);
console.log(`Base path: ${basePath || '(root)'}`);