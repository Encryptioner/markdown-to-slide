# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Markdown-to-Slides web application** - a modern, browser-based, single-page application that transforms Markdown content into professional presentation slides. The app is designed to be production-ready, open-source, and free to use without login requirements.

## Architecture & Technology Stack

**Planned Tech Stack (as per Phase 1 requirements):**
- Framework: React (Next.js App Router) or Vue 3 (Vite)
- Language: TypeScript (strict mode)
- UI Styling: TailwindCSS with utility classes + custom design tokens
- PDF Generation: Browser-side (html2pdf.js or Print-to-PDF pipeline)
- State Management: Context API or Pinia (Vue)
- Storage: LocalStorage wrapper with validation
- Testing: Jest for unit tests, Playwright/Cypress for E2E
- Deployment: GitHub Pages (static hosting)

## Core Components Architecture

The application should be structured with these main components:
- **Editor**: Markdown input with real-time parsing
- **SlidePreview**: Live preview panel with slide rendering
- **PDFExporter**: One-click multi-page PDF export functionality
- **StorageManager**: Local storage with unique titles and timestamps
- **Layout**: Responsive UI container with navigation

## Key Features to Implement

1. **Markdown Editor**: Lightweight editor with real-time slide separation using `---`
2. **Slide Rendering**: Live preview with support for custom attributes via Markdown comments
3. **PDF Export**: Multi-page PDF generation preserving formatting and backgrounds
4. **PWA Support**: Service Worker for offline functionality and installable app
5. **Local Storage**: Save/load Markdown documents without login
6. **Responsive Design**: Mobile-first, accessible UI following WCAG guidelines

## Slide Syntax

Slides are separated with `---` and support custom attributes:
```markdown
<!-- .slide: data-background-color="red" -->
# Red background slide
---
<!-- .slide: data-background-image="https://..." -->
# Image background
```

## Development Commands

**This project uses pnpm as the package manager:**
- `pnpm install` - Install dependencies
- `pnpm run dev` - Start development server
- `pnpm run build` - Build for production
- `pnpm run lint` - Run ESLint
- `pnpm run test` - Run Jest unit tests
- `pnpm run type-check` - Run TypeScript type checking
- `pnpm run export` - Build and export for static deployment

## Project Structure

```
/src
  /components
    /Editor          # Markdown input component
    /SlidePreview    # Live preview rendering
    /PDFExporter     # PDF generation logic  
    /StorageManager  # Local storage operations
  /utils             # Markdown parsing utilities
  /styles            # TailwindCSS configurations
  /types             # TypeScript type definitions
/examples
  /markdowns         # Sample presentation files
/public              # Static assets
```

## Example Markdown Files

The `examples/markdowns/` directory contains sample presentations that demonstrate the expected Markdown format:
- "Hands on Coding of Basic Application Tools.md" - Technical presentation example
- "Automation of Daily Workflow Presentation.md" - Workflow automation example

## Development Guidelines

- Follow strict TypeScript mode
- Use TailwindCSS utility classes over custom CSS
- Implement error boundaries for graceful error handling
- Optimize for performance with code-splitting and lazy loading
- Ensure keyboard accessibility (Ctrl+S save, Ctrl+E export, F11 fullscreen)
- Support both dark and light themes
- Maintain semantic HTML for SEO optimization

## Author & Attribution

Created by [Ankur Mursalin](https://encryptioner.github.io/) - include in footer with social links and GitHub repository reference.

## Reference Materials

- Slide syntax reference: https://slides.com/tools/markdown-to-presentation
- Project requirements detailed in `Project Overview/Phase 1.md`

## General Rules
1. Be concise and accurate
2. Consider yourself as experienced professional software engineer and act accordingly
3. You must ensure production ready, professional, scalable and maintainable code
4. You must ensure the website follows responsive design and works good in all screen
5. Ensure the UX and UI follows latest standard and attractive (not pushy) to use
6. Must kill all the bash script after providing final output in chat
