import { z } from 'zod';
import {
  Role,
  ConsultantCategory,
  Faith,
  BookingStatus,
  CallStatus,
  TransactionType,
} from './enums';

export const UserSchema = z.object({
  id: z.string().cuid(),
  email: z.string().email(),
  username: z.string().min(3).max(50),
  name: z.string().optional().nullable(),
  avatar: z.string().url().optional().nullable(),
  role: z.nativeEnum(Role),
  sparks: z.number().int().min(0),
  isVerified: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const WalletSchema = z.object({
  id: z.string().cuid(),
  userId: z.string().cuid(),
  balance: z.number().min(0),
  escrow: z.number().min(0),
  pendingIn: z.number().min(0),
  pendingOut: z.number().min(0),
  blocked: z.number().min(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const TransactionSchema = z.object({
  id: z.string().cuid(),
  walletId: z.string().cuid(),
  type: z.nativeEnum(TransactionType),
  amount: z.number(),
  balance: z.number(),
  description: z.string(),
  referenceId: z.string().optional().nullable(),
  metadata: z.any().optional().nullable(),
  createdAt: z.date(),
});

export const BookingSchema = z.object({
  id: z.string().cuid(),
  userId: z.string().cuid().optional().nullable(),
  consultantId: z.string().cuid(),
  scheduledAt: z.date(),
  durationMinutes: z.number().int().min(5),
  status: z.nativeEnum(BookingStatus),
  meetingLink: z.string().url().optional().nullable(),
  externalEmail: z.string().email().optional().nullable(),
  paymentId: z.string().optional().nullable(),
  amount: z.number().min(0),
  platformFee: z.number().min(0),
  consultantEarning: z.number().min(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateBookingSchema = z.object({
  consultantId: z.string().cuid(),
  scheduledAt: z.string().datetime(),
  durationMinutes: z.number().int().min(5).max(120),
  externalEmail: z.string().email().optional(),
});

export const TopupSchema = z.object({
  amount: z.number().min(1).max(100000),
});

export const PlatformFeeSchema = z.object({
  feePercent: z.number().min(0).max(50),
});

// Type inference helpers
export type UserType = z.infer<typeof UserSchema>;
export type WalletType = z.infer<typeof WalletSchema>;
export type TransactionType = z.infer<typeof TransactionSchema>;
export type BookingType = z.infer<typeof BookingSchema>;
export type CreateBookingType = z.infer<typeof CreateBookingSchema>;
export type TopupType = z.infer<typeof TopupSchema>;
export type PlatformFeeType = z.infer<typeof PlatformFeeSchema>;
