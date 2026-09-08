import { z } from "zod";

export const BookingCreateSchema = z.object({
  consultantId: z.string().cuid(),
  scheduledAt: z.string().datetime(),
  durationMinutes: z.number().min(5).max(120),
  externalEmail: z.string().email().optional(),
});

export const TopupSchema = z.object({
  amount: z.number().min(1),
});

export const AIStartSchema = z.object({
  aiConsultantId: z.string().cuid(),
});

export const AIMessageSchema = z.object({
  sessionId: z.string().cuid(),
  message: z.string().min(1),
});

export const AIEndSchema = z.object({
  sessionId: z.string().cuid(),
});

export const CallEndSchema = z.object({
  sessionId: z.string().cuid(),
  recordingFile: z.any().optional(),
  rating: z.number().min(1).max(5).optional(),
  review: z.string().optional(),
});
