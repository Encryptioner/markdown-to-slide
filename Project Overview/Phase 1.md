# Project Overview – Phase 1: Markdown-to-Slides Website (Production Ready)

## Objective

Develop a **modern, browser-based, single page, open-source web application** that enables users to **write, edit, and paste Markdown** into a simple editor, and instantly transform it into professional presentation slides. The website will also support **exporting slides as multi-page PDFs**, so users can reuse them in other presentation tools.

The application must be **production-ready, professional, responsive, user-friendly, and highly maintainable**, following modern standards and best practices. It will be **free to use, without login**, lowering adoption barriers for a wide audience.

---

## Core Features (Phase 1 - Production Ready)

### 1. Markdown Editor

* Lightweight, minimal editor for writing/pasting Markdown.
* Real-time parsing into slides.
* Slide separation with `---`.
* Full support for standard Markdown formatting (headings, bold, italic, lists, quotes, etc.).
* User also should be able to load existing examples in markdown editor easily

### 2. Slide Rendering & Preview

* **Live preview** panel with instant updates.
* **Fullscreen presentation mode**.
* Support for **custom attributes** via Markdown comments, e.g.:

  ```markdown
  <!-- .slide: data-background-color="red" -->
  # Red background slide
  ```
* Support for **background colors, images**.
* General instructions for markdown is in https://slides.com/tools/markdown-to-presentation
```md
Separate slides with three dashes
# Slide one
---
# Slide two
Slide attributes
Special syntax is available for adding attributes to slides. Slide attributes can be used to set background colors, images or videos. View full list of attributes.

<!-- .slide: data-background-color="red" -->
# This slide has a red background
---
<!-- .slide: data-background-image="https://..." -->
# Image background
---
<!-- .slide: data-background-video="https://..." -->
# Video background
Markdown syntax
Beyond the custom extensions above, we also support all standard Markdown formatting.

Markdown	Output
# Heading 1	Heading 1
## Heading 2	Heading 2
### Heading 3	Heading 3
**Bold**	Bold
_Italicized_	Italicized
~~Strikethrough~~	Strikethrough
See [Slides](https://slides.com)	See Slides
> Block quote	“Block quote”
- List item one
- List item two	
List item one
List item two
1. Ordered item one
1. Ordered item two	
Ordered item one
Ordered item two
```

### 3. PDF Export

* One-click **multi-page PDF export**.
* Slide formatting, background, and layout preserved.

### 4. Offline & Progressive Web App (PWA) Support

* Fully installable as a **PWA** on desktop and mobile.
* **Service Worker** for:

  * Caching static assets (editor, renderer, libraries).
  * Offline support for reading/editing saved Markdown.
* Works seamlessly in both online and offline modes.

### 5. Local Storage Management

* Users can **save their Markdown drafts locally** without login.
* Features:

  * View list of saved Markdown documents.
  * Rename documents (titles must be unique).
  * Prevent duplicate saves (based on title & content).
  * Store **save time** for easy reference.
  * Load, update, or delete saved documents.

### 6. Responsive, Professional UI/UX

* **Fully responsive** design for all devices (desktop, tablet, mobile).
* **Top-notch UX**:

  * Intuitive layout for editor + preview.
  * Easy-to-find export and presentation controls.
  * Clear visual hierarchy (fonts, spacing, colors).
  * Keyboard shortcuts for power users (save, export, fullscreen).
* **Accessible** (WCAG-compliant contrast, ARIA roles, tab navigation).
* Clean, professional look to appeal to a wide user base.

### 7. Website Features

* **Free and open-source** – no login required.
* **Footer section** with:

  * Provide created by [Ankur Mursalin](https://encryptioner.github.io/)
  * Link to GitHub repository.
  * License info.
  * Contact/feedback link.
  * Attribution/branding tagline.
  * Multiple social links of creator `Ankur Mursalin`.
* **SEO-ready**:

  * Semantic HTML with metadata.
  * Mobile-first responsive layout.
  * Sitemap + robots.txt.
  * Open Graph and Twitter card tags for social sharing.
* **Marketing-friendly**:

  * Homepage with clear description and use cases.
  * Examples of Markdown → Slides.
  * Quick-start guide with instructions.
  * Call-to-action (“Start editing now!”).

---

## Technical Standards

### Coding & Architecture

* **Framework**: React (Next.js App Router) or Vue 3 (Vite).
* **Language**: TypeScript (strict mode).
* **UI Styling**: TailwindCSS with utility classes + custom design tokens.
* **Code quality**: ESLint + Prettier enforced.
* **Folder structure**: Modular, component-based (Editor, SlidePreview, PDFExporter, StorageManager, Layout).
* **Testing**: Jest for unit tests, Playwright/Cypress for end-to-end testing.
* **PDF generation**: Browser-side (html2pdf.js or Print-to-PDF pipeline).
* **State management**: Context API or Pinia (Vue).
* **Storage**: LocalStorage wrapper with validation.

### Deployment & Workflow

* **Deployment**: GitHub Pages (static hosting).
* **CI/CD**: GitHub Actions for build, lint, test, and deploy.
* **Open-source readiness**:

  * README with setup instructions.
  * Contribution guidelines.
  * Changelog & semantic versioning.
  * MIT or Apache 2.0 license.

---

## Additional Production-Ready Considerations

* **Error Handling**: Friendly error states (e.g., invalid Markdown, failed PDF export).
* **Performance Optimization**:

  * Code-splitting and lazy loading for faster loads.
  * Minification and caching strategies.
  * Optimize assets (icons, images, fonts).
* **Analytics (Optional)**: Simple privacy-friendly analytics (e.g., Plausible or Umami) to measure usage.
* **Theming Support (Basic)**: Dark/light mode toggle for user comfort.
* **Versioned Local Storage**: In case future schema changes affect saved Markdown.
* **Keyboard Accessibility**: Shortcuts for navigation (e.g., `Ctrl+S` = save, `Ctrl+E` = export, `F11` = fullscreen).

---

## User Experience Flow

1. Open the website (works online/offline).
2. Paste/write Markdown in editor.
3. Live preview shows formatted slides.
4. Save Markdown locally with unique title.
5. Reopen site → load/edit saved Markdown drafts.
6. Present directly in fullscreen or export as PDF.
7. Use PWA mode offline on desktop/mobile.

---

## Deliverables for Phase 1

* Production-ready, open-source website.
* Editor + preview + fullscreen + PDF export.
* Local storage system with unique titles, save timestamps, and management UI.
* Responsive, professional design with strong UX.
* PWA with service worker caching.
* SEO, marketing, and accessibility ready.
* GitHub Pages deployment + CI/CD workflow.

---

## Outcome

At the end of Phase 1, the project delivers a **professional, production-ready Markdown-to-Slides website** that is:

* **Free, open-source, and browser-based**.
* **Installable (PWA) with offline support**.
* **User-friendly**, responsive, and accessible.
* **Maintainable**, scalable, and built with coding best practices.
* Ready for **public release, demos, and feedback collection**.

---

## Reference
1. [slides.com - Markdown to Presentation](https://slides.com/tools/markdown-to-presentation)