/**
 * Google Analytics Configuration
 * Privacy-first: tracking is disabled by default
 */
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
