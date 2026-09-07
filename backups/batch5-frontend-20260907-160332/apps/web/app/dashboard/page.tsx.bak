'use client';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Heart, MessageCircle, Share2, Sparkles, ArrowRight, Zap, Star, Clock, Users, Award } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@zeal/ui';
import { ServiceCard } from '@/components/home/ServiceCard';
import { ConsultantCarousel } from '@/components/home/ConsultantCarousel';
import { useAppStore } from '@/lib/store/appStore';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { cn } from '@/lib/utils';
import { ConsultantCategory } from '@zeal/types';

// Free AI Services – only AI-powered free services
const freeAIServices = [
  { id: 'horoscope', name: 'Horoscope', icon: '🌙', description: 'Daily AI predictions', isFree: true, route: '/services/horoscope', tag: 'AI' },
  { id: 'tarot', name: 'Tarot', icon: '🔮', description: '3-card AI reading', isFree: true, route: '/services/tarot', tag: 'AI' },
  { id: 'kundali', name: 'Kundali', icon: '🪐', description: 'Instant birth chart', isFree: true, route: '/services/kundali', tag: 'AI' },
  { id: 'palmistry', name: 'Palmistry', icon: '🖐️', description: 'AI palm analysis', isFree: true, route: '/services/palmistry', tag: 'AI' },
  { id: 'numerology', name: 'Numerology', icon: '🔢', description: 'Life path report', isFree: true, route: '/services/numerology', tag: 'AI' },
];

// All Services – consultancy categories with feature labels
const allServices = [
  { id: 'astrologer', name: 'Astrologers', icon: '⭐', description: 'Vedic, KP, Nadi, Western', route: '/explore?category=astrologer', tag: 'Expert' },
  { id: 'psychologist', name: 'Psychologists', icon: '🧠', description: 'CBT, Anxiety, Depression', route: '/explore?category=psychologist', tag: 'Therapy' },
  { id: 'tarot', name: 'Tarot Readers', icon: '🔮', description: 'Rider-Waite, Lenormand', route: '/explore?category=tarot', tag: 'Intuitive' },
  { id: 'numerologist', name: 'Numerologists', icon: '🔢', description: 'Life path, Destiny mapping', route: '/explore?category=numerologist', tag: 'Destiny' },
  { id: 'palmist', name: 'Palmists', icon: '🖐️', description: 'Classical, Modern reading', route: '/explore?category=palmist', tag: 'Insight' },
  { id: 'vastu', name: 'Vastu Experts', icon: '🏠', description: 'Vastu Shastra, Feng Shui', route: '/explore?category=vastu', tag: 'Harmony' },
  { id: 'reiki', name: 'Reiki Masters', icon: '✨', description: 'Energy healing, Chakra', route: '/explore?category=reiki', tag: 'Healing' },
  { id: 'life_coach', name: 'Life Coaches', icon: '🎯', description: 'Career, Relationships', route: '/explore?category=life_coach', tag: 'Growth' },
  { id: 'healer', name: 'Healers', icon: '💫', description: 'Pranic, Crystal, Sound', route: '/explore?category=healer', tag: 'Wellness' },
  { id: 'motivational_speaker', name: 'Motivational Speakers', icon: '🎤', description: 'Inspiration, Leadership', route: '/explore?category=motivational_speaker', tag: 'Inspire' },
  { id: 'spiritual_guide', name: 'Spiritual Guides', icon: '🕊️', description: 'Meditation, Mindfulness', route: '/explore?category=spiritual_guide', tag: 'Peace' },
  { id: 'yoga_instructor', name: 'Yoga Instructors', icon: '🧘', description: 'Hatha, Vinyasa, Kundalini', route: '/explore?category=yoga_instructor', tag: 'Fitness' },
];

// Featured consultants (top rated)
const featuredConsultants = [
  { id: 'a1', name: 'Rajesh Sharma', username: 'raj_astrologer', avatar: 'https://ui-avatars.com/api/?name=Rajesh+Sharma&background=9D7DC5&color=fff', isOnline: true, perMinuteRate: 50, rating: 4.9, experience: 12, category: ConsultantCategory.ASTROLOGER, userId: 'u1', isVerified: true, totalConsultations: 1200, sparks: 25000, languages: ['Hindi', 'English'], specialties: ['Vedic', 'KP'], faith: 'HINDU', bio: 'Vedic Astrologer with 12+ years experience' },
  { id: 'p1', name: 'Dr. Meera Nair', username: 'dr_meera', avatar: 'https://ui-avatars.com/api/?name=Meera+Nair&background=9D7DC5&color=fff', isOnline: true, perMinuteRate: 80, rating: 4.7, experience: 10, category: ConsultantCategory.PSYCHOLOGIST, userId: 'u3', isVerified: true, totalConsultations: 600, sparks: 15000, languages: ['English'], specialties: ['CBT', 'Anxiety'], faith: 'OTHER', bio: 'Licensed psychologist specializing in anxiety' },
  { id: 't1', name: 'Sana Khan', username: 'sana_tarot', avatar: 'https://ui-avatars.com/api/?name=Sana+Khan&background=9D7DC5&color=fff', isOnline: true, perMinuteRate: 60, rating: 4.8, experience: 6, category: ConsultantCategory.TAROT, userId: 'u4', isVerified: true, totalConsultations: 400, sparks: 10000, languages: ['Hindi', 'English'], specialties: ['Rider-Waite', 'Lenormand'], faith: 'ISLAM', bio: 'Professional tarot reader' },
];

export default function DashboardPage() {
  const { user } = useAppStore();
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 200], [1, 0.7]);
  const heroScale = useTransform(scrollY, [0, 200], [1, 0.95]);

  const heroRef = useScrollReveal({ threshold: 0.2 });
  const servicesRef = useScrollReveal({ threshold: 0.1 });
  const allServicesRef = useScrollReveal({ threshold: 0.1 });
  const consultantsRef = useScrollReveal({ threshold: 0.1 });
  const feedRef = useScrollReveal({ threshold: 0.1 });

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ['feed'],
    queryFn: async () => {
      const res = await fetch('/api/posts/feed');
      if (!res.ok) throw new Error('Failed to fetch feed');
      const data = await res.json();
      return Array.isArray(data) ? data : data.posts || [];
    },
    retry: false,
  });

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 space-y-10">
      {/* Hero – Parallax effect */}
      <motion.section
        ref={heroRef.ref}
        style={{ opacity: heroOpacity, scale: heroScale }}
        className={cn('scroll-reveal', heroRef.isInView && 'in-view')}
      >
        <div className="relative overflow-hidden rounded-2xl md:rounded-3xl h-56 sm:h-64 md:h-80 lg:h-96">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            poster="/videos/hero-poster.jpg"
          >
            <source src="/videos/hero.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={heroRef.isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight"
            >
              Welcome {user?.name || 'Seeker'}!
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={heroRef.isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="text-white/80 text-sm sm:text-base md:text-lg mt-1 max-w-md"
            >
              Your journey to wellness starts here.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={heroRef.isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex flex-wrap gap-2 mt-3"
            >
              <Button variant="primary" className="btn-luxury flex items-center gap-2 bg-white text-[#533AFD] hover:bg-white/90 text-sm px-4 py-2">
                Explore Now <ArrowRight className="w-4 h-4" />
              </Button>
              <Button variant="secondary" className="glass border-white/20 text-white hover:bg-white/10 text-sm px-4 py-2">
                <Zap className="w-4 h-4 mr-2" /> AI Services
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Free AI Services */}
      <section ref={servicesRef.ref} className={cn('scroll-reveal-stagger', servicesRef.isInView && 'in-view')}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg sm:text-xl font-bold text-[#5E4B8B] dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#FFD700]" /> Free AI Services
          </h2>
          <Link href="/services?filter=free" className="text-xs sm:text-sm text-[#9D7DC5] hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
          {freeAIServices.map((service) => (
            <ServiceCard key={service.id} {...service} />
          ))}
        </div>
      </section>

      {/* All Services – Consultancy Categories */}
      <section ref={allServicesRef.ref} className={cn('scroll-reveal-stagger', allServicesRef.isInView && 'in-view')}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg sm:text-xl font-bold text-[#5E4B8B] dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-[#9D7DC5]" /> All Services
          </h2>
          <Link href="/explore" className="text-xs sm:text-sm text-[#9D7DC5] hover:underline flex items-center gap-1">
            Explore All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
          {allServices.map((service) => (
            <motion.div
              key={service.id}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="glass-card-3d p-3 sm:p-4 text-center flex flex-col items-center hover:shadow-xl transition-all"
            >
              <Link href={service.route} className="block w-full">
                <div className="text-3xl sm:text-4xl mb-1">{service.icon}</div>
                <h3 className="font-semibold text-[#5E4B8B] dark:text-white text-xs sm:text-sm">{service.name}</h3>
                <p className="text-[10px] sm:text-xs text-[#B8A1D9] dark:text-gray-400 mt-0.5">{service.description}</p>
                <span className="mt-1.5 inline-block text-[8px] sm:text-[10px] px-2 py-0.5 rounded-full bg-[#9D7DC5]/10 text-[#9D7DC5] border border-[#9D7DC5]/20">
                  {service.tag}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Top Consultants */}
      {featuredConsultants.length > 0 && (
        <section ref={consultantsRef.ref} className={cn('scroll-reveal', consultantsRef.isInView && 'in-view')}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#5E4B8B] dark:text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" /> Top Consultants
            </h2>
            <Link href="/explore" className="text-xs sm:text-sm text-[#9D7DC5] hover:underline flex items-center gap-1">
              See All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {featuredConsultants.map((consultant) => (
              <motion.div
                key={consultant.id}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="glass-card-3d p-3 text-center hover:shadow-xl transition-all"
              >
                <Link href={`/consultant/${consultant.id}`} className="block">
                  <div className="relative inline-block">
                    <img
                      src={consultant.avatar}
                      alt={consultant.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-2 ring-[#9D7DC5]/20 mx-auto"
                    />
                    {consultant.isOnline && (
                      <span className="absolute bottom-0 right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
                    )}
                    {consultant.isVerified && (
                      <span className="absolute -top-1 -right-1 bg-[#9D7DC5] rounded-full p-0.5 shadow-lg">
                        <span className="text-white text-[8px]">✓</span>
                      </span>
                    )}
                  </div>
                  <h3 className="mt-2 font-semibold text-[#5E4B8B] dark:text-white text-sm">{consultant.name}</h3>
                  <p className="text-[10px] text-[#B8A1D9] dark:text-gray-400">@{consultant.username}</p>
                  <div className="flex items-center justify-center gap-2 mt-1 text-xs">
                    <span className="text-yellow-500">⭐ {consultant.rating}</span>
                    <span className="text-[#B8A1D9] dark:text-gray-400">₹{consultant.perMinuteRate}/min</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F4E8F7] dark:bg-gray-800 text-[#5E4B8B] dark:text-white">
                      {consultant.specialties?.[0] || 'General'}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Feed */}
      <section ref={feedRef.ref} className={cn('scroll-reveal', feedRef.isInView && 'in-view')}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg sm:text-xl font-bold text-[#5E4B8B] dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-[#9D7DC5]" /> Latest Updates
          </h2>
          <span className="text-[10px] text-[#B8A1D9] dark:text-gray-400">Live</span>
        </div>
        {postsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card-3d animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#E1C5E7]/50 dark:bg-gray-700/50" />
                  <div className="flex-1">
                    <div className="h-4 bg-[#E1C5E7]/50 dark:bg-gray-700/50 rounded w-24" />
                    <div className="h-3 bg-[#E1C5E7]/50 dark:bg-gray-700/50 rounded w-16 mt-1" />
                  </div>
                </div>
                <div className="mt-3 h-4 bg-[#E1C5E7]/50 dark:bg-gray-700/50 rounded w-full" />
                <div className="mt-2 h-4 bg-[#E1C5E7]/50 dark:bg-gray-700/50 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : !posts || posts.length === 0 ? (
          <div className="glass-card-3d text-center py-8 text-[#B8A1D9] dark:text-gray-400">
            No posts yet. Follow people to see their updates!
          </div>
        ) : (
          <div className="space-y-4">
            {posts.slice(0, 5).map((post: any, idx: number) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.5 }}
                className="glass-card-3d overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center gap-3 p-3 sm:p-4">
                  <img
                    src={post.author?.avatar || 'https://ui-avatars.com/api/?name=U&background=9D7DC5&color=fff'}
                    alt={post.author?.username || 'User'}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-[#9D7DC5]/20"
                  />
                  <div>
                    <p className="font-medium text-[#5E4B8B] dark:text-white text-sm">@{post.author?.username || 'User'}</p>
                    <p className="text-[10px] text-[#B8A1D9] dark:text-gray-400">
                      {post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : 'Just now'}
                    </p>
                  </div>
                </div>
                {post.imageUrl && (
                  <img src={post.imageUrl} alt="Post" className="w-full aspect-square object-cover" />
                )}
                <p className="p-3 sm:p-4 text-[#5E4B8B] dark:text-white text-sm">{post.content}</p>
                <div className="flex items-center justify-around p-2 sm:p-3 border-t border-[#E1C5E7]/30 dark:border-gray-700/30">
                  <button className="flex items-center gap-1 text-xs text-[#B8A1D9] dark:text-gray-400 hover:text-[#9D7DC5] transition-colors group soft-press">
                    <Heart className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>{post.cheerCount || 0}</span>
                  </button>
                  <button className="flex items-center gap-1 text-xs text-[#B8A1D9] dark:text-gray-400 hover:text-[#9D7DC5] transition-colors group soft-press">
                    <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>{post.commentCount || 0}</span>
                  </button>
                  <button className="flex items-center gap-1 text-xs text-[#B8A1D9] dark:text-gray-400 hover:text-[#9D7DC5] transition-colors group soft-press">
                    <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>{post.shareCount || 0}</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
