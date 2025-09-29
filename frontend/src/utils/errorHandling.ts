/**
 * Error handling utilities for the financial document analyzer
 */

export interface ErrorDetails {
  message: string;
  type: 'network' | 'server' | 'client' | 'unknown';
  canRetry: boolean;
}

/**
 * Parse and categorize errors for better user experience
 */
export const parseError = (error: unknown): ErrorDetails => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    // Network errors
    if (message.includes('fetch') || message.includes('network') || message.includes('cors')) {
      return {
        message: "Network error. Please check your connection and try again.",
        type: 'network',
        canRetry: true,
      };
    }
    
    // Service unavailable errors
    if (message.includes('cannot read properties of undefined') || 
        message.includes('service unavailable') ||
        message.includes('503')) {
      return {
        message: "Analysis service is currently unavailable. Please try again in a few moments.",
        type: 'server',
        canRetry: true,
      };
    }
    
    // Not found errors
    if (message.includes('404') || message.includes('not found')) {
      return {
        message: "Document not found. Please try uploading the document again.",
        type: 'client',
        canRetry: false,
      };
    }
    
    // Authentication errors
    if (message.includes('401') || message.includes('unauthorized')) {
      return {
        message: "Authentication required. Please log in and try again.",
        type: 'client',
        canRetry: false,
      };
    }
    
    // Forbidden errors
    if (message.includes('403') || message.includes('forbidden')) {
      return {
        message: "Access denied. You don't have permission for this action.",
        type: 'client',
        canRetry: false,
      };
    }
    
    // Validation errors
    if (message.includes('422') || message.includes('validation')) {
      return {
        message: "Invalid data. Please check your input and try again.",
        type: 'client',
        canRetry: false,
      };
    }
    
    // Rate limiting
    if (message.includes('429') || message.includes('rate limit')) {
      return {
        message: "Too many requests. Please wait a moment and try again.",
        type: 'server',
        canRetry: true,
      };
    }
    
    // Server errors
    if (message.includes('500') || message.includes('server error')) {
      return {
        message: "Server error. Please try again later.",
        type: 'server',
        canRetry: true,
      };
    }
    
    // Return the original error message for other cases
    return {
      message: error.message,
      type: 'unknown',
      canRetry: true,
    };
  }
  
  // Handle non-Error objects
  if (typeof error === 'string') {
    return {
      message: error,
      type: 'unknown',
      canRetry: true,
    };
  }
  
  // Fallback for unknown error types
  return {
    message: "An unexpected error occurred. Please try again.",
    type: 'unknown',
    canRetry: true,
  };
};

/**
 * Create user-friendly error messages with action suggestions
 */
export const createErrorMessage = (error: unknown, context?: string): string => {
  const errorDetails = parseError(error);
  const contextPrefix = context ? `${context}: ` : '';
  
  let actionSuggestion = '';
  if (errorDetails.canRetry) {
    actionSuggestion = ' You can try again.';
  }
  
  return `${contextPrefix}${errorDetails.message}${actionSuggestion}`;
};

/**
 * Check if an error is retryable
 */
export const isRetryableError = (error: unknown): boolean => {
  const errorDetails = parseError(error);
  return errorDetails.canRetry;
};
