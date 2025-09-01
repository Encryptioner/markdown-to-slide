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

// More robust origin detection for GitHub Pages
export const origin = (() => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined' && window.location) {
    // In browser environment, use actual location
    return window.location.origin;
  }
  // Fallback for server-side rendering or build time
  return baseDomain;
})();

export const AI_CHAT_BASE_CONFIG = {
  get domain() {
    // Get current origin dynamically for better GitHub Pages support
    const currentOrigin = (typeof window !== 'undefined' && window.location) 
      ? window.location.origin 
      : origin;
    const fullDomain = `${currentOrigin}${basePublicPath}`;
    
    // Debug logs for troubleshooting
    if (isProduction) {
      console.log('AI Chat domain (production):', fullDomain);
      console.log('Current origin:', currentOrigin);
      console.log('Base public path:', basePublicPath);
    }
    
    return encodeURIComponent(fullDomain);
  },
  get systemMessage() {
    const message = `
      You are a helpful assistant.
      Keep responses as concise as possible.
      Avoid long explanations.
      You must reply as poem while giving the answer.
    `.replace(/\n/g, ' ').trim();
    return encodeURIComponent(message);
  }
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
  // Build embed script URL with proper encoding
  get embedScriptUrl() {
    const baseUrl = embedScriptMainSrc;
    
    // Ensure we have valid URL
    if (!baseUrl || !this.isValidUrl(baseUrl)) {
      console.error('Invalid embed script URL:', baseUrl);
      return '';
    }
    
    try {
      const systemParam = AI_CHAT_BASE_CONFIG.systemMessage;
      const domainParam = AI_CHAT_BASE_CONFIG.domain;
      const finalUrl = `${baseUrl}?system=${systemParam}&domain=${domainParam}`;
      
      console.log('AI Chat embed URL:', finalUrl); // Debug log for GitHub Pages
      return finalUrl;
    } catch (error) {
      console.error('Error building embed script URL:', error);
      return baseUrl; // Fallback to base URL without parameters
    }
  },
  
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
