// Monitoring configuration
export const monitoringConfig = {
  // Sentry (if configured)
  sentry: {
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 0.1,
  },
  // Vercel Analytics
  vercelAnalytics: {
    id: process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID,
  },
  // Custom logging
  logging: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  },
};

export const metrics = {
  collect: (name: string, value: number) => {
    // In production, send to monitoring service
    console.log(`[Metric] ${name}: ${value}`);
  },
};
