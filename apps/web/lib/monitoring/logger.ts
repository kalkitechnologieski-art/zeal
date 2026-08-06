// Simple error logger
// In production, replace with Sentry or similar service

export const logError = (error: Error, context?: Record<string, any>) => {
  console.error("Error:", error.message, context);
  // Send to logging service
};

export const logInfo = (message: string, data?: Record<string, any>) => {
  console.info(message, data);
};

export const logWarn = (message: string, data?: Record<string, any>) => {
  console.warn(message, data);
};
