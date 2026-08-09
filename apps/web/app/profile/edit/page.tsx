'use client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Avatar, AvatarImage, AvatarFallback } from '@zeal/ui';
import { ArrowLeft, Camera, Loader2 } from 'lucide-react';
import { useState, useRef } from 'react';

const profileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  bio: z.string().max(160, 'Bio must be under 160 characters').optional(),
  email: z.string().email('Invalid email address'),
  name: z.string().optional(),
  isHealer: z.boolean().optional(),
  specialties: z.string().optional(),
  languages: z.string().optional(),
  perMinuteRate: z.number().min(0).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfileEditPage() {
  const router = useRouter();
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, watch } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || 'seeker',
      bio: 'Exploring spirituality and wellness.',
      email: user?.emailAddresses[0]?.emailAddress || '',
      name: user?.fullName || '',
      isHealer: false,
      specialties: '',
      languages: '',
      perMinuteRate: 0,
    },
  });

  const isHealer = watch('isHealer');

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push('/profile');
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-animated rounded-2xl p-6 border border-[#E1C5E7]/30 dark:border-gray-700/30"
      >
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#9D7DC5] hover:underline mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <h1 className="text-2xl font-bold text-[#5E4B8B] dark:text-white mb-6">Edit Profile</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="w-24 h-24 ring-2 ring-[#9D7DC5]/20">
                <AvatarImage src={avatarFile ? URL.createObjectURL(avatarFile) : user?.imageUrl || undefined} alt="Avatar" />
                <AvatarFallback className="bg-gradient-to-br from-[#9D7DC5] to-[#533AFD] text-white">
                  {user?.firstName?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 p-1.5 bg-[#9D7DC5] rounded-full text-white hover:bg-[#533AFD] transition-colors shadow-lg"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-[#5E4B8B] dark:text-white">Profile Photo</p>
              <p className="text-xs text-[#B8A1D9] dark:text-gray-400">Click the camera icon to upload</p>
            </div>
          </div>

          <Input label="Username" {...register('username')} />
          <Input label="Full Name" {...register('name')} />
          <Input label="Email" type="email" {...register('email')} disabled />

          <div>
            <label className="block text-sm font-medium text-[#5E4B8B] dark:text-white mb-1">Bio</label>
            <textarea
              {...register('bio')}
              rows={4}
              className="w-full rounded-xl glass border border-[#E1C5E7]/30 dark:border-gray-700/30 px-4 py-3 text-[#5E4B8B] dark:text-white focus:ring-2 focus:ring-[#9D7DC5]/50 outline-none resize-none"
              placeholder="Tell us about yourself..."
            />
          </div>

          <div className="border-t border-[#E1C5E7]/30 dark:border-gray-700/30 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                id="isHealer"
                {...register('isHealer')}
                className="w-4 h-4 rounded border-[#E1C5E7] dark:border-gray-700 text-[#9D7DC5] focus:ring-[#9D7DC5]"
              />
              <label htmlFor="isHealer" className="text-sm font-medium text-[#5E4B8B] dark:text-white">
                I am a healer/consultant
              </label>
            </div>

            {isHealer && (
              <div className="space-y-3 pl-6 border-l-2 border-[#9D7DC5]/30">
                <Input label="Specialties (comma separated)" {...register('specialties')} />
                <Input label="Languages (comma separated)" {...register('languages')} />
                <Input
                  label="Per Minute Rate (₹)"
                  type="number"
                  {...register('perMinuteRate', { valueAsNumber: true })}
                />
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1 btn-luxury">
              {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...</> : 'Save Changes'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => router.back()} className="glass">
              Cancel
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
