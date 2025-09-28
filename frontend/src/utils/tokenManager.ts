// Enhanced token management utilities for secure authentication

interface TokenData {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

// Token events for better integration
export interface TokenEvents {
  onTokenRefreshed?: (tokenData: TokenData) => void;
  onTokenExpired?: () => void;
  onTokenCleared?: () => void;
}

class TokenManager {
  private static instance: TokenManager;
  private refreshPromise: Promise<string> | null = null;
  private events: TokenEvents = {};
  private refreshTimer: number | null = null;

  private constructor() {
    // Set up automatic token refresh
    this.setupAutoRefresh();
  }

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  // Subscribe to token events
  subscribe(events: TokenEvents): void {
    this.events = { ...this.events, ...events };
  }

  // Unsubscribe from token events
  unsubscribe(): void {
    this.events = {};
  }

  // Store tokens securely
  setTokens(tokenData: TokenData): void {
    try {
      localStorage.setItem("access_token", tokenData.access_token);
      localStorage.setItem("refresh_token", tokenData.refresh_token);
      localStorage.setItem(
        "token_expires_at",
        (Date.now() + tokenData.expires_in * 1000).toString()
      );

      // Set up auto refresh for this token
      this.setupAutoRefresh();

      // Notify listeners
      this.events.onTokenRefreshed?.(tokenData);
    } catch (error) {
      console.error("Failed to store tokens:", error);
    }
  }

  // Get access token
  getAccessToken(): string | null {
    return localStorage.getItem("access_token");
  }

  // Get refresh token
  getRefreshToken(): string | null {
    return localStorage.getItem("refresh_token");
  }

  // Check if token is expired
  isTokenExpired(): boolean {
    const expiresAt = localStorage.getItem("token_expires_at");
    if (!expiresAt) return true;

    const expirationTime = parseInt(expiresAt, 10);
    const now = Date.now();

    // Consider token expired if it expires within the next 5 minutes
    return now >= expirationTime - 5 * 60 * 1000;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();

    return !!(accessToken && refreshToken && !this.isTokenExpired());
  }

  // Clear all tokens
  clearTokens(): void {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("token_expires_at");

    // Clear auto refresh
    if (this.refreshTimer) {
      window.clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }

    // Clear any pending refresh
    this.refreshPromise = null;

    // Notify listeners
    this.events.onTokenCleared?.();
  }

  // Refresh access token
  async refreshAccessToken(): Promise<string> {
    // If there's already a refresh in progress, return the same promise
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    this.refreshPromise = this.performTokenRefresh(refreshToken);

    try {
      const newAccessToken = await this.refreshPromise;
      return newAccessToken;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(refreshToken: string): Promise<string> {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"
        }/auth/refresh`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refresh_token: refreshToken }),
        }
      );

      if (!response.ok) {
        throw new Error("Token refresh failed");
      }

      const tokenData: TokenData = await response.json();
      this.setTokens(tokenData);

      return tokenData.access_token;
    } catch (error) {
      // If refresh fails, clear all tokens
      this.clearTokens();
      this.events.onTokenExpired?.();
      throw error;
    }
  }

  // Set up automatic token refresh
  private setupAutoRefresh(): void {
    // Clear any existing timer
    if (this.refreshTimer) {
      window.clearTimeout(this.refreshTimer);
    }

    const expiresAt = localStorage.getItem("token_expires_at");
    if (!expiresAt) return;

    const expirationTime = parseInt(expiresAt, 10);
    const now = Date.now();
    const timeUntilRefresh = expirationTime - now - 10 * 60 * 1000; // Refresh 10 minutes before expiry

    if (timeUntilRefresh > 0) {
      this.refreshTimer = window.setTimeout(async () => {
        try {
          await this.refreshAccessToken();
        } catch (error) {
          console.error("Auto token refresh failed:", error);
          this.events.onTokenExpired?.();
        }
      }, timeUntilRefresh);
    }
  }

  // Get authorization header
  getAuthHeader(): string | null {
    const token = this.getAccessToken();
    return token ? `Bearer ${token}` : null;
  }

  // Check if token needs refresh (within 5 minutes of expiry)
  needsRefresh(): boolean {
    const expiresAt = localStorage.getItem("token_expires_at");
    if (!expiresAt) return false;

    const expirationTime = parseInt(expiresAt, 10);
    const now = Date.now();

    // Need refresh if token expires within the next 5 minutes
    return now >= expirationTime - 5 * 60 * 1000;
  }

  // Get time until token expires (in milliseconds)
  getTimeUntilExpiry(): number {
    const expiresAt = localStorage.getItem("token_expires_at");
    if (!expiresAt) return 0;

    const expirationTime = parseInt(expiresAt, 10);
    const now = Date.now();

    return Math.max(0, expirationTime - now);
  }
}

export const tokenManager = TokenManager.getInstance();
