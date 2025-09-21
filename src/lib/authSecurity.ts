// Advanced authentication utilities
import { jwtDecode } from 'jwt-decode';

export interface TokenPayload {
  sub: string;
  exp: number;
  iat: number;
  jti: string;
  user_id: number;
  role: string;
}

export class AuthSecurityManager {
  private static readonly TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes before expiry
  private static readonly MAX_FAILED_ATTEMPTS = 5;
  private static readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

  // Check if token is valid and not expired
  static isTokenValid(token: string): boolean {
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      const now = Date.now() / 1000;
      return decoded.exp > now;
    } catch {
      return false;
    }
  }

  // Check if token needs refresh
  static shouldRefreshToken(token: string): boolean {
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      const now = Date.now() / 1000;
      const timeUntilExpiry = (decoded.exp - now) * 1000;
      return timeUntilExpiry < this.TOKEN_REFRESH_THRESHOLD;
    } catch {
      return false;
    }
  }

  // Get token expiry time
  static getTokenExpiry(token: string): Date | null {
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      return new Date(decoded.exp * 1000);
    } catch {
      return null;
    }
  }

  // Get user info from token
  static getUserFromToken(token: string): Partial<TokenPayload> | null {
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      return {
        user_id: decoded.user_id,
        role: decoded.role,
        exp: decoded.exp,
        iat: decoded.iat
      };
    } catch {
      return null;
    }
  }

  // Track failed login attempts
  static trackFailedAttempt(identifier: string): void {
    const key = `failed_attempts_${identifier}`;
    const attempts = this.getFailedAttempts(identifier);
    const newAttempts = {
      count: attempts.count + 1,
      lastAttempt: Date.now(),
      lockedUntil: attempts.count + 1 >= this.MAX_FAILED_ATTEMPTS 
        ? Date.now() + this.LOCKOUT_DURATION 
        : 0
    };
    
    localStorage.setItem(key, JSON.stringify(newAttempts));
  }

  // Get failed attempts info
  static getFailedAttempts(identifier: string): {
    count: number;
    lastAttempt: number;
    lockedUntil: number;
  } {
    const key = `failed_attempts_${identifier}`;
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Ignore parse errors
    }
    
    return { count: 0, lastAttempt: 0, lockedUntil: 0 };
  }

  // Check if account is locked
  static isAccountLocked(identifier: string): boolean {
    const attempts = this.getFailedAttempts(identifier);
    return attempts.lockedUntil > Date.now();
  }

  // Clear failed attempts (on successful login)
  static clearFailedAttempts(identifier: string): void {
    const key = `failed_attempts_${identifier}`;
    localStorage.removeItem(key);
  }

  // Get remaining lockout time
  static getRemainingLockoutTime(identifier: string): number {
    const attempts = this.getFailedAttempts(identifier);
    if (attempts.lockedUntil > Date.now()) {
      return attempts.lockedUntil - Date.now();
    }
    return 0;
  }

  // Secure token storage with encryption (basic XOR for demo)
  static secureStore(key: string, value: string): void {
    try {
      // Simple XOR encryption for demo - in production use proper encryption
      const encrypted = this.xorEncrypt(value, 'secure_key_learn_academy');
      localStorage.setItem(key, encrypted);
    } catch (error) {
      console.error('Failed to securely store data:', error);
      // Fallback to regular storage
      localStorage.setItem(key, value);
    }
  }

  // Secure token retrieval with decryption
  static secureRetrieve(key: string): string | null {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return null;
      
      // Try to decrypt
      try {
        return this.xorDecrypt(encrypted, 'secure_key_learn_academy');
      } catch {
        // If decryption fails, assume it's plain text (fallback)
        return encrypted;
      }
    } catch (error) {
      console.error('Failed to securely retrieve data:', error);
      return null;
    }
  }

  // Simple XOR encryption/decryption (for demo purposes only)
  private static xorEncrypt(text: string, key: string): string {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(result);
  }

  private static xorDecrypt(encrypted: string, key: string): string {
    const text = atob(encrypted);
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
  }

  // Generate a secure random session ID
  static generateSessionId(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Validate password strength
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    // Length check
    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('Password must be at least 8 characters long');
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password must contain at least one uppercase letter');
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password must contain at least one lowercase letter');
    }

    // Number check
    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password must contain at least one number');
    }

    // Special character check
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password must contain at least one special character');
    }

    // Common patterns check
    const commonPatterns = ['123', 'abc', 'password', 'admin', 'user'];
    if (commonPatterns.some(pattern => password.toLowerCase().includes(pattern))) {
      score -= 1;
      feedback.push('Password should not contain common patterns');
    }

    return {
      isValid: score >= 4,
      score: Math.max(0, score),
      feedback
    };
  }

  // Device fingerprinting for additional security
  static getDeviceFingerprint(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint', 2, 2);
    }
    
    const fingerprint = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      canvas: canvas.toDataURL(),
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack
    };

    return btoa(JSON.stringify(fingerprint));
  }
}