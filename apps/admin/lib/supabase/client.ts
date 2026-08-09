// Placeholder – replace with real Supabase client when needed
export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    signOut: async () => ({ error: null }),
  },
  from: () => ({
    select: () => ({
      single: async () => ({ data: null, error: null }),
    }),
  }),
};

export type AdminRole = 'super_admin' | 'client_admin';

export interface AdminProfile {
  id: string;
  email: string;
  role: AdminRole;
  name: string;
  avatar?: string;
  consultantId?: string;
  createdAt: string;
}
