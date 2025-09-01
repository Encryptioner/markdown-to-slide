/*
 * Ankur Mursalin
 *
 * https://encryptioner.github.io/
 *
 * Created on Sun Aug 31 2025
 */

const isProduction = process.env.NODE_ENV === 'production'

export const basePublicPath = isProduction ? '/markdown-to-slide' : '';

/**
 * The domain on which the project will load
 */
export const baseDomain = isProduction ? 'https://encryptioner.github.io' : 'http://localhost:4000';
export const origin = typeof window !== 'undefined' ? window.location.origin : baseDomain;

export const AI_CHAT_BASE_CONFIG = {
  domain: encodeURIComponent(`${origin}${basePublicPath}`),
  systemMessage: encodeURIComponent(`
    You are a helpful assistant.
    Keep responses as concise as possible.
    Avoid long explanations.
    You must reply as poem while giving the answer.
  `).replace(/\n/g, ' ')
  }

/**
 * NOTE:
 * Set to empty string to disable chat functionality
 * For development: 'http://localhost:5173/embed.js'
 * For production: 'https://username.github.io/in-browser-llm-inference/embed.js'
 */
const embedScriptMainSrc = isProduction 
? 'https://encryptioner.github.io/in-browser-llm-inference/embed.js' 
: 'http://localhost:5173/embed.js';


// AI Chat Plugin Configuration
export const AI_CHAT_CONFIG = {
  embedScriptUrl: `${embedScriptMainSrc}?system=${AI_CHAT_BASE_CONFIG.systemMessage}&domain=${AI_CHAT_BASE_CONFIG.domain}`,
  
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
