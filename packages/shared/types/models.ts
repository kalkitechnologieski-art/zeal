import type {
  Role,
  ConsultantCategory,
  Faith,
  BookingStatus,
  CallStatus,
  TransactionType,
} from './enums';

export interface User {
  id: string;
  email: string;
  username: string;
  name: string | null;
  avatar: string | null;
  role: Role;
  sparks: number;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  escrow: number;
  pendingIn: number;
  pendingOut: number;
  blocked: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  walletId: string;
  type: TransactionType;
  amount: number;
  balance: number;
  description: string;
  referenceId: string | null;
  metadata: any | null;
  createdAt: Date;
}

export interface Consultant {
  id: string;
  userId: string;
  category: ConsultantCategory;
  specialties: string[];
  languages: string[];
  bio: string | null;
  perMinuteRate: number;
  isVerified: boolean;
  isActive: boolean;
  faith: Faith;
  rating: number;
  totalConsultations: number;
  earnings: number;
  availability: any; // JSON
  createdAt: Date;
  updatedAt: Date;
}

export interface Booking {
  id: string;
  userId: string | null;
  consultantId: string;
  scheduledAt: Date;
  durationMinutes: number;
  status: BookingStatus;
  meetingLink: string | null;
  externalEmail: string | null;
  paymentId: string | null;
  amount: number;
  platformFee: number;
  consultantEarning: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CallSession {
  id: string;
  bookingId: string | null;
  userId: string;
  consultantId: string;
  startTime: Date;
  endTime: Date | null;
  durationSeconds: number;
  amount: number;
  status: CallStatus;
  recordingUrl: string | null;
  recordingReady: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  message: string;
  redirectUrl: string | null;
  read: boolean;
  actorId: string;
  createdAt: Date;
  updatedAt: Date;
}
