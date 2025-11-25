import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BaseUrlService {

  constructor() { }

  /**
   * Retrieves the base URL (origin) of the current application instance.
   * This handles both local development and Firebase production hosting.
   * @returns The base URL (e.g., 'https://yourapp.web.app' or 'http://localhost:4200').
   */
  public getBaseUrl(): string {
    // Check if window (the browser environment) is available
    if (typeof window !== 'undefined' && window.location && window.location.origin) {
      return window.location.origin;
    }
    
    // Fallback for server-side rendering (SSR) or non-browser environments
    // You would typically need to inject a request object in SSR to get the host.
    // For standard Angular/Firebase, this is usually sufficient.
    console.warn('window.location.origin not available. Defaulting to empty string.');
    return ''; 
  }
}