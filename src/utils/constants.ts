/*
 * Ankur Mursalin
 *
 * https://encryptioner.github.io/
 *
 * Created on Sun Aug 31 2025
 */

export const basePublicPath = process.env.NODE_ENV === 'production' ? '/markdown-to-slide' : ''

// AI Chat Plugin Configuration
export const AI_CHAT_CONFIG = {
  // Set to empty string to disable chat functionality
  // For development: 'http://localhost:5173/embed.js'
  // For production: 'https://username.github.io/in-browser-llm-inference/embed.js'
  embedScriptUrl: process.env.NODE_ENV === 'production' ? 'https://encryptioner.github.io/in-browser-llm-inference/embed.js' : 'http://localhost:5173/embed.js',
  
  // Chat widget configuration
  enabled: true, // Set to false to completely disable chat widget
  
  // Validate URL helper
  isValidUrl: (url: string): boolean => {
    if (!url || url.trim() === '') return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}
