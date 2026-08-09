import { PrismaClient, ConsultantCategory } from '@prisma/client';

const prisma = new PrismaClient();

// All categories (including new ones)
const categories: ConsultantCategory[] = [
  'ASTROLOGER',
  'PSYCHOLOGIST',
  'TAROT',
  'NUMEROLOGIST',
  'PALMIST',
  'VASTU',
  'REIKI',
  'LIFE_COACH',
  'HEALER',
  'MOTIVATIONAL_SPEAKER',
  'SPIRITUAL_GUIDE',
  'YOGA_INSTRUCTOR',
];

const aiNames: Record<ConsultantCategory, string[]> = {
  ASTROLOGER: ['AstroAI-1', 'AstroAI-2', 'AstroAI-3', 'AstroAI-4'],
  PSYCHOLOGIST: ['PsychAI-1', 'PsychAI-2', 'PsychAI-3', 'PsychAI-4'],
  TAROT: ['TarotAI-1', 'TarotAI-2', 'TarotAI-3', 'TarotAI-4'],
  NUMEROLOGIST: ['NumerAI-1', 'NumerAI-2', 'NumerAI-3', 'NumerAI-4'],
  PALMIST: ['PalmAI-1', 'PalmAI-2', 'PalmAI-3', 'PalmAI-4'],
  VASTU: ['VastuAI-1', 'VastuAI-2', 'VastuAI-3', 'VastuAI-4'],
  REIKI: ['ReikiAI-1', 'ReikiAI-2', 'ReikiAI-3', 'ReikiAI-4'],
  LIFE_COACH: ['CoachAI-1', 'CoachAI-2', 'CoachAI-3', 'CoachAI-4'],
  HEALER: ['HealAI-1', 'HealAI-2', 'HealAI-3', 'HealAI-4'],
  MOTIVATIONAL_SPEAKER: ['MotivateAI-1', 'MotivateAI-2', 'MotivateAI-3', 'MotivateAI-4'],
  SPIRITUAL_GUIDE: ['GuideAI-1', 'GuideAI-2', 'GuideAI-3', 'GuideAI-4'],
  YOGA_INSTRUCTOR: ['YogaAI-1', 'YogaAI-2', 'YogaAI-3', 'YogaAI-4'],
};

const specialties: Record<ConsultantCategory, string[]> = {
  ASTROLOGER: ['Vedic', 'KP', 'Nadi', 'Western'],
  PSYCHOLOGIST: ['CBT', 'Anxiety', 'Depression', 'Mindfulness'],
  TAROT: ['Rider-Waite', 'Lenormand', 'Osho Zen', 'Angel Cards'],
  NUMEROLOGIST: ['Chaldean', 'Pythagorean', 'Kabbalah', 'Indian'],
  PALMIST: ['Classical', 'Modern', 'Psychological'],
  VASTU: ['Vastu Shastra', 'Feng Shui', 'Space Harmony'],
  REIKI: ['Reiki', 'Pranic', 'Crystal', 'Sound'],
  LIFE_COACH: ['Career', 'Relationships', 'Health', 'Personal Growth'],
  HEALER: ['Energy', 'Pranic', 'Crystal', 'Sound'],
  MOTIVATIONAL_SPEAKER: ['Inspiration', 'Leadership', 'Mindfulness', 'Resilience'],
  SPIRITUAL_GUIDE: ['Meditation', 'Mindfulness', 'Spiritual Counseling', 'Inner Peace'],
  YOGA_INSTRUCTOR: ['Hatha', 'Vinyasa', 'Kundalini', 'Meditation'],
};

const bios: Record<ConsultantCategory, string> = {
  ASTROLOGER: 'AI astrologer with deep knowledge of planetary alignments.',
  PSYCHOLOGIST: 'AI psychologist specializing in mental wellness.',
  TAROT: 'AI tarot reader with intuitive card interpretations.',
  NUMEROLOGIST: 'AI numerologist decoding life paths and destiny.',
  PALMIST: 'AI palmist analyzing hand lines and patterns.',
  VASTU: 'AI Vastu expert for harmonious living spaces.',
  REIKI: 'AI Reiki master for energy healing.',
  LIFE_COACH: 'AI life coach for personal and professional growth.',
  HEALER: 'AI healer for holistic wellness.',
  MOTIVATIONAL_SPEAKER: 'AI motivational speaker to inspire and empower.',
  SPIRITUAL_GUIDE: 'AI spiritual guide for inner peace and mindfulness.',
  YOGA_INSTRUCTOR: 'AI yoga instructor for physical and mental wellness.',
};

const models = ['zhipu', 'agnes', 'roxy', 'groq'];

export async function seedAIConsultants() {
  for (const category of categories) {
    const names = aiNames[category];
    const spec = specialties[category] || ['General'];
    const bio = bios[category] || 'AI consultant.';
    
    for (let i = 0; i < names.length; i++) {
      const isPaid = i >= 2; // First 2 free, last 2 paid
      await prisma.aIConsultant.upsert({
        where: { username: names[i].toLowerCase() },
        update: {},
        create: {
          name: names[i],
          username: names[i].toLowerCase(),
          avatar: `https://ui-avatars.com/api/?name=${names[i].replace(/[^a-zA-Z]/g, '')}&background=533AFD&color=fff`,
          category: category,
          isPaid,
          perMinuteRate: isPaid ? 5 + (i - 2) * 3 : 0,
          rating: 4.5 + Math.random() * 0.4,
          experience: 100,
          totalConsultations: Math.floor(1000 + Math.random() * 9000),
          sparks: 50000 + Math.floor(Math.random() * 50000),
          bio: `${bio} ${isPaid ? 'Premium consultant with advanced expertise.' : 'Free consultant providing general guidance.'}`,
          specialties: spec.slice(0, 3),
          languages: ['English', 'Hindi'],
          model: models[i % models.length],
          responseTime: 150 + Math.floor(Math.random() * 100),
          accuracy: 0.92 + Math.random() * 0.07,
          isActive: true,
        },
      });
    }
  }
  console.log('✅ AI consultants seeded.');
}
