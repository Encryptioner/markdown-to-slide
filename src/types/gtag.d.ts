/**
 * Window augmentation for Google Analytics gtag function.
 * Allows typed access to window.gtag without any-casting.
 */

type GtagCommand = "config" | "event" | "js" | "set";

interface Window {
  gtag: (command: GtagCommand, target: string, params?: Record<string, unknown>) => void;
  dataLayer: unknown[];
}
