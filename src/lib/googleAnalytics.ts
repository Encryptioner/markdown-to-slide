/**
 * Google Analytics Configuration & Typed Event Tracking Service
 *
 * Privacy-first: tracking is disabled by default in development.
 * Pure TypeScript module — no React imports. Safe to import from
 * any file including contexts, services, and components.
 */

// ── Configuration ────────────────────────────────────────────

export const GOOGLE_ANALYTICS_CONFIG = {
  measurementId: 'G-Z7NVT8P8HQ',
  enabled: true,
  trackInDevelopment: false,

  get shouldTrack(): boolean {
    if (!this.enabled) return false;
    if (!this.measurementId || this.measurementId === 'G-XXXXXXXXXX') return false;

    const isProduction = process.env.NODE_ENV === 'production';
    if (!isProduction && !this.trackInDevelopment) return false;

    return true;
  },
};

// ── Event taxonomy ──────────────────────────────────────────

type EditorEvent =
  | { name: "toolbar_action_used"; params: { action: "h1" | "h2" | "h3" | "bold" | "italic" | "code" | "link" | "bullet_list" | "numbered_list" | "new_slide" } }
  | { name: "keyboard_shortcut_used"; params: { shortcut: "save" | "bold" | "italic" | "link" | "undo" | "redo" | "fullscreen" } }
  | { name: "slide_count_changed"; params: { slide_count: number } }
  | { name: "example_loaded"; params: { example: string } }
  | { name: "history_action"; params: { action: "undo" | "redo" } };

type PresentationEvent =
  | { name: "fullscreen_entered"; params: { slide_count: number } }
  | { name: "fullscreen_exited"; params: { slides_viewed: number; total_slides: number } }
  | { name: "slide_navigated"; params: { method: "arrow_key" | "spacebar" | "button" | "dot" | "home_end"; slide_index: number } }
  | { name: "theme_toggled"; params: { theme: "dark" | "light" } };

type ExportEvent =
  | { name: "pdf_export_started"; params: { slide_count: number } }
  | { name: "pdf_export_completed"; params: { slide_count: number; duration_ms: number } }
  | { name: "pdf_export_failed"; params: { slide_count: number; error: string } };

type StorageEvent =
  | { name: "presentation_saved"; params: { slide_count: number } }
  | { name: "presentation_loaded"; params: { slide_count: number } }
  | { name: "presentation_renamed" }
  | { name: "presentation_deleted" }
  | { name: "storage_panel_toggled"; params: { opened: boolean } };

type ErrorEvent = {
  name: "error_occurred";
  params: { category: string; action: string; error: string };
};

export type AnalyticsEvent =
  | EditorEvent
  | PresentationEvent
  | ExportEvent
  | StorageEvent
  | ErrorEvent;

// ── Core tracking function ──────────────────────────────────

/**
 * Send a typed analytics event to Google Analytics.
 * No-ops gracefully when gtag is unavailable (SSR, ad blockers, dev mode).
 */
export function trackEvent(event: AnalyticsEvent): void {
  if (!GOOGLE_ANALYTICS_CONFIG.shouldTrack) return;
  if (typeof window === "undefined" || !window.gtag) return;

  const { name, ...rest } = event;
  const params = "params" in rest ? (rest.params as Record<string, unknown>) : undefined;
  window.gtag("event", name, params);
}

// ── Helpers ─────────────────────────────────────────────────

const EMAIL_PATTERN = /[\w.+-]+@[\w.-]+\.\w+/g;

/**
 * Strip email addresses from error messages to prevent PII leakage.
 * Truncates to 100 chars for GA parameter limits.
 */
export function sanitizeError(msg: string): string {
  return msg.replace(EMAIL_PATTERN, "[email]").slice(0, 100);
}
