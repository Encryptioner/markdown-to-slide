# Markdown to Slides

A modern, browser-based web application that transforms Markdown content into professional presentation slides. Create, edit, and present stunning slide decks - all for free, with no login required!

## ✨ Features

- **📝 Real-time Markdown Editor** - Write presentations with live preview
- **🎬 Fullscreen Presentation Mode** - Present with keyboard navigation
- **📄 PDF Export** - Generate high-quality PDF slideshows
- **💾 Local Storage** - Save and manage presentations locally
- **📱 Responsive Design** - Works perfectly on desktop and mobile
- **⚡ PWA Support** - Install as an app, works offline
- **🎨 Custom Backgrounds** - Support for colors, images, and videos
- **⌨️ Keyboard Shortcuts** - Efficient workflow with shortcuts
- **🤖 AI Chat Integration** - Built-in AI assistant for help and suggestions

## 🚀 Quick Start

### Online Version
Visit the live application: [Markdown to Slides](https://encryptioner.github.io/markdown-to-slide/)

### Local Development

**Prerequisites:**
- Node.js 18+ 
- pnpm (recommended package manager)

**Installation:**
```bash
# Clone the repository
git clone https://github.com/Encryptioner/markdown-to-slide.git
cd markdown-to-slide

# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠️ Tech Stack

### Frontend Framework
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety and better DX

### Styling & UI
- **[TailwindCSS 4](https://tailwindcss.com/)** - Utility-first CSS framework
- **Responsive Design** - Mobile-first approach

### Core Libraries
- **[marked](https://marked.js.org/)** - Markdown parser and compiler
- **[DOMPurify](https://github.com/cure53/DOMPurify)** - HTML sanitization
- **[html2pdf.js](https://github.com/eKoopmans/html2pdf.js)** - Client-side PDF generation

### Development Tools
- **[ESLint](https://eslint.org/)** - Code linting
- **[Prettier](https://prettier.io/)** - Code formatting
- **[Jest](https://jestjs.io/)** - Unit testing framework

### Build & Deployment
- **Static Export** - Optimized for GitHub Pages
- **GitHub Actions** - Automated CI/CD pipeline
- **PWA** - Progressive Web App capabilities

## 📖 Usage

### Creating Slides

Write your presentation in Markdown format. Use `---` to separate slides:

```markdown
# Welcome to My Presentation
## Subtitle here

---

## Second Slide

- Bullet point 1
- Bullet point 2
- Bullet point 3

---

<!-- .slide: data-background-color="#ff6b6b" -->

## Slide with Custom Background

This slide has a red background!
```

### Custom Slide Attributes

Add custom styling with HTML comments:

```markdown
<!-- .slide: data-background-color="#4a90e2" -->
# Blue Background Slide

<!-- .slide: data-background-image="https://example.com/image.jpg" -->
# Image Background Slide

<!-- .slide: data-background-video="https://example.com/video.mp4" -->
# Video Background Slide
```

### Keyboard Shortcuts

- **Ctrl/Cmd + S** - Save presentation
- **F11** - Enter/exit fullscreen presentation
- **Arrow Keys** - Navigate slides (in presentation mode)
- **Esc** - Exit fullscreen mode
- **Home/End** - Jump to first/last slide

### AI Chat Assistant

The app includes an integrated AI chat assistant that runs entirely in your browser:

- **Floating Chat Button** - Available in the bottom-right corner
- **Privacy-First** - All AI processing happens locally, no data sent to servers
- **Offline Capable** - Works without internet connection after initial setup
- **Presentation Help** - Get suggestions for improving your slides

#### Configuration

The AI chat feature can be configured in `src/utils/constants.ts`:

```typescript
export const AI_CHAT_CONFIG = {
  // Set to empty string to disable chat functionality
  embedScriptUrl: 'https://username.github.io/in-browser-llm-inference/embed.js',
  enabled: true, // Set to false to completely disable chat widget
}
```

**To disable the chat widget:**
1. Set `enabled: false` in `AI_CHAT_CONFIG`
2. Or set `embedScriptUrl` to an empty string

#### How It Works

The AI chat integration uses an embed script that:
- Loads a local language model in an iframe
- Provides a floating chat interface
- Processes all conversations locally in the browser
- Caches models for offline use

## 🧪 Available Scripts

**This project uses pnpm as the package manager:**

```bash
# Development
pnpm run dev          # Start development server
pnpm run build        # Build for production
pnpm run start        # Start production server

# Code Quality
pnpm run lint         # Run ESLint
pnpm run type-check   # Run TypeScript checks

# Testing
pnpm run test         # Run Jest tests
pnpm run test:watch   # Run tests in watch mode
```

## 🚀 Deployment

The project is configured for automatic deployment to GitHub Pages:

1. Push to `main` branch
2. GitHub Actions automatically builds and deploys
3. Available at `https://username.github.io/repository-name`

For manual deployment:
```bash
pnpm run build
# Upload the 'out' directory to your hosting provider
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author
1. Name: Ankur Mursalin
2. Email: mir.ankur.ruet13@gmail.com
3. Website: [https://encryptioner.github.io/](https://encryptioner.github.io/)
4. LinkedIn: [https://www.linkedin.com/in/mir-mursalin-ankur](https://www.linkedin.com/in/mir-mursalin-ankur)
5. Github: [https://github.com/encryptioner](https://github.com/encryptioner)
6. Twitter: [https://x.com/AnkurMursalin](https://x.com/AnkurMursalin)
7. Blog: [https://dev.to/mir_mursalin_ankur](https://dev.to/mir_mursalin_ankur)
8. Nerddevs: [https://nerddevs.com/author/ankur/](https://nerddevs.com/author/ankur/)
9. Project Home Page: [https://encryptioner.github.io/markdown-to-slide](https://encryptioner.github.io/markdown-to-slide)

## 🙏 Acknowledgments

- Inspired by [Slides.com](https://slides.com/) Markdown support
- Built with modern web technologies
- Designed for simplicity and accessibility

---

**Made with ❤️ by [Ankur Mursalin](https://encryptioner.github.io/)**
