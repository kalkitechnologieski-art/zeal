export interface User {
  id: string;
  email: string;
  avatar?: string;
  name?: string;
  role: "USER" | "HEALER" | "ADMIN";
  sparks: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface HealerProfile {
  id: string;
  userId: string;
  user: User;
  specialties: string[];
  languages: string[];
  bio?: string;
  perMinuteRate: number;
  isVerified: boolean;
  isActive: boolean;
  faith: "HINDU" | "ISLAM" | "CHRISTIAN" | "BUDDHIST" | "JEWISH" | "SIKH" | "OTHER";
  rating: number;
  totalConsultations: number;
  earnings: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConsultantProfile {
  id: string;
  userId: string;
  name: string;
  username: string;
  bio: string;
  avatar: string;
  category: "astrologer" | "psychologist" | "tarot" | "numerologist" | "palmist" | "vastu" | "reiki" | "life_coach" | "healer";
  isVerified: boolean;
  isOnline: boolean;
  perMinuteRate: number;
  experience: number;
  rating: number;
  totalConsultations: number;
  sparks: number;
  languages: string[];
  specialties: string[];
  faith: "HINDU" | "ISLAM" | "CHRISTIAN" | "BUDDHIST" | "JEWISH" | "SIKH" | "OTHER";
}

export interface Post {
  id: string;
  content: string;
  imageUrl?: string;
  authorId: string;
  cheerCount: number;
  commentCount: number;
  shareCount: number;
  createdAt: Date;
}

export interface SparkActivity {
  id: string;
  type: "cheer" | "comment" | "share" | "follow" | "mention";
  actor: { id: string; username: string; avatar: string };
  target?: { id: string; content: string };
  sparksEarned: number;
  createdAt: Date;
}

export interface SparkBazaarListing {
  id: string;
  userId: string;
  user: User;
  sparks: number;
  rank: number;
  tier: "bronze" | "silver" | "gold";
  isAvailable: boolean;
}

export interface BazaarBid {
  id: string;
  listingId: string;
  healerId: string;
  amount: number;
  status: "pending" | "accepted" | "rejected" | "completed";
  createdAt: Date;
  updatedAt: Date;
}

export interface Referral {
  id: string;
  referrerId: string;
  referredId: string;
  type: "user" | "healer";
  status: "pending" | "completed" | "expired";
  sparksEarned: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  type: "daily" | "weekly";
  requirement: number;
  reward: number;
  icon: string;
  isActive: boolean;
}

export interface QuestProgress {
  id: string;
  userId: string;
  questId: string;
  progress: number;
  isCompleted: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PayoutRequest {
  id: string;
  healerId: string;
  amount: number;
  status: "pending" | "approved" | "rejected" | "completed";
  bankDetails: {
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Consultation {
  id: string;
  userId: string;
  healerId: string;
  status: "REQUESTED" | "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  type: "CHAT" | "VOICE" | "VIDEO";
  scheduledAt?: Date;
  durationMinutes: number;
  amount: number;
  platformFee: number;
  healerEarning: number;
  rating?: number;
  review?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FreeService {
  id: string;
  name: string;
  description: string;
  icon: string;
  route: string;
  isAIPowered: boolean;
}

export interface CategorySection {
  id: string;
  name: string;
  icon: string;
  consultants: ConsultantProfile[];
}
