'use client';
import { SignIn } from '@clerk/nextjs';
import { motion } from 'framer-motion';

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#533AFD] via-[#9D7DC5] to-[#533AFD] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-4xl">✨</span>
            <span className="text-3xl font-bold text-white drop-shadow-lg">Zeal Admin</span>
          </div>
          <p className="text-white/70 text-sm">Manage your platform with ease</p>
        </div>
        <div className="glass-card-3d p-6 border border-white/20">
          <SignIn
            routing="path"
            path="/login"
            signUpUrl="/register"
            redirectUrl="/dashboard"
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'bg-transparent shadow-none',
                headerTitle: 'text-[#5E4B8B] dark:text-white text-2xl font-bold',
                headerSubtitle: 'text-[#B8A1D9] dark:text-gray-400',
                socialButtonsBlockButton: 'glass border border-[#E1C5E7] dark:border-gray-700 hover:bg-white/20 transition-colors',
                formButtonPrimary: 'bg-gradient-to-r from-[#9D7DC5] to-[#533AFD] text-white font-medium hover:shadow-lg hover:shadow-[#533AFD]/30 transition-all',
                formFieldInput: 'glass border border-[#E1C5E7] dark:border-gray-700 focus:ring-2 focus:ring-[#9D7DC5] outline-none transition-all',
                footer: 'text-[#B8A1D9] dark:text-gray-400',
                footerActionLink: 'text-[#9D7DC5] hover:text-[#533AFD] transition-colors',
              },
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}
