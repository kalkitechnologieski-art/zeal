export const DEFAULT_PLATFORM_FEE = 10; // 10%
export const MIN_PLATFORM_FEE = 0;
export const MAX_PLATFORM_FEE = 50;
export const MIN_PER_MINUTE_RATE = 10;
export const MAX_PER_MINUTE_RATE = 500;
export const FREE_MINUTES_PER_DAY = 3;
export const AI_RATE_PER_MINUTE = 2;
export const CURRENCY = 'INR';

export const BOOKING_REMINDER_INTERVALS = [15, 5]; // minutes before
export const RECORDING_RETENTION_DAYS = 30;

export const ROLES = {
  USER: 'USER',
  HEALER: 'HEALER',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const;
