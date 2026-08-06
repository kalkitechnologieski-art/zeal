// Security utilities
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://clerk.com https://vercel.live",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https://ui-avatars.com https://images.unsplash.com https://picsum.photos",
    "font-src 'self'",
    "connect-src 'self' https://api.clerk.com wss://api.zeal.com https://api.razorpay.com",
    "frame-src 'self' https://clerk.com",
  ].join('; '),
};

export const validateInput = (input: any, schema: any) => {
  // Zod validation wrapper
  return schema.parse(input);
};
