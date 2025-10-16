/**
 * Simple Analytics integration for event tracking
 * Docs: https://docs.simpleanalytics.com/events
 */

// Extend window type for Simple Analytics
declare global {
  interface Window {
    sa_event?: (eventName: string, metadata?: Record<string, any>) => void;
  }
}

/**
 * Track an event using Simple Analytics
 */
export function track(eventName: string, metadata?: Record<string, any>): void {
  // Send to Simple Analytics if available
  if (typeof window !== 'undefined' && window.sa_event) {
    try {
      window.sa_event(eventName, metadata);
    } catch (e) {
      console.warn('Simple Analytics tracking failed:', e);
    }
  }
}

/**
 * Track button click
 */
export function trackButtonClick(buttonName: string): void {
  track('button_click', { button: buttonName });
}

/**
 * Track grid initialization
 */
export function trackGridInitialized(config: {
  height: number;
  width: number;
  foodCount: number;
  cellCount: number;
  maxValue: number;
  energy: number;
  cellsDie: boolean;
  allowRandomMove: boolean;
  cannibalMode: boolean;
}): void {
  track('grid_initialized', config);
}

/**
 * Track simulation start
 */
export function trackSimulationStarted(delay: number): void {
  track('simulation_started', { delay });
}

/**
 * Track help modal events
 */
export function trackHelpOpened(): void {
  track('help_opened');
}

export function trackHelpClosed(method: 'close_button' | 'backdrop_click' | 'escape_key'): void {
  track('help_closed', { method });
}

// Create analytics object for backwards compatibility
export const analytics = {
  track,
  trackButtonClick,
  trackGridInitialized,
  trackSimulationStarted,
  trackHelpOpened,
  trackHelpClosed,
};
